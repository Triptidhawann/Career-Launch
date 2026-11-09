import { StudentSkillSelection } from '../models/StudentSkillSelection.js'
import { LearningSession } from '../models/LearningSession.js'
import { LearningMessage } from '../models/LearningMessage.js'
import { learningAssistantService } from '../services/ai/learningAssistantService.js'
import {
  getSkillsByRoleId,
  validateSkillIds,
} from '../data/roleSkillTaxonomy.js'

const VALID_ROLE_IDS = [
  'frontend-developer',
  'backend-developer',
  'full-stack-developer',
  'software-engineer',
  'data-analyst',
  'data-scientist',
  'devops-engineer',
  'mobile-app-developer',
]

/**
 * GET /api/learning/skills/:roleId
 * Returns the simplified top-level skill names for a role (no subtopics, no descriptions).
 */
export async function getRoleSkills(req, res) {
  try {
    const { roleId } = req.params

    if (!roleId || !VALID_ROLE_IDS.includes(roleId)) {
      return res.status(400).json({
        error: `Invalid or unsupported roleId '${roleId}'. Allowed roles: ${VALID_ROLE_IDS.join(', ')}`,
      })
    }

    const roleData = getSkillsByRoleId(roleId)

    if (!roleData) {
      return res.status(404).json({
        error: `Skill definitions not found for role '${roleId}'. Frontend Developer is currently the pilot role.`,
      })
    }

    return res.status(200).json({
      success: true,
      roleId: roleData.roleId,
      roleTitle: roleData.roleTitle,
      subtitle: roleData.subtitle,
      skills: roleData.skills.map((s) => ({
        id: s.id,
        name: s.name,
      })),
      totalSkills: roleData.skills.length,
    })
  } catch (error) {
    console.error('[LearningController] getRoleSkills error:', error)
    return res.status(500).json({
      error: 'Failed to retrieve role skills.',
      details: error.message,
    })
  }
}

/**
 * GET /api/learning/selection/:roleId
 * Retrieves the student's saved skill selection for a role.
 */
export async function getStudentSkillSelection(req, res) {
  try {
    const firebaseUid = req.user?.uid
    const { roleId } = req.params

    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication.' })
    }

    if (!roleId || !VALID_ROLE_IDS.includes(roleId)) {
      return res.status(400).json({
        error: `Invalid or unsupported roleId '${roleId}'.`,
      })
    }

    const selection = await StudentSkillSelection.findOne({ firebaseUid, roleId })

    if (!selection) {
      return res.status(200).json({
        exists: false,
        roleId,
        selectedSkills: [],
        customSkills: [],
        updatedAt: null,
      })
    }

    return res.status(200).json({
      exists: true,
      roleId: selection.roleId,
      selectedSkills: selection.selectedSkills,
      customSkills: selection.customSkills,
      updatedAt: selection.updatedAt,
      createdAt: selection.createdAt,
    })
  } catch (error) {
    console.error('[LearningController] getStudentSkillSelection error:', error)
    return res.status(500).json({
      error: 'Failed to retrieve student skill selection.',
      details: error.message,
    })
  }
}

/**
 * PUT /api/learning/selection/:roleId
 * Saves or updates the student's selected skills and custom skills for a role.
 */
