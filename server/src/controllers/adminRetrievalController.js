import { embedChunksForSource, getEmbeddingStatusSummary } from '../services/embeddings/embeddingService.js'
import { retrieveKnowledge } from '../services/retrieval/hybridRetriever.js'
import { vectorIndex } from '../services/retrieval/vectorIndex.js'

/**
 * Triggers batch embedding generation for a registered source.
 * POST /api/admin/retrieval/embed/:sourceId
 */
export async function triggerEmbeddingGeneration(req, res) {
  const { sourceId } = req.params
  const { forceReembed = false, providerId } = req.body || {}

  if (!sourceId) {
    return res.status(400).json({ error: 'sourceId parameter is required.' })
  }

  try {
    const result = await embedChunksForSource(sourceId, {
      forceReembed: Boolean(forceReembed),
      providerId,
    })

    res.status(200).json({
      success: true,
      message: `Embedding generation completed for source "${sourceId}".`,
      data: result,
    })
  } catch (error) {
    console.error(`[AdminRetrievalController] Embedding generation error for "${sourceId}":`, error)
    res.status(500).json({
      error: error.message || 'Failed to generate embeddings for source.',
    })
  }
}

/**
 * Retrieves embedding status, coverage metrics, and memory cache diagnostics.
 * GET /api/admin/retrieval/embedding-status
 */
export async function getEmbeddingStatus(_req, res) {
  try {
    const summary = await getEmbeddingStatusSummary()
    const memoryProfile = vectorIndex.getMemoryProfile()

    res.status(200).json({
      success: true,
      data: {
        ...summary,
        vectorCache: memoryProfile,
      },
    })
  } catch (error) {
    console.error('[AdminRetrievalController] Error fetching embedding status:', error)
    res.status(500).json({
      error: 'Failed to retrieve embedding status summary.',
    })
  }
}

/**
 * Executes knowledge retrieval search.
 * POST /api/admin/retrieval/search
 */
export async function searchKnowledge(req, res) {
  const {
    query,
    roleId,
    topicId,
    difficultyTier,
    sourceId,
    mode = 'hybrid',
    limit = 5,
  } = req.body || {}

  // Request validation
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({
      error: 'Search query must be a non-empty string.',
    })
  }

  if (query.trim().length > 1000) {
    return res.status(400).json({
      error: 'Search query exceeds maximum allowed limit of 1000 characters.',
    })
  }

  const validModes = ['hybrid', 'semantic', 'keyword']
  if (!validModes.includes(mode)) {
    return res.status(400).json({
      error: `Invalid search mode "${mode}". Supported modes: [${validModes.join(', ')}].`,
    })
  }

  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 50)

  try {
    const retrievalResult = await retrieveKnowledge({
      query: query.trim(),
      roleId,
      topicId,
      difficultyTier,
      sourceId,
      mode,
      limit: parsedLimit,
    })

    res.status(200).json({
      success: true,
      data: retrievalResult,
    })
  } catch (error) {
    console.error('[AdminRetrievalController] Retrieval search error:', error)
    res.status(500).json({
      error: error.message || 'Failed to execute knowledge retrieval query.',
    })
  }
}
