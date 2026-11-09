import mongoose from 'mongoose'
import { PreparationSession } from '../models/PreparationSession.js'
import { DiagnosticSession } from '../models/DiagnosticSession.js'
import { PreparationPlan } from '../models/PreparationPlan.js'
import {
  initializeDiagnosticQuestions,
  sanitizeQuestionForClient,
  evaluateAnswer,
  selectNextAdaptiveQuestion,
  compileDiagnosticOutcomes,
} from '../services/diagnostic/adaptiveDiagnosticEngine.js'
import { generatePersonalisedPlan } from '../services/ai/planGenerator.js'
import { validatePreparationPlan } from '../services/ai/planValidator.js'
import { OFFICIAL_FRONTEND_TOPICS } from '../services/ai/curriculumRegistry.js'

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

function formatDiagnosticPayload(diagnostic) {
  const currentQ = diagnostic.questions[diagnostic.currentIndex] || null
  return {
    diagnosticId: diagnostic._id.toString(),
    sessionId: diagnostic.sessionId.toString(),
    roleId: diagnostic.roleId,
    status: diagnostic.status,
    currentIndex: diagnostic.currentIndex,
    maxQuestions: diagnostic.maxQuestions,
    totalQuestionsAssigned: diagnostic.questions.length,
    currentQuestion: sanitizeQuestionForClient(currentQ),
    answeredQuestions: diagnostic.questions
      .filter((q) => q.answeredAt || q.isSkipped)
      .map((q) => ({
        questionId: q.questionId,
        topicId: q.topicId,
        topicTitle: q.topicTitle,
        difficulty: q.difficulty,
        type: q.type,
        isSkipped: q.isSkipped,
        isCorrect: q.isCorrect,
        score: q.score,
        evaluationFeedback: q.evaluationFeedback,
      })),
    demonstratedStrengths: diagnostic.demonstratedStrengths || [],
    demonstratedGaps: diagnostic.demonstratedGaps || [],
    unassessedTopics: diagnostic.unassessedTopics || [],
    diagnosticScore: diagnostic.diagnosticScore || 0,
    completedAt: diagnostic.completedAt,
    createdAt: diagnostic.createdAt,
    updatedAt: diagnostic.updatedAt,
  }
}

function formatPlanPayload(plan) {
  return {
    planId: plan._id.toString(),
    sessionId: plan.sessionId ? plan.sessionId.toString() : null,
    diagnosticId: plan.diagnosticId ? plan.diagnosticId.toString() : null,
    roleId: plan.roleId,
    status: plan.status,
    overview: plan.overview,
    knowledgeAssessment: plan.knowledgeAssessment,
    milestones: plan.milestones,
    weeklySchedule: plan.weeklySchedule,
    practiceRecommendations: plan.practiceRecommendations,
    generationMetadata: plan.generationMetadata,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
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

    // 5. Validate custom topics
    if (!Array.isArray(customTopics)) {
      return res.status(400).json({
        success: false,
        error: 'customTopics must be an array.',
      })
    }

    if (customTopics.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'Exceeded maximum of 20 custom topics.',
      })
    }

    const seenCustom = new Set()
    const sanitizedCustomTopics = []
    for (const ct of customTopics) {
      const rawTitle = typeof ct === 'string' ? ct : String(ct?.title || '')
      const title = rawTitle.trim()
      if (!title) continue
      const lower = title.toLowerCase()
      if (seenCustom.has(lower)) continue
      seenCustom.add(lower)
      sanitizedCustomTopics.push({
        title: title.slice(0, 100),
        source: 'student_custom',
      })
    }

    // 6. Validate legacy arrays
    const sanitizedKnownTopics = Array.isArray(knownTopics)
      ? Array.from(new Set(knownTopics.map((t) => String(t).trim()).filter(Boolean))).slice(0, 50)
      : []

    const sanitizedWeakTopics = Array.isArray(weakTopics)
      ? Array.from(new Set(weakTopics.map((t) => String(t).trim()).filter(Boolean))).slice(0, 50)
      : []

    // 7. Upsert session for (firebaseUid, roleId)
    const filter = { firebaseUid, roleId: roleId.trim() }
    const update = {
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
      selectedDirectTopicId: selectedDirectTopicId ? String(selectedDirectTopicId).trim().slice(0, 60) : null,
      status: 'setup_saved',
    }

    const options = { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    const session = await PreparationSession.findOneAndUpdate(filter, update, options)

    return res.status(200).json({
      success: true,
      sessionId: session._id.toString(),
      session: formatSessionPayload(session),
      message: 'Preparation preferences saved successfully.',
    })
  } catch (error) {
    console.error('[PrepController] Error saving preparation setup:', error.message)
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while saving your preparation setup.',
    })
  }
}

