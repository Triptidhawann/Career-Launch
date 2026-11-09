import mongoose from 'mongoose'
import { PreparationSession } from '../models/PreparationSession.js'

const ALLOWED_ROLES = [
  'frontend-developer',
  'backend-developer',
  'full-stack-developer',
  'software-engineer',
  'data-analyst',
  'data-scientist',
  'devops-engineer',
  'mobile-app-developer',
]

const ALLOWED_EXPERIENCE = ['beginner', 'intermediate', 'advanced']
const ALLOWED_TIMELINES = ['1_week', '2_4_weeks', '1_2_months', 'custom']
const ALLOWED_GOALS = ['internship', 'placement', 'technical_interview', 'skill_improvement']

function formatSessionPayload(session) {
  return {
    sessionId: session._id.toString(),
    roleId: session.roleId,
    goalPrompt: session.goalPrompt,
    experienceLevel: session.experienceLevel,
    officialTopics: (session.officialTopics || []).map((t) => ({
      topicId: t.topicId,
      title: t.title,
      source: t.source || 'curriculum',
    })),
    customTopics: (session.customTopics || []).map((t) => ({
      title: t.title,
      source: t.source || 'student_custom',
    })),
    knownTopics: session.knownTopics || [],
    weakTopics: session.weakTopics || [],
    preparationTimeline: session.preparationTimeline,
    primaryGoal: session.primaryGoal,
    selectedDirectTopicId: session.selectedDirectTopicId,
    status: session.status,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  }
}

/**
 * POST /api/prep/setup
 * Validates and saves personal preparation setup.
 * Enforces ownership strictly via verified req.user.uid.
 */
export async function savePreparationSetup(req, res) {
  try {
    const firebaseUid = req.user?.uid || req.user?.user_id
    if (!firebaseUid) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing verified student UID in token.',
      })
    }

    const {
      roleId,
      goalPrompt,
      experienceLevel = 'intermediate',
      officialTopics = [],
      customTopics = [],
      knownTopics = [],
      weakTopics = [],
      preparationTimeline = '2_4_weeks',
      primaryGoal = 'placement',
      selectedDirectTopicId = null,
    } = req.body

    // 1. Validate roleId
    if (!roleId || typeof roleId !== 'string' || !ALLOWED_ROLES.includes(roleId.trim())) {
      return res.status(400).json({
        success: false,
        error: `Invalid or missing roleId. Must be one of: [${ALLOWED_ROLES.join(', ')}].`,
      })
    }

    // 2. Validate goalPrompt
    if (!goalPrompt || typeof goalPrompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Goal prompt is required and must be text.',
      })
    }

    const trimmedPrompt = goalPrompt.trim()
    if (trimmedPrompt.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Goal prompt is too short. Please provide at least 5 characters describing what you want to prepare.',
      })
    }

    if (trimmedPrompt.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Goal prompt exceeds maximum allowed length of 2000 characters.',
      })
    }

    // 3. Validate structured selections
    if (!ALLOWED_EXPERIENCE.includes(experienceLevel)) {
      return res.status(400).json({
        success: false,
        error: `Invalid experienceLevel. Must be one of: [${ALLOWED_EXPERIENCE.join(', ')}].`,
      })
    }

    if (!ALLOWED_TIMELINES.includes(preparationTimeline)) {
      return res.status(400).json({
        success: false,
        error: `Invalid preparationTimeline. Must be one of: [${ALLOWED_TIMELINES.join(', ')}].`,
      })
    }

    if (!ALLOWED_GOALS.includes(primaryGoal)) {
      return res.status(400).json({
        success: false,
        error: `Invalid primaryGoal. Must be one of: [${ALLOWED_GOALS.join(', ')}].`,
      })
    }

    // 4. Validate official curriculum topics
    if (!Array.isArray(officialTopics)) {
      return res.status(400).json({
        success: false,
        error: 'officialTopics must be an array.',
      })
    }

    if (officialTopics.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Exceeded maximum of 50 topics in officialTopics.',
      })
    }

    const seenOfficial = new Set()
    const sanitizedOfficialTopics = []
    for (const t of officialTopics) {
      const topicId = typeof t === 'string' ? t.trim() : String(t?.topicId || '').trim()
      const title = typeof t === 'object' && t?.title ? String(t.title).trim() : topicId
      if (!topicId || seenOfficial.has(topicId)) continue
      seenOfficial.add(topicId)
      sanitizedOfficialTopics.push({
        topicId: topicId.slice(0, 50),
        title: title.slice(0, 150),
        source: 'curriculum',
      })
    }

    // 5. Validate custom student topics
    if (!Array.isArray(customTopics)) {
      return res.status(400).json({
        success: false,
        error: 'customTopics must be an array.',
      })
    }

    if (customTopics.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Exceeded maximum of 50 topics in customTopics.',
      })
    }

    const seenCustom = new Set()
    const sanitizedCustomTopics = []
    for (const item of customTopics) {
      const title = typeof item === 'string' ? item.trim() : String(item?.title || '').trim()
      if (!title) continue
      const lower = title.toLowerCase()
      if (seenCustom.has(lower)) continue
      seenCustom.add(lower)
      sanitizedCustomTopics.push({
        title: title.slice(0, 100),
        source: 'student_custom',
      })
    }

    // 6. Validate legacy topic arrays (for backward compatibility)
    const sanitizedKnownTopics = Array.isArray(knownTopics)
      ? knownTopics.filter((t) => typeof t === 'string' && t.trim().length > 0).map((t) => t.trim().slice(0, 100))
      : []

    const sanitizedWeakTopics = Array.isArray(weakTopics)
      ? weakTopics.filter((t) => typeof t === 'string' && t.trim().length > 0).map((t) => t.trim().slice(0, 100))
      : []

    const cleanDirectTopic =
      typeof selectedDirectTopicId === 'string' && selectedDirectTopicId.trim().length > 0
        ? selectedDirectTopicId.trim().slice(0, 100)
        : null

    // 7. Upsert active/saved session for this student and role
    let session = await PreparationSession.findOne({
      firebaseUid,
      roleId: roleId.trim(),
      status: { $in: ['setup_saved', 'plan_pending', 'active'] },
    })

    if (session) {
      session.goalPrompt = trimmedPrompt
      session.experienceLevel = experienceLevel
      session.officialTopics = sanitizedOfficialTopics
      session.customTopics = sanitizedCustomTopics
      session.knownTopics = sanitizedKnownTopics
      session.weakTopics = sanitizedWeakTopics
      session.preparationTimeline = preparationTimeline
      session.primaryGoal = primaryGoal
      session.selectedDirectTopicId = cleanDirectTopic
      session.status = 'setup_saved'
      await session.save()
    } else {
      session = await PreparationSession.create({
        firebaseUid,
        roleId: roleId.trim(),
        goalPrompt: trimmedPrompt,
        experienceLevel,
        officialTopics: sanitizedOfficialTopics,
        customTopics: sanitizedCustomTopics,
        knownTopics: sanitizedKnownTopics,
        weakTopics: sanitizedWeakTopics,
        preparationTimeline,
        primaryGoal,
        selectedDirectTopicId: cleanDirectTopic,
        status: 'setup_saved',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Preparation setup saved successfully.',
      session: formatSessionPayload(session),
    })
  } catch (error) {
    console.error('[PrepController] Error saving preparation setup:', error.message)
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while saving preparation setup.',
    })
  }
}

