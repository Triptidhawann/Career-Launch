import { Router } from 'express'
import {
  triggerLessonGeneration,
  getLessonById,
  listLessons,
  revalidateLesson,
} from '../controllers/adminLessonController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { requireAdmin } from '../middleware/adminMiddleware.js'
import { rateLimiter } from '../middleware/rateLimiter.js'

const router = Router()

// All administrative lesson endpoints require verified administrator privileges
router.use(requireAuth, requireAdmin)

// Generation endpoint protected with rate limiting (max 20 generations per minute)
router.post('/generate', rateLimiter({ windowMs: 60000, maxRequests: 20 }), triggerLessonGeneration)

// Read and validation endpoints
router.get('/', listLessons)
router.get('/:lessonId', getLessonById)
router.post('/:lessonId/validate', revalidateLesson)

export default router