/**
 * GET /api/prep/setup/:sessionId
 * Retrieves a saved preparation setup by ID.
 * Enforces ownership strictly via verified req.user.uid.
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
        error: 'Preparation setup session not found.',
      })
    }

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

// =============================================================================
// DIAGNOSTIC CONTROLLERS (Phase B2)
// =============================================================================

/**
 * POST /api/prep/diagnostic/start
 * Initializes or resumes an adaptive knowledge diagnostic session.
 */
export async function startDiagnostic(req, res) {
  try {
    const firebaseUid = req.user?.uid || req.user?.user_id
    if (!firebaseUid) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing student UID.' })
    }

    const { sessionId } = req.body
    if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ success: false, error: 'Valid sessionId is required to start diagnostic.' })
    }

    const prepSession = await PreparationSession.findById(sessionId)
    if (!prepSession) {
      return res.status(404).json({ success: false, error: 'Preparation session not found.' })
    }

    if (prepSession.firebaseUid !== firebaseUid) {
      return res.status(403).json({ success: false, error: 'Forbidden: You do not own this preparation session.' })
    }

    // Check if an in-progress diagnostic already exists
    let diagnostic = await DiagnosticSession.findOne({
      sessionId: prepSession._id,
      firebaseUid,
      status: 'in_progress',
    })

    if (!diagnostic) {
      const { initialQuestion, maxQuestions } = initializeDiagnosticQuestions({ session: prepSession })
      diagnostic = new DiagnosticSession({
        firebaseUid,
        sessionId: prepSession._id,
        roleId: prepSession.roleId,
        status: 'in_progress',
        questions: [initialQuestion],
        currentIndex: 0,
        maxQuestions,
      })
      await diagnostic.save()
    }

    return res.status(200).json({
      success: true,
      diagnostic: formatDiagnosticPayload(diagnostic),
    })
  } catch (error) {
    console.error('[PrepController] Error starting diagnostic:', error.message)
    return res.status(500).json({ success: false, error: 'Internal error starting diagnostic.' })
  }
}

/**
 * POST /api/prep/diagnostic/answer
 * Evaluates candidate answer deterministically / via rubric and serves next adaptive question.
 */
export async function answerDiagnosticQuestion(req, res) {
  try {
    const firebaseUid = req.user?.uid || req.user?.user_id
    if (!firebaseUid) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing student UID.' })
    }

    const { diagnosticId, questionId, studentAnswer, isSkipped = false } = req.body
    if (!diagnosticId || !mongoose.Types.ObjectId.isValid(diagnosticId)) {
      return res.status(400).json({ success: false, error: 'Valid diagnosticId is required.' })
    }

    const diagnostic = await DiagnosticSession.findById(diagnosticId)
    if (!diagnostic) {
      return res.status(404).json({ success: false, error: 'Diagnostic session not found.' })
    }

    if (diagnostic.firebaseUid !== firebaseUid) {
      return res.status(403).json({ success: false, error: 'Forbidden: You do not own this diagnostic session.' })
    }

    if (diagnostic.status !== 'in_progress') {
      return res.status(400).json({ success: false, error: `Diagnostic session is already ${diagnostic.status}.` })
    }

    // Find the question being answered
    const currentQuestion = diagnostic.questions.find((q) => q.questionId === questionId)
    if (!currentQuestion) {
      return res.status(404).json({ success: false, error: `Question '${questionId}' not found in active session.` })
    }

    // Evaluate response
    const evaluation = evaluateAnswer({
      question: currentQuestion,
      studentAnswer,
      isSkipped: Boolean(isSkipped),
    })

    currentQuestion.studentAnswer = isSkipped ? null : studentAnswer
    currentQuestion.isSkipped = Boolean(isSkipped)
    currentQuestion.isCorrect = evaluation.isCorrect
    currentQuestion.score = evaluation.score
    currentQuestion.evaluationFeedback = evaluation.feedback
    currentQuestion.answeredAt = new Date()

    // Determine next question
    const nextQuestion = selectNextAdaptiveQuestion({
      answeredQuestions: diagnostic.questions,
      maxQuestions: diagnostic.maxQuestions,
    })

    let isFinished = false
    if (!nextQuestion) {
      isFinished = true
      diagnostic.status = 'completed'
      diagnostic.completedAt = new Date()

      const outcomes = compileDiagnosticOutcomes({
        questions: diagnostic.questions,
        allCurriculumTopics: Object.values(OFFICIAL_FRONTEND_TOPICS),
        wasSkipped: false,
      })

      diagnostic.demonstratedStrengths = outcomes.demonstratedStrengths
      diagnostic.demonstratedGaps = outcomes.demonstratedGaps
      diagnostic.unassessedTopics = outcomes.unassessedTopics
      diagnostic.diagnosticScore = outcomes.diagnosticScore
    } else {
      diagnostic.questions.push(nextQuestion)
      diagnostic.currentIndex = diagnostic.questions.length - 1
    }

    await diagnostic.save()

    return res.status(200).json({
      success: true,
      isFinished,
      evaluation: {
        isCorrect: evaluation.isCorrect,
        score: evaluation.score,
        feedback: evaluation.feedback,
        explanation: evaluation.explanation,
      },
      nextQuestion: nextQuestion ? sanitizeQuestionForClient(nextQuestion) : null,
      currentIndex: diagnostic.currentIndex,
      diagnostic: formatDiagnosticPayload(diagnostic),
    })
  } catch (error) {
    console.error('[PrepController] Error evaluating diagnostic answer:', error.message)
    return res.status(500).json({ success: false, error: 'Internal error processing diagnostic response.' })
  }
}

