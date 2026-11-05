import crypto from 'node:crypto'
import { KnowledgeSource } from '../../models/KnowledgeSource.js'
import { IngestionJob } from '../../models/IngestionJob.js'
import { IngestedDocument } from '../../models/IngestedDocument.js'
import { ContentChunk } from '../../models/ContentChunk.js'
import { validateSourceLicence, validateUrlSafety } from './sourceValidator.js'
import { cleanDocumentContent, computeContentHash } from './markdownCleaner.js'
import { chunkDocument } from './semanticChunker.js'

/**
 * Executes an idempotent, provenance-tracked ingestion job for a registered KnowledgeSource.
 * Enforces explicit separation between canonical source passages and CareerLaunch-authored
 * pedagogical code examples.
 *
 * @param {object} params
 * @param {string} params.sourceId
 * @param {string} params.initiatedBy - Admin user identifier
 * @param {Array<object>} params.documents
 * @returns {Promise<object>} Result summary and IngestionJob record
 */
export async function executeIngestionJob({ sourceId, initiatedBy, documents = [] }) {
  const jobId = `job_${sourceId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`

  // 1. Initialize IngestionJob record
  const job = await IngestionJob.create({
    jobId,
    sourceId,
    initiatedBy: initiatedBy || 'admin',
    status: 'running',
    startedAt: new Date(),
    documentsDiscovered: documents.length,
    documentsProcessed: 0,
    chunksCreated: 0,
    retryCount: 0,
    errorLog: [],
  })

  // 2. Fetch & Validate Source
  const source = await KnowledgeSource.findOne({ sourceId })
  if (!source) {
    job.status = 'failed'
    job.finishedAt = new Date()
    job.errorLog.push({
      errorMessage: `Source "${sourceId}" is not registered in the KnowledgeSource catalog.`,
      errorCode: 'SOURCE_NOT_FOUND',
    })
    await job.save()
    throw new Error(`KnowledgeSource "${sourceId}" not found.`)
  }

  // 3. Validate Source Licence
  const licenceCheck = validateSourceLicence(source)
  if (!licenceCheck.approved) {
    job.status = 'failed'
    job.finishedAt = new Date()
    job.errorLog.push({
      errorMessage: `Licence verification failed: ${licenceCheck.reason}`,
      errorCode: 'LICENCE_REJECTED',
    })
    await job.save()

    // Mark source as rejected
    source.status = 'rejected'
    source.rejectionReason = licenceCheck.reason
    await source.save()

    throw new Error(`Ingestion aborted: ${licenceCheck.reason}`)
  }

  const isStoragePermitted = source.licence.storagePermitted === true
  let totalChunksCreated = 0
  let totalProcessed = 0
  const processedDocHashes = []
  const newChunksToInsert = []
  const docOperations = []

  // 4. Process each document entry
  for (let idx = 0; idx < documents.length; idx++) {
    const docEntry = documents[idx]
    const {
      title,
      url,
      rawContent,
      contentType = 'markdown',
      roleTags = [],
      topicTags = [],
      difficultyTier = 'intermediate',
      sectionHierarchy = [],
      contentOrigin = 'canonical_source',
      canonicalSource = {},
      groundingPassage = '',
      codeExemplar = {},
      crossReferences = [],
    } = docEntry

    try {
      // 4a. Validate URL safety (SSRF Defense)
      const urlSafety = await validateUrlSafety(url, source.allowedDomains)
      if (!urlSafety.valid) {
        job.errorLog.push({
          documentUrl: url,
          errorMessage: urlSafety.reason,
          errorCode: 'SSRF_VALIDATION_FAILED',
        })
        continue
      }

      // 4b. Clean & Normalize Document
      const { cleanedText, contentHash } = cleanDocumentContent(rawContent, contentType)
      processedDocHashes.push(contentHash)

      const docId = `doc_${sourceId}_${computeContentHash(url).substring(0, 12)}`

      // 4c. Duplicate Detection & Unchanged Content Skipping
      const existingDoc = await IngestedDocument.findOne({ docId })

      if (existingDoc && existingDoc.contentHash === contentHash) {
        // Document content is identical to existing snapshot; skip re-chunking
        totalProcessed++
        continue
      }

      // 4d. Prepare document upsert with explicit provenance metadata
      docOperations.push({
        updateOne: {
          filter: { docId },
          update: {
            $set: {
              docId,
              sourceId,
              jobId,
              title: title || 'Untitled Document',
              url,
              contentHash,
              cleanedContent: isStoragePermitted ? cleanedText : '',
              contentType,
              documentVersion: source.activeVersionTag || '1.0',
              sectionHierarchy,
              storagePermitted: isStoragePermitted,
              contentOrigin,
              crossReferences,
            },
          },
          upsert: true,
        },
      })

      // 4e. Semantic Chunking with Explicit Provenance Fields
      const generatedChunks = chunkDocument({
        docId,
        sourceId,
        sourceSnapshotHash: contentHash,
        cleanedText,
        roleTags,
        topicTags,
        difficultyTier,
        documentVersion: source.activeVersionTag || '1.0',
        contentOrigin,
        canonicalSource: {
          name: canonicalSource.name || source.name,
          url: canonicalSource.url || url,
          passage: canonicalSource.passage || groundingPassage,
        },
        groundingPassage,
        codeExemplar,
        crossReferences,
      })

      // If document was previously ingested with different content, clear old chunks
      if (existingDoc) {
        await ContentChunk.deleteMany({ docId })
      }

      newChunksToInsert.push(...generatedChunks)
      totalChunksCreated += generatedChunks.length
      totalProcessed++
    } catch (docErr) {
      job.errorLog.push({
        documentUrl: docEntry.url || 'unknown',
        errorMessage: docErr.message,
        errorCode: 'DOCUMENT_PROCESSING_ERROR',
      })
    }
  }

  // 5. Execute bulk database operations
  if (docOperations.length > 0) {
    await IngestedDocument.bulkWrite(docOperations)
  }

  if (newChunksToInsert.length > 0) {
    await ContentChunk.insertMany(newChunksToInsert, { ordered: false })
  }

  // 6. Compute Snapshot Hash (SHA-256 tree hash of all document hashes)
  processedDocHashes.sort()
  const snapshotHash = computeContentHash(processedDocHashes.join(':'))

  // 7. Update Job Status
  job.documentsProcessed = totalProcessed
  job.chunksCreated = totalChunksCreated
  job.snapshotHash = snapshotHash
  job.finishedAt = new Date()

  if (job.errorLog.length === 0) {
    job.status = 'completed'
  } else if (totalProcessed > 0) {
    job.status = 'partial'
  } else {
    job.status = 'failed'
  }

  await job.save()

  // 8. Update KnowledgeSource if successful or partial
  if (job.status === 'completed' || job.status === 'partial') {
    source.lastSuccessfulIngestAt = new Date()
    await source.save()
  }

  return {
    success: job.status === 'completed' || job.status === 'partial',
    jobId: job.jobId,
    status: job.status,
    documentsProcessed: totalProcessed,
    chunksCreated: totalChunksCreated,
    snapshotHash,
    errorCount: job.errorLog.length,
    errors: job.errorLog,
  }
}
