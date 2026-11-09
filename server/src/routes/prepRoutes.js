import { Router } from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import {
  savePreparationSetup,
  getPreparationSetup,
  getLatestPreparationSession,
  startDiagnostic,
  answerDiagnosticQuestion,
  completeDiagnostic,
  getDiagnosticSession,
  generatePreparationPlanHandler,
  getPreparationPlan,
  getLatestPreparationPlan,
  customizePreparationPlanHandler,
  acceptPreparationPlanHandler,
} from '../controllers/prepController.js'

const router = Router()

// All preparation endpoints require authenticated student session
router.use(requireAuth)

// Setup and session retrieval endpoints
router.post('/setup', savePreparationSetup)
router.get('/setup/:sessionId', getPreparationSetup)
router.get('/session/latest', getLatestPreparationSession)

// Adaptive Knowledge Diagnostic endpoints (Phase B2)
router.post('/diagnostic/start', startDiagnostic)
router.post('/diagnostic/answer', answerDiagnosticQuestion)
router.post('/diagnostic/complete', completeDiagnostic)
router.get('/diagnostic/:diagnosticId', getDiagnosticSession)

// Personalised Preparation Plan endpoints (Phase B2)
router.post('/plan/generate', generatePreparationPlanHandler)
router.get('/plan/latest', getLatestPreparationPlan)
router.get('/plan/:planId', getPreparationPlan)
router.put('/plan/:planId/customize', customizePreparationPlanHandler)
router.post('/plan/:planId/accept', acceptPreparationPlanHandler)

export default router