/**
 * POST /api/prep/diagnostic/complete
 * Completes or skips the diagnostic session early.
 */
export async function completeDiagnostic(req, res) {
  try {
    const firebaseUid = req.user?.uid || req.user?.user_id
    if (!firebaseUid) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing student UID.' })
    }

    const { diagnosticId, skipped = false } = req.body
    if (!diagnosticId || !mongoose.Types.ObjectId.isValid(diagnosticId)) {
      return res.status(400).json({ success: false, error: 'Valid diagnosticId is required.' })
    }

    const diagnostic = await DiagnosticSession.findById(diagnosticId)
    if (!diagnostic) {
      return res.status(404).json({ success: false, error: 'Diagnostic session not found.' })
    }

    if (diagnostic.firebaseUid !== firebaseUid) {
      return res.status(403).json({ success: false, error: 'Forbidden: You do not own this diagnostic session.' })
    }

    const wasSkipped = Boolean(skipped) || diagnostic.questions.every((q) => !q.answeredAt)
    diagnostic.status = wasSkipped ? 'skipped' : 'completed'
    diagnostic.completedAt = new Date()

    const outcomes = compileDiagnosticOutcomes({
      questions: diagnostic.questions,
      allCurriculumTopics: Object.values(OFFICIAL_FRONTEND_TOPICS),
      wasSkipped,
    })

    diagnostic.demonstratedStrengths = outcomes.demonstratedStrengths
    diagnostic.demonstratedGaps = outcomes.demonstratedGaps
    diagnostic.unassessedTopics = outcomes.unassessedTopics
    diagnostic.diagnosticScore = outcomes.diagnosticScore

    await diagnostic.save()

    return res.status(200).json({
      success: true,
      diagnostic: formatDiagnosticPayload(diagnostic),
    })
  } catch (error) {
    console.error('[PrepController] Error completing diagnostic:', error.message)
    return res.status(500).json({ success: false, error: 'Internal error completing diagnostic.' })
  }
}

/**
 * GET /api/prep/diagnostic/:diagnosticId
 * Retrieves diagnostic session by ID.
 */
export async function getDiagnosticSession(req, res) {
  try {
    const firebaseUid = req.user?.uid || req.user?.user_id
    if (!firebaseUid) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing student UID.' })
    }

    const { diagnosticId } = req.params
    if (!diagnosticId || !mongoose.Types.ObjectId.isValid(diagnosticId)) {
      return res.status(400).json({ success: false, error: 'Valid diagnosticId is required.' })
    }

    const diagnostic = await DiagnosticSession.findById(diagnosticId)
    if (!diagnostic) {
      return res.status(404).json({ success: false, error: 'Diagnostic session not found.' })
    }

    if (diagnostic.firebaseUid !== firebaseUid) {
      return res.status(403).json({ success: false, error: 'Forbidden: You do not own this diagnostic session.' })
    }

    return res.status(200).json({
      success: true,
      diagnostic: formatDiagnosticPayload(diagnostic),
    })
  } catch (error) {
    console.error('[PrepController] Error retrieving diagnostic:', error.message)
    return res.status(500).json({ success: false, error: 'Internal error retrieving diagnostic.' })
  }
}

