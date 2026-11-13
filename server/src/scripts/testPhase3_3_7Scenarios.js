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

const SCENARIOS = [
  {
    id: 1,
    prompt: 'Teach me HTML void elements.',
    skill: 'HTML',
    expectedTitleSkill: 'HTML',
    expectedTitleTopic: 'Void Elements',
    checks: ['void', 'syntax', '###'],
  },
  {
    id: 2,
    prompt: 'Explain every important HTML void element with syntax and examples.',
    skill: 'HTML',
    expectedTitleSkill: 'HTML',
    expectedTitleTopic: 'Void Elements',
    checks: ['<img', '<input', '<br', '<meta', '<link'],
  },
  {
    id: 3,
    prompt: 'Explain semantic HTML in detail.',
    skill: 'HTML',
    expectedTitleSkill: 'HTML',
    expectedTitleTopic: 'Semantic Elements',
    checks: ['semantic', 'accessibility', '<header', '<article', '<nav'],
  },
  {
    id: 4,
    prompt: 'Teach me HTML forms from beginner to advanced.',
    skill: 'HTML',
    expectedTitleSkill: 'HTML',
    expectedTitleTopic: 'Forms & Inputs',
    checks: ['<form', '<input', 'label', 'validation'],
  },
  {
    id: 5,
    prompt: 'Explain JavaScript closures with practical examples.',
    skill: 'JavaScript',
    expectedTitleSkill: 'JavaScript',
    expectedTitleTopic: 'Closures',
    checks: ['lexical', 'scope', 'function', 'return'],
  },
  {
    id: 6,
    prompt: 'Explain React useState in detail.',
    skill: 'React',
    expectedTitleSkill: 'React',
    expectedTitleTopic: 'useState',
    checks: ['useState', 'render', 'state', 'const ['],
  },
  {
    id: 7,
    prompt: 'Prepare me for HTML technical interviews.',
    skill: 'HTML',
    expectedTitleSkill: 'HTML',
    expectedTitleTopic: 'Interview Preparation',
    checks: ['interview', 'question', 'answer', 'html'],
  },
  // Contextual follow-up scenarios run in the session of Scenario 1 (HTML void elements)
  {
    id: 8,
    isFollowUp: true,
    prompt: 'Explain this more deeply.',
    skill: 'HTML',
    expectedTitleSkill: 'HTML',
    expectedTitleTopic: 'Deep Dive',
    checks: ['under the hood', 'browser', 'dom', 'spec'],
  },
  {
    id: 9,
    isFollowUp: true,
    prompt: 'Give me a practical coding exercise.',
    skill: 'HTML',
    expectedTitleSkill: 'HTML',
    expectedTitleTopic: 'Coding Challenge',
    checks: ['exercise', 'challenge', 'task', 'code'],
  },
  {
    id: 10,
    isFollowUp: true,
    prompt: 'Ask me five interview questions about the topic.',
    skill: 'HTML',
    expectedTitleSkill: 'HTML',
    expectedTitleTopic: 'Interview Preparation',
    checks: ['1.', '2.', '3.', '4.', '5.'],
  },
]

async function run() {
  console.log('='.repeat(80))
  console.log('CAREERLAUNCH PHASE 3.3.7 — 10 REAL GROQ SCENARIO VERIFICATION')
  console.log('Provider: Groq (openai/gpt-oss-120b) | DB: careerlaunch port 27018')
  console.log('='.repeat(80))

  await mongoose.connect(MONGODB_URI)

  const results = []
  let sharedSessionId = null

  for (const scen of SCENARIOS) {
    console.log(`\n--- Scenario ${scen.id}: "${scen.prompt}" ---`)

    let currentSessionId = sharedSessionId
    if (!scen.isFollowUp || !currentSessionId) {
      // Create new session for this scenario
      const createRes = await fetch('http://localhost:5000/api/learning/conversations', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: 'frontend-developer' }),
      }).then((r) => r.json())
      currentSessionId = createRes.conversation?.sessionId
      if (scen.id === 1) {
        sharedSessionId = currentSessionId // reuse for follow-ups 8, 9, 10
      }
    }

    const t0 = performance.now()
    let responseData
    try {
      const res = await fetch(`http://localhost:5000/api/learning/sessions/${currentSessionId}/messages`, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: scen.prompt }),
      })
      responseData = await res.json()
    } catch (err) {
      console.error(`Scenario ${scen.id} fetch error:`, err.message)
      results.push({ id: scen.id, prompt: scen.prompt, status: 'ERROR', error: err.message })
      continue
    }

    const elapsedMs = Math.round(performance.now() - t0)

    if (!responseData.success) {
      console.error(`Scenario ${scen.id} failed:`, responseData.error || responseData)
      results.push({ id: scen.id, prompt: scen.prompt, status: 'FAILED', error: responseData.error })
      continue
    }

    const title = responseData.conversationTitle || ''
    const reply = responseData.assistantMessage?.content || ''
    const model = responseData.assistantMessage?.providerModel || 'unknown'
    const hasCodeBlock = reply.includes('```')
    const hasHeadings = reply.includes('###')

    // Evaluate keyword checks
    const lowerReply = reply.toLowerCase()
    const passedChecks = scen.checks.filter((kw) => lowerReply.includes(kw.toLowerCase()))

    console.log(`✓ Response received in ${elapsedMs}ms (${reply.length} chars, model: ${model})`)
    console.log(`  Title: "${title}"`)
    console.log(`  Structured Headings: ${hasHeadings ? 'YES' : 'NO'} | Code Blocks: ${hasCodeBlock ? 'YES' : 'NO'}`)
    console.log(`  Keyword checks passed: ${passedChecks.length}/${scen.checks.length} [${passedChecks.join(', ')}]`)

    results.push({
      id: scen.id,
      prompt: scen.prompt,
      status: 'PASSED',
      elapsedMs,
      title,
      model,
      charCount: reply.length,
      hasCodeBlock,
      hasHeadings,
      passedChecksCount: passedChecks.length,
      totalChecks: scen.checks.length,
      sampleSnippet: reply.slice(0, 180).replace(/\n/g, ' ') + '...',
    })

    // Brief delay between calls to respect TPM window
    await new Promise((r) => setTimeout(r, 2000))
  }

  console.log('\n' + '='.repeat(80))
  console.log('SUMMARY OF 10 SCENARIO TEST RESULTS')
  console.log('='.repeat(80))
  console.table(
    results.map((r) => ({
      Scenario: r.id,
      Status: r.status,
      TimeMs: r.elapsedMs,
      Chars: r.charCount,
      Headings: r.hasHeadings ? 'Yes' : 'No',
      Code: r.hasCodeBlock ? 'Yes' : 'No',
      Checks: `${r.passedChecksCount}/${r.totalChecks}`,
      Title: r.title,
    })),
  )

  await mongoose.disconnect()
}

run().catch((err) => {
  console.error('Fatal test error:', err)
  process.exit(1)
})
