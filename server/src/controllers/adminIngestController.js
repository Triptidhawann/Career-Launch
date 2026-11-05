import { KnowledgeSource } from '../models/KnowledgeSource.js'
import { IngestionJob } from '../models/IngestionJob.js'
import { IngestedDocument } from '../models/IngestedDocument.js'
import { ContentChunk } from '../models/ContentChunk.js'
import { validateSourceLicence } from '../services/ingestion/sourceValidator.js'
import { executeIngestionJob } from '../services/ingestion/ingestionService.js'

/**
 * POST /api/admin/ingest/sources
 * Registers a new technical knowledge source with strict licence validation.
 */
export async function registerSource(req, res) {
  try {
    const {
      sourceId,
      name,
      owner,
      baseUrl,
      category,
      authorityTier,
      licence,
      ingestionMethod,
      allowedDomains,
      activeVersionTag,
    } = req.body

    if (!sourceId || !name || !owner || !baseUrl || !category || !authorityTier || !licence || !ingestionMethod || !allowedDomains) {
      res.status(400).json({
        error: 'Missing required fields for KnowledgeSource registration.',
        required: [
          'sourceId',
          'name',
          'owner',
          'baseUrl',
          'category',
          'authorityTier',
          'licence',
          'ingestionMethod',
          'allowedDomains',
        ],
      })
      return
    }

    // Pre-flight licence check
    const licenceEval = validateSourceLicence({
      sourceId,
      licence,
      ingestionMethod,
      allowedDomains,
    })

    const initialStatus = licenceEval.approved ? 'active' : 'rejected'
    const rejectionReason = licenceEval.approved ? '' : licenceEval.reason

    const source = await KnowledgeSource.findOneAndUpdate(
      { sourceId: sourceId.toLowerCase().trim() },
      {
        sourceId: sourceId.toLowerCase().trim(),
        name,
        owner,
        baseUrl,
        category,
        authorityTier,
        licence,
        ingestionMethod,
        allowedDomains,
        status: initialStatus,
        rejectionReason,
        activeVersionTag: activeVersionTag || '1.0',
      },
      { upsert: true, new: true, runValidators: true },
    )

    res.status(201).json({
      success: true,
      message: licenceEval.approved
        ? 'Knowledge source registered and verified for ingestion.'
        : `Knowledge source registered in REJECTED status: ${licenceEval.reason}`,
      source,
      licenceApproved: licenceEval.approved,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to register knowledge source.', details: err.message })
  }
}

/**
 * GET /api/admin/ingest/sources
 * Lists all registered knowledge sources.
 */
export async function listSources(_req, res) {
  try {
    const sources = await KnowledgeSource.find().sort({ createdAt: -1 })
    res.status(200).json({ success: true, count: sources.length, sources })
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve knowledge sources.', details: err.message })
  }
}

/**
 * GET /api/admin/ingest/sources/:sourceId
 * Inspects metadata and document stats for a specific source.
 */
export async function getSource(req, res) {
  try {
    const { sourceId } = req.params
    const source = await KnowledgeSource.findOne({ sourceId: sourceId.toLowerCase().trim() })

    if (!source) {
      res.status(404).json({ error: `KnowledgeSource "${sourceId}" not found.` })
      return
    }

    const documentCount = await IngestedDocument.countDocuments({ sourceId })
    const chunkCount = await ContentChunk.countDocuments({ sourceId })
    const recentJobs = await IngestionJob.find({ sourceId }).sort({ createdAt: -1 }).limit(5)

    res.status(200).json({
      success: true,
      source,
      metrics: {
        documentsIngested: documentCount,
        chunksCreated: chunkCount,
      },
      recentJobs,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to inspect knowledge source.', details: err.message })
  }
}

/**
 * POST /api/admin/ingest/trigger/:sourceId
 * Triggers an ingestion job for a registered source.
 */
export async function triggerIngestion(req, res) {
  try {
    const { sourceId } = req.params
    const { documents = [] } = req.body
    const initiatedBy = req.user?.uid || 'admin'

    const source = await KnowledgeSource.findOne({ sourceId: sourceId.toLowerCase().trim() })
    if (!source) {
      res.status(404).json({ error: `KnowledgeSource "${sourceId}" not found.` })
      return
    }

    if (source.status === 'rejected') {
      res.status(400).json({
        error: `Cannot trigger ingestion: Source is rejected. Reason: ${source.rejectionReason}`,
      })
      return
    }

    if (documents.length === 0) {
      res.status(400).json({
        error: 'Ingestion trigger payload must include a non-empty "documents" array for Phase 2A.',
      })
      return
    }

    // Execute ingestion
    const result = await executeIngestionJob({
      sourceId: source.sourceId,
      initiatedBy,
      documents,
    })

    res.status(200).json({
      success: result.success,
      message: result.success ? 'Ingestion job completed successfully.' : 'Ingestion job finished with errors.',
      result,
    })
  } catch (err) {
    res.status(500).json({ error: 'Ingestion pipeline execution failure.', details: err.message })
  }
}

/**
 * GET /api/admin/ingest/jobs
 * Lists recent ingestion jobs.
 */
export async function listJobs(_req, res) {
  try {
    const jobs = await IngestionJob.find().sort({ createdAt: -1 }).limit(20)
    res.status(200).json({ success: true, count: jobs.length, jobs })
  } catch (err) {
    res.status(500).json({ error: 'Failed to list ingestion jobs.', details: err.message })
  }
}

/**
 * GET /api/admin/ingest/jobs/:jobId
 * Inspects a specific ingestion job's status and logs.
 */
export async function getJob(req, res) {
  try {
    const { jobId } = req.params
    const job = await IngestionJob.findOne({ jobId })

    if (!job) {
      res.status(404).json({ error: `IngestionJob "${jobId}" not found.` })
      return
    }

    res.status(200).json({ success: true, job })
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve ingestion job.', details: err.message })
  }
}

/**
 * GET /api/admin/ingest/chunks/:topicTag
 * Lists verified chunks created for a specific topic tag (for provenance verification).
 */
export async function getChunksByTopic(req, res) {
  try {
    const { topicTag } = req.params
    const chunks = await ContentChunk.find({ topicTags: topicTag }).sort({ createdAt: -1 }).limit(50)

    res.status(200).json({
      success: true,
      topicTag,
      count: chunks.length,
      chunks,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve topic chunks.', details: err.message })
  }
}
