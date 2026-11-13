import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LearningSession } from '../models/LearningSession.js'
import { LearningMessage } from '../models/LearningMessage.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/careerlaunch'
const token =
  'eyJhbGciOiJub25lIn0.eyJ1c2VyX2lkIjoiSDBjWXJIRGNndVFsNjZlTVhZNW5pQ0c4bUVqMiIsImVtYWlsIjoidHJpcHRpZGhhd2FuMTVAZ21haWwuY29tIiwibmFtZSI6IlRyaXB0aSBEaGF3YW4ifQ.sig'

async function run() {
  await mongoose.connect(MONGODB_URI)
  console.log('[Test] Connected to MongoDB.')

  // 1. Create a fresh conversation for test
  const createRes = await fetch('http://localhost:5000/api/learning/conversations', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ roleId: 'frontend-developer' }),
  }).then((r) => r.json())

  const sessionId = createRes.conversation.sessionId
  console.log(`[Test] Test Session ID: ${sessionId}`)

  // 2. Insert an unanswered user message directly to simulate a 503 failure before AI reply
  const testPrompt = 'Teach me HTML void elements.'
  const rawUserMsg = await LearningMessage.create({
    sessionId: new mongoose.Types.ObjectId(sessionId),
    firebaseUid: 'H0cYrHDcguQl66eMXY5niCG8mEj2',
    role: 'user',
    content: testPrompt,
    type: 'text',
  })
  console.log(`[Test] Created initial user message ID: ${rawUserMsg._id}`)

  // Check how many messages exist in session
  let countBefore = await LearningMessage.countDocuments({ sessionId })
  console.log(`[Test] Message count in DB before retry: ${countBefore}`)

  // 3. Now simulate Retry via HTTP POST /api/learning/sessions/:sessionId/messages
  console.log(`[Test] Simulating Retry with exact same message: "${testPrompt}"`)
  const sendRes = await fetch(`http://localhost:5000/api/learning/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: testPrompt }),
  }).then((r) => r.json())

  console.log(`[Test] HTTP Response success: ${sendRes.success}`)
  console.log(`[Test] Returned userMessage id: ${sendRes.userMessage?.id}`)
  console.log(`[Test] Conversation title generated: "${sendRes.conversationTitle}"`)

  // Check how many user messages exist in this session
  const userMsgs = await LearningMessage.find({ sessionId, role: 'user' })
  console.log(`[Test] Total user messages in DB for this prompt: ${userMsgs.length}`)
  const reusedCorrectly = userMsgs.length === 1 && String(userMsgs[0]._id) === String(rawUserMsg._id)
  console.log(`[Test] Duplicate eliminated & existing message reused: ${reusedCorrectly ? 'PASS (YES)' : 'FAIL (NO)'}`)

  // Check title
  const expectedTitle = 'HTML — Void Elements'
  const titleOk = sendRes.conversationTitle === expectedTitle
  console.log(`[Test] Auto-title matches expected "${expectedTitle}": ${titleOk ? 'PASS' : 'FAIL'} ("${sendRes.conversationTitle}")`)

  // Check assistant reply structure
  if (sendRes.assistantMessage) {
    console.log(`[Test] Assistant reply length: ${sendRes.assistantMessage.content.length} chars`)
    console.log(`[Test] Assistant model: ${sendRes.assistantMessage.providerModel}`)
    const hasHeadings = sendRes.assistantMessage.content.includes('###')
    console.log(`[Test] Assistant reply contains structured markdown headings: ${hasHeadings ? 'PASS' : 'FAIL'}`)
  }

  // Clean up test session
  await LearningMessage.deleteMany({ sessionId })
  await LearningSession.deleteOne({ _id: sessionId })
  console.log('[Test] Cleaned up test session.')

  await mongoose.disconnect()
  console.log('[Test] All idempotency tests completed.')
}

run().catch((err) => {
  console.error('[Test] Error:', err)
  process.exit(1)
})
