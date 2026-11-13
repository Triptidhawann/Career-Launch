import mongoose from 'mongoose'
import { StudentSkillSelection } from '../models/StudentSkillSelection.js'
import { LearningSession } from '../models/LearningSession.js'
import { LearningMessage } from '../models/LearningMessage.js'
import { learningAssistantService } from '../services/ai/learningAssistantService.js'
import { generateConversationTitle } from '../utils/conversationTitleGenerator.js'
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
        category: s.category,
        categoryName: s.categoryName,
        isCore: s.isCore,
      })),
      customAllowed: roleData.customAllowed,
      customPlaceholder: roleData.customPlaceholder,
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
 * Retrieves the authenticated student's saved skill selection for a role.
 */
export async function getStudentSkillSelection(req, res) {
  try {
    const firebaseUid = req.user?.uid
    const { roleId } = req.params

    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication.' })
    }

    if (!roleId || !VALID_ROLE_IDS.includes(roleId)) {
      return res.status(400).json({ error: `Invalid roleId '${roleId}'.` })
    }

    const selection = await StudentSkillSelection.findOne({ firebaseUid, roleId })

    if (!selection) {
      return res.status(200).json({
        success: true,
        hasSelection: false,
        selection: null,
      })
    }

    return res.status(200).json({
      success: true,
      hasSelection: true,
      selection: {
        roleId: selection.roleId,
        selectedSkills: selection.selectedSkills,
        customSkills: selection.customSkills,
        totalSelected: selection.totalSelected,
        updatedAt: selection.updatedAt,
      },
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
 * Saves or replaces the student's selected skills and custom skills for a role.
 */
export async function saveStudentSkillSelection(req, res) {
  try {
    const firebaseUid = req.user?.uid
    const { roleId } = req.params
    const { selectedSkillIds = [], customSkills = [] } = req.body

    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication.' })
    }

    if (!roleId || !VALID_ROLE_IDS.includes(roleId)) {
      return res.status(400).json({ error: `Invalid roleId '${roleId}'.` })
    }

    if (!Array.isArray(selectedSkillIds) || !Array.isArray(customSkills)) {
      return res.status(400).json({
        error: 'Invalid payload: selectedSkillIds and customSkills must be arrays.',
      })
    }

    const totalCount = selectedSkillIds.length + customSkills.length
    if (totalCount === 0) {
      return res.status(400).json({
        error: 'At least one skill (standard or custom) must be selected.',
      })
    }

    const { valid, invalidIds } = validateSkillIds(roleId, selectedSkillIds)
    if (!valid || (invalidIds && invalidIds.length > 0)) {
      return res.status(400).json({
        error: `The following skill IDs are invalid for role '${roleId}': ${invalidIds.join(', ')}`,
      })
    }

    const roleData = getSkillsByRoleId(roleId)
    const skillsById = new Map((roleData?.skills || []).map((s) => [s.id, s]))

    const formattedSelectedSkills = selectedSkillIds.map((id) => {
      const def = skillsById.get(id)
      return {
        skillId: id,
        name: def ? def.name : id,
        categoryId: def ? def.category : id,
        categoryName: def ? def.categoryName : 'General',
        officialTopicId: def?.officialTopicId || null,
        knowledgeSupportStatus: def?.knowledgeSupportStatus || 'roadmap_topic',
      }
    })

    const formattedCustomSkills = customSkills
      .map((c) => (typeof c === 'string' ? { name: c.trim() } : { name: String(c?.name || '').trim() }))
      .filter((c) => c.name.length > 0)
      .slice(0, 10)

    const updated = await StudentSkillSelection.findOneAndUpdate(
      { firebaseUid, roleId },
      {
        $set: {
          selectedSkills: formattedSelectedSkills,
          customSkills: formattedCustomSkills,
          totalSelected: formattedSelectedSkills.length + formattedCustomSkills.length,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )

    return res.status(200).json({
      success: true,
      message: 'Student skill selection saved successfully.',
      selection: {
        roleId: updated.roleId,
        selectedSkills: updated.selectedSkills,
        customSkills: updated.customSkills,
        totalSelected: updated.totalSelected,
        updatedAt: updated.updatedAt,
      },
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
 * POST /api/learning/conversations
 * Phase 3.3: Creates a brand new, independent conversation snapshotting the student's selected skills.
 */
export async function createConversation(req, res) {
  try {
    const firebaseUid = req.user?.uid
    const {
      roleId = 'frontend-developer',
      selectedSkillIds,
      customSkills = [],
      initialTitle,
    } = req.body

    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication.' })
    }

    if (!VALID_ROLE_IDS.includes(roleId)) {
      return res.status(400).json({ error: `Invalid roleId '${roleId}'.` })
    }

    const roleData = getSkillsByRoleId(roleId)
    const skillsById = new Map((roleData?.skills || []).map((s) => [s.id, s]))

    let resolvedSkills = []

    if (Array.isArray(selectedSkillIds) && selectedSkillIds.length > 0) {
      resolvedSkills = selectedSkillIds.map((id) => {
        const def = skillsById.get(id)
        return {
          skillId: id,
          name: def ? def.name : id,
          officialTopicId: def?.officialTopicId || null,
          knowledgeSupportStatus: def?.knowledgeSupportStatus || 'roadmap_topic',
        }
      })
    } else {
      const savedSel = await StudentSkillSelection.findOne({ firebaseUid, roleId })
      if (savedSel && savedSel.selectedSkills?.length > 0) {
        resolvedSkills = savedSel.selectedSkills.map((s) => ({
          skillId: s.skillId,
          name: s.name,
          officialTopicId: s.officialTopicId,
          knowledgeSupportStatus: s.knowledgeSupportStatus,
        }))
      } else {
        resolvedSkills = (roleData?.skills || []).slice(0, 4).map((s) => ({
          skillId: s.id,
          name: s.name,
          officialTopicId: s.officialTopicId || null,
          knowledgeSupportStatus: s.knowledgeSupportStatus || 'roadmap_topic',
        }))
      }
    }

    const title =
      initialTitle && typeof initialTitle === 'string' && initialTitle.trim()
        ? initialTitle.trim().slice(0, 100)
        : 'New Chat'

    // Phase 3.3.7: Prevent cluttering the sidebar/database with multiple empty chats.
    // If the student already has an active empty session (0 messages) for this role, reuse it!
    const existingEmpty = await LearningSession.findOne({
      firebaseUid,
      roleId,
      status: 'active',
      title: 'New Chat',
      isCustomTitle: { $ne: true },
    }).sort({ createdAt: -1 })

    if (existingEmpty) {
      const msgCount = await LearningMessage.countDocuments({ sessionId: existingEmpty._id })
      if (msgCount === 0) {
        if (resolvedSkills.length > 0) {
          existingEmpty.selectedSkills = resolvedSkills
          existingEmpty.customSkills = Array.isArray(customSkills) ? customSkills : []
          existingEmpty.lastActivityAt = new Date()
          await existingEmpty.save()
        }
        return res.status(200).json({
          success: true,
          conversation: {
            sessionId: existingEmpty._id,
            roleId: existingEmpty.roleId,
            roleTitle: existingEmpty.roleTitle,
            title: existingEmpty.title,
            status: existingEmpty.status,
            lastActivityAt: existingEmpty.lastActivityAt,
            selectedSkills: existingEmpty.selectedSkills,
            customSkills: existingEmpty.customSkills,
            currentLearningContext: existingEmpty.currentLearningContext,
            createdAt: existingEmpty.createdAt,
            updatedAt: existingEmpty.updatedAt,
          },
        })
      }
    }

    const session = await LearningSession.create({
      firebaseUid,
      roleId,
      roleTitle: roleData?.roleTitle || 'Frontend Developer',
      title,
      isCustomTitle: false,
      status: 'active',
      lastActivityAt: new Date(),
      selectedSkills: resolvedSkills,
      customSkills: Array.isArray(customSkills) ? customSkills : [],
      active: true,
      currentLearningContext: {
        activeSkill: resolvedSkills[0]?.name || 'Frontend Fundamentals',
        statedKnowledge: [],
        demonstratedCompetencies: [],
        generatedRoadmap: null,
      },
    })

    return res.status(201).json({
      success: true,
      conversation: {
        sessionId: session._id,
        roleId: session.roleId,
        roleTitle: session.roleTitle,
        title: session.title,
        status: session.status,
        lastActivityAt: session.lastActivityAt,
        selectedSkills: session.selectedSkills,
        customSkills: session.customSkills,
        currentLearningContext: session.currentLearningContext,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    })
  } catch (error) {
    console.error('[LearningController] createConversation error:', error)
    return res.status(500).json({
      error: 'Failed to create new conversation.',
      details: error.message,
    })
  }
}

/**
 * GET /api/learning/conversations
 * Phase 3.3: Lists the student's conversations with date ordering, search, and message counts.
 */
export async function listConversations(req, res) {
  try {
    const firebaseUid = req.user?.uid
    const { roleId, search, limit = 50 } = req.query

    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication.' })
    }

    const query = {
      firebaseUid,
      status: { $ne: 'deleted' },
    }

    if (roleId && VALID_ROLE_IDS.includes(roleId)) {
      query.roleId = roleId
    }

    if (search && typeof search === 'string' && search.trim()) {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      query.title = { $regex: sanitized, $options: 'i' }
    }

    const conversations = await LearningSession.find(query)
      .sort({ lastActivityAt: -1, updatedAt: -1 })
      .limit(Math.min(parseInt(limit, 10) || 50, 100))

    const sessionIds = conversations.map((c) => c._id)
    const counts = await LearningMessage.aggregate([
      { $match: { sessionId: { $in: sessionIds } } },
      { $group: { _id: '$sessionId', count: { $sum: 1 } } },
    ])
    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]))

    // Phase 3.3.7: Backfill generic titles for conversations that have messages,
    // and exclude empty unused conversations (messageCount === 0) from sidebar clutter.
    const populated = []
    for (const c of conversations) {
      const msgCount = countMap.get(c._id.toString()) || 0
      if (msgCount === 0) {
        continue // Skip empty chats from persistent sidebar history
      }

      if ((!c.title || c.title === 'New Chat') && !c.isCustomTitle) {
        const firstUserMsg = await LearningMessage.findOne({
          sessionId: c._id,
          role: 'user',
        }).sort({ createdAt: 1 })

        if (firstUserMsg && firstUserMsg.content) {
          const activeSkill = c.currentLearningContext?.activeSkill || c.selectedSkills?.[0]?.name || 'Tech'
          c.title = generateConversationTitle(firstUserMsg.content, activeSkill)
          await c.save()
        }
      }

      populated.push({
        sessionId: c._id,
        roleId: c.roleId,
        roleTitle: c.roleTitle,
        title: c.title || 'Untitled Chat',
        isCustomTitle: Boolean(c.isCustomTitle),
        status: c.status || 'active',
        lastActivityAt: c.lastActivityAt || c.updatedAt || c.createdAt,
        selectedSkills: c.selectedSkills,
        customSkills: c.customSkills,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        messageCount: msgCount,
      })
    }

    return res.status(200).json({
      success: true,
      conversations: populated,
    })
  } catch (error) {
    console.error('[LearningController] listConversations error:', error)
    return res.status(500).json({
      error: 'Failed to retrieve conversations.',
      details: error.message,
    })
  }
}

/**
 * PATCH /api/learning/conversations/:sessionId
 * Phase 3.3: Renames an existing conversation.
 */
export async function renameConversation(req, res) {
  try {
    const firebaseUid = req.user?.uid
    const { sessionId } = req.params
    const { title } = req.body

    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication.' })
    }

    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(404).json({ error: 'Conversation not found.' })
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title cannot be blank.' })
    }

    const trimmedTitle = title.trim().slice(0, 100)

    const session = await LearningSession.findById(sessionId)
    if (!session || session.status === 'deleted') {
      return res.status(404).json({ error: 'Conversation not found.' })
    }

    if (session.firebaseUid !== firebaseUid) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this conversation.' })
    }

    session.title = trimmedTitle
    session.isCustomTitle = true
    session.lastActivityAt = new Date()
    await session.save()

    return res.status(200).json({
      success: true,
      conversation: {
        sessionId: session._id,
        title: session.title,
        lastActivityAt: session.lastActivityAt,
        updatedAt: session.updatedAt,
      },
      message: 'Conversation renamed successfully.',
    })
  } catch (error) {
    console.error('[LearningController] renameConversation error:', error)
    return res.status(500).json({
      error: 'Failed to rename conversation.',
      details: error.message,
    })
  }
}

/**
 * DELETE /api/learning/conversations/:sessionId
 * Phase 3.3: Soft deletes a conversation (sets status: 'deleted').
 */
export async function deleteConversation(req, res) {
  try {
    const firebaseUid = req.user?.uid
    const { sessionId } = req.params

    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication.' })
    }

    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(404).json({ error: 'Conversation not found.' })
    }

    const session = await LearningSession.findById(sessionId)
    if (!session || session.status === 'deleted') {
      return res.status(404).json({ error: 'Conversation not found.' })
    }

    if (session.firebaseUid !== firebaseUid) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this conversation.' })
    }

    session.status = 'deleted'
    session.active = false
    await session.save()

    return res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully.',
    })
  } catch (error) {
    console.error('[LearningController] deleteConversation error:', error)
    return res.status(500).json({
      error: 'Failed to delete conversation.',
      details: error.message,
    })
  }
}

