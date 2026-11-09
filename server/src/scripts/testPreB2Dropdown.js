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
  console.log('   CAREERLAUNCH PRE-B2: SEARCHABLE TOPIC DROPDOWN API TEST SUITE  ')
  console.log('=================================================================\n')

  await mongoose.connect(MONGODB_URI)
  console.log(`Connected to database at: ${MONGODB_URI}\n`)

  // 1. Baseline Checks
  console.log('--- 1. Baseline Invariants ---')
  const initialStudentCount = await StudentProfile.countDocuments()
  assert(initialStudentCount === 2, 'Student records baseline strictly preserved at 2', `Found: ${initialStudentCount}`)

  const totalLessons = await GeneratedLesson.countDocuments()
  assert(totalLessons === 20, 'Total GeneratedLessons strictly preserved at 20', `Found: ${totalLessons}`)

  // 2. Setup Student Tokens
  const studentUid = 'student_test_pre_b2'
  const otherStudentUid = 'student_test_pre_b2_other'

  await StudentProfile.findOneAndUpdate(
    { firebaseUid: studentUid },
    {
      firebaseUid: studentUid,
      email: 'student_pre_b2@careerlaunch.com',
      fullName: 'Student Pre-B2',
      role: 'student',
    },
    { upsert: true }
  )

  await StudentProfile.findOneAndUpdate(
    { firebaseUid: otherStudentUid },
    {
      firebaseUid: otherStudentUid,
      email: 'student_other@careerlaunch.com',
      fullName: 'Student Other',
      role: 'student',
    },
    { upsert: true }
  )

  const sHeader = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url')
  const token = `${sHeader}.${Buffer.from(JSON.stringify({ user_id: studentUid, email: 'student_pre_b2@careerlaunch.com' })).toString('base64url')}.sig`
  const otherToken = `${sHeader}.${Buffer.from(JSON.stringify({ user_id: otherStudentUid, email: 'student_other@careerlaunch.com' })).toString('base64url')}.sig`

  console.log('\n--- 2. Multi-Select Official Topics & Custom Topics Persistence ---')
  const payloadWithTopics = {
    roleId: 'frontend-developer',
    goalPrompt: 'I want to prepare modern React, state management, and Next.js for a frontend role.',
    experienceLevel: 'intermediate',
    officialTopics: [
      { topicId: 'fe-top-1', title: 'Semantic Markup & Accessibility Outlines' },
      { topicId: 'fe-top-4', title: 'Execution Context, Scopes & Closures' },
      { topicId: 'fe-top-8', title: 'Modern React Hooks: State, Effects & Refs' },
    ],
    customTopics: [
      { title: 'Next.js App Router' },
      { title: 'Redux Toolkit' },
      { title: 'TypeScript for React' },
      { title: 'next.js app router' }, // Duplicate test
      { title: '   ' }, // Blank test
    ],
    preparationTimeline: '2_4_weeks',
    primaryGoal: 'placement',
  }

  const saveRes = await fetch(`${API_BASE}/prep/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify(payloadWithTopics),
  })
  assert(saveRes.status === 200, 'POST /api/prep/setup responded with HTTP 200 OK')

  const saveData = await saveRes.json()
  assert(saveData.success === true, 'Response indicates success === true')
  const session = saveData.session
  assert(Boolean(session?.sessionId), 'Response includes sessionId')
  assert(session.roleId === 'frontend-developer', 'Role is frontend-developer')

  // Check official topics
  assert(Array.isArray(session.officialTopics), 'officialTopics is an array')
  assert(session.officialTopics.length === 3, 'officialTopics has exactly 3 items', `Found: ${session.officialTopics.length}`)
  assert(session.officialTopics[0].topicId === 'fe-top-1', 'First official topic is fe-top-1')
  assert(session.officialTopics[0].source === 'curriculum', 'Official topic source is "curriculum"')

  // Check custom topics & deduplication
  assert(Array.isArray(session.customTopics), 'customTopics is an array')
  assert(session.customTopics.length === 3, 'customTopics deduplicated (3 unique, ignoring duplicate and blank)', `Found: ${session.customTopics.length}`)
  assert(session.customTopics.some((t) => t.title === 'Next.js App Router'), 'Next.js App Router present')
  assert(session.customTopics[0].source === 'student_custom', 'Custom topic source is "student_custom"')

  const sessionId = session.sessionId

  console.log('\n--- 3. Session Retrieval & Data Structure Verification ---')
  const getRes = await fetch(`${API_BASE}/prep/setup/${sessionId}`, {
    headers: { authorization: `Bearer ${token}` },
  })
  assert(getRes.status === 200, 'GET /api/prep/setup/:sessionId responds with 200 OK')
  const getData = await getRes.json()
  assert(getData.session.officialTopics.length === 3, 'Retrieved session preserves officialTopics')
  assert(getData.session.customTopics.length === 3, 'Retrieved session preserves customTopics')

  // Cross-student security check
  const crossRes = await fetch(`${API_BASE}/prep/setup/${sessionId}`, {
    headers: { authorization: `Bearer ${otherToken}` },
  })
  assert(crossRes.status === 403, 'Cross-student retrieval rejected with 403 Forbidden')

  console.log('\n--- 4. Backward Compatibility with Legacy Sessions ---')
  const legacyPayload = {
    roleId: 'frontend-developer',
    goalPrompt: 'Testing legacy format without officialTopics or customTopics.',
    knownTopics: ['fe-top-2'],
    weakTopics: ['fe-top-3'],
  }
  const legacySaveRes = await fetch(`${API_BASE}/prep/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${otherToken}` },
    body: JSON.stringify(legacyPayload),
  })
  assert(legacySaveRes.status === 200, 'Legacy payload without officialTopics saves successfully (HTTP 200)')
  const legacyData = await legacySaveRes.json()
  assert(Array.isArray(legacyData.session.officialTopics) && legacyData.session.officialTopics.length === 0, 'Legacy session defaults officialTopics to empty array')
  assert(Array.isArray(legacyData.session.customTopics) && legacyData.session.customTopics.length === 0, 'Legacy session defaults customTopics to empty array')
  assert(legacyData.session.knownTopics.length === 1, 'Legacy session preserves knownTopics')

  // Cleanup test records
  await PreparationSession.deleteMany({ firebaseUid: { $in: [studentUid, otherStudentUid] } })
  await StudentProfile.deleteMany({ firebaseUid: { $in: [studentUid, otherStudentUid] } })

  const finalStudents = await StudentProfile.countDocuments()
  assert(finalStudents === 2, 'Student profiles strictly restored to exactly 2', `Found: ${finalStudents}`)

  const finalLessons = await GeneratedLesson.countDocuments()
  assert(finalLessons === 20, 'Generated lessons strictly preserved at 20', `Found: ${finalLessons}`)

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
