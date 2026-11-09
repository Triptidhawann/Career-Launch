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

// Student B (Foreign Test Student)
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
          const parsed = JSON.parse(data)
          resolve({ status: res.statusCode, headers: res.headers, data: parsed })
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data })
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
  console.log('='.repeat(70))
  console.log('CAREERLAUNCH PHASE 2 (SIMPLIFIED): SKILL SELECTION TEST SUITE')
  console.log('='.repeat(70))

  let passed = 0
  let failed = 0

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`)
      passed++
    } else {
      console.error(`  ✗ FAIL: ${message}`)
      failed++
    }
  }

  // Connect to DB for direct invariant verification
  await mongoose.connect(MONGO_URI)
  const db = mongoose.connection.db

  try {
    // ----------------------------------------------------
    // TEST GROUP 1: Simplified Skills Retrieval & Validation
    // ----------------------------------------------------
    console.log('\n[1] Testing Simplified Skills Retrieval (/api/learning/skills/:roleId)...')
    const taxRes = await request('GET', '/api/learning/skills/frontend-developer', null, null)
    assert(taxRes.status === 200, 'GET /api/learning/skills/frontend-developer returns HTTP 200')
    assert(taxRes.data.success === true, 'Response indicates success: true')
    assert(taxRes.data.roleId === 'frontend-developer', 'Returns correct roleId')
    assert(taxRes.data.roleTitle === 'Frontend Developer', 'Returns correct roleTitle')
    assert(taxRes.data.totalSkills === 12, 'Includes exactly 12 top-level skills')
    assert(Array.isArray(taxRes.data.skills), 'skills is an array of objects')

    // Verify first skill structure (names only, no subtopics/descriptions)
    const firstSkill = taxRes.data.skills[0]
    assert(firstSkill.id === 'html', 'First skill id is "html"')
    assert(firstSkill.name === 'HTML', 'First skill name is "HTML"')
    assert(firstSkill.subtopics === undefined, 'Zero subtopics on skill object')
    assert(firstSkill.description === undefined, 'Zero description on skill object')

    // Verify all 12 expected skill names are present
    const names = taxRes.data.skills.map((s) => s.name)
    assert(names.includes('HTML'), 'Includes "HTML"')
    assert(names.includes('CSS'), 'Includes "CSS"')
    assert(names.includes('JavaScript'), 'Includes "JavaScript"')
    assert(names.includes('TypeScript'), 'Includes "TypeScript"')
    assert(names.includes('React'), 'Includes "React"')
    assert(names.includes('Next.js'), 'Includes "Next.js"')
    assert(names.includes('State Management'), 'Includes "State Management"')
    assert(names.includes('Git & GitHub'), 'Includes "Git & GitHub"')

    // Test invalid role
    const invRoleRes = await request('GET', '/api/learning/skills/quantum-computing', null, null)
    assert(invRoleRes.status === 400, 'Invalid role returns HTTP 400 Bad Request')

    // ----------------------------------------------------
    // TEST GROUP 2: Authentication Enforcement
    // ----------------------------------------------------
    console.log('\n[2] Testing Authentication Enforcement...')
    const unauthGet = await request('GET', '/api/learning/selection/frontend-developer', null, null)
    assert(unauthGet.status === 401, 'GET /api/learning/selection without token returns HTTP 401')

    const unauthPut = await request(
      'PUT',
      '/api/learning/selection/frontend-developer',
      { selectedSkillIds: ['html'] },
      null,
    )
    assert(unauthPut.status === 401, 'PUT /api/learning/selection without token returns HTTP 401')

    // ----------------------------------------------------
    // TEST GROUP 3: Save and Retrieve Student Skill Selection
    // ----------------------------------------------------
    console.log('\n[3] Testing Simplified Skill Selection Persistence...')
    const payload = {
      selectedSkillIds: ['html', 'css', 'javascript', 'react'],
      customSkills: [
        'Tailwind CSS',
        'Docker',
        'Tailwind CSS', // duplicate to verify deduplication
        '   ',          // blank to verify filtering
      ],
    }

    const saveRes = await request('PUT', '/api/learning/selection/frontend-developer', payload, tokenA)
    assert(saveRes.status === 200, 'PUT /api/learning/selection/frontend-developer returns HTTP 200')
    assert(saveRes.data.success === true, 'Save response success is true')
    assert(saveRes.data.selection.selectedSkills.length === 4, 'Saved exactly 4 official skills')
    assert(saveRes.data.selection.customSkills.length === 2, 'Custom skills deduplicated and trimmed to 2')
    assert(
      saveRes.data.selection.selectedSkills[0].name === 'HTML',
      'First saved skill name is "HTML"',
    )
    assert(
      saveRes.data.selection.totalSelected === 6,
      'Total selected count equals official (4) + custom (2) = 6',
    )

    // Retrieve saved selection
    const getRes = await request('GET', '/api/learning/selection/frontend-developer', null, tokenA)
    assert(getRes.status === 200, 'GET /api/learning/selection/frontend-developer returns HTTP 200')
    assert(getRes.data.exists === true, 'Selection exists: true')
    assert(getRes.data.selectedSkills.length === 4, 'Retrieved 4 official skills')
    assert(getRes.data.customSkills.length === 2, 'Retrieved 2 custom skills')
    assert(
      getRes.data.customSkills.some((c) => c.name === 'Tailwind CSS'),
      'Retrieved custom skill "Tailwind CSS"',
    )

    // ----------------------------------------------------
    // TEST GROUP 4: Payload Validation & Invalid Skill Handling
    // ----------------------------------------------------
    console.log('\n[4] Testing Payload Validation & Invalid Skill Handling...')
    const invalidPayload = {
      selectedSkillIds: 'not-an-array',
      customSkills: [],
    }
    const invRes = await request('PUT', '/api/learning/selection/frontend-developer', invalidPayload, tokenA)
    assert(invRes.status === 400, 'Non-array selectedSkillIds returns HTTP 400')

    // Graceful handling of invalid skill IDs
    const mixedPayload = {
      selectedSkillIds: ['html', 'non-existent-skill-id-12345'],
      customSkills: ['Zustand'],
    }
    const mixedRes = await request('PUT', '/api/learning/selection/frontend-developer', mixedPayload, tokenA)
    assert(mixedRes.status === 200, 'Mixed valid and invalid skill IDs returns HTTP 200')
    assert(mixedRes.data.selection.selectedSkills.length === 1, 'Only valid skill is persisted')
    assert(
      Array.isArray(mixedRes.data.ignoredInvalidSkillIds) &&
        mixedRes.data.ignoredInvalidSkillIds.includes('non-existent-skill-id-12345'),
      'Invalid skill ID is reported in ignoredInvalidSkillIds',
    )

    // ----------------------------------------------------
    // TEST GROUP 5: Student Data Isolation
    // ----------------------------------------------------
    console.log('\n[5] Testing Student Isolation (Student A vs Student B)...')
    const studentBGet = await request('GET', '/api/learning/selection/frontend-developer', null, tokenB)
    assert(studentBGet.status === 200, 'Student B can query their own selection endpoint')
    assert(studentBGet.data.exists === false, 'Student B has exists: false (no cross-leakage from Student A)')
    assert(studentBGet.data.selectedSkills.length === 0, 'Student B has 0 selected skills')

    // ----------------------------------------------------
    // TEST GROUP 6: Database Invariant & Integrity Verification
    // ----------------------------------------------------
    console.log('\n[6] Verifying Database Invariants & Integrity...')
    const profilesCount = await db.collection('studentprofiles').countDocuments()
    assert(profilesCount === 2, `Student profiles preserved (expected 2, found ${profilesCount})`)

    const lessonsCount = await db.collection('generatedlessons').countDocuments()
    assert(lessonsCount === 20, `Generated lessons preserved (expected 20, found ${lessonsCount})`)

    const sourcesCount = await db.collection('knowledgesources').countDocuments()
    assert(sourcesCount === 7, `Knowledge sources preserved (expected 7, found ${sourcesCount})`)

    const ingestedDocsCount = await db.collection('ingesteddocuments').countDocuments()
    assert(ingestedDocsCount === 20, `Ingested documents preserved (expected 20, found ${ingestedDocsCount})`)

    const chunksCount = await db.collection('contentchunks').countDocuments()
    assert(chunksCount === 28, `Content chunks preserved (expected 28, found ${chunksCount})`)

    const skillSelectionCount = await db.collection('studentskillselections').countDocuments()
    assert(skillSelectionCount >= 1, `StudentSkillSelection collection has records (found ${skillSelectionCount})`)

    console.log('\n' + '='.repeat(70))
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`)
    console.log('='.repeat(70))

    if (failed > 0) {
      process.exit(1)
    }
  } finally {
    await mongoose.disconnect()
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err)
  process.exit(1)
})
