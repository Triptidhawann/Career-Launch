import { generateCanonicalLesson, SUPPORTED_PILOT_TOPICS } from '../services/ai/lessonGenerator.js'
import { GeneratedLesson } from '../models/GeneratedLesson.js'
import { validateLessonStructure } from '../services/ai/lessonValidator.js'
import { ContentChunk } from '../models/ContentChunk.js'

/**
 * Triggers AI lesson generation for a pilot topic.
 * POST /api/admin/lessons/generate
 */
export async function triggerLessonGeneration(req, res) {
  const { topicId, roleId = 'software-engineer', difficulty, forceRegenerate = false } = req.body || {}

  if (!topicId) {
    return res.status(400).json({ error: 'topicId is required in request body.' })
  }

  if (!SUPPORTED_PILOT_TOPICS[topicId]) {
    return res.status(400).json({
      error: `Unsupported topicId "${topicId}". Phase 3 pilot only supports: [${Object.keys(SUPPORTED_PILOT_TOPICS).join(', ')}].`,
    })
  }

  try {
    const result = await generateCanonicalLesson({
      topicId,
      roleId,
      difficulty,
      forceRegenerate: Boolean(forceRegenerate),
    })

    if (!result.success) {
      return res.status(422).json({
        error: result.error || 'Generated lesson failed validation.',
        validation: result.validation,
      })
    }

    res.status(200).json({
      success: true,
      fromCache: result.fromCache,
      lesson: result.lesson,
    })
  } catch (error) {
    console.error(`[AdminLessonController] Generation error for topic "${topicId}":`, error)
    res.status(500).json({
      error: error.message || 'Failed to generate lesson.',
    })
  }
}

/**
 * Retrieves a single generated lesson by ID.
 * GET /api/admin/lessons/:lessonId
 */
export async function getLessonById(req, res) {
  const { lessonId } = req.params

  try {
    const lesson = await GeneratedLesson.findOne({ lessonId })
    if (!lesson) {
      return res.status(404).json({ error: `Lesson "${lessonId}" not found.` })
    }

    res.status(200).json({
      success: true,
      lesson,
    })
  } catch (error) {
    console.error(`[AdminLessonController] Error fetching lesson "${lessonId}":`, error)
    res.status(500).json({ error: 'Internal server error retrieving lesson.' })
  }
}

/**
 * Lists generated lessons with optional filtering.
 * GET /api/admin/lessons
 */
export async function listLessons(req, res) {
  const { roleId, topicId, isStale, validationStatus } = req.query || {}

  const filter = {}
  if (roleId) filter.roleId = roleId
  if (topicId) filter.topicId = topicId
  if (isStale !== undefined) filter.isStale = isStale === 'true'
  if (validationStatus) filter.validationStatus = validationStatus

  try {
    const lessons = await GeneratedLesson.find(filter)
      .sort({ generationTimestamp: -1 })
      .select('lessonId roleId topicId difficulty title estimatedMinutes validationStatus isStale generationTimestamp aiModel')
      .lean()

    res.status(200).json({
      success: true,
      count: lessons.length,
      lessons,
    })
  } catch (error) {
    console.error('[AdminLessonController] Error listing lessons:', error)
    res.status(500).json({ error: 'Internal server error listing lessons.' })
  }
}

/**
 * Re-validates an existing lesson against current source eligibility and citations.
 * POST /api/admin/lessons/:lessonId/validate
 */
export async function revalidateLesson(req, res) {
  const { lessonId } = req.params

  try {
    const lesson = await GeneratedLesson.findOne({ lessonId })
    if (!lesson) {
      return res.status(404).json({ error: `Lesson "${lessonId}" not found.` })
    }

    // Retrieve original chunks
    const chunks = await ContentChunk.find({ chunkId: { $in: lesson.retrievedChunkIds } }).lean()

    const validation = await validateLessonStructure({
      lessonContent: lesson.content,
      evidenceChunks: chunks,
    })

    const newStatus = validation.valid ? 'passed' : 'failed'
    lesson.validationStatus = newStatus
    lesson.validationDetails = {
      integrityPassed: validation.citationValidation.level1Passed,
      evidenceSupportPassed: validation.citationValidation.level2Passed,
      technicalAccuracyPassed: validation.citationValidation.level3Passed,
      errors: validation.errors,
      warnings: validation.warnings,
    }

    await lesson.save()

    res.status(200).json({
      success: true,
      lessonId,
      validationStatus: newStatus,
      validation,
    })
  } catch (error) {
    console.error(`[AdminLessonController] Error revalidating lesson "${lessonId}":`, error)
    res.status(500).json({ error: 'Internal server error revalidating lesson.' })
  }
}
