import { Router } from 'express'
import {
  registerSource,
  listSources,
  getSource,
  triggerIngestion,
  listJobs,
  getJob,
  getChunksByTopic,
} from '../controllers/adminIngestController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { requireAdmin } from '../middleware/adminMiddleware.js'

const router = Router()

// All administrative ingestion routes strictly enforce authentication AND admin authorization
router.use(requireAuth, requireAdmin)

router.post('/sources', registerSource)
router.get('/sources', listSources)
router.get('/sources/:sourceId', getSource)
router.post('/trigger/:sourceId', triggerIngestion)
router.get('/jobs', listJobs)
router.get('/jobs/:jobId', getJob)
router.get('/chunks/:topicTag', getChunksByTopic)

export default router
