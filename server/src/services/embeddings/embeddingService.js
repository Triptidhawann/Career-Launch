import { getEmbeddingProvider } from './embeddingProvider.js'
import { EMBEDDING_CONFIG, getProviderConfig } from './embeddingConfig.js'
import { ContentChunk } from '../../models/ContentChunk.js'
import { KnowledgeSource } from '../../models/KnowledgeSource.js'
import { invalidateVectorIndex } from '../retrieval/vectorIndex.js'

// In-flight embedding jobs set to prevent concurrent duplicate executions for the same source
const activeEmbeddingJobs = new Set()

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
 * Features safe atomic updates, concurrent job deduplication, and vector preservation.
 *
 * @param {string} sourceId
 * @param {object} [options]
 * @param {boolean} [options.forceReembed=false] - If true, re-embeds even active chunks
 * @param {string} [options.providerId]
 * @returns {Promise<{ sourceId: string, totalEligible: number, succeeded: number, failed: number, skipped: number, errors: Array<{ chunkId: string, error: string }> }>}
 */
export async function embedChunksForSource(sourceId, options = {}) {
  // 1. Prevent concurrent duplicate jobs on the same source
  if (activeEmbeddingJobs.has(sourceId)) {
    throw new Error(`An embedding job for source "${sourceId}" is already running. Duplicate concurrent jobs are rejected.`)
  }

  activeEmbeddingJobs.add(sourceId)

  try {
    // 2. Verify source exists and is eligible for embedding
    const source = await KnowledgeSource.findOne({ sourceId })
    if (!source) {
      throw new Error(`KnowledgeSource "${sourceId}" not found.`)
    }

    if (source.status !== 'active') {
      throw new Error(
        `Cannot embed chunks for source "${sourceId}": source status is "${source.status}". Only "active" sources are eligible.`,
      )
    }

    if (!source.licence?.indexingPermitted || !source.licence?.storagePermitted) {
      throw new Error(
        `Cannot embed chunks for source "${sourceId}": licence prohibits indexing or storage.`,
      )
    }

    const provider = getEmbeddingProvider(options.providerId)

    // 3. Query chunks for this source
    const allChunks = await ContentChunk.find({ sourceId })

    const chunksToProcess = []
    let skipped = 0

    for (const chunk of allChunks) {
      const isStaleHash = chunk.embedding?.contentHash !== chunk.contentHash
      const isModelMismatch = chunk.embedding?.model !== provider.modelId || chunk.embedding?.dimensions !== provider.dimensions
      const isPendingOrFailed =
        !chunk.embedding ||
        chunk.embedding.status === 'pending' ||
        chunk.embedding.status === 'failed' ||
        chunk.embedding.status === 'stale'
      const needsEmbed = options.forceReembed || isStaleHash || isModelMismatch || isPendingOrFailed

      if (needsEmbed) {
        // Mark stale if content or model mismatched
        if ((isStaleHash || isModelMismatch) && chunk.embedding?.status === 'active') {
          await ContentChunk.updateOne({ chunkId: chunk.chunkId }, { $set: { 'embedding.status': 'stale' } })
          chunk.embedding.status = 'stale'
        }
        chunksToProcess.push(chunk)
      } else {
        skipped++
      }
    }

    let succeeded = 0
    let failed = 0
    const errors = []

    // 4. Process in batches with safe update isolation
    const batchSize = EMBEDDING_CONFIG.limits.maxBatchSize
    for (let i = 0; i < chunksToProcess.length; i += batchSize) {
      const batch = chunksToProcess.slice(i, i + batchSize)
      const texts = batch.map((c) => `${c.content}\n\nGrounding: ${c.groundingPassage || ''}`)

      try {
        const replacementVectors = await retryWithBackoff(async () => {
          return await provider.embedBatch(texts)
        })

        // Validate each replacement vector BEFORE writing to MongoDB
        for (let j = 0; j < batch.length; j++) {
          const chunk = batch[j]
          const repVector = replacementVectors[j]

          const validation = provider.validateVector(repVector, provider.dimensions)
          if (!validation.valid) {
            throw new Error(`Vector validation failed for chunk ${chunk.chunkId}: ${validation.reason}`)
          }

          // Safe activation: only update DB after full validation succeeds
          await ContentChunk.updateOne(
            { chunkId: chunk.chunkId },
            {
              $set: {
                'embedding.vector': repVector,
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
        // Safe error isolation: if regeneration fails, DO NOT erase existing valid vectors
        for (const chunk of batch) {
          failed++
          errors.push({ chunkId: chunk.chunkId, error: batchErr.message })

          const hasValidExistingVector =
            Array.isArray(chunk.embedding?.vector) &&
            chunk.embedding.vector.length === provider.dimensions

          const updateFields = {
            'embedding.lastError': batchErr.message,
          }

          // If chunk never had a valid vector, set status to failed.
          // If it had a valid vector, keep the vector intact and flag error without destroying data!
          if (!hasValidExistingVector) {
            updateFields['embedding.status'] = 'failed'
          }

          await ContentChunk.updateOne({ chunkId: chunk.chunkId }, { $set: updateFields })
        }
      }
    }

    // 5. Invalidate vector cache so fresh embeddings are indexed
    invalidateVectorIndex(sourceId)

    return {
      sourceId,
      totalEligible: chunksToProcess.length,
      succeeded,
      failed,
      skipped,
      errors,
    }
  } finally {
    activeEmbeddingJobs.delete(sourceId)
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
    KnowledgeSource.find({}, 'sourceId name status licence.indexingPermitted licence.storagePermitted'),
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
    activeModel: getProviderConfig().modelId,
    activeDimensions: getProviderConfig().dimensions,
    coveragePercentage: totalChunks > 0 ? Number(((breakdown.active / totalChunks) * 100).toFixed(1)) : 0,
    sources: sources.map((s) => ({
      sourceId: s.sourceId,
      name: s.name,
      status: s.status,
      indexingPermitted: s.licence?.indexingPermitted,
      storagePermitted: s.licence?.storagePermitted,
    })),
  }
}
