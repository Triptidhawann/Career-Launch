import { ContentChunk } from '../../models/ContentChunk.js'
import { KnowledgeSource } from '../../models/KnowledgeSource.js'

/**
 * Executes keyword retrieval against MongoDB text index and exact technical token matching.
 *
 * @param {string} query
 * @param {object} [filters]
 * @param {string} [filters.roleId]
 * @param {string} [filters.topicId]
 * @param {string} [filters.difficultyTier]
 * @param {string} [filters.sourceId]
 * @param {number} [limit=10]
 * @returns {Promise<Array<{ chunkId: string, score: number, method: 'text_index' | 'token_regex' }>>}
 */
export async function searchKeywords(query, filters = {}, limit = 10) {
  if (typeof query !== 'string' || !query.trim()) {
    return []
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
  const allowedSourceIds = activeSources.map((s) => s.sourceId)

  // 2. Build MongoDB query filter
  const baseFilter = {
    sourceId: { $in: allowedSourceIds },
  }

  if (filters.roleId) {
    baseFilter.roleTags = filters.roleId
  }
  if (filters.topicId) {
    baseFilter.topicTags = filters.topicId
  }
  if (filters.difficultyTier) {
    baseFilter.difficultyTier = filters.difficultyTier
  }
  if (filters.sourceId) {
    baseFilter.sourceId = filters.sourceId
  }

  // 3. Try MongoDB full-text index first
  const textFilter = {
    ...baseFilter,
    $text: { $search: query.trim() },
  }

  try {
    const textResults = await ContentChunk.find(textFilter, {
      chunkId: 1,
      score: { $meta: 'textScore' },
    })
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean()

    if (textResults.length > 0) {
      return textResults.map((r) => ({
        chunkId: r.chunkId,
        score: r.score,
        method: 'text_index',
      }))
    }
  } catch (err) {
    console.warn('[KeywordSearch] Full-text index search failed or unindexed, using token fallback:', err.message)
  }

  // 4. Fallback: Exact technical token regex search for terms or symbols missed by stopword filtering
  const cleanTokens = query
    .trim()
    .split(/[\s,.-]+/)
    .filter((t) => t.length > 2)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

  if (cleanTokens.length === 0) {
    return []
  }

  const regexConditions = cleanTokens.map((token) => ({
    $or: [
      { content: { $regex: token, $options: 'i' } },
      { topicTags: { $regex: token, $options: 'i' } },
    ],
  }))

  const regexFilter = {
    ...baseFilter,
    $or: regexConditions,
  }

  const regexResults = await ContentChunk.find(regexFilter, 'chunkId content topicTags')
    .limit(limit * 2)
    .lean()

  // Score based on token hit frequency
  const scored = regexResults.map((doc) => {
    let hitCount = 0
    const lowerContent = doc.content.toLowerCase()
    for (const tok of cleanTokens) {
      const lowerTok = tok.toLowerCase()
      if (lowerContent.includes(lowerTok)) {
        hitCount += 1
      }
      if (doc.topicTags?.some((t) => t.toLowerCase().includes(lowerTok))) {
        hitCount += 2
      }
    }
    return {
      chunkId: doc.chunkId,
      score: hitCount,
      method: 'token_regex',
    }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit)
}
