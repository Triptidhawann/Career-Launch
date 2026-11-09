import { Router } from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import {
  savePreparationSetup,
  getPreparationSetup,
  getLatestPreparationSession,
} from '../controllers/prepController.js'

const router = Router()

// All preparation endpoints require authenticated student session
router.use(requireAuth)

// Setup and session retrieval endpoints
router.post('/setup', savePreparationSetup)
router.get('/setup/:sessionId', getPreparationSetup)
router.get('/session/latest', getLatestPreparationSession)

export default router
