import { Router } from 'express'
import {
  getProfile,
  getStatus,
  saveOnboarding,
  updateProfile,
} from '../controllers/profileController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()

// All profile routes require a verified Firebase bearer token
router.get('/me', requireAuth, getProfile)
router.get('/status', requireAuth, getStatus)
router.post('/onboarding', requireAuth, saveOnboarding)
router.put('/me', requireAuth, updateProfile)

export default router
