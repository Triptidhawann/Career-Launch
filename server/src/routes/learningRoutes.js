import { Router } from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import {
  getRoleSkills,
  getStudentSkillSelection,
  saveStudentSkillSelection,
} from '../controllers/learningController.js'

const router = Router()

// Public taxonomy retrieval
router.get('/skills/:roleId', getRoleSkills)

// Authenticated student skill selection routes
router.get('/selection/:roleId', requireAuth, getStudentSkillSelection)
router.put('/selection/:roleId', requireAuth, saveStudentSkillSelection)

export default router
