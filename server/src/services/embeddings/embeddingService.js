import { getEmbeddingProvider } from './embeddingProvider.js'
import { EMBEDDING_CONFIG } from './embeddingConfig.js'
import { ContentChunk } from '../../models/ContentChunk.js'
import { KnowledgeSource } from '../../models/KnowledgeSource.js'
import { invalidateVectorIndex } from '../retrieval/vectorIndex.js'

/**
 * Executes an operation with exponential backoff retry.
 *
 * @template T
 * @param {() => Promise<T>} operation
 * @param {number} [maxRetries]
 * @param {number} [delayMs]
 * @returns {Promise<T>}
 */
async function retryWithBackoff(
  operation,
  maxRetries = EMBEDDING_CONFIG.limits.maxRetries,
  delayMs = EMBEDDING_CONFIG.limits.retryDelayMs,
) {
  let attempt = 0
  while (attempt < maxRetries) {
    try {
      return await operation()
    } catch (err) {
      attempt++
      if (attempt >= maxRetries) {
        throw err
      }
      const backoff = delayMs * Math.pow(2, attempt - 1)
      await new Promise((resolve) => setTimeout(resolve, backoff))
    }
  }
}

/**
 * Generates an embedding vector for a single text query or passage.
 *
 * @param {string} text
 * @param {object} [options]
 * @param {string} [options.providerId]
 * @returns {Promise<{ vector: number[], provider: string, model: string, dimensions: number }>}
 */
export async function generateEmbeddingForText(text, options = {}) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Input text for embedding must be a non-empty string.')
  }

  const truncated = text.trim().substring(0, EMBEDDING_CONFIG.limits.maxChunkCharacters)
  const provider = getEmbeddingProvider(options.providerId)

  const vector = await retryWithBackoff(async () => {
    return await provider.embedText(truncated)
  })

  const validation = provider.validateVector(vector)
  if (!validation.valid) {
    throw new Error(`Embedding vector validation failed: ${validation.reason}`)
  }

  return {
    vector,
    provider: provider.providerId,
    model: provider.modelId,
    modelVersion: provider.modelVersion,
    dimensions: provider.dimensions,
  }
}

/**
 * Embeds all eligible, pending, or stale chunks for a registered KnowledgeSource.
 *
 * @param {string} sourceId
 * @param {object} [options]
 * @param {boolean} [options.forceReembed=false] - If true, re-embeds even active chunks
 * @param {string} [options.providerId]
 * @returns {Promise<{ sourceId: string, totalEligible: number, succeeded: number, failed: number, skipped: number, errors: Array<{ chunkId: string, error: string }> }>}
 */
export async function embedChunksForSource(sourceId, options = {}) {
  // 1. Verify source exists and is eligible for embedding
  const source = await KnowledgeSource.findOne({ sourceId })
  if (!source) {
    throw new Error(`KnowledgeSource "${sourceId}" not found.`)
  }

  if (source.status !== 'active') {
    throw new Error(
      `Cannot embed chunks for source "${sourceId}": source status is "${source.status}". Only "active" sources are eligible.`,
    )
  }

  if (!source.licence.indexingPermitted) {
    throw new Error(
      `Cannot embed chunks for source "${sourceId}": licence prohibits indexing (indexingPermitted=false).`,
    )
  }

  const provider = getEmbeddingProvider(options.providerId)

  // 2. Query chunks for this source
  const allChunks = await ContentChunk.find({ sourceId })

  const chunksToProcess = []
  let skipped = 0

  for (const chunk of allChunks) {
    const isStale = chunk.embedding?.contentHash !== chunk.contentHash
    const isModelMismatch = chunk.embedding?.model !== provider.modelId
    const isPendingOrFailed =
      !chunk.embedding ||
      chunk.embedding.status === 'pending' ||
      chunk.embedding.status === 'failed' ||
      chunk.embedding.status === 'stale'
    const needsEmbed = options.forceReembed || isStale || isModelMismatch || isPendingOrFailed

    if (needsEmbed) {
      chunksToProcess.push(chunk)
    } else {
      skipped++
    }
  }

  let succeeded = 0
  let failed = 0
  const errors = []

  // 3. Process in batches
  const batchSize = EMBEDDING_CONFIG.limits.maxBatchSize
  for (let i = 0; i < chunksToProcess.length; i += batchSize) {
    const batch = chunksToProcess.slice(i, i + batchSize)
    const texts = batch.map((c) => `${c.content}\n\nGrounding: ${c.groundingPassage || ''}`)

    try {
      const vectors = await retryWithBackoff(async () => {
        return await provider.embedBatch(texts)
      })

      // Update chunks in DB
      for (let j = 0; j < batch.length; j++) {
        const chunk = batch[j]
        const vector = vectors[j]

        const validation = provider.validateVector(vector)
        if (!validation.valid) {
          throw new Error(`Vector validation failed for chunk ${chunk.chunkId}: ${validation.reason}`)
        }

        await ContentChunk.updateOne(
          { chunkId: chunk.chunkId },
          {
            $set: {
              'embedding.vector': vector,
              'embedding.provider': provider.providerId,
              'embedding.model': provider.modelId,
              'embedding.modelVersion': provider.modelVersion,
              'embedding.dimensions': provider.dimensions,
              'embedding.contentHash': chunk.contentHash,
              'embedding.createdAt': new Date(),
              'embedding.status': 'active',
              'embedding.lastError': '',
            },
          },
        )
        succeeded++
      }
    } catch (batchErr) {
      // Record failure without erasing previous valid vectors if they existed
      for (const chunk of batch) {
        failed++
        errors.push({ chunkId: chunk.chunkId, error: batchErr.message })

        const updateFields = {
          'embedding.lastError': batchErr.message,
        }
        // Only set status to failed if there was no active vector
        if (chunk.embedding?.status !== 'active') {
          updateFields['embedding.status'] = 'failed'
        }

        await ContentChunk.updateOne({ chunkId: chunk.chunkId }, { $set: updateFields })
      }
    }
  }

  // 4. Invalidate retrieval in-memory vector cache so new embeddings take effect immediately
  invalidateVectorIndex(sourceId)

  return {
    sourceId,
    totalEligible: chunksToProcess.length,
    succeeded,
    failed,
    skipped,
    errors,
  }
}

/**
 * Returns a high-level summary of embedding coverage and status across all sources.
 *
 * @returns {Promise<object>} Status breakdown
 */
export async function getEmbeddingStatusSummary() {
  const [totalChunks, statusCounts, sources] = await Promise.all([
    ContentChunk.countDocuments(),
    ContentChunk.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$embedding.status', 'pending'] },
          count: { $sum: 1 },
        },
      },
    ]),
    KnowledgeSource.find({}, 'sourceId name status licence.indexingPermitted'),
  ])

  const breakdown = {
    active: 0,
    pending: 0,
    stale: 0,
    failed: 0,
  }

  for (const item of statusCounts) {
    if (breakdown[item._id] !== undefined) {
      breakdown[item._id] = item.count
    }
  }

  return {
    totalChunks,
    breakdown,
    coveragePercentage: totalChunks > 0 ? Number(((breakdown.active / totalChunks) * 100).toFixed(1)) : 0,
    sources: sources.map((s) => ({
      sourceId: s.sourceId,
      name: s.name,
      status: s.status,
      indexingPermitted: s.licence?.indexingPermitted,
    })),
  }
}