export async function saveStudentSkillSelection(req, res) {
  try {
    const firebaseUid = req.user?.uid
    const { roleId } = req.params

    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication.' })
    }

    if (!roleId || !VALID_ROLE_IDS.includes(roleId)) {
      return res.status(400).json({
        error: `Invalid or unsupported roleId '${roleId}'.`,
      })
    }

    const { selectedSkillIds = [], customSkills = [] } = req.body

    if (!Array.isArray(selectedSkillIds)) {
      return res.status(400).json({
        error: 'Invalid payload: selectedSkillIds must be an array of skill IDs or names.',
      })
    }

    if (!Array.isArray(customSkills)) {
      return res.status(400).json({
        error: 'Invalid payload: customSkills must be an array.',
      })
    }

    // Validate and map official skill IDs
    const { validSkills, invalidIds } = validateSkillIds(roleId, selectedSkillIds)

    const mappedSkills = validSkills.map((s) => ({
      skillId: s.id,
      name: s.name,
      categoryId: s.id,
      categoryName: s.name,
      officialTopicId: s.canonicalTopics?.[0] || null,
      knowledgeSupportStatus: 'verified',
    }))

    // Clean and deduplicate custom skills
    const seenCustom = new Set()
    const cleanedCustom = []

    for (const item of customSkills) {
      const name = typeof item === 'string' ? item.trim() : item?.name?.trim()
      if (!name) continue
      if (name.length > 100) {
        return res.status(400).json({
          error: `Custom skill name '${name.substring(0, 20)}...' exceeds maximum length of 100 characters.`,
        })
      }

      const lower = name.toLowerCase()
      if (!seenCustom.has(lower)) {
        seenCustom.add(lower)
        cleanedCustom.push({
          name,
          requestedAt: item?.requestedAt ? new Date(item.requestedAt) : new Date(),
        })
      }
    }

    // Upsert the student's selection for this role
    const updatedRecord = await StudentSkillSelection.findOneAndUpdate(
      { firebaseUid, roleId },
      {
        $set: {
          selectedSkills: mappedSkills,
          customSkills: cleanedCustom,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    )

    return res.status(200).json({
      success: true,
      message: 'Student skill selection saved successfully.',
      selection: {
        roleId: updatedRecord.roleId,
        selectedSkills: updatedRecord.selectedSkills,
        customSkills: updatedRecord.customSkills,
        totalSelected: updatedRecord.selectedSkills.length + updatedRecord.customSkills.length,
        updatedAt: updatedRecord.updatedAt,
      },
      ignoredInvalidSkillIds: invalidIds.length > 0 ? invalidIds : undefined,
    })
  } catch (error) {
    console.error('[LearningController] saveStudentSkillSelection error:', error)
    return res.status(500).json({
      error: 'Failed to save student skill selection.',
      details: error.message,
    })
  }
}

/**
 * POST /api/learning/sessions
 * Starts or retrieves the active continuous learning session for the student and role.
 */
export async function startOrGetLearningSession(req, res) {
  try {
    const firebaseUid = req.user?.uid
    const { roleId = 'frontend-developer' } = req.body || {}

    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication.' })
    }

    if (!VALID_ROLE_IDS.includes(roleId)) {
      return res.status(400).json({ error: `Invalid roleId '${roleId}'.` })
    }

    // 1. Fetch student's saved skills for this role
    const skillSelection = await StudentSkillSelection.findOne({ firebaseUid, roleId })
    let selectedSkills = skillSelection?.selectedSkills || []
    let customSkills = skillSelection?.customSkills || []

    // If no saved selection, provide default starter skills for frontend-developer
    if (selectedSkills.length === 0 && customSkills.length === 0) {
      selectedSkills = [
        { skillId: 'html', name: 'HTML', officialTopicId: 'fe-top-1', knowledgeSupportStatus: 'verified' },
        { skillId: 'css', name: 'CSS', officialTopicId: 'fe-top-2', knowledgeSupportStatus: 'verified' },
        { skillId: 'javascript', name: 'JavaScript', officialTopicId: 'fe-top-4', knowledgeSupportStatus: 'verified' },
        { skillId: 'react', name: 'React', officialTopicId: 'fe-top-7', knowledgeSupportStatus: 'verified' },
      ]
    }

    // 2. Check for existing active session
    let session = await LearningSession.findOne({
      firebaseUid,
      roleId,
      active: true,
    })

    let isNew = false

    if (session) {
      // Sync latest selected skills into session
      session.selectedSkills = selectedSkills
      session.customSkills = customSkills
      await session.save()
    } else {
      // Create new session
      isNew = true
      session = await LearningSession.create({
        firebaseUid,
        roleId,
        roleTitle: 'Frontend Developer',
        selectedSkills,
        customSkills,
        active: true,
        currentLearningContext: {
          activeSkill: selectedSkills[0]?.name || 'Frontend Fundamentals',
          statedKnowledge: [],
          demonstratedCompetencies: [],
          generatedRoadmap: null,
        },
      })

      // Create initial welcome message
      const skillNames = [
        ...selectedSkills.map((s) => s.name),
        ...customSkills.map((c) => c.name),
      ].join(', ')

      await LearningMessage.create({
        sessionId: session._id,
        firebaseUid,
        role: 'assistant',
        type: 'welcome',
        content: `Welcome to your **Frontend Development** learning space!\n\nYou've selected: **${skillNames}**.\n\nWhat would you like to learn first?\n\nYou can ask me to teach a concept from scratch, generate a personalised interview roadmap, explain code line-by-line, or test your readiness with technical interview questions.`,
        suggestedActions: [
          'Create a personalised interview roadmap',
          'Teach me JavaScript closures with examples',
          'Explain React state batching and reconciliation',
          'Ask me interview questions on my selected skills',
        ],
        providerMetadata: {
          provider: 'system',
          model: 'welcome-onboarding',
        },
      })
    }

    return res.status(200).json({
      success: true,
      isNew,
      session: {
        sessionId: session._id,
        roleId: session.roleId,
        roleTitle: session.roleTitle,
        selectedSkills: session.selectedSkills,
        customSkills: session.customSkills,
        currentLearningContext: session.currentLearningContext,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    })
  } catch (error) {
    console.error('[LearningController] startOrGetLearningSession error:', error)
    return res.status(500).json({
      error: 'Failed to start or retrieve learning session.',
      details: error.message,
    })
  }
}

/**
 * GET /api/learning/sessions/:sessionId
 * Retrieves learning session metadata.
 */
export async function getLearningSession(req, res) {
  try {
    const firebaseUid = req.user?.uid
    const { sessionId } = req.params

    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication.' })
    }

    const session = await LearningSession.findById(sessionId)
    if (!session) {
      return res.status(404).json({ error: 'Learning session not found.' })
    }

    if (session.firebaseUid !== firebaseUid) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this learning session.' })
    }

    return res.status(200).json({
      success: true,
      session: {
        sessionId: session._id,
        roleId: session.roleId,
        roleTitle: session.roleTitle,
        selectedSkills: session.selectedSkills,
        customSkills: session.customSkills,
        currentLearningContext: session.currentLearningContext,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    })
  } catch (error) {
    console.error('[LearningController] getLearningSession error:', error)
    return res.status(500).json({
      error: 'Failed to retrieve learning session.',
      details: error.message,
    })
  }
}

