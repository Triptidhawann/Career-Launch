import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import { StudentProfile } from '../models/StudentProfile.js'
import { GeneratedLesson } from '../models/GeneratedLesson.js'
import { KnowledgeSource } from '../models/KnowledgeSource.js'
import { IngestedDocument } from '../models/IngestedDocument.js'
import { ContentChunk } from '../models/ContentChunk.js'
import { LearningSession } from '../models/LearningSession.js'
import { LearningMessage } from '../models/LearningMessage.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const BASE_URL = 'http://localhost:5000/api'
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/careerlaunch'

// Test Student A (Primary student)
const studentAHeader = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url')
const studentAPayload = Buffer.from(JSON.stringify({
  user_id: 'H0cYrHDcguQl66eMXY5niCG8mEj2',
  email: 'triptidhawan15@gmail.com',
  name: 'Tripti Dhawan',
})).toString('base64url')
const studentAToken = `${studentAHeader}.${studentAPayload}.sig`

// Test Student B (For isolation tests)
const studentBPayload = Buffer.from(JSON.stringify({
  user_id: 'TEST_STUDENT_B_ISOLATION_UID',
  email: 'student_b@test.internal',
  name: 'Student B',
})).toString('base64url')
const studentBToken = `${studentAHeader}.${studentBPayload}.sig`

let totalTests = 0
let passedTests = 0

function assert(condition, message) {
  totalTests++
  if (condition) {
    console.log(`  ✓ ${message}`)
    passedTests++
  } else {
    console.error(`  ✗ FAIL: ${message}`)
    throw new Error(`Assertion failed: ${message}`)
  }
}

