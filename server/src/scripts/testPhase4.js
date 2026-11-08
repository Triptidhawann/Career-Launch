import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import http from 'node:http'
import mongoose from 'mongoose'
import express from 'express'
import lessonRoutes from '../routes/lessonRoutes.js'
import adminLessonRoutes from '../routes/adminLessonRoutes.js'
import { GeneratedLesson } from '../models/GeneratedLesson.js'
import { StudentProfile } from '../models/StudentProfile.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/careerlaunch'

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

async function runPhase4Tests() {
  console.log('\n=================================================================')
  console.log('   CAREERLAUNCH PHASE 4: FRONTEND LESSON INTEGRATION TEST SUITE  ')
  console.log('=================================================================\n')

  await mongoose.connect(MONGODB_URI)
  console.log(`Connected to database at: ${MONGODB_URI}\n`)

  // Baseline student count check
  const baselineCount = await StudentProfile.countDocuments()
  assert(baselineCount === 2, 'Test 1: Student records baseline intact (count: 2)')

  // Pilot lessons presence check
  const PILOT_TOPIC_IDS = ['swe-top-1', 'swe-top-4', 'swe-top-7', 'swe-top-9', 'swe-top-13']
  const storedLessonsCount = await GeneratedLesson.countDocuments({ topicId: { $in: PILOT_TOPIC_IDS } })
  assert(storedLessonsCount === 5, 'Test 2: All 5 pilot lessons present in database')

  // Setup test Express server with lessonRoutes and adminLessonRoutes
  const testApp = express()
  testApp.use(express.json())
  testApp.use('/api/lessons', lessonRoutes)
  testApp.use('/api/admin/lessons', adminLessonRoutes)
  const server = http.createServer(testApp)
  await new Promise((resolve) => server.listen(0, resolve))
  const port = server.address().port

  console.log(`\n--- 1. Testing Authentication & Authorization ---`)

  // 1a. Unauthenticated access to /api/lessons/:topicId
  const unauthRes = await fetch(`http://127.0.0.1:${port}/api/lessons/swe-top-1`)
  assert(unauthRes.status === 401, 'Test 3: Unauthenticated student request rejected with 401')

  // Create temporary mock student profile
  const mockStudentUid = 'student_test_uid_p4'
  await StudentProfile.findOneAndUpdate(
    { firebaseUid: mockStudentUid },
    {
      firebaseUid: mockStudentUid,
      email: 'student_p4@careerlaunch.com',
      fullName: 'Student Phase4',
      role: 'student',
    },
    { upsert: true }
  )

  const sHeader = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url')
  const sPayload = Buffer.from(
    JSON.stringify({ user_id: mockStudentUid, email: 'student_p4@careerlaunch.com' })
  ).toString('base64url')
  const studentToken = `${sHeader}.${sPayload}.sig`

  // 1b. Student accessing admin endpoint must be rejected with 403
  const studentOnAdminRes = await fetch(`http://127.0.0.1:${port}/api/admin/lessons/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({ topicId: 'swe-top-1' }),
  })
  assert(studentOnAdminRes.status === 403, 'Test 4: Student token accessing admin route rejected with 403 Forbidden')

  // 1c. Authenticated student accessing /api/lessons/swe-top-1
  const studentLessonRes = await fetch(`http://127.0.0.1:${port}/api/lessons/swe-top-1`, {
    headers: {
      authorization: `Bearer ${studentToken}`,
    },
  })
  assert(studentLessonRes.status === 200, 'Test 5: Authenticated student can access GET /api/lessons/swe-top-1 (HTTP 200)')
  const studentLessonData = await studentLessonRes.json()
  assert(studentLessonData.success === true, 'Test 6: Response indicates success === true')
  assert(studentLessonData.available === true, 'Test 7: Response indicates available === true')

  console.log(`\n--- 2. Verifying 9 Structured Lesson Content Sections ---`)
  const lesson = studentLessonData.lesson
  assert(Boolean(lesson), 'Test 8: Lesson payload present')
  assert(lesson.topicId === 'swe-top-1', 'Test 9: Correct topicId returned')
  assert(typeof lesson.title === 'string' && lesson.title.length > 5, 'Test 10: Human-readable title present')
  assert(Array.isArray(lesson.learningObjectives) && lesson.learningObjectives.length >= 2, 'Test 11: Learning objectives array present')

  const content = lesson.content
  assert(Boolean(content), 'Test 12: Lesson content object present')

  // Section 1: Introduction
  assert(
    Boolean(content.introduction?.meaning && content.introduction?.whyItMatters && content.introduction?.realWorldUse),
    'Test 13: Section 1 (Introduction) contains meaning, whyItMatters, realWorldUse'
  )

  // Section 2: Core Concepts
  assert(
    Array.isArray(content.coreConcepts) && content.coreConcepts.length >= 2,
    'Test 14: Section 2 (Core Concepts) contains key concept definitions'
  )

  // Section 3: Step-by-Step
  assert(
    Array.isArray(content.stepByStep) && content.stepByStep.length >= 3,
    'Test 15: Section 3 (Step-by-Step) contains algorithmic execution steps'
  )

  // Section 4: Practical Examples & Attribution
  assert(
    Array.isArray(content.practicalExamples) && content.practicalExamples.length >= 1,
    'Test 16: Section 4 (Practical Examples) contains code exemplar'
  )
  const firstExample = content.practicalExamples[0]
  assert(
    typeof firstExample.code === 'string' && firstExample.code.length > 20,
    'Test 17: Practical example contains code snippet'
  )
  assert(
    firstExample.attribution.includes('CareerLaunch'),
    'Test 18: Practical example code attribution clearly cites CareerLaunch Engineering'
  )

  // Section 5: Complexity Analysis
  assert(
    Boolean(content.complexityAnalysis?.timeComplexity && content.complexityAnalysis?.spaceComplexity),
    'Test 19: Section 5 (Complexity Analysis) provides time and space asymptotic bounds'
  )

  // Section 6: Common Mistakes
  assert(
    Array.isArray(content.commonMistakes) && content.commonMistakes.length >= 1,
    'Test 20: Section 6 (Common Mistakes) contains pitfalls and corrections'
  )

  // Section 7: Interview Insights
  assert(
    Boolean(content.interviewInsights?.advice && content.interviewInsights?.focusAreas?.length > 0),
    'Test 21: Section 7 (Interview Insights) contains whiteboard strategy and focus areas'
  )

  // Section 8: Summary
  assert(
    Array.isArray(content.summary) && content.summary.length >= 2,
    'Test 22: Section 8 (Summary) contains concise recap bullet points'
  )

  // Section 9: References
  assert(
    Array.isArray(content.references) && content.references.length >= 1,
    'Test 23: Section 9 (References) contains canonical source evidence'
  )
  const firstRef = content.references[0]
  assert(
    typeof firstRef.canonicalUrl === 'string' && firstRef.canonicalUrl.startsWith('http'),
    'Test 24: Reference includes valid external canonical URL'
  )

  console.log(`\n--- 3. Verifying Information Security & Data Leak Prevention ---`)
  assert(lesson.sourceSnapshotHashes === undefined, 'Test 25: sourceSnapshotHashes excluded from student payload')
  assert(lesson.retrievedChunkIds === undefined, 'Test 26: retrievedChunkIds excluded from student payload')
  assert(lesson.tokenUsage === undefined, 'Test 27: tokenUsage excluded from student payload')
  assert(lesson.rawSystemPrompt === undefined, 'Test 28: rawSystemPrompt excluded from student payload')
  assert(lesson.rawUserPrompt === undefined, 'Test 29: rawUserPrompt excluded from student payload')
  assert(lesson.providerResponseRaw === undefined, 'Test 30: providerResponseRaw excluded from student payload')

  console.log(`\n--- 4. Testing Query Parameter & Dual-Route Support ---`)
  // 4a. Query string: ?roleId=software-engineer
  const queryRes = await fetch(`http://127.0.0.1:${port}/api/lessons/swe-top-1?roleId=software-engineer`, {
    headers: { authorization: `Bearer ${studentToken}` },
  })
  assert(queryRes.status === 200, 'Test 31: GET /api/lessons/:topicId?roleId=... responds with 200 OK')

  // 4b. Path params: /api/lessons/:roleId/:topicId
  const pathRes = await fetch(`http://127.0.0.1:${port}/api/lessons/software-engineer/swe-top-1`, {
    headers: { authorization: `Bearer ${studentToken}` },
  })
  assert(pathRes.status === 200, 'Test 32: GET /api/lessons/:roleId/:topicId responds with 200 OK')

  console.log(`\n--- 5. Verifying All 5 Pilot Topics ---`)
  for (const tid of PILOT_TOPIC_IDS) {
    const res = await fetch(`http://127.0.0.1:${port}/api/lessons/${tid}`, {
      headers: { authorization: `Bearer ${studentToken}` },
    })
    const body = await res.json()
    assert(
      res.status === 200 && body.available === true && Boolean(body.lesson?.content?.introduction),
      `Test 33 [${tid}]: Pilot lesson retrieved and validated`
    )
  }

  console.log(`\n--- 6. Testing Non-Pilot & Unavailable Topics (404 Handling) ---`)
  // Non-pilot existing roadmap topic
  const nonPilotRes = await fetch(`http://127.0.0.1:${port}/api/lessons/swe-top-2`, {
    headers: { authorization: `Bearer ${studentToken}` },
  })
  const nonPilotData = await nonPilotRes.json()
  assert(nonPilotRes.status === 404, 'Test 34: Non-pilot topic returns HTTP 404')
  assert(nonPilotData.available === false, 'Test 35: Non-pilot topic returns available === false')
  assert(nonPilotData.lesson === null, 'Test 36: Non-pilot topic returns lesson === null')

  // Completely unknown topic
  const unknownRes = await fetch(`http://127.0.0.1:${port}/api/lessons/invalid-topic-999`, {
    headers: { authorization: `Bearer ${studentToken}` },
  })
  const unknownData = await unknownRes.json()
  assert(unknownRes.status === 404, 'Test 37: Unknown topic returns HTTP 404')
  assert(unknownData.available === false, 'Test 38: Unknown topic returns available === false')

  // Clean up mock student profile
  await StudentProfile.deleteOne({ firebaseUid: mockStudentUid })

  server.close()

  console.log(`\n--- 7. Preserving Student Profiles Integrity ---`)
  const finalStudentCount = await StudentProfile.countDocuments()
  assert(finalStudentCount === 2, 'Test 39: Student profiles strictly preserved at exactly 2')

  console.log('\n=================================================================')
  console.log(`   TEST SUMMARY: ${testResults.passed.length} PASSED | ${testResults.failed.length} FAILED`)
  console.log('=================================================================\n')

  await mongoose.disconnect()

  if (testResults.failed.length > 0) {
    process.exit(1)
  }
}

runPhase4Tests().catch((err) => {
  console.error('Fatal test error in Phase 4 test suite:', err)
  process.exit(1)
})