/**
 * GET /api/learning/sessions/:sessionId/messages
 * Retrieves ordered message history for a learning session.
 */
export async function getLearningMessages(req, res) {
  try {
    const firebaseUid = req.user?.uid
    const { sessionId } = req.params

    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication.' })
    }

    const session = await LearningSession.findById(sessionId)
    if (!session) {
      return res.status(404).json({ error: 'Learning session not found.' })
    }

    if (session.firebaseUid !== firebaseUid) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this conversation.' })
    }

    const messages = await LearningMessage.find({ sessionId }).sort({ createdAt: 1 })

    return res.status(200).json({
      success: true,
      messages: messages.map((m) => ({
        id: m._id,
        role: m.role,
        content: m.content,
        type: m.type,
        structuredData: m.structuredData,
        suggestedActions: m.suggestedActions,
        createdAt: m.createdAt,
        providerModel: m.providerMetadata?.model,
      })),
    })
  } catch (error) {
    console.error('[LearningController] getLearningMessages error:', error)
    return res.status(500).json({
      error: 'Failed to retrieve learning conversation messages.',
      details: error.message,
    })
  }
}

/**
 * POST /api/learning/sessions/:sessionId/messages
 * Sends a student message, invokes the Groq learning assistant, and returns the response.
 */
export async function sendLearningMessage(req, res) {
  try {
    const firebaseUid = req.user?.uid
    const { sessionId } = req.params
    const { content } = req.body || {}

    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication.' })
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Message content cannot be blank.' })
    }

    const trimmedContent = content.trim()
    if (trimmedContent.length > 2000) {
      return res.status(400).json({ error: 'Message exceeds maximum limit of 2000 characters.' })
    }

    const session = await LearningSession.findById(sessionId)
    if (!session) {
      return res.status(404).json({ error: 'Learning session not found.' })
    }

    if (session.firebaseUid !== firebaseUid) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this conversation.' })
    }

    // 1. Save student's user message first (never lose student input)
    const userMessage = await LearningMessage.create({
      sessionId: session._id,
      firebaseUid,
      role: 'user',
      content: trimmedContent,
      type: 'text',
    })

    // 2. Fetch recent conversation history
    const history = await LearningMessage.find({ sessionId: session._id })
      .sort({ createdAt: -1 })
      .limit(10)
    const orderedHistory = history.reverse()

    // 3. Dispatch to Groq Learning Assistant Engine
    try {
      const assistantResult = await learningAssistantService.generateAssistantResponse({
        session,
        userMessage: trimmedContent,
        conversationHistory: orderedHistory,
      })

      // 4. Save validated assistant response
      const assistantMessage = await LearningMessage.create({
        sessionId: session._id,
        firebaseUid,
        role: 'assistant',
        content: assistantResult.reply,
        type: assistantResult.type,
        structuredData: assistantResult.structuredData,
        suggestedActions: assistantResult.suggestedActions,
        providerMetadata: assistantResult.providerMetadata,
      })

      // 5. Update session context
      await session.save()

      return res.status(200).json({
        success: true,
        userMessage: {
          id: userMessage._id,
          role: userMessage.role,
          content: userMessage.content,
          type: userMessage.type,
          createdAt: userMessage.createdAt,
        },
        assistantMessage: {
          id: assistantMessage._id,
          role: assistantMessage.role,
          content: assistantMessage.content,
          type: assistantMessage.type,
          structuredData: assistantMessage.structuredData,
          suggestedActions: assistantMessage.suggestedActions,
          createdAt: assistantMessage.createdAt,
          providerModel: assistantMessage.providerMetadata?.model,
        },
        sessionContext: session.currentLearningContext,
      })
    } catch (aiError) {
      console.error('[LearningController] Groq Assistant execution failure:', aiError)
      return res.status(503).json({
        error: 'AI Learning Assistant generation temporarily failed. Your message has been saved.',
        userMessageId: userMessage._id,
        details: aiError.message,
      })
    }
  } catch (error) {
    console.error('[LearningController] sendLearningMessage error:', error)
    return res.status(500).json({
      error: 'Failed to process message.',
      details: error.message,
    })
  }
}
