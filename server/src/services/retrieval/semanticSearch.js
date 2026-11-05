import { generateEmbeddingForText } from '../embeddings/embeddingService.js'
import { vectorIndex } from './vectorIndex.js'

/**
 * Executes semantic similarity search against the in-process vector index.
 *
 * @param {string} query
 * @param {object} [filters]
 * @param {string} [filters.roleId]
 * @param {string} [filters.topicId]
 * @param {string} [filters.difficultyTier]
 * @param {string} [filters.sourceId]
 * @param {number} [limit=10]
 * @param {object} [options]
 * @param {string} [options.providerId]
 * @returns {Promise<Array<{ chunkId: string, similarity: number }>>}
 */
export async function searchSemantic(query, filters = {}, limit = 10, options = {}) {
  if (typeof query !== 'string' || !query.trim()) {
    return []
  }

  // 1. Generate embedding for query text
  const { vector } = await generateEmbeddingForText(query, options)

  // 2. Perform cosine similarity search on the vector index
  const results = await vectorIndex.search(vector, filters, limit)

  return results
}
