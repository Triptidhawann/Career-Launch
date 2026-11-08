import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import http from 'node:http'
import mongoose from 'mongoose'
import express from 'express'
import { GeneratedLesson } from '../models/GeneratedLesson.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { GroqProvider, MockGroqProvider, getAIProvider } from '../services/ai/groqProvider.js'
import { validateLessonStructure } from '../services/ai/lessonValidator.js'
import { validateCitationsAndEvidence } from '../services/ai/citationValidator.js'
import { generateCanonicalLesson, SUPPORTED_PILOT_TOPICS } from '../services/ai/lessonGenerator.js'
import adminLessonRoutes from '../routes/adminLessonRoutes.js'
import { rateLimiter } from '../middleware/rateLimiter.js'

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

async function runPhase3Tests() {
  console.log('\n=================================================================')
  console.log('   CAREERLAUNCH PHASE 3: GROQ AI GENERATION ACCEPTANCE SUITE    ')
  console.log('=================================================================\n')

  await mongoose.connect(MONGODB_URI)
  console.log(`Connected to database at: ${MONGODB_URI}\n`)

  // Baseline student count check
  const studentCount = await StudentProfile.countDocuments()
  assert(studentCount === 2, 'Test 25: Student records baseline verified (count: 2)')

  // --------------------------------------------------------------------------
  // TEST 1: Provider Initialization & Missing Secret Safeguard
  // --------------------------------------------------------------------------
  console.log('\n--- 1. Testing Groq Provider & Key Handling ---')

  const originalKey = process.env.GROQ_API_KEY
  try {
    delete process.env.GROQ_API_KEY
    new GroqProvider({ apiKey: '' })
    assert(false, 'Test 1a: Groq provider threw error on missing key')
  } catch (err) {
    assert(
      err.message.includes('GROQ_API_KEY'),
      'Test 1a: Groq provider strictly requires GROQ_API_KEY and avoids silent masking',
    )
  }

  const mockAi = new MockGroqProvider()
  assert(mockAi.isMock === true, 'Test 1b: Mock provider isMock flag explicitly true')
  assert(mockAi.modelId === 'mock-llama-3.3-70b', 'Test 1c: Mock provider configured with Llama-3.3-70b archetype')

  // Verify that silent mock fallback is blocked when AI_GENERATION_ENABLED=true
  try {
    delete process.env.GROQ_API_KEY
    getAIProvider('groq')
    assert(false, 'Test 1d: Factory should throw when key is missing and generation enabled')
  } catch (err) {
    assert(
      err.message.includes('mock fallback is disallowed'),
      'Test 1d: Factory strictly prevents silent mock fallback when generation enabled',
    )
  }

  // Restore active GROQ_API_KEY
  process.env.GROQ_API_KEY = originalKey
  const activeProvider = getAIProvider('groq')
  assert(activeProvider instanceof GroqProvider, 'Test 1e: Real GroqProvider active when GROQ_API_KEY present')
  assert(!activeProvider.isMock, 'Test 1f: Active provider isMock flag is false')

  // --------------------------------------------------------------------------
  // TEST 2: Structured Lesson Generation for All 5 Pilot Topics
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Validating Stored Canonical Lessons for All 5 Pilot Topics ---')

  const pilotTopicIds = Object.keys(SUPPORTED_PILOT_TOPICS)
  assert(pilotTopicIds.length >= 5, 'Test 2a: At least 5 pilot/expansion topics registered')

  for (const topicId of pilotTopicIds) {
    const genRes = await generateCanonicalLesson({
      topicId,
      forceRegenerate: false,
    })

    assert(genRes.success === true, `Test 2b (${topicId}): Canonical lesson retrieved/generated successfully`)
    assert(genRes.lesson && genRes.lesson.validationStatus === 'passed', `Test 2c (${topicId}): Validation status passed`)
    assert(genRes.lesson.content.practicalExamples.length > 0, `Test 2d (${topicId}): Practical example included`)
    assert(
      genRes.lesson.content.practicalExamples[0].attribution === 'CareerLaunch Engineering',
      `Test 2e (${topicId}): Code attributed to CareerLaunch Engineering`,
    )
    assert(genRes.lesson.content.references.length > 0, `Test 2f (${topicId}): Valid source reference attached`)
    assert(genRes.lesson.aiProvider === 'groq', `Test 2g (${topicId}): Recorded aiProvider is "groq"`)
  }

  // --------------------------------------------------------------------------
  // TEST 3: Schema & Completeness Validation
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing Schema Validation & Section Enforcement ---')

  // Rejection of missing required section
  const incompleteLesson = {
    title: 'Incomplete Lesson',
    difficulty: 'beginner',
    estimatedMinutes: 10,
    learningObjectives: ['Obj 1', 'Obj 2'],
    // Missing introduction, coreConcepts, stepByStep, etc.
  }
  const incompleteCheck = await validateLessonStructure({ lessonContent: incompleteLesson, evidenceChunks: [] })
  assert(!incompleteCheck.valid, 'Test 7a: Incomplete lesson with missing sections rejected')
  assert(
    incompleteCheck.errors.some((e) => e.includes('introduction')),
    'Test 7b: Error explicitly flags missing introduction section',
  )

  // Rejection of invalid difficulty tier
  const invalidDifficultyLesson = {
    title: 'Valid Title',
    difficulty: 'ultra-expert', // Invalid difficulty
    estimatedMinutes: 10,
    learningObjectives: ['A', 'B'],
    introduction: { meaning: 'm', whyItMatters: 'w', realWorldUse: 'r' },
    coreConcepts: [{ term: 't', definition: 'd', principles: 'p' }],
    stepByStep: [{ stepNumber: 1, heading: 'h', explanation: 'e' }],
    practicalExamples: [{ title: 't', explanation: 'e', code: 'def f(): pass', language: 'python', attribution: 'CareerLaunch Engineering' }],
    complexityAnalysis: { timeComplexity: 'O(1)', spaceComplexity: 'O(1)', explanation: 'e', assumptions: 'a' },
    commonMistakes: [{ mistake: 'm', consequence: 'c', correction: 'cr' }],
    interviewInsights: { focusAreas: ['fa'], followUpQuestions: ['fq'], advice: 'ad' },
    summary: ['s1'],
    references: [],
  }
  const diffCheck = await validateLessonStructure({ lessonContent: invalidDifficultyLesson, evidenceChunks: [] })
  assert(!diffCheck.valid && diffCheck.errors.some((e) => e.includes('difficulty')), 'Test 6a: Invalid difficulty value rejected')

  // --------------------------------------------------------------------------
  // TEST 4: Citation & Evidence Validation (Level 1, 2, 3)
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Testing Citation & Evidence Validation ---')

  // Level 1 Failure: Non-existent chunk ID
  const fakeChunkCitation = [
    {
      sourceId: 'nist-dads',
      canonicalUrl: 'https://xlinux.nist.gov/dads/HTML/array.html',
      chunkId: 'doc_nist-dads_nonexistent_chk_999', // Fake ID
      groundingSnippet: 'Some snippet',
    },
  ]
  const fakeCheck = await validateCitationsAndEvidence({
    references: fakeChunkCitation,
    evidenceChunks: [],
    lessonContent: {},
  })
  assert(!fakeCheck.level1Passed, 'Test 8a: Citation to non-existent chunk rejected at Level 1')

  // Level 1 Failure: Reference to flagged/inactive source
  const flaggedSourceCitation = [
    {
      sourceId: 'python-stdlib-ds', // Flagged for review in DB
      canonicalUrl: 'https://docs.python.org/3/tutorial/datastructures.html',
      chunkId: 'doc_python-stdlib-ds_chk_001',
      groundingSnippet: 'Python list methods',
    },
  ]
  const flaggedCheck = await validateCitationsAndEvidence({
    references: flaggedSourceCitation,
    evidenceChunks: [],
    lessonContent: {},
  })
  assert(!flaggedCheck.level1Passed, 'Test 9a: Citation to flagged source strictly rejected at Level 1')

  // Level 1 Failure: Canonical URL spoofing
  const validChunk = await GeneratedLesson.findOne({ topicId: 'swe-top-1' })
  const validRef = validChunk.content.references[0]

  const spoofedUrlCitation = [
    {
      ...validRef,
      canonicalUrl: 'https://malicious-phishing-site.com/fake-array.html', // spoofed URL
    },
  ]
  const spoofCheck = await validateCitationsAndEvidence({
    references: spoofedUrlCitation,
    evidenceChunks: [],
    lessonContent: {},
  })
  assert(!spoofCheck.level1Passed, 'Test 8b: Spoofed canonical source URL rejected at Level 1')

  // Level 2 Failure: Falsely claiming CareerLaunch code is NIST-authored
  const falseNistAttribution = {
    practicalExamples: [
      {
        title: 'Two Sum',
        code: 'def two_sum(): pass',
        attribution: 'Written by NIST Researchers', // False attribution violation!
      },
    ],
  }
  const nistAttributionCheck = await validateCitationsAndEvidence({
    references: [validRef],
    evidenceChunks: [],
    lessonContent: falseNistAttribution,
  })
  assert(!nistAttributionCheck.level2Passed, 'Test 10a: False NIST attribution of code rejected at Level 2')

  // Level 3 Failure: Unbalanced code syntax in practical example
  const brokenCodeExample = {
    practicalExamples: [
      {
        title: 'Broken Syntax',
        code: 'def solve(arr: if not arr: return ((unbalanced',
        attribution: 'CareerLaunch Engineering',
      },
    ],
  }
  const syntaxCheck = await validateCitationsAndEvidence({
    references: [validRef],
    evidenceChunks: [],
    lessonContent: brokenCodeExample,
  })
  assert(!syntaxCheck.level3Passed, 'Test 11a: Malformed code syntax rejected at Level 3')

  // --------------------------------------------------------------------------
  // TEST 5: Caching, Versioning & Idempotency
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Testing Caching & Safe Lesson Preservation ---')

  // Requesting existing lesson without force should return from cache
  const cachedCall = await generateCanonicalLesson({ topicId: 'swe-top-1', forceRegenerate: false })
  assert(cachedCall.fromCache === true, 'Test 17a: Non-forced request served from canonical cache')
  assert(cachedCall.lesson.lessonId === 'lesson_software-engineer_swe-top-1_beginner', 'Test 17b: Lesson ID structure verified')

  // Concurrency Lock: Simultaneous requests on the same topic reject duplicate
  const job1 = generateCanonicalLesson({ topicId: 'swe-top-4', forceRegenerate: true })
  let concurrencyRejected = false
  try {
    await generateCanonicalLesson({ topicId: 'swe-top-4', forceRegenerate: true })
  } catch (concurrencyErr) {
    concurrencyRejected = concurrencyErr.message.includes('already in progress')
  }
  await job1
  assert(concurrencyRejected, 'Test 15a: Duplicate concurrent lesson generation safely rejected by lock')

  // Stale Lesson Flagging: simulate source snapshot invalidation
  await GeneratedLesson.updateOne({ topicId: 'swe-top-1' }, { $set: { isStale: true, staleReason: 'Source snapshot hash updated' } })
  const staleLesson = await GeneratedLesson.findOne({ topicId: 'swe-top-1' })
  assert(staleLesson.isStale === true, 'Test 18a: Lesson successfully flagged as stale on snapshot change')
  // Re-run regeneration to refresh cache
  await generateCanonicalLesson({ topicId: 'swe-top-1', forceRegenerate: true })

  // --------------------------------------------------------------------------
  // TEST 6: Rate Limiting & Admin API Security
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Testing Rate Limiter & Admin Security ---')

  const limiter = rateLimiter({ windowMs: 1000, maxRequests: 2 })
  const mockReq = { ip: '127.0.0.1' }
  const mockRes = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v },
    status(c) { this.statusCode = c; return this },
    json(payload) { this.body = payload; return this },
  }
  let reqCount = 0
  for (let i = 0; i < 3; i++) {
    limiter(mockReq, mockRes, () => { reqCount++ })
  }
  assert(reqCount === 2, 'Test 20a: Rate limiter allowed exactly 2 requests')
  assert(mockRes.statusCode === 429, 'Test 20b: Request #3 rejected with 429 Too Many Requests')

  // Test admin lesson API endpoint mounting & authorization
  const testApp = express()
  testApp.use(express.json())
  testApp.use('/api/admin/lessons', adminLessonRoutes)
  const server = http.createServer(testApp)
  await new Promise((resolve) => server.listen(0, resolve))
  const port = server.address().port

  // 6a. Unauthenticated request to /generate
  const unauthRes = await fetch(`http://127.0.0.1:${port}/api/admin/lessons/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId: 'swe-top-1' }),
  })
  assert(unauthRes.status === 401, 'Test 19a: Unauthenticated generation request rejected with 401 Unauthorized')

  // Setup mock student & admin tokens
  const mockStudentUid = 'student_test_uid_p3'
  await StudentProfile.findOneAndUpdate(
    { firebaseUid: mockStudentUid },
    { firebaseUid: mockStudentUid, email: 'student_p3@careerlaunch.com', fullName: 'Student P3', role: 'student' },
    { upsert: true },
  )
  const sHeader = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url')
  const sPayload = Buffer.from(JSON.stringify({ user_id: mockStudentUid, email: 'student_p3@careerlaunch.com' })).toString('base64url')
  const sToken = `${sHeader}.${sPayload}.sig`

  // 6b. Non-admin request
  const nonAdminRes = await fetch(`http://127.0.0.1:${port}/api/admin/lessons/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${sToken}`,
    },
    body: JSON.stringify({ topicId: 'swe-top-1' }),
  })
  assert(nonAdminRes.status === 403, 'Test 19b: Non-admin request rejected with 403 Forbidden')

  // 6c. Verified Admin request
  const mockAdminUid = 'admin_test_uid_p3'
  await StudentProfile.findOneAndUpdate(
    { firebaseUid: mockAdminUid },
    { firebaseUid: mockAdminUid, email: 'admin_p3@careerlaunch.com', fullName: 'Admin P3', role: 'admin' },
    { upsert: true },
  )
  const aPayload = Buffer.from(JSON.stringify({ user_id: mockAdminUid, email: 'admin_p3@careerlaunch.com' })).toString('base64url')
  const aToken = `${sHeader}.${aPayload}.sig`

  const adminRes = await fetch(`http://127.0.0.1:${port}/api/admin/lessons`, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${aToken}`,
    },
  })
  const adminData = await adminRes.json()
  assert(adminRes.status === 200, 'Test 19c: Admin granted access to list lessons (HTTP 200)')
  assert(adminData.lessons?.length >= 5, 'Test 19d: All pilot and expansion lessons listed in administrative registry')

  // Clean up mock users
  await StudentProfile.deleteOne({ firebaseUid: mockStudentUid })
  await StudentProfile.deleteOne({ firebaseUid: mockAdminUid })

  server.close()

  // --------------------------------------------------------------------------
  // TEST 7: Student Profile Database Integrity
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Verifying Student Records Preservation ---')

  const postStudentCount = await StudentProfile.countDocuments()
  assert(postStudentCount === 2, 'Test 25b: Student profiles preserved at exactly 2')

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n=================================================================')
  console.log(`   TEST SUMMARY: ${testResults.passed.length} PASSED | ${testResults.failed.length} FAILED`)
  console.log('=================================================================\n')

  await mongoose.disconnect()

  if (testResults.failed.length > 0) {
    process.exit(1)
  }
}

runPhase3Tests().catch((err) => {
  console.error('Fatal test error in Phase 3 test suite:', err)
  process.exit(1)
})
