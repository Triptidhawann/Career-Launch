import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import { GeneratedLesson } from '../models/GeneratedLesson.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { IngestedDocument } from '../models/IngestedDocument.js'
import { ContentChunk } from '../models/ContentChunk.js'
import { KnowledgeSource } from '../models/KnowledgeSource.js'

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
  console.log('   CAREERLAUNCH PHASE 6.1 BATCH 1: COMPREHENSIVE VERIFICATION   ')
  console.log('=================================================================\n')

  await mongoose.connect(MONGODB_URI)
  console.log(`Connected to database at: ${MONGODB_URI}\n`)

  // 1. Database Counts & Integrity
  console.log('--- 1. Database Schema & Document Counts ---')
  const studentCount = await StudentProfile.countDocuments()
  assert(studentCount === 2, 'Student count strictly preserved at 2', `Found: ${studentCount}`)

  const totalLessons = await GeneratedLesson.countDocuments()
  assert(totalLessons === 20, 'Total GeneratedLessons is exactly 20', `Found: ${totalLessons}`)

  const sweLessons = await GeneratedLesson.countDocuments({ roleId: 'software-engineer' })
  assert(sweLessons === 16, 'SWE lessons count is exactly 16', `Found: ${sweLessons}`)

  const feLessons = await GeneratedLesson.countDocuments({ roleId: 'frontend-developer' })
  assert(feLessons === 4, 'Frontend lessons count is exactly 4', `Found: ${feLessons}`)

  const sourcesCount = await KnowledgeSource.countDocuments()
  assert(sourcesCount === 7, 'KnowledgeSources count is exactly 7', `Found: ${sourcesCount}`)

  const docsCount = await IngestedDocument.countDocuments()
  assert(docsCount === 20, 'IngestedDocuments count is exactly 20', `Found: ${docsCount}`)

  const chunksCount = await ContentChunk.countDocuments()
  assert(chunksCount === 28, 'ContentChunks count is exactly 28', `Found: ${chunksCount}`)

  // 2. Generate Auth Token for Mock Student
  const mockStudentUid = 'student_test_uid_p6'
  await StudentProfile.findOneAndUpdate(
    { firebaseUid: mockStudentUid },
    {
      firebaseUid: mockStudentUid,
      email: 'student_p6@careerlaunch.com',
      fullName: 'Student Phase6',
      role: 'student',
    },
    { upsert: true }
  )

  const sHeader = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url')
  const sPayload = Buffer.from(
    JSON.stringify({ user_id: mockStudentUid, email: 'student_p6@careerlaunch.com' })
  ).toString('base64url')
  const studentToken = `${sHeader}.${sPayload}.sig`

  console.log('\n--- 2. Batch 1 Frontend API Endpoint Verification ---')
  const feBatch1Topics = [
    {
      topicId: 'fe-top-1',
      title: 'Semantic Markup & Accessibility Outlines',
      expectedSourceId: 'whatwg-standards',
      expectedDocChunk: 'doc_whatwg-standards_cc732611edae_chk_001',
    },
    {
      topicId: 'fe-top-2',
      title: 'CSS Box Model, Flexbox & Grid Systems',
      expectedSourceId: 'w3c-standards',
      expectedDocChunk: 'doc_w3c-standards_3e3b960b30fb_chk_001',
    },
    {
      topicId: 'fe-top-3',
      title: 'Responsive Design & Fluid Typography',
      expectedSourceId: 'w3c-standards',
      expectedDocChunk: 'doc_w3c-standards_6999b7095969_chk_001',
    },
    {
      topicId: 'fe-top-4',
      title: 'Execution Context, Scopes & Closures',
      expectedSourceId: 'ecma-standards',
      expectedDocChunk: 'doc_ecma-standards_80655998e01e_chk_001',
    },
  ]

  for (const item of feBatch1Topics) {
    const res = await fetch(`${API_BASE}/lessons/${item.topicId}?roleId=frontend-developer`, {
      headers: { authorization: `Bearer ${studentToken}` },
    })
    assert(res.status === 200, `GET /api/lessons/${item.topicId}?roleId=frontend-developer returned HTTP 200`, `Status: ${res.status}`)

    const data = await res.json()
    assert(data.success === true, `${item.topicId}: success === true`)
    assert(data.available === true, `${item.topicId}: available === true`)

    const lesson = data.lesson
    assert(Boolean(lesson), `${item.topicId}: Lesson object present`)
    assert(lesson.topicId === item.topicId, `${item.topicId}: topicId matches`)
    assert(lesson.lessonId === `lesson_frontend-developer_${item.topicId}_beginner`, `${item.topicId}: Canonical lessonId correct`)
    assert(lesson.roleId === 'frontend-developer', `${item.topicId}: roleId === 'frontend-developer'`)

    // Verify all 9 sections in student payload
    assert(Array.isArray(lesson.learningObjectives) && lesson.learningObjectives.length >= 2, `${item.topicId}: Section 1 Learning Objectives present (>=2)`)
    assert(Boolean(lesson.content?.introduction?.meaning && lesson.content?.introduction?.whyItMatters && lesson.content?.introduction?.realWorldUse), `${item.topicId}: Section 2 Introduction present`)
    assert(Array.isArray(lesson.content?.coreConcepts) && lesson.content.coreConcepts.length >= 1, `${item.topicId}: Section 3 Core Concepts present (>=1)`)
    assert(Array.isArray(lesson.content?.stepByStep) && lesson.content.stepByStep.length >= 1, `${item.topicId}: Section 4 Step-by-Step present (>=1)`)
    assert(Array.isArray(lesson.content?.practicalExamples) && lesson.content.practicalExamples.length >= 1, `${item.topicId}: Section 5 Practical Examples present (>=1)`)
    assert(lesson.content?.practicalExamples?.[0]?.attribution?.includes('CareerLaunch Engineering'), `${item.topicId}: Code exemplar attributed to CareerLaunch Engineering`)
    assert(Boolean(lesson.content?.complexityAnalysis?.timeComplexity), `${item.topicId}: Section 6 Complexity Analysis present`)
    assert(Array.isArray(lesson.content?.commonMistakes) && lesson.content.commonMistakes.length >= 1, `${item.topicId}: Section 7 Common Mistakes present (>=1)`)
    assert(Boolean(lesson.content?.interviewInsights?.advice), `${item.topicId}: Section 8 Interview Insights present`)
    assert(Array.isArray(lesson.content?.summary) && lesson.content.summary.length >= 1, `${item.topicId}: Section 9 Summary present (>=1)`)

    // Citations in payload and in DB
    const refs = lesson.content?.references
    assert(Array.isArray(refs) && refs.length >= 1, `${item.topicId}: Content references array present (count: ${refs?.length})`)
    assert(refs.some(r => r.sourceId === item.expectedSourceId), `${item.topicId}: References cited sourceId "${item.expectedSourceId}"`)

    // DB record citation check
    const dbRecord = await GeneratedLesson.findOne({ lessonId: lesson.lessonId }).lean()
    assert(dbRecord?.citationReferences?.includes(item.expectedDocChunk), `${item.topicId}: DB record cited chunk ${item.expectedDocChunk}`)
  }

  console.log('\n--- 3. Unavailable / Deferred Topics Verification ---')
  // fe-top-5 (batch 2 topic, not yet generated)
  const fe5Res = await fetch(`${API_BASE}/lessons/fe-top-5?roleId=frontend-developer`, {
    headers: { authorization: `Bearer ${studentToken}` },
  })
  assert(fe5Res.status === 404, 'fe-top-5 returns HTTP 404 Not Available', `Status: ${fe5Res.status}`)
  const fe5Data = await fe5Res.json()
  assert(fe5Data.available === false, 'fe-top-5 response has available === false')
  assert(fe5Data.lesson === null, 'fe-top-5 response has lesson === null')

  // se-top-1 (deferred SWE topic)
  const se1Res = await fetch(`${API_BASE}/lessons/se-top-1?roleId=software-engineer`, {
    headers: { authorization: `Bearer ${studentToken}` },
  })
  assert(se1Res.status === 404, 'se-top-1 returns HTTP 404 Not Available (deferred topic)', `Status: ${se1Res.status}`)

  // se-top-14 (deferred SWE topic)
  const se14Res = await fetch(`${API_BASE}/lessons/se-top-14?roleId=software-engineer`, {
    headers: { authorization: `Bearer ${studentToken}` },
  })
  assert(se14Res.status === 404, 'se-top-14 returns HTTP 404 Not Available (deferred topic)', `Status: ${se14Res.status}`)

  console.log('\n--- 4. Software Engineer Pilot & Expansion Regression Checks ---')
  const sweTopicsToCheck = ['swe-top-1', 'se-top-2', 'se-top-8', 'se-top-13']
  for (const tid of sweTopicsToCheck) {
    const res = await fetch(`${API_BASE}/lessons/${tid}?roleId=software-engineer`, {
      headers: { authorization: `Bearer ${studentToken}` },
    })
    assert(res.status === 200, `SWE topic ${tid} returns HTTP 200 OK`, `Status: ${res.status}`)
    const d = await res.json()
    assert(d.available === true, `SWE topic ${tid} has available === true`)
  }

  // Cleanup temporary student
  await StudentProfile.deleteOne({ firebaseUid: mockStudentUid })
  const finalStudents = await StudentProfile.countDocuments()
  assert(finalStudents === 2, 'Final student profiles count strictly preserved at 2')

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