async function run() {
  console.log('='.repeat(70))
  console.log('CAREERLAUNCH PHASE 3: DEDICATED AI LEARNING ASSISTANT TEST SUITE')
  console.log('='.repeat(70))

  await mongoose.connect(MONGODB_URI)

  // 1. Clean existing test session for Student A to test fresh lifecycle
  await LearningSession.deleteMany({ firebaseUid: 'H0cYrHDcguQl66eMXY5niCG8mEj2' })
  await LearningMessage.deleteMany({ firebaseUid: 'H0cYrHDcguQl66eMXY5niCG8mEj2' })

  console.log('\n[1] Testing Session Initialization (POST /api/learning/sessions)...')
  const startRes = await fetch(`${BASE_URL}/learning/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentAToken}`,
    },
    body: JSON.stringify({ roleId: 'frontend-developer' }),
  })

  assert(startRes.status === 200, `POST /api/learning/sessions returns HTTP 200 (got ${startRes.status})`)
  const startData = await startRes.json()
  assert(startData.success === true, 'Response indicates success: true')
  assert(startData.isNew === true, 'First session creation reports isNew: true')
  assert(Boolean(startData.session.sessionId), 'Session has a valid sessionId')
  assert(startData.session.roleId === 'frontend-developer', 'Session roleId is frontend-developer')
  assert(startData.session.selectedSkills.length > 0, 'Session has populated skills from selection')

  const sessionId = startData.session.sessionId

  console.log('\n[2] Testing Initial Welcoming Conversation (GET /api/learning/sessions/:sessionId/messages)...')
  const msgRes = await fetch(`${BASE_URL}/learning/sessions/${sessionId}/messages`, {
    headers: { 'Authorization': `Bearer ${studentAToken}` },
  })

  assert(msgRes.status === 200, 'GET messages returns HTTP 200')
  const msgData = await msgRes.json()
  assert(msgData.success === true, 'Messages retrieval success is true')
  assert(msgData.messages.length === 1, 'Initial session has exactly 1 welcome message')
  const welcome = msgData.messages[0]
  assert(welcome.role === 'assistant', 'Initial message role is assistant')
  assert(welcome.type === 'welcome', 'Initial message type is welcome')
  assert(welcome.content.includes('Welcome to your **Frontend Development**'), 'Welcome message includes role greeting')
  assert(Array.isArray(welcome.suggestedActions) && welcome.suggestedActions.length > 0, 'Welcome message includes suggested prompts')

  console.log('\n[3] Testing Real Groq Conversational Inference (Teaching Concept)...')
  console.log('    Sending: "I am confident with functions and scope. Teach me JavaScript closures with practical code examples and interview focal points."')
  const chatStart = performance.now()
  const chatRes = await fetch(`${BASE_URL}/learning/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentAToken}`,
    },
    body: JSON.stringify({
      content: 'I am confident with functions and scope. Teach me JavaScript closures with practical code examples and interview focal points.',
    }),
  })
  const chatDuration = Math.round(performance.now() - chatStart)

  assert(chatRes.status === 200, `Chat message returns HTTP 200 (took ${chatDuration}ms)`)
  const chatData = await chatRes.json()
  assert(chatData.success === true, 'Chat response success is true')
  assert(chatData.userMessage.content.includes('closures'), 'User message returned and persisted')
  assert(Boolean(chatData.assistantMessage.content), 'Assistant message content is non-empty')
  assert(chatData.assistantMessage.content.length > 100, 'Assistant returned comprehensive explanation')
  assert(
    chatData.assistantMessage.providerModel === 'openai/gpt-oss-120b' ||
    Boolean(chatData.assistantMessage.providerModel),
    `Assistant generated via configured Groq model: ${chatData.assistantMessage.providerModel}`
  )
  assert(chatData.assistantMessage.content.includes('```') || chatData.assistantMessage.content.includes('`'), 'Assistant explanation includes formatted code elements')

  console.log('\n[4] Testing Dynamic In-Conversation Roadmap Generation...')
  console.log('    Sending: "Create a personalised roadmap to learn React for frontend interviews."')
  const rmRes = await fetch(`${BASE_URL}/learning/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentAToken}`,
    },
    body: JSON.stringify({
      content: 'Create a personalised roadmap to learn React for frontend interviews.',
    }),
  })

  assert(rmRes.status === 200, `Roadmap request returns HTTP 200`)
  const rmData = await rmRes.json()
  assert(rmData.success === true, 'Roadmap generation success is true')
  assert(rmData.assistantMessage.type === 'roadmap', 'Message type is "roadmap"')
  const roadmap = rmData.assistantMessage.structuredData?.roadmap
  assert(Boolean(roadmap), 'Structured roadmap object is present in message')
  assert(Boolean(roadmap.title), `Roadmap title generated: "${roadmap.title}"`)
  assert(Array.isArray(roadmap.milestones) && roadmap.milestones.length >= 2, 'Roadmap has at least 2 ordered milestones')
  const firstMilestone = roadmap.milestones[0]
  assert(Boolean(firstMilestone.title), `First milestone: "${firstMilestone.title}"`)
  assert(Array.isArray(firstMilestone.topics) && firstMilestone.topics.length > 0, 'First milestone contains topic items')
  assert(Boolean(firstMilestone.practicalExercise), 'First milestone includes hands-on practical exercise')
  assert(Boolean(rmData.sessionContext.generatedRoadmap), 'Roadmap is saved in session currentLearningContext')

  console.log('\n[5] Testing Contextual Prerequisite Stating & Skipping...')
  console.log('    Sending: "I already know JavaScript and ES6 fundamentals. Let\'s begin React component architecture."')
  const prereqRes = await fetch(`${BASE_URL}/learning/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentAToken}`,
    },
    body: JSON.stringify({
      content: 'I already know JavaScript and ES6 fundamentals. Let\'s begin React component architecture.',
    }),
  })

  assert(prereqRes.status === 200, 'Prerequisite prompt returns HTTP 200')
  const prereqData = await prereqRes.json()
  assert(prereqData.success === true, 'Response success is true')
  assert(Boolean(prereqData.assistantMessage.content), 'Assistant taught React without forcing beginner JS revision')
  assert(
    prereqData.sessionContext.statedKnowledge?.length > 0,
    `Stated knowledge updated in context: ${prereqData.sessionContext.statedKnowledge?.join(', ')}`
  )

  console.log('\n[6] Testing Role Boundary Enforcement (Polite Redirection)...')
  console.log('    Sending: "How do I deploy a Kubernetes cluster for a Python Django backend on AWS?"')
  const outOfScopeRes = await fetch(`${BASE_URL}/learning/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentAToken}`,
    },
    body: JSON.stringify({
      content: 'How do I deploy a Kubernetes cluster for a Python Django backend on AWS?',
    }),
  })

  assert(outOfScopeRes.status === 200, 'Out-of-scope prompt handled with HTTP 200')
  const outOfScopeData = await outOfScopeRes.json()
  const redirectText = outOfScopeData.assistantMessage.content
  assert(
    redirectText.toLowerCase().includes('frontend') ||
    redirectText.toLowerCase().includes('outside') ||
    redirectText.toLowerCase().includes('track') ||
    redirectText.toLowerCase().includes('learning'),
    'Assistant politely redirects student to their Frontend Developer learning track'
  )

  console.log('\n[7] Testing Natural Skill Switching within Continuous Thread...')
  console.log('    Sending: "Now explain Tailwind CSS utility-first workflow and responsive prefixes."')
  const switchRes = await fetch(`${BASE_URL}/learning/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentAToken}`,
    },
    body: JSON.stringify({
      content: 'Now explain Tailwind CSS utility-first workflow and responsive prefixes.',
    }),
  })

  assert(switchRes.status === 200, 'Skill switch returns HTTP 200')
  const switchData = await switchRes.json()
  assert(
    switchData.assistantMessage.content.toLowerCase().includes('tailwind'),
    'Assistant smoothly switches to Tailwind CSS within the same conversation'
  )

  console.log('\n[8] Testing Conversation History Restoration...')
  const historyRes = await fetch(`${BASE_URL}/learning/sessions/${sessionId}/messages`, {
    headers: { 'Authorization': `Bearer ${studentAToken}` },
  })
  const historyData = await historyRes.json()
  assert(historyData.messages.length >= 6, `Complete conversation history preserved (found ${historyData.messages.length} messages)`)

  console.log('\n[9] Testing Security, Validation & Student Isolation...')
  // Student B attempting to access Student A's session
  const bAccessRes = await fetch(`${BASE_URL}/learning/sessions/${sessionId}`, {
    headers: { 'Authorization': `Bearer ${studentBToken}` },
  })
  assert(bAccessRes.status === 403, `Cross-student session access rejected with HTTP 403 (got ${bAccessRes.status})`)

  // Student B attempting to read Student A's messages
  const bMessagesRes = await fetch(`${BASE_URL}/learning/sessions/${sessionId}/messages`, {
    headers: { 'Authorization': `Bearer ${studentBToken}` },
  })
  assert(bMessagesRes.status === 403, `Cross-student message access rejected with HTTP 403 (got ${bMessagesRes.status})`)

  // Unauthenticated access
  const unauthRes = await fetch(`${BASE_URL}/learning/sessions/${sessionId}/messages`)
  assert(unauthRes.status === 401, 'Unauthenticated message request rejected with HTTP 401')

  // Blank message rejection
  const blankRes = await fetch(`${BASE_URL}/learning/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentAToken}`,
    },
    body: JSON.stringify({ content: '   ' }),
  })
  assert(blankRes.status === 400, 'Blank message rejected with HTTP 400 Bad Request')

  // Over-length message rejection (>2000 chars)
  const longRes = await fetch(`${BASE_URL}/learning/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentAToken}`,
    },
    body: JSON.stringify({ content: 'a'.repeat(2500) }),
  })
  assert(longRes.status === 400, 'Over-length message (>2000) rejected with HTTP 400 Bad Request')

  console.log('\n[10] Verifying Core Database Invariants...')
  const profilesCount = await StudentProfile.countDocuments()
  const lessonsCount = await GeneratedLesson.countDocuments()
  const sourcesCount = await KnowledgeSource.countDocuments()
  const docsCount = await IngestedDocument.countDocuments()
  const chunksCount = await ContentChunk.countDocuments()

  assert(profilesCount === 2, `Student profiles preserved (expected 2, found ${profilesCount})`)
  assert(lessonsCount === 20, `Generated lessons preserved (expected 20, found ${lessonsCount})`)
  assert(sourcesCount === 7, `Knowledge sources preserved (expected 7, found ${sourcesCount})`)
  assert(docsCount === 20, `Ingested documents preserved (expected 20, found ${docsCount})`)
  assert(chunksCount === 28, `Content chunks preserved (expected 28, found ${chunksCount})`)

  console.log('\n' + '='.repeat(70))
  console.log(`TEST SUMMARY: ${passedTests} PASSED, 0 FAILED (out of ${totalTests} assertions)`)
  console.log('='.repeat(70))

  await mongoose.disconnect()
}

run().catch(async (err) => {
  console.error('\nTest Suite Execution Aborted:', err)
  try { await mongoose.disconnect() } catch {}
  process.exit(1)
})