/**
 * POST /api/learning/sessions
 * Starts or retrieves the active continuous learning session for a role.
 * Preserved for backward compatibility.
 */
export async function startOrGetLearningSession(req, res) {
  try {
    const firebaseUid = req.user?.uid
    const { roleId = 'frontend-developer', createNew = false } = req.body

    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication.' })
    }

    if (!VALID_ROLE_IDS.includes(roleId)) {
      return res.status(400).json({ error: `Invalid roleId '${roleId}'.` })
    }

    const savedSelection = await StudentSkillSelection.findOne({ firebaseUid, roleId })
    let selectedSkills = []
    let customSkills = []

    if (savedSelection && savedSelection.selectedSkills.length > 0) {
      selectedSkills = savedSelection.selectedSkills.map((s) => ({
        skillId: s.skillId,
        name: s.name,
        officialTopicId: s.officialTopicId,
        knowledgeSupportStatus: s.knowledgeSupportStatus,
      }))
      customSkills = savedSelection.customSkills || []
    } else {
      selectedSkills = [
        { skillId: 'html', name: 'HTML', officialTopicId: 'fe-top-1', knowledgeSupportStatus: 'verified' },
        { skillId: 'css', name: 'CSS', officialTopicId: 'fe-top-2', knowledgeSupportStatus: 'verified' },
        { skillId: 'javascript', name: 'JavaScript', officialTopicId: 'fe-top-4', knowledgeSupportStatus: 'verified' },
        { skillId: 'react', name: 'React', officialTopicId: 'fe-top-7', knowledgeSupportStatus: 'verified' },
      ]
    }

    let session = null
    let isNew = false

    if (!createNew) {
      session = await LearningSession.findOne({
        firebaseUid,
        roleId,
        status: 'active',
        active: true,
      }).sort({ lastActivityAt: -1, updatedAt: -1 })
    }

    if (session) {
      session.selectedSkills = selectedSkills
      session.customSkills = customSkills
      await session.save()
    } else {
      isNew = true
      session = await LearningSession.create({
        firebaseUid,
        roleId,
        roleTitle: 'Frontend Developer',
        title: 'New Chat',
        status: 'active',
        lastActivityAt: new Date(),
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
    }

    return res.status(200).json({
      success: true,
      isNew,
      session: {
        sessionId: session._id,
        roleId: session.roleId,
        roleTitle: session.roleTitle,
        title: session.title,
        status: session.status,
        lastActivityAt: session.lastActivityAt,
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
 * GET /api/learning/conversations/:sessionId
 * Retrieves active session metadata and current context.
 */
export async function getLearningSession(req, res) {
  try {
    const firebaseUid = req.user?.uid
    const { sessionId } = req.params

    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication.' })
    }

    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(404).json({ error: 'Learning session not found.' })
    }

    const session = await LearningSession.findById(sessionId)
    if (!session || session.status === 'deleted') {
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
        title: session.title || 'Untitled Chat',
        status: session.status || 'active',
        lastActivityAt: session.lastActivityAt || session.updatedAt,
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
 * GET /api/learning/conversations/:sessionId/messages
 * Retrieves ordered message history for a learning session.
 */
export async function getLearningMessages(req, res) {
  try {
    const firebaseUid = req.user?.uid
    const { sessionId } = req.params

    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication.' })
    }

    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(404).json({ error: 'Learning session not found.' })
    }

    const session = await LearningSession.findById(sessionId)
    if (!session || session.status === 'deleted') {
      return res.status(404).json({ error: 'Learning session not found.' })
    }

    if (session.firebaseUid !== firebaseUid) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this conversation.' })
    }

    const messages = await LearningMessage.find({ sessionId }).sort({ createdAt: 1 })

    return res.status(200).json({
      success: true,
      sessionId: session._id,
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
      error: 'Failed to retrieve learning messages.',
      details: error.message,
    })
  }
}

/**
 * POST /api/learning/sessions/:sessionId/messages
 * POST /api/learning/conversations/:sessionId/messages
 * Processes a student user message and generates the AI response.
 */
export async function sendLearningMessage(req, res) {
  try {
    const firebaseUid = req.user?.uid
    const { sessionId } = req.params
    const { content } = req.body

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

    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(404).json({ error: 'Learning session not found.' })
    }

    const session = await LearningSession.findById(sessionId)
    if (!session || session.status === 'deleted') {
      return res.status(404).json({ error: 'Learning session not found.' })
    }

    if (session.firebaseUid !== firebaseUid) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this learning session.' })
    }

    // Phase 3.3.7: Idempotency & duplicate message elimination
    // If the immediately preceding message is an unanswered user message with the exact same content, reuse it!
    const lastMsg = await LearningMessage.findOne({ sessionId: session._id }).sort({ createdAt: -1 })
    let userMessage
    if (lastMsg && lastMsg.role === 'user' && lastMsg.content.trim() === trimmedContent) {
      userMessage = lastMsg
    } else {
      userMessage = await LearningMessage.create({
        sessionId: session._id,
        firebaseUid,
        role: 'user',
        content: trimmedContent,
        type: 'text',
      })
    }

    // Auto-Title Generation on first user message if conversation is still generic and not manually renamed
    if (!session.isCustomTitle && (!session.title || session.title === 'New Chat')) {
      const activeSkill = session.currentLearningContext?.activeSkill || session.selectedSkills[0]?.name || 'Tech'
      session.title = generateConversationTitle(trimmedContent, activeSkill)
    }

    // Update lastActivityAt on conversation
    session.lastActivityAt = new Date()
    await session.save()

    const recentMessages = await LearningMessage.find({ sessionId: session._id })
      .sort({ createdAt: -1 })
      .limit(10)

    const conversationHistory = recentMessages
      .reverse()
      .slice(0, -1)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }))

    let aiResult
    try {
      aiResult = await learningAssistantService.generateAssistantResponse({
        session,
        userMessage: trimmedContent,
        conversationHistory,
      })
    } catch (aiErr) {
      console.error('[LearningController] AI generation error:', aiErr)
      return res.status(503).json({
        error: 'AI Learning Assistant generation temporarily failed. Your message has been saved.',
        userMessageId: userMessage._id,
        details: aiErr.message,
      })
    }

    const assistantMessage = await LearningMessage.create({
      sessionId: session._id,
      firebaseUid,
      role: 'assistant',
      content: aiResult.reply,
      type: aiResult.type || 'text',
      structuredData: aiResult.structuredData || null,
      suggestedActions: aiResult.suggestedActions || [],
      providerMetadata: aiResult.providerMetadata || {},
    })

    if (aiResult.type === 'roadmap' && aiResult.structuredData?.roadmap) {
      session.currentLearningContext.generatedRoadmap = aiResult.structuredData.roadmap
      session.markModified('currentLearningContext')
      await session.save()
    }

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
      conversationTitle: session.title,
    })
  } catch (error) {
    console.error('[LearningController] sendLearningMessage error:', error)
    return res.status(500).json({
      error: 'Failed to send message to learning assistant.',
      details: error.message,
    })
  }
}

/**
 * DELETE /api/learning/sessions/:sessionId/messages
 * Clears conversation history for a learning session.
 */
export async function clearLearningMessages(req, res) {
  try {
    const firebaseUid = req.user?.uid
    const { sessionId } = req.params

    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication.' })
    }

    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(404).json({ error: 'Learning session not found.' })
    }

    const session = await LearningSession.findById(sessionId)
    if (!session || session.status === 'deleted') {
      return res.status(404).json({ error: 'Learning session not found.' })
    }

    if (session.firebaseUid !== firebaseUid) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this conversation.' })
    }

    await LearningMessage.deleteMany({ sessionId: session._id })

    session.currentLearningContext = {
      activeSkill: session.selectedSkills[0]?.name || 'Frontend Fundamentals',
      statedKnowledge: [],
      demonstratedCompetencies: [],
      generatedRoadmap: null,
    }
    session.title = 'New Chat'
    session.lastActivityAt = new Date()
    await session.save()

    return res.status(200).json({
      success: true,
      message: 'Conversation cleared successfully.',
    })
  } catch (error) {
    console.error('[LearningController] clearLearningMessages error:', error)
    return res.status(500).json({
      error: 'Failed to clear conversation.',
      details: error.message,
    })
  }
}
