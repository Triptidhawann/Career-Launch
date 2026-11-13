import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import { LearningSession } from '../models/LearningSession.js'
import { LearningMessage } from '../models/LearningMessage.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const BASE_URL = 'http://localhost:5000/api'
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/careerlaunch'

const studentAHeader = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url')
const studentAPayload = Buffer.from(JSON.stringify({
  user_id: 'H0cYrHDcguQl66eMXY5niCG8mEj2',
  email: 'triptidhawan15@gmail.com',
  name: 'Tripti Dhawan',
})).toString('base64url')
const studentAToken = `${studentAHeader}.${studentAPayload}.sig`

const FORBIDDEN_SECTIONS = [
  'Conceptual Foundations',
  'Core Concepts and Invariants',
  'Step-by-Step Algorithmic Mechanics',
  'Practical Implementation',
  'Complexity Analysis',
  'Common Pitfalls',
  'Technical Interview Strategy',
  'Production Engineering Application',
  'Learning Objectives',
]

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function runTest(sessionId, testNum, prompt, expectedChecks) {
  console.log(`\n------------------------------------------------------------`)
  console.log(`[Test ${testNum}/11] Student Prompt: "${prompt}"`)
  console.log(`------------------------------------------------------------`)

  const res = await fetch(`${BASE_URL}/learning/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentAToken}`,
    },
    body: JSON.stringify({ content: prompt }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error(`❌ HTTP Error ${res.status}:`, errText)
    return { testNum, prompt, passed: false, error: errText }
  }

  const json = await res.json()
  const assistantMsg = json.assistantMessage || {}
  const content = assistantMsg.content || ''
  const type = assistantMsg.type || 'text'
  const suggestedActions = assistantMsg.suggestedActions || []
  const providerMeta = assistantMsg.providerMetadata || {}
  const structuredData = assistantMsg.structuredData || {}

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  console.log(`AI Response Type: ${type}`)
  console.log(`Word Count: ~${wordCount} words`)
  console.log(`Groq Model: ${providerMeta.model || 'unknown'} (${providerMeta.durationMs || 0}ms)`)
  console.log(`Suggested Actions (${suggestedActions.length}):`, suggestedActions)
  console.log(`\nResponse Preview:\n${content.substring(0, 300)}...\n`)

  const foundForbidden = FORBIDDEN_SECTIONS.filter((sec) =>
    content.toLowerCase().includes(sec.toLowerCase())
  )

  let passed = true
  const failures = []

  if (foundForbidden.length > 0) {
    passed = false
    failures.push(`Contains forbidden boilerplate sections: ${foundForbidden.join(', ')}`)
  }

  if (suggestedActions.length > 2) {
    passed = false
    failures.push(`Too many suggested actions: got ${suggestedActions.length}, expected max 2`)
  }

  if (expectedChecks.maxWords && wordCount > expectedChecks.maxWords) {
    passed = false
    failures.push(`Word count too high: ${wordCount} > ${expectedChecks.maxWords}`)
  }

  if (expectedChecks.expectType && type !== expectedChecks.expectType) {
    passed = false
    failures.push(`Expected type '${expectedChecks.expectType}', got '${type}'`)
  }

  if (expectedChecks.expectRoadmap && !structuredData?.roadmap) {
    passed = false
    failures.push(`Expected structured roadmap data, but none was returned`)
  }

  if (expectedChecks.expectOutOfScope) {
    const isRedirect =
      content.toLowerCase().includes('outside') ||
      content.toLowerCase().includes('frontend') ||
      content.toLowerCase().includes('scope') ||
      content.toLowerCase().includes('focus') ||
      json.session?.currentLearningContext?.isOutOfScope
    if (!isRedirect) {
      passed = false
      failures.push(`Expected out-of-scope redirection message`)
    }
  }

  if (passed) {
    console.log(`✅ PASSED Test ${testNum}`)
  } else {
    console.log(`❌ FAILED Test ${testNum}:`, failures)
  }

  return {
    testNum,
    prompt,
    passed,
    wordCount,
    type,
    content,
    suggestedActions,
    failures,
  }
}

