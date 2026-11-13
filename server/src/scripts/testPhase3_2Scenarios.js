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

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function runScenario(sessionId, testNum, prompt, checks) {
  console.log(`\n============================================================`)
  console.log(`[Scenario ${testNum}/10] Student: "${prompt}"`)
  console.log(`============================================================`)

  let res = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      res = await fetch(`${BASE_URL}/learning/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentAToken}`,
        },
        body: JSON.stringify({ content: prompt }),
      });
      break;
    } catch (err) {
      if (attempt === 3) throw err;
      console.warn(`[Retry attempt ${attempt + 1}] for scenario ${testNum}: ${err.message}`);
      await sleep(2000);
    }
  }

  if (!res.ok) {
    const errText = await res.text()
    console.error(`❌ HTTP Error ${res.status}:`, errText)
    return { testNum, prompt, passed: false, error: errText }
  }

  const json = await res.json()
  const assistantMsg = json.assistantMessage || {}
  const content = assistantMsg.content || ''
  const type = assistantMsg.type || 'text'
  const structuredData = assistantMsg.structuredData || {}
  const roadmap = structuredData?.roadmap || null
  const suggestedActions = assistantMsg.suggestedActions || []
  const providerMeta = assistantMsg.providerMetadata || {}

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  console.log(`Response Type: ${type}`)
  console.log(`Word Count: ~${wordCount} words`)
  console.log(`Groq Model: ${providerMeta.model || 'openai/gpt-oss-120b'} (${providerMeta.durationMs || 0}ms)`)
  console.log(`Suggested Actions:`, suggestedActions)
  console.log(`\nResponse Preview:\n${content.substring(0, 350)}...\n`)

  let passed = true
  const failures = []

  // Check Type
  if (checks.expectType && type !== checks.expectType) {
    passed = false
    failures.push(`Expected type '${checks.expectType}', got '${type}'`)
  }

  // Check Roadmap
  if (checks.expectRoadmap) {
    if (!roadmap) {
      passed = false
      failures.push('Missing structured roadmap object')
    } else {
      console.log(`Roadmap Title: "${roadmap.title}"`)
      console.log(`Milestones (${roadmap.milestones?.length || 0}):`, roadmap.milestones?.map(m => m.title))
      if (!roadmap.milestones || roadmap.milestones.length < 5) {
        passed = false
        failures.push(`Roadmap milestones too few (${roadmap.milestones?.length || 0})`)
      }
    }
  }

  // Check Skill Boundary (e.g. HTML only, no CSS/JS/React in HTML roadmap)
  if (checks.forbiddenKeywords) {
    for (const kw of checks.forbiddenKeywords) {
      const lower = content.toLowerCase()
      // Check in content
      if (lower.includes(kw.toLowerCase())) {
        passed = false
        failures.push(`Contains forbidden boundary skill: "${kw}"`)
      }
      // Also check in roadmap milestone titles if roadmap
      if (roadmap && roadmap.milestones) {
        for (const m of roadmap.milestones) {
          if (m.title.toLowerCase().includes(kw.toLowerCase())) {
            passed = false
            failures.push(`Roadmap milestone "${m.title}" contains forbidden skill: "${kw}"`)
          }
        }
      }
    }
  }

  // Check Expected Keywords
  if (checks.requiredKeywords) {
    for (const kw of checks.requiredKeywords) {
      const lower = content.toLowerCase()
      const inRoadmap = roadmap ? JSON.stringify(roadmap).toLowerCase().includes(kw.toLowerCase()) : false
      if (!lower.includes(kw.toLowerCase()) && !inRoadmap) {
        passed = false
        failures.push(`Missing expected technical keyword: "${kw}"`)
      }
    }
  }

  // Check Detailed Length (Mode B should not be artificially short)
  if (checks.minWords && wordCount < checks.minWords) {
    passed = false
    failures.push(`Response too short for detailed teaching: got ${wordCount} words, expected >= ${checks.minWords}`)
  }

  // Check Out of Scope
  if (checks.expectOutOfScope) {
    const isRedirect =
      content.toLowerCase().includes('outside') ||
      content.toLowerCase().includes('scope') ||
      content.toLowerCase().includes('frontend') ||
      json.session?.currentLearningContext?.isOutOfScope
    if (!isRedirect) {
      passed = false
      failures.push('Expected out-of-scope redirection')
    }
  }

  if (passed) {
    console.log(`✅ PASSED Scenario ${testNum}`)
  } else {
    console.log(`❌ FAILED Scenario ${testNum}:`, failures)
  }

  return {
    testNum,
    prompt,
    passed,
    wordCount,
    type,
    content,
    roadmap,
    failures,
  }
}