// =============================================================================
// PREPARATION PLAN CONTROLLERS (Phase B2)
// =============================================================================

/**
 * POST /api/prep/plan/generate
 * Synthesizes a personalised preparation plan via Groq model openai/gpt-oss-120b.
 * Strictly preserves previous plans if generation fails.
 */
export async function generatePreparationPlanHandler(req, res) {
  try {
    const firebaseUid = req.user?.uid || req.user?.user_id
    if (!firebaseUid) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing student UID.' })
    }

    const { sessionId, diagnosticId } = req.body
    if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ success: false, error: 'Valid sessionId is required to generate a plan.' })
    }

    const session = await PreparationSession.findById(sessionId)
    if (!session) {
      return res.status(404).json({ success: false, error: 'Preparation session not found.' })
    }

    if (session.firebaseUid !== firebaseUid) {
      return res.status(403).json({ success: false, error: 'Forbidden: You do not own this preparation session.' })
    }

    let diagnosticSession = null
    if (diagnosticId && mongoose.Types.ObjectId.isValid(diagnosticId)) {
      diagnosticSession = await DiagnosticSession.findById(diagnosticId)
      if (diagnosticSession && diagnosticSession.firebaseUid !== firebaseUid) {
        return res.status(403).json({ success: false, error: 'Forbidden: You do not own this diagnostic session.' })
      }
    } else {
      // Find latest completed/skipped diagnostic for this session if available
      diagnosticSession = await DiagnosticSession.findOne({
        sessionId: session._id,
        firebaseUid,
      }).sort({ updatedAt: -1 })
    }

    // Call Groq AI plan synthesis
    const generationResult = await generatePersonalisedPlan({
      session,
      diagnosticSession,
    })

    const { plan: planData, tokenUsage, durationMs, provider, model } = generationResult

    // Upsert or create new preparation plan
    let plan = await PreparationPlan.findOne({
      sessionId: session._id,
      firebaseUid,
      status: { $in: ['draft', 'customized'] },
    })

    if (!plan) {
      plan = new PreparationPlan({
        firebaseUid,
        sessionId: session._id,
        diagnosticId: diagnosticSession?._id || null,
        roleId: session.roleId,
        status: 'draft',
      })
    }

    plan.overview = planData.overview
    plan.knowledgeAssessment = planData.knowledgeAssessment
    plan.milestones = planData.milestones
    plan.weeklySchedule = planData.weeklySchedule
    plan.practiceRecommendations = planData.practiceRecommendations
    plan.generationMetadata = {
      provider,
      model,
      tokensUsed: tokenUsage || {},
      durationMs: durationMs || 0,
      generatedAt: new Date(),
      acceptedAt: null,
    }

    await plan.save()

    // Mark session status as plan_ready
    session.status = 'plan_pending'
    await session.save()

    return res.status(200).json({
      success: true,
      planId: plan._id.toString(),
      plan: formatPlanPayload(plan),
      message: 'Personalised preparation plan synthesized successfully.',
    })
  } catch (error) {
    console.error('[PrepController] Error generating preparation plan:', error.message)
    return res.status(500).json({
      success: false,
      error: `Failed to generate preparation plan: ${error.message}`,
    })
  }
}

/**
 * GET /api/prep/plan/:planId
 * Retrieves a preparation plan by ID, enforcing verified student ownership.
 */
export async function getPreparationPlan(req, res) {
  try {
    const firebaseUid = req.user?.uid || req.user?.user_id
    if (!firebaseUid) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing student UID.' })
    }

    const { planId } = req.params
    if (!planId || !mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({ success: false, error: 'Valid planId is required.' })
    }

    const plan = await PreparationPlan.findById(planId)
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Preparation plan not found.' })
    }

    if (plan.firebaseUid !== firebaseUid) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to access this preparation plan.',
      })
    }

    return res.status(200).json({
      success: true,
      plan: formatPlanPayload(plan),
    })
  } catch (error) {
    console.error('[PrepController] Error retrieving preparation plan:', error.message)
    return res.status(500).json({ success: false, error: 'Internal error retrieving preparation plan.' })
  }
}