/**
 * GET /api/prep/setup/:sessionId
 * Retrieves a saved preparation setup by ID.
 * Strictly verifies that the authenticated student owns the session.
 */
export async function getPreparationSetup(req, res) {
  try {
    const firebaseUid = req.user?.uid || req.user?.user_id
    if (!firebaseUid) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing verified student UID in token.',
      })
    }

    const { sessionId } = req.params
    if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sessionId parameter format.',
      })
    }

    const session = await PreparationSession.findById(sessionId)
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Preparation session not found.',
      })
    }

    // Security Check: Cross-student data isolation
    if (session.firebaseUid !== firebaseUid) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to access this preparation session.',
      })
    }

    return res.status(200).json({
      success: true,
      session: formatSessionPayload(session),
    })
  } catch (error) {
    console.error('[PrepController] Error retrieving preparation setup:', error.message)
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while retrieving preparation setup.',
    })
  }
}

/**
 * GET /api/prep/session/latest?roleId=...
 * Retrieves the authenticated student's most recent session for a role.
 */
export async function getLatestPreparationSession(req, res) {
  try {
    const firebaseUid = req.user?.uid || req.user?.user_id
    if (!firebaseUid) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing verified student UID in token.',
      })
    }

    const { roleId } = req.query
    const query = { firebaseUid }
    if (roleId && ALLOWED_ROLES.includes(roleId.trim())) {
      query.roleId = roleId.trim()
    }

    const session = await PreparationSession.findOne(query).sort({ updatedAt: -1 })

    if (!session) {
      return res.status(200).json({
        success: true,
        session: null,
      })
    }

    return res.status(200).json({
      success: true,
      session: formatSessionPayload(session),
    })
  } catch (error) {
    console.error('[PrepController] Error retrieving latest preparation session:', error.message)
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while retrieving latest preparation session.',
    })
  }
}