async function main() {
  console.log('='.repeat(75))
  console.log('CAREERLAUNCH PHASE 3.2: SKILL-FOCUSED INTELLIGENT TEACHING REAL GROQ TESTS')
  console.log('='.repeat(75))

  await mongoose.connect(MONGODB_URI)

  // Reset conversation messages for clean verification
  await LearningSession.deleteMany({ firebaseUid: 'H0cYrHDcguQl66eMXY5niCG8mEj2' })
  await LearningMessage.deleteMany({ firebaseUid: 'H0cYrHDcguQl66eMXY5niCG8mEj2' })

  // Initialize fresh session with selected skills: HTML, CSS, JavaScript, React
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
  console.log(`✓ Initialized fresh session: ${sessionId}\n`)

  const results = []

  // Scenario 1: "I want to learn HTML from scratch." -> Comprehensive HTML-only roadmap
  results.push(await runScenario(sessionId, 1, 'I want to learn HTML from scratch.', {
    expectType: 'roadmap',
    expectRoadmap: true,
    requiredKeywords: ['HTML'],
    // Ensure strict skill boundary: HTML roadmap should NOT be about React or backend
    forbiddenKeywords: ['React', 'Kubernetes'],
  }))
  await sleep(1500)

  // Scenario 2: "Explain semantic HTML in detail." -> Detailed HTML explanation (Mode B)
  results.push(await runScenario(sessionId, 2, 'Explain semantic HTML in detail.', {
    expectType: 'text',
    minWords: 200,
    requiredKeywords: ['<article>', '<nav>', 'semantic', 'accessibility'],
  }))
  await sleep(1500)

  // Scenario 3: "Give me practical HTML examples." -> Useful HTML examples (Mode C)
  results.push(await runScenario(sessionId, 3, 'Give me practical HTML examples.', {
    expectType: 'text',
    requiredKeywords: ['<', '>'],
  }))
  await sleep(1500)

  // Scenario 4: "Prepare me for HTML interviews." -> Structured HTML interview preparation path
  results.push(await runScenario(sessionId, 4, 'Prepare me for HTML interviews.', {
    expectType: 'text',
    requiredKeywords: ['interview'],
  }))
  await sleep(1500)

  // Scenario 5: "I want to learn JavaScript from scratch." -> JavaScript-focused roadmap
  results.push(await runScenario(sessionId, 5, 'I want to learn JavaScript from scratch.', {
    expectType: 'roadmap',
    expectRoadmap: true,
    requiredKeywords: ['JavaScript'],
    forbiddenKeywords: ['React Component', 'Kubernetes'],
  }))
  await sleep(1500)

  // Scenario 6: "Explain closures with examples." -> Detailed JavaScript explanation (Mode B)
  results.push(await runScenario(sessionId, 6, 'Explain closures with examples.', {
    expectType: 'text',
    minWords: 200,
    requiredKeywords: ['scope', 'function'],
  }))
  await sleep(1500)

  // Scenario 7: "I already know HTML. Let's start CSS." -> Respects student's knowledge & selected skills
  results.push(await runScenario(sessionId, 7, "I already know HTML. Let's start CSS.", {
    expectType: 'text',
    requiredKeywords: ['CSS'],
  }))
  await sleep(1500)

  // Scenario 8: "Explain React useState in detail." -> Focused on React and relevant JS prerequisites
  results.push(await runScenario(sessionId, 8, 'Explain React useState in detail.', {
    expectType: 'text',
    minWords: 200,
    requiredKeywords: ['useState', 'React'],
  }))
  await sleep(1500)

  // Scenario 9: "Explain this more deeply." -> Correctly continues previous topic (useState)
  results.push(await runScenario(sessionId, 9, 'Explain this more deeply.', {
    expectType: 'text',
    requiredKeywords: ['render'],
  }))
  await sleep(1500)

  // Scenario 10: Ask an unrelated question outside selected role and skills -> Politely redirect
  results.push(await runScenario(sessionId, 10, 'How do I deploy a Kubernetes cluster on AWS using Terraform and Ansible?', {
    expectOutOfScope: true,
  }))

  console.log('\n' + '='.repeat(75))
  console.log('PHASE 3.2 TEST SUMMARY')
  console.log('='.repeat(75))

  const total = results.length
  const passed = results.filter((r) => r.passed).length
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${total - passed}`)

  await mongoose.disconnect()

  if (passed === total) {
    console.log('🎉 ALL 10 PHASE 3.2 REAL GROQ SCENARIOS PASSED!')
    process.exit(0)
  } else {
    console.error('⚠️ SOME SCENARIOS FAILED. Inspect details above.')
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