/**
 * GET /api/prep/plan/latest?roleId=...
 * Retrieves the authenticated student's most recent plan.
 */
export async function getLatestPreparationPlan(req, res) {
  try {
    const firebaseUid = req.user?.uid || req.user?.user_id
    if (!firebaseUid) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing student UID.' })
    }

    const { roleId } = req.query
    const query = { firebaseUid }
    if (roleId && ALLOWED_ROLES.includes(roleId.trim())) {
      query.roleId = roleId.trim()
    }

    const plan = await PreparationPlan.findOne(query).sort({ updatedAt: -1 })
    if (!plan) {
      return res.status(200).json({ success: true, plan: null })
    }

    return res.status(200).json({
      success: true,
      plan: formatPlanPayload(plan),
    })
  } catch (error) {
    console.error('[PrepController] Error retrieving latest preparation plan:', error.message)
    return res.status(500).json({ success: false, error: 'Internal error retrieving latest preparation plan.' })
  }
}

/**
 * PUT /api/prep/plan/:planId/customize
 * Allows candidate to reorder, add, remove, or modify milestones.
 */
export async function customizePreparationPlanHandler(req, res) {
  try {
    const firebaseUid = req.user?.uid || req.user?.user_id
    if (!firebaseUid) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing student UID.' })
    }

    const { planId } = req.params
    if (!planId || !mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({ success: false, error: 'Valid planId is required.' })
    }

    const plan = await PreparationPlan.findById(planId)
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Preparation plan not found.' })
    }

    if (plan.firebaseUid !== firebaseUid) {
      return res.status(403).json({ success: false, error: 'Forbidden: You do not own this preparation plan.' })
    }

    const { milestones, weeklySchedule, overview } = req.body

    const candidatePlan = {
      overview: overview || plan.overview,
      knowledgeAssessment: plan.knowledgeAssessment,
      milestones: Array.isArray(milestones) ? milestones : plan.milestones,
      weeklySchedule: Array.isArray(weeklySchedule) ? weeklySchedule : plan.weeklySchedule,
      practiceRecommendations: plan.practiceRecommendations,
    }

    const validation = validatePreparationPlan(candidatePlan)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: `Invalid plan customization: ${validation.errors.join('; ')}`,
      })
    }

    if (overview) plan.overview = overview
    if (Array.isArray(milestones)) plan.milestones = milestones
    if (Array.isArray(weeklySchedule)) plan.weeklySchedule = weeklySchedule
    plan.status = 'customized'

    await plan.save()

    return res.status(200).json({
      success: true,
      plan: formatPlanPayload(plan),
      message: 'Plan customized successfully.',
    })
  } catch (error) {
    console.error('[PrepController] Error customizing preparation plan:', error.message)
    return res.status(500).json({ success: false, error: 'Internal error customizing preparation plan.' })
  }
}

/**
 * POST /api/prep/plan/:planId/accept
 * Candidate officially accepts the preparation plan.
 */
export async function acceptPreparationPlanHandler(req, res) {
  try {
    const firebaseUid = req.user?.uid || req.user?.user_id
    if (!firebaseUid) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing student UID.' })
    }

    const { planId } = req.params
    if (!planId || !mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({ success: false, error: 'Valid planId is required.' })
    }

    const plan = await PreparationPlan.findById(planId)
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Preparation plan not found.' })
    }

    if (plan.firebaseUid !== firebaseUid) {
      return res.status(403).json({ success: false, error: 'Forbidden: You do not own this preparation plan.' })
    }

    plan.status = 'accepted'
    plan.generationMetadata.acceptedAt = new Date()

    await plan.save()

    // Also update associated session status
    if (plan.sessionId) {
      await PreparationSession.findByIdAndUpdate(plan.sessionId, { status: 'active' })
    }

    return res.status(200).json({
      success: true,
      plan: formatPlanPayload(plan),
      message: 'Preparation plan accepted and finalized. Ready for structured learning milestones.',
    })
  } catch (error) {
    console.error('[PrepController] Error accepting preparation plan:', error.message)
    return res.status(500).json({ success: false, error: 'Internal error accepting preparation plan.' })
  }
}
