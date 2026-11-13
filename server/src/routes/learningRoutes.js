import { Router } from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import { rateLimiter } from '../middleware/rateLimiter.js'
import {
  getRoleSkills,
  getStudentSkillSelection,
  saveStudentSkillSelection,
  createConversation,
  listConversations,
  renameConversation,
  deleteConversation,
  startOrGetLearningSession,
  getLearningSession,
  getLearningMessages,
  sendLearningMessage,
  clearLearningMessages,
} from '../controllers/learningController.js'

const router = Router()

// Rate limiter for AI assistant message generation: max 30 messages per minute
const messageLimiter = rateLimiter({ windowMs: 60000, maxRequests: 30 })

// Public taxonomy retrieval
router.get('/skills/:roleId', getRoleSkills)

// Authenticated student skill selection routes
router.get('/selection/:roleId', requireAuth, getStudentSkillSelection)
router.put('/selection/:roleId', requireAuth, saveStudentSkillSelection)

// Phase 3.3: ChatGPT-Style Multi-Conversation Management Routes
router.post('/conversations', requireAuth, createConversation)
router.get('/conversations', requireAuth, listConversations)
router.get('/conversations/:sessionId', requireAuth, getLearningSession)
router.get('/conversations/:sessionId/messages', requireAuth, getLearningMessages)
router.post('/conversations/:sessionId/messages', requireAuth, messageLimiter, sendLearningMessage)
router.patch('/conversations/:sessionId', requireAuth, renameConversation)
router.delete('/conversations/:sessionId', requireAuth, deleteConversation)

// Phase 3: Continuous AI Learning Assistant Routes (preserved for backward compatibility)
router.post('/sessions', requireAuth, startOrGetLearningSession)
router.get('/sessions/:sessionId', requireAuth, getLearningSession)
router.get('/sessions/:sessionId/messages', requireAuth, getLearningMessages)
router.post('/sessions/:sessionId/messages', requireAuth, messageLimiter, sendLearningMessage)
router.delete('/sessions/:sessionId/messages', requireAuth, clearLearningMessages)

export default router
