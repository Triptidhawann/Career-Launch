import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/careerlaunch'
const API_BASE = 'http://127.0.0.1:5000'

// Student A (Primary Test Student)
const studentA = {
  uid: 'H0cYrHDcguQl66eMXY5niCG8mEj2',
  email: 'triptidhawan15@gmail.com',
  name: 'Tripti Dhawan',
}

// Student B (Unauthorized Foreign Student)
const studentB = {
  uid: 'FOREIGN_STUDENT_TEST_UID_9999',
  email: 'foreign.student@example.com',
  name: 'Foreign Candidate',
}

function makeToken(user) {
  const h = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url')
  const p = Buffer.from(
    JSON.stringify({
      user_id: user.uid,
      email: user.email,
      name: user.name,
    }),
  ).toString('base64url')
  return `${h}.${p}.sig`
}

const tokenA = makeToken(studentA)
const tokenB = makeToken(studentB)

function request(method, path, body = null, token = tokenA) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE)
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    }
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (c) => (data += c))
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) })
        } catch {
          resolve({ status: res.statusCode, body: data })
        }
      })
    })

    req.on('error', reject)
    if (body) {
      req.write(JSON.stringify(body))
    }
    req.end()
  })
}

async function runTests() {
  console.log('\n=================================================================')
  console.log('   CAREERLAUNCH PHASE B2: AI DIAGNOSTIC & PLAN VERIFICATION      ')
  console.log('=================================================================\n')

  await mongoose.connect(MONGO_URI)
  console.log(`Connected to database at: ${MONGO_URI}\n`)

  const db = mongoose.connection.db
  let passes = 0
  let failures = 0

  function assert(desc, condition) {
    if (condition) {
      console.log(`  ✓ [PASS] ${desc}`)
      passes++
    } else {
      console.error(`  ✗ [FAIL] ${desc}`)
      failures++
    }
  }

  try {
    // 1. Baseline Invariants
    console.log('--- 1. Baseline System Invariant Checks ---')
    const initialProfiles = await db.collection('studentprofiles').countDocuments()
    const initialLessons = await db.collection('generatedlessons').countDocuments()
    assert('Student records baseline strictly preserved at 2', initialProfiles === 2)
    assert('Total GeneratedLessons strictly preserved at 20', initialLessons === 20)

    // 2. Setup Session for Student A
    console.log('\n--- 2. Preparation Setup Creation & Retrieval ---')
    const setupRes = await request('POST', '/api/prep/setup', {
      roleId: 'frontend-developer',
      goalPrompt: 'I want to prepare React.js, Next.js, and CSS layout for a frontend campus placement. I struggle with hooks cleanup and performance.',
      experienceLevel: 'intermediate',
      officialTopics: [
        { topicId: 'fe-top-2', title: 'CSS Box Model, Flexbox & Grid Systems' },
        { topicId: 'fe-top-9', title: 'Modern React Hooks: useState, useEffect, useRef & Custom Hooks' },
      ],
      customTopics: [
        { title: 'Next.js 14 App Router' },
        { title: 'Redux Toolkit & RTK Query' },
      ],
      preparationTimeline: '2_4_weeks',
      primaryGoal: 'placement',
    })

    assert('POST /api/prep/setup responded with 200 OK', setupRes.status === 200)
    assert('Setup returned valid sessionId', Boolean(setupRes.body?.sessionId))
    const sessionId = setupRes.body?.sessionId

    // 3. Diagnostic Session Initialization
    console.log('\n--- 3. Adaptive Diagnostic Session Lifecycle ---')
    const diagStartRes = await request('POST', '/api/prep/diagnostic/start', { sessionId })
    assert('POST /api/prep/diagnostic/start responded with 200 OK', diagStartRes.status === 200)
    assert('Diagnostic session initialized with status "in_progress"', diagStartRes.body?.diagnostic?.status === 'in_progress')
    assert('Initial question served to candidate', Boolean(diagStartRes.body?.diagnostic?.currentQuestion))
    assert('Initial question prompt is non-empty', Boolean(diagStartRes.body?.diagnostic?.currentQuestion?.prompt))

    const diagnosticId = diagStartRes.body?.diagnostic?.diagnosticId
    const firstQ = diagStartRes.body?.diagnostic?.currentQuestion

    // 4. Deterministic Objective Grading & Adaptive Progression
    console.log('\n--- 4. Deterministic Scoring & Adaptive Question Serving ---')
    // Submit correct answer to first question if MCQ
    let answerRes = await request('POST', '/api/prep/diagnostic/answer', {
      diagnosticId,
      questionId: firstQ.questionId,
      studentAnswer: firstQ.type === 'objective' ? 1 : 'Focus trapping restricts tab navigation inside the active modal and restores focus to trigger on close.',
      isSkipped: false,
    })

    assert('POST /api/prep/diagnostic/answer responded with 200 OK', answerRes.status === 200)
    assert('Evaluation result object returned', Boolean(answerRes.body?.evaluation))
    assert('Feedback message provided to candidate', Boolean(answerRes.body?.evaluation?.feedback))

    // Submit a skipped question
    if (answerRes.body?.nextQuestion) {
      const secondQ = answerRes.body.nextQuestion
      const skipRes = await request('POST', '/api/prep/diagnostic/answer', {
        diagnosticId,
        questionId: secondQ.questionId,
        studentAnswer: null,
        isSkipped: true,
      })
      assert('Skipped question handled cleanly (HTTP 200)', skipRes.status === 200)
      assert('Skipped question marked with score 0', skipRes.body?.evaluation?.score === 0)
    }

    // Complete the diagnostic
    const completeRes = await request('POST', '/api/prep/diagnostic/complete', {
      diagnosticId,
      skipped: false,
    })
    assert('POST /api/prep/diagnostic/complete returned 200 OK', completeRes.status === 200)
    assert('Diagnostic status is "completed"', completeRes.body?.diagnostic?.status === 'completed')
    assert('Demonstrated gaps or strengths compiled', Array.isArray(completeRes.body?.diagnostic?.demonstratedGaps))
    assert('Unassessed curriculum topics tracked', Array.isArray(completeRes.body?.diagnostic?.unassessedTopics))

    // 5. Groq AI Personalised Plan Generation
    console.log('\n--- 5. Groq Plan Generation & Knowledge Verification ---')
    console.log('  [Calling Groq model: openai/gpt-oss-120b...]')
    const planGenRes = await request('POST', '/api/prep/plan/generate', {
      sessionId,
      diagnosticId,
    })

    assert('POST /api/prep/plan/generate responded with 200 OK', planGenRes.status === 200)
    assert('Plan generation succeeded with success === true', planGenRes.body?.success === true)
    assert('Generated planId returned', Boolean(planGenRes.body?.planId))

    const plan = planGenRes.body?.plan
    const planId = planGenRes.body?.planId
    assert('Plan overview roleTitle is "Frontend Developer"', plan?.overview?.roleTitle === 'Frontend Developer')
    assert('Starting level matches intermediate', plan?.overview?.startingLevel === 'intermediate')
    assert('Plan milestones is an array with >= 4 milestones', Array.isArray(plan?.milestones) && plan?.milestones?.length >= 4)

    // Check official topic IDs and custom topic handling
    const officialMilestone = plan?.milestones?.find((m) => m.topicSource === 'curriculum')
    assert('Official curriculum milestone has valid fe-top-X ID', Boolean(officialMilestone && officialMilestone.officialTopicId && officialMilestone.officialTopicId.startsWith('fe-top-')))

    const customMilestone = plan?.milestones?.find((m) => m.topicSource === 'student_custom')
    assert('Custom milestone correctly recognized', Boolean(customMilestone))
    assert('Custom milestone has null officialTopicId', customMilestone ? customMilestone.officialTopicId === null : false)
    assert('Custom milestone flagged with "source_review_required"', customMilestone ? customMilestone.knowledgeSupportStatus === 'source_review_required' : false)

    assert('Weekly schedule generated with >= 2 weeks', Array.isArray(plan?.weeklySchedule) && plan?.weeklySchedule?.length >= 2)
    assert('Practice recommendations generated for MCQs & exercises', Array.isArray(plan?.practiceRecommendations?.codingExercises) && plan?.practiceRecommendations?.codingExercises?.length > 0)
    assert('Generation metadata records provider as "groq"', plan?.generationMetadata?.provider === 'groq')
    assert('Generation metadata records model as "openai/gpt-oss-120b"', plan?.generationMetadata?.model === 'openai/gpt-oss-120b')

    // 6. Plan Customization & Acceptance
    console.log('\n--- 6. Plan Customization & Acceptance Workflow ---')
    // Candidate reorders milestones and adds custom milestone
    const updatedMilestones = [...plan.milestones]
    // Swap first two milestones
    const temp = updatedMilestones[0]
    updatedMilestones[0] = updatedMilestones[1]
    updatedMilestones[1] = temp

    // Add a student custom milestone
    updatedMilestones.push({
      milestoneId: `m-custom-99`,
      title: 'Full-Stack Integration with Mock Server & MSW',
      officialTopicId: null,
      topicSource: 'student_custom',
      difficulty: 'intermediate',
      priority: 'high',
      reasonForRecommendation: 'Student added milestone for mocking APIs in tests.',
      learningObjectives: ['Set up Mock Service Worker in Vitest environment'],
      estimatedHours: 4,
      recommendedLearningActivities: ['Read MSW docs and configure worker handlers'],
      prerequisites: ['Modern JavaScript'],
      knowledgeSupportStatus: 'source_review_required',
      isCustomMilestone: true,
      orderIndex: updatedMilestones.length,
    })

    const customRes = await request('PUT', `/api/prep/plan/${planId}/customize`, {
      milestones: updatedMilestones,
    })

    assert('PUT /api/prep/plan/:planId/customize returned 200 OK', customRes.status === 200)
    assert('Plan status transitioned to "customized"', customRes.body?.plan?.status === 'customized')
    assert('Custom milestone successfully persisted', customRes.body?.plan?.milestones?.some((m) => m.milestoneId === 'm-custom-99'))

    // Accept Plan
    const acceptRes = await request('POST', `/api/prep/plan/${planId}/accept`)
    assert('POST /api/prep/plan/:planId/accept returned 200 OK', acceptRes.status === 200)
    assert('Plan status transitioned to "accepted"', acceptRes.body?.plan?.status === 'accepted')
    assert('Accepted timestamp recorded in generationMetadata', Boolean(acceptRes.body?.plan?.generationMetadata?.acceptedAt))

    // 7. Security: Cross-Student Authorization Enforcement
    console.log('\n--- 7. Security & Resource Ownership Enforcement ---')
    const crossPlanRes = await request('GET', `/api/prep/plan/${planId}`, null, tokenB)
    assert('Cross-student GET /api/prep/plan/:planId rejected with 403 Forbidden', crossPlanRes.status === 403)

    const crossCustRes = await request('PUT', `/api/prep/plan/${planId}/customize`, { milestones: [] }, tokenB)
    assert('Cross-student PUT /api/prep/plan/:planId/customize rejected with 403 Forbidden', crossCustRes.status === 403)

    const crossAcceptRes = await request('POST', `/api/prep/plan/${planId}/accept`, null, tokenB)
    assert('Cross-student POST /api/prep/plan/:planId/accept rejected with 403 Forbidden', crossAcceptRes.status === 403)

    const crossDiagRes = await request('GET', `/api/prep/diagnostic/${diagnosticId}`, null, tokenB)
    assert('Cross-student GET /api/prep/diagnostic/:diagnosticId rejected with 403 Forbidden', crossDiagRes.status === 403)

    // 8. Final Invariant Checks
    console.log('\n--- 8. Post-Execution System Invariant Verification ---')
    const finalProfiles = await db.collection('studentprofiles').countDocuments()
    const finalLessons = await db.collection('generatedlessons').countDocuments()
    assert('Student records strictly preserved at 2', finalProfiles === 2)
    assert('Generated lessons strictly preserved at 20', finalLessons === 20)

    console.log('\n=================================================================')
    console.log(`   TEST SUMMARY: ${passes} PASSED | ${failures} FAILED`)
    console.log('=================================================================\n')

    await mongoose.disconnect()
    process.exit(failures > 0 ? 1 : 0)
  } catch (err) {
    console.error('Test execution encountered fatal error:', err)
    await mongoose.disconnect()
    process.exit(1)
  }
}

runTests()
