import { Router } from 'express'
import {
  triggerEmbeddingGeneration,
  getEmbeddingStatus,
  searchKnowledge,
} from '../controllers/adminRetrievalController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { requireAdmin } from '../middleware/adminMiddleware.js'
import { rateLimiter } from '../middleware/rateLimiter.js'

const router = Router()

// All administrative retrieval endpoints require verified administrator privileges
router.use(requireAuth, requireAdmin)

// Embedding management endpoints
router.post('/embed/:sourceId', triggerEmbeddingGeneration)
router.get('/embedding-status', getEmbeddingStatus)

// Search endpoint protected with rate limiting (max 60 queries/minute)
router.post('/search', rateLimiter({ windowMs: 60000, maxRequests: 60 }), searchKnowledge)

export default router
