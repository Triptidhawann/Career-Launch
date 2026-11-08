import { Router } from 'express'
import { getStudentLesson } from '../controllers/lessonController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()

// All student lesson endpoints require authenticated student session
router.use(requireAuth)

// Student read-only lesson retrieval
router.get('/:topicId', getStudentLesson)
router.get('/:roleId/:topicId', getStudentLesson)

export default router
