import { searchSemantic } from './semanticSearch.js'
import { searchKeywords } from './keywordSearch.js'
import { ContentChunk } from '../../models/ContentChunk.js'
import { KnowledgeSource } from '../../models/KnowledgeSource.js'

/**
 * Default Reciprocal Rank Fusion (RRF) hyperparameters.
 */
export const RRF_CONFIG = {
  k: 60, // Standard smoothing constant to avoid penalizing lower ranks excessively
  semanticWeight: 0.6,
  keywordWeight: 0.4,
}

/**
 * Executes hybrid knowledge retrieval combining semantic similarity and keyword relevance.
 *
 * @param {object} params
 * @param {string} params.query
 * @param {string} [params.roleId]
 * @param {string} [params.topicId]
 * @param {string} [params.difficultyTier]
 * @param {string} [params.sourceId]
 * @param {'hybrid' | 'semantic' | 'keyword'} [params.mode='hybrid']
 * @param {number} [params.limit=5]
 * @param {object} [params.rrfConfig]
 * @param {object} [params.options]
 * @returns {Promise<{ query: string, totalFound: number, mode: string, results: Array<object> }>}
 */
export async function retrieveKnowledge({
  query,
  roleId,
  topicId,
  difficultyTier,
  sourceId,
  mode = 'hybrid',
  limit = 5,
  rrfConfig = RRF_CONFIG,
  options = {},
}) {
  if (typeof query !== 'string' || !query.trim()) {
    throw new Error('Retrieval query must be a non-empty string.')
  }

  const filters = {}
  if (roleId) filters.roleId = roleId
  if (topicId) filters.topicId = topicId
  if (difficultyTier) filters.difficultyTier = difficultyTier
  if (sourceId) filters.sourceId = sourceId

  const candidateLimit = Math.max(limit * 3, 15)

  // 1. Execute Retrieval Channels according to mode
  let semanticMatches = []
  let keywordMatches = []

  if (mode === 'hybrid' || mode === 'semantic') {
    try {
      semanticMatches = await searchSemantic(query, filters, candidateLimit, options)
    } catch (semErr) {
      console.warn('[HybridRetriever] Semantic search channel failed, degrading to keyword:', semErr.message)
      if (mode === 'semantic') {
        throw semErr
      }
    }
  }

  if (mode === 'hybrid' || mode === 'keyword') {
    try {
      keywordMatches = await searchKeywords(query, filters, candidateLimit)
    } catch (keyErr) {
      console.warn('[HybridRetriever] Keyword search channel failed:', keyErr.message)
      if (mode === 'keyword') {
        throw keyErr
      }
    }
  }

  // 2. Compute Hybrid Fusion Scores
  const k = rrfConfig.k || RRF_CONFIG.k
  const wSem = rrfConfig.semanticWeight ?? RRF_CONFIG.semanticWeight
  const wKey = rrfConfig.keywordWeight ?? RRF_CONFIG.keywordWeight

  /** @type {Map<string, { chunkId: string, rrfScore: number, semanticRank: number|null, semanticSimilarity: number|null, keywordRank: number|null, keywordScore: number|null }>} */
  const scoreMap = new Map()

  // Incorporate semantic ranks
  for (let rank = 0; rank < semanticMatches.length; rank++) {
    const item = semanticMatches[rank]
    const rrfContrib = wSem / (k + rank + 1)
    scoreMap.set(item.chunkId, {
      chunkId: item.chunkId,
      rrfScore: rrfContrib,
      semanticRank: rank + 1,
      semanticSimilarity: Number(item.similarity.toFixed(4)),
      keywordRank: null,
      keywordScore: null,
    })
  }

  // Incorporate keyword ranks
  for (let rank = 0; rank < keywordMatches.length; rank++) {
    const item = keywordMatches[rank]
    const rrfContrib = wKey / (k + rank + 1)
    if (scoreMap.has(item.chunkId)) {
      const existing = scoreMap.get(item.chunkId)
      existing.rrfScore += rrfContrib
      existing.keywordRank = rank + 1
      existing.keywordScore = Number(item.score.toFixed(2))
    } else {
      scoreMap.set(item.chunkId, {
        chunkId: item.chunkId,
        rrfScore: rrfContrib,
        semanticRank: null,
        semanticSimilarity: null,
        keywordRank: rank + 1,
        keywordScore: Number(item.score.toFixed(2)),
      })
    }
  }

  // 3. Sort by final score
  let rankedEntries = Array.from(scoreMap.values())

  if (mode === 'semantic') {
    rankedEntries.sort((a, b) => (b.semanticSimilarity ?? -1) - (a.semanticSimilarity ?? -1))
  } else if (mode === 'keyword') {
    rankedEntries.sort((a, b) => (b.keywordScore ?? -1) - (a.keywordScore ?? -1))
  } else {
    rankedEntries.sort((a, b) => b.rrfScore - a.rrfScore)
  }

  // Slice to limit
  const topEntries = rankedEntries.slice(0, limit)
  if (topEntries.length === 0) {
    return {
      query,
      totalFound: 0,
      mode,
      results: [],
    }
  }

  // 4. Hydrate chunk records from MongoDB with complete provenance
  const chunkIds = topEntries.map((e) => e.chunkId)
  const chunkDocs = await ContentChunk.find({ chunkId: { $in: chunkIds } }).lean()
  const sourceIds = Array.from(new Set(chunkDocs.map((c) => c.sourceId)))
  const sources = await KnowledgeSource.find({ sourceId: { $in: sourceIds } }).lean()

  const sourceMap = new Map(sources.map((s) => [s.sourceId, s]))
  const chunkMap = new Map(chunkDocs.map((c) => [c.chunkId, c]))

  const results = []

  for (let i = 0; i < topEntries.length; i++) {
    const entry = topEntries[i]
    const chunk = chunkMap.get(entry.chunkId)
    if (!chunk) continue

    const source = sourceMap.get(chunk.sourceId)

    // Strict security filter: verify source is active and permits indexing/storage
    if (!source || source.status !== 'active' || !source.licence?.indexingPermitted) {
      continue
    }

    results.push({
      chunkId: chunk.chunkId,
      documentId: chunk.docId,
      sourceId: chunk.sourceId,
      sourceTitle: source.name,
      canonicalSourceUrl: chunk.canonicalSource?.url || source.baseUrl,
      canonicalSource: chunk.canonicalSource || {},
      documentVersion: chunk.documentVersion,
      sourceSnapshotHash: chunk.sourceSnapshotHash,
      roleTags: chunk.roleTags,
      topicTags: chunk.topicTags,
      difficultyTier: chunk.difficultyTier,
      content: chunk.content,
      tokenCount: chunk.tokenCount,

      // Explicit Content Origin and Pedagogical Separation
      contentOrigin: chunk.contentOrigin || 'canonical_source',
      groundingPassage: chunk.groundingPassage || '',
      codeExemplar: chunk.codeExemplar || {},
      crossReferences: chunk.crossReferences || [],

      // Retrieval and Ranking Metadata
      retrieval: {
        method: mode,
        rank: i + 1,
        rrfScore: Number(entry.rrfScore.toFixed(6)),
        semanticRank: entry.semanticRank,
        semanticSimilarity: entry.semanticSimilarity,
        keywordRank: entry.keywordRank,
        keywordScore: entry.keywordScore,
      },
    })
  }

  return {
    query,
    totalFound: results.length,
    mode,
    results,
  }
}