async function main() {
  console.log('='.repeat(70))
  console.log('CAREERLAUNCH PHASE 3.1: CHATGPT-LIKE NATURAL AI CONVERSATION TEST (11 PROMPTS)')
  console.log('='.repeat(70))

  await mongoose.connect(MONGODB_URI)

  // 1. Reset conversation messages for Student A for fresh test
  await LearningSession.deleteMany({ firebaseUid: 'H0cYrHDcguQl66eMXY5niCG8mEj2' })
  await LearningMessage.deleteMany({ firebaseUid: 'H0cYrHDcguQl66eMXY5niCG8mEj2' })

  // 2. Start fresh session
  const startRes = await fetch(`${BASE_URL}/learning/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentAToken}`,
    },
    body: JSON.stringify({ roleId: 'frontend-developer' }),
  })
  const startData = await startRes.json()
  const sessionId = startData.session?.sessionId
  console.log(`✓ Initialized fresh session: ${sessionId}`)

  const results = []

  // Prompt 1: "What is HTML?"
  results.push(await runTest(sessionId, 1, 'What is HTML?', {
    maxWords: 300,
    expectType: 'text',
  }))
  await sleep(1500)

  // Prompt 2: "Explain the DOM in JavaScript."
  results.push(await runTest(sessionId, 2, 'Explain the DOM in JavaScript.', {
    maxWords: 350,
    expectType: 'text',
  }))
  await sleep(1500)

  // Prompt 3: "What are React components?"
  results.push(await runTest(sessionId, 3, 'What are React components?', {
    maxWords: 350,
    expectType: 'text',
  }))
  await sleep(1500)

  // Prompt 4: "Explain useState with a simple example."
  results.push(await runTest(sessionId, 4, 'Explain useState with a simple example.', {
    maxWords: 400,
    expectType: 'text',
  }))
  await sleep(1500)

  // Prompt 5: "What are JavaScript closures?"
  results.push(await runTest(sessionId, 5, 'What are JavaScript closures?', {
    maxWords: 350,
    expectType: 'text',
  }))
  await sleep(1500)

  // Prompt 6: "Explain this in more detail." (Follow-up)
  results.push(await runTest(sessionId, 6, 'Explain this in more detail.', {
    expectType: 'text',
  }))
  await sleep(1500)

  // Prompt 7: "Give me a practical example." (Follow-up)
  results.push(await runTest(sessionId, 7, 'Give me a practical example.', {
    expectType: 'text',
  }))
  await sleep(1500)

  // Prompt 8: "Create a React roadmap from scratch."
  results.push(await runTest(sessionId, 8, 'Create a React roadmap from scratch.', {
    expectType: 'roadmap',
    expectRoadmap: true,
  }))
  await sleep(1500)

  // Prompt 9: "I already know JavaScript. Let's start React."
  results.push(await runTest(sessionId, 9, "I already know JavaScript. Let's start React.", {
    expectType: 'text',
  }))
  await sleep(1500)

  // Prompt 10: "Ask me five React interview questions."
  results.push(await runTest(sessionId, 10, 'Ask me five React interview questions.', {
    expectType: 'text',
  }))
  await sleep(1500)

  // Prompt 11: An unrelated out-of-scope question.
  results.push(await runTest(sessionId, 11, 'How do I deploy a Kubernetes cluster on AWS using Terraform and Ansible?', {
    expectOutOfScope: true,
  }))

  console.log('\n' + '='.repeat(70))
  console.log('TEST SUMMARY')
  console.log('='.repeat(70))

  const total = results.length
  const passed = results.filter((r) => r.passed).length
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${total - passed}`)

  await mongoose.disconnect()

  if (passed === total) {
    console.log('🎉 ALL 11 CONVERSATIONAL TESTS PASSED!')
    process.exit(0)
  } else {
    console.error('⚠️ SOME TESTS FAILED. Inspect details above.')
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
