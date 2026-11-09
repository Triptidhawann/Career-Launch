import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import { PreparationSession } from '../models/PreparationSession.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { GeneratedLesson } from '../models/GeneratedLesson.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/careerlaunch'
const API_BASE = 'http://127.0.0.1:5000/api'

const testResults = {
  passed: [],
  failed: [],
}

function assert(condition, testName, details = '') {
  if (condition) {
    testResults.passed.push(testName)
    console.log(`  ✓ [PASS] ${testName}`)
  } else {
    testResults.failed.push({ testName, details })
    console.error(`  ✗ [FAIL] ${testName} - ${details}`)
  }
}

async function runTests() {
  console.log('\n=================================================================')
  console.log('   CAREERLAUNCH PHASE B1: PREPARATION SETUP API TEST SUITE        ')
  console.log('=================================================================\n')

  await mongoose.connect(MONGODB_URI)
  console.log(`Connected to database at: ${MONGODB_URI}\n`)

  // 1. Baseline Checks
  console.log('--- 1. Baseline System Invariant Checks ---')
  const initialStudentCount = await StudentProfile.countDocuments()
  assert(initialStudentCount === 2, 'Student records baseline strictly preserved at 2', `Found: ${initialStudentCount}`)

  const totalLessons = await GeneratedLesson.countDocuments()
  assert(totalLessons === 20, 'Total GeneratedLessons strictly preserved at 20', `Found: ${totalLessons}`)

  // 2. Setup Tokens for Two Distinct Students (Student A and Student B)
  const studentAUid = 'student_test_uid_b1_a'
  const studentBUid = 'student_test_uid_b1_b'

  await StudentProfile.findOneAndUpdate(
    { firebaseUid: studentAUid },
    {
      firebaseUid: studentAUid,
      email: 'student_b1_a@careerlaunch.com',
      fullName: 'Student B1 Alpha',
      role: 'student',
    },
    { upsert: true }
  )

  await StudentProfile.findOneAndUpdate(
    { firebaseUid: studentBUid },
    {
      firebaseUid: studentBUid,
      email: 'student_b1_b@careerlaunch.com',
      fullName: 'Student B1 Beta',
      role: 'student',
    },
    { upsert: true }
  )

  const sHeader = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url')
  const tokenA = `${sHeader}.${Buffer.from(JSON.stringify({ user_id: studentAUid, email: 'student_b1_a@careerlaunch.com' })).toString('base64url')}.sig`
  const tokenB = `${sHeader}.${Buffer.from(JSON.stringify({ user_id: studentBUid, email: 'student_b1_b@careerlaunch.com' })).toString('base64url')}.sig`

  console.log('\n--- 2. Authentication & Authorization Enforcement ---')
  // 2a. Unauthenticated POST rejected
  const unauthPost = await fetch(`${API_BASE}/prep/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roleId: 'frontend-developer', goalPrompt: 'Valid goal prompt test' }),
  })
  assert(unauthPost.status === 401, 'Unauthenticated POST /api/prep/setup rejected with 401 Unauthorized')

  // 2b. Unauthenticated GET rejected
  const unauthGet = await fetch(`${API_BASE}/prep/session/latest`)
  assert(unauthGet.status === 401, 'Unauthenticated GET /api/prep/session/latest rejected with 401 Unauthorized')

  console.log('\n--- 3. Validation Logic & Size Restriction Checks ---')
  // 3a. Missing roleId
  const resNoRole = await fetch(`${API_BASE}/prep/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ goalPrompt: 'Testing missing role' }),
  })
  assert(resNoRole.status === 400, 'POST with missing roleId rejected with 400 Bad Request')

  // 3b. Invalid roleId
  const resBadRole = await fetch(`${API_BASE}/prep/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ roleId: 'non-existent-role', goalPrompt: 'Testing bad role' }),
  })
  assert(resBadRole.status === 400, 'POST with invalid roleId rejected with 400 Bad Request')

  // 3c. Missing goalPrompt
  const resNoPrompt = await fetch(`${API_BASE}/prep/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ roleId: 'frontend-developer' }),
  })
  assert(resNoPrompt.status === 400, 'POST with missing goalPrompt rejected with 400 Bad Request')

  // 3d. Too short goalPrompt (<5 chars)
  const resShortPrompt = await fetch(`${API_BASE}/prep/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ roleId: 'frontend-developer', goalPrompt: 'abc' }),
  })
  assert(resShortPrompt.status === 400, 'POST with goalPrompt < 5 chars rejected with 400 Bad Request')

  // 3e. Invalid experienceLevel
  const resBadExp = await fetch(`${API_BASE}/prep/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      roleId: 'frontend-developer',
      goalPrompt: 'Valid goal prompt here',
      experienceLevel: 'ninja',
    }),
  })
  assert(resBadExp.status === 400, 'POST with invalid experienceLevel rejected with 400 Bad Request')

  console.log('\n--- 4. Valid Preparation Setup Creation (Student A) ---')
  const validPayloadA = {
    roleId: 'frontend-developer',
    goalPrompt: 'I want to prepare React.js for a frontend developer interview. I know HTML, CSS and JavaScript, but struggle with state management and performance.',
    experienceLevel: 'intermediate',
    knownTopics: ['fe-top-1', 'fe-top-2'],
    weakTopics: ['fe-top-4', 'fe-top-15'],
    preparationTimeline: '2_4_weeks',
    primaryGoal: 'placement',
    selectedDirectTopicId: 'fe-top-4',
  }

  const saveResA = await fetch(`${API_BASE}/prep/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${tokenA}` },
    body: JSON.stringify(validPayloadA),
  })
  assert(saveResA.status === 200, 'POST /api/prep/setup responded with HTTP 200 OK')
  const saveDataA = await saveResA.json()
  assert(saveDataA.success === true, 'Response indicates success === true')
  assert(Boolean(saveDataA.session?.sessionId), 'Response includes saved sessionId')
  assert(saveDataA.session.roleId === 'frontend-developer', 'Session roleId is frontend-developer')
  assert(saveDataA.session.goalPrompt === validPayloadA.goalPrompt, 'Session goalPrompt matches input')
  assert(saveDataA.session.status === 'setup_saved', 'Session status is setup_saved')
  assert(saveDataA.session.knownTopics.length === 2, 'knownTopics array preserved')
  assert(saveDataA.session.weakTopics.length === 2, 'weakTopics array preserved')

  const createdSessionId = saveDataA.session.sessionId

  console.log('\n--- 5. Setup Retrieval & Data Ownership Verification ---')
  // 5a. Student A retrieves own setup
  const getResA = await fetch(`${API_BASE}/prep/setup/${createdSessionId}`, {
    headers: { authorization: `Bearer ${tokenA}` },
  })
  assert(getResA.status === 200, 'Student A can retrieve own session (HTTP 200)')
  const getDataA = await getResA.json()
  assert(getDataA.session.sessionId === createdSessionId, 'Retrieved sessionId matches')

  // 5b. Student B attempts to retrieve Student A's setup -> MUST BE REJECTED (403)
  const getResB = await fetch(`${API_BASE}/prep/setup/${createdSessionId}`, {
    headers: { authorization: `Bearer ${tokenB}` },
  })
  assert(getResB.status === 403, 'Cross-student access rejected with HTTP 403 Forbidden')
  const getDataB = await getResB.json()
  assert(getDataB.success === false, 'Cross-student response has success === false')

  // 5c. Student A retrieves latest session for frontend-developer
  const latestResA = await fetch(`${API_BASE}/prep/session/latest?roleId=frontend-developer`, {
    headers: { authorization: `Bearer ${tokenA}` },
  })
  assert(latestResA.status === 200, 'GET /api/prep/session/latest responds with 200 OK')
  const latestDataA = await latestResA.json()
  assert(latestDataA.session?.sessionId === createdSessionId, 'Latest session returns the newly created session')

  // 5d. Student B has no session yet
  const latestResB = await fetch(`${API_BASE}/prep/session/latest?roleId=frontend-developer`, {
    headers: { authorization: `Bearer ${tokenB}` },
  })
  const latestDataB = await latestResB.json()
  assert(latestDataB.session === null, 'Student B has no session (session === null)')

  // 5e. Clean up test student profiles and test sessions
  await PreparationSession.deleteMany({ firebaseUid: { $in: [studentAUid, studentBUid] } })
  await StudentProfile.deleteMany({ firebaseUid: { $in: [studentAUid, studentBUid] } })

  const finalStudentCount = await StudentProfile.countDocuments()
  assert(finalStudentCount === 2, 'Student records strictly restored to exactly 2', `Found: ${finalStudentCount}`)

  const finalLessonCount = await GeneratedLesson.countDocuments()
  assert(finalLessonCount === 20, 'Generated lessons strictly preserved at 20', `Found: ${finalLessonCount}`)

  console.log('\n=================================================================')
  console.log(`   TEST SUMMARY: ${testResults.passed.length} PASSED | ${testResults.failed.length} FAILED`)
  console.log('=================================================================\n')

  await mongoose.disconnect()
  if (testResults.failed.length > 0) {
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error('\n✗ Test execution failed:', err)
  process.exit(1)
})
