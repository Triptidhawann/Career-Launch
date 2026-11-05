import { ContentChunk } from '../../models/ContentChunk.js'
import { KnowledgeSource } from '../../models/KnowledgeSource.js'

/**
 * In-Process Vector Index Cache for Bounded Pilot
 *
 * Stores active chunk vectors as compact Float32Array buffers to eliminate
 * the 8x memory overhead of generic JavaScript 64-bit Number arrays.
 * Provides microsecond-latency cosine similarity scanning for bounded corpora.
 */
class InProcessVectorIndex {
  constructor() {
    /** @type {Map<string, { chunkId: string, docId: string, sourceId: string, roleTags: string[], topicTags: string[], difficultyTier: string, contentHash: string, vector: Float32Array, norm: number }>} */
    this.entries = new Map()
    this.dimensions = 0
    this.lastRefreshedAt = null
    this.isDirty = true
  }

  /**
   * Invalidates the vector cache.
   */
  invalidate() {
    this.isDirty = true
  }

  /**
   * Refreshes or populates the in-memory Float32Array index from MongoDB.
   * Only includes chunks with 'active' embedding status whose sources are 'active' and approved.
   *
   * @param {boolean} [force=false]
   */
  async ensureIndex(force = false) {
    if (!this.isDirty && !force && this.entries.size > 0) {
      return
    }

    // 1. Identify active, approved knowledge sources
    const activeSources = await KnowledgeSource.find(
      {
        status: 'active',
        'licence.commercialUsePermitted': true,
        'licence.indexingPermitted': true,
      },
      'sourceId',
    )
    const allowedSourceIds = new Set(activeSources.map((s) => s.sourceId))

    // 2. Fetch all active chunks for eligible sources
    const chunks = await ContentChunk.find(
      {
        'embedding.status': 'active',
        'embedding.vector.0': { $exists: true },
        sourceId: { $in: Array.from(allowedSourceIds) },
      },
      'chunkId docId sourceId roleTags topicTags difficultyTier contentHash embedding',
    ).lean()

    this.entries.clear()

    for (const chunk of chunks) {
      const rawVec = chunk.embedding?.vector
      if (!Array.isArray(rawVec) || rawVec.length === 0) continue

      // Verify content hash matches
      if (chunk.embedding.contentHash && chunk.embedding.contentHash !== chunk.contentHash) {
        continue // Skip stale embeddings
      }

      const dim = rawVec.length
      this.dimensions = dim

      const floatArray = new Float32Array(dim)
      let sumSq = 0
      for (let i = 0; i < dim; i++) {
        const val = rawVec[i]
        floatArray[i] = val
        sumSq += val * val
      }
      const norm = Math.sqrt(sumSq)

      if (norm > 0) {
        this.entries.set(chunk.chunkId, {
          chunkId: chunk.chunkId,
          docId: chunk.docId,
          sourceId: chunk.sourceId,
          roleTags: chunk.roleTags || [],
          topicTags: chunk.topicTags || [],
          difficultyTier: chunk.difficultyTier,
          contentHash: chunk.contentHash,
          vector: floatArray,
          norm,
        })
      }
    }

    this.isDirty = false
    this.lastRefreshedAt = new Date()
  }

  /**
   * Computes cosine similarity between two Float32Array vectors.
   * Cosine Similarity = (A · B) / (||A|| * ||B||)
   *
   * @param {Float32Array} vecA
   * @param {number} normA
   * @param {Float32Array} vecB
   * @param {number} normB
   * @returns {number} Value in range [-1.0, 1.0]
   */
  computeCosineSimilarity(vecA, normA, vecB, normB) {
    if (vecA.length !== vecB.length || normA === 0 || normB === 0) {
      return 0
    }

    let dot = 0
    const len = vecA.length
    for (let i = 0; i < len; i++) {
      dot += vecA[i] * vecB[i]
    }

    const similarity = dot / (normA * normB)
    if (!Number.isFinite(similarity)) return 0
    return Math.max(-1, Math.min(1, similarity))
  }

  /**
   * Searches the vector index by cosine similarity, applying optional metadata filters.
   *
   * @param {number[]} queryVector
   * @param {object} [filters]
   * @param {string} [filters.roleId]
   * @param {string} [filters.topicId]
   * @param {string} [filters.difficultyTier]
   * @param {string} [filters.sourceId]
   * @param {number} [limit=10]
   * @returns {Promise<Array<{ chunkId: string, similarity: number }>>}
   */
  async search(queryVector, filters = {}, limit = 10) {
    await this.ensureIndex()

    if (!Array.isArray(queryVector) || queryVector.length === 0) {
      throw new Error('Query vector must be a non-empty array.')
    }

    const qLen = queryVector.length
    if (this.dimensions > 0 && qLen !== this.dimensions) {
      throw new Error(`Query vector dimension (${qLen}) does not match index dimension (${this.dimensions}).`)
    }

    // Convert query vector to Float32Array
    const qVec = new Float32Array(qLen)
    let qSumSq = 0
    for (let i = 0; i < qLen; i++) {
      const v = queryVector[i]
      qVec[i] = v
      qSumSq += v * v
    }
    const qNorm = Math.sqrt(qSumSq)
    if (qNorm === 0) {
      return []
    }

    const matches = []

    for (const entry of this.entries.values()) {
      // 1. Metadata filter evaluation
      if (filters.roleId && !entry.roleTags.includes(filters.roleId)) {
        continue
      }
      if (filters.topicId && !entry.topicTags.includes(filters.topicId)) {
        continue
      }
      if (filters.difficultyTier && entry.difficultyTier !== filters.difficultyTier) {
        continue
      }
      if (filters.sourceId && entry.sourceId !== filters.sourceId) {
        continue
      }

      // 2. Vector similarity
      const similarity = this.computeCosineSimilarity(qVec, qNorm, entry.vector, entry.norm)
      matches.push({
        chunkId: entry.chunkId,
        similarity,
      })
    }

    // Sort by descending similarity
    matches.sort((a, b) => b.similarity - a.similarity)
    return matches.slice(0, limit)
  }

  /**
   * Reports memory footprint and index metrics.
   *
   * @returns {object} Memory and size profile
   */
  getMemoryProfile() {
    const vectorCount = this.entries.size
    const vectorBytes = vectorCount * this.dimensions * 4 // 4 bytes per Float32
    return {
      vectorCount,
      dimensions: this.dimensions,
      vectorBufferBytes: vectorBytes,
      vectorBufferKb: Number((vectorBytes / 1024).toFixed(2)),
      lastRefreshedAt: this.lastRefreshedAt,
      isDirty: this.isDirty,
    }
  }
}

// Singleton vector index instance
export const vectorIndex = new InProcessVectorIndex()

/**
 * External invalidation helper.
 * @param {string} [_sourceId]
 */
export function invalidateVectorIndex(_sourceId) {
  vectorIndex.invalidate()
}
