import mongoose from 'mongoose'
import { LearningSession } from '../models/LearningSession.js'
import { LearningMessage } from '../models/LearningMessage.js'

const BASE_URL = 'http://localhost:5000/api'

// Generate test student tokens
function getStudentToken(uid = 'H0cYrHDcguQl66eMXY5niCG8mEj2', email = 'triptidhawan15@gmail.com') {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({
      user_id: uid,
      email,
      name: 'Tripti Dhawan',
      email_verified: true,
    }),
  ).toString('base64url')
  return `${header}.${payload}.sig`
}

function getOtherStudentToken() {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({
      user_id: 'OTHER_STUDENT_99999',
      email: 'other_student@example.com',
      name: 'Other Student',
      email_verified: true,
    }),
  ).toString('base64url')
  return `${header}.${payload}.sig`
}

const token = getStudentToken()
const otherToken = getOtherStudentToken()

async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.token || token}`,
      ...options.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, ok: res.ok, data }
}

async function runTests() {
  console.log('===========================================================================')
  console.log('CAREERLAUNCH PHASE 3.3: CHATGPT-STYLE CONVERSATION MANAGEMENT TEST SUITE')
  console.log('===========================================================================')

  let passed = 0
  let failed = 0

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`)
      passed++
    } else {
      console.error(`  ❌ FAILED: ${message}`)
      failed++
    }
  }

  try {
    // ------------------------------------------------------------------------
    console.log('\n[Scenario 1] Fresh Entry via Skill Selection creates independent conversation')
    // ------------------------------------------------------------------------
    const entryRes = await api('/learning/conversations', {
      method: 'POST',
      body: JSON.stringify({
        roleId: 'frontend-developer',
        selectedSkillIds: ['html'],
        initialTitle: 'New Chat',
      }),
    })
    assert(entryRes.ok && entryRes.data.success, 'Conversation created successfully')
    const conv1Id = entryRes.data.conversation.sessionId
    assert(entryRes.data.conversation.selectedSkills.some((s) => s.name === 'HTML'), 'Conversation snapshot contains HTML skill')
    assert(entryRes.data.conversation.title === 'New Chat', 'Initial title is "New Chat"')

    // ------------------------------------------------------------------------
    console.log('\n[Scenario 2] Creating New Chat opens empty conversation with clean initial state')
    // ------------------------------------------------------------------------
    const msgs1Before = await api(`/learning/conversations/${conv1Id}/messages`)
    assert(msgs1Before.ok && msgs1Before.data.messages.length === 0, 'New conversation starts with 0 messages')

    // ------------------------------------------------------------------------
    console.log('\n[Scenario 3] Sending message persists to active conversation & triggers auto-title')
    // ------------------------------------------------------------------------
    const send1 = await api(`/learning/conversations/${conv1Id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content: 'I want to learn HTML from scratch.' }),
    })
    assert(send1.ok && send1.data.success, 'First message sent and AI replied')
    assert(send1.data.conversationTitle === 'Learn HTML', `Title auto-generated correctly: "${send1.data.conversationTitle}"`)
    assert(send1.data.assistantMessage?.content?.length > 0, 'Assistant message content persisted')

    const msgs1After = await api(`/learning/conversations/${conv1Id}/messages`)
    assert(msgs1After.data.messages.length === 2, `Conversation 1 now contains exactly 2 messages (has ${msgs1After.data.messages.length})`)

    // ------------------------------------------------------------------------
    console.log('\n[Scenario 4] Creating Conversation 2 with different skills does NOT leak messages')
    // ------------------------------------------------------------------------
    const entry2Res = await api('/learning/conversations', {
      method: 'POST',
      body: JSON.stringify({
        roleId: 'frontend-developer',
        selectedSkillIds: ['javascript'],
        initialTitle: 'New Chat',
      }),
    })
    const conv2Id = entry2Res.data.conversation.sessionId
    assert(conv2Id !== conv1Id, 'Conversation 2 has a distinct unique session ID')
    assert(entry2Res.data.conversation.selectedSkills.some((s) => s.name === 'JavaScript'), 'Conversation 2 snapshot contains JavaScript')
    assert(!entry2Res.data.conversation.selectedSkills.some((s) => s.name === 'HTML'), 'Conversation 2 does NOT have HTML')

    const msgs2Before = await api(`/learning/conversations/${conv2Id}/messages`)
    assert(msgs2Before.data.messages.length === 0, 'Conversation 2 starts with ZERO messages (no leakage from Conv 1)')

    // ------------------------------------------------------------------------
    console.log('\n[Scenario 5] Context restoration when switching between Conversation 1 and 2')
    // ------------------------------------------------------------------------
    const send2 = await api(`/learning/conversations/${conv2Id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content: 'Explain closures with examples.' }),
    })
    assert(send2.ok && send2.data.success, 'Message sent to Conversation 2')
    assert(send2.data.conversationTitle === 'Closures Explained', `Conv 2 title auto-generated: "${send2.data.conversationTitle}"`)

    // Verify Conv 1 messages are still intact and unchanged
    const msgs1Verify = await api(`/learning/conversations/${conv1Id}/messages`)
    assert(msgs1Verify.data.messages.length === 2, 'Conv 1 still has exactly 2 messages')
    assert(msgs1Verify.data.messages[0].content === 'I want to learn HTML from scratch.', 'Conv 1 preserved original user prompt')

    // Verify Conv 2 messages
    const msgs2Verify = await api(`/learning/conversations/${conv2Id}/messages`)
    assert(msgs2Verify.data.messages.length === 2, 'Conv 2 has its own 2 messages')
    assert(msgs2Verify.data.messages[0].content === 'Explain closures with examples.', 'Conv 2 preserved its user prompt')

    // ------------------------------------------------------------------------
    console.log('\n[Scenario 6] Refreshing active conversation restores exact metadata and messages')
    // ------------------------------------------------------------------------
    const meta2 = await api(`/learning/conversations/${conv2Id}`)
    assert(meta2.ok && meta2.data.session.title === 'Closures Explained', 'Conversation 2 restored with title "Closures Explained"')
    assert(meta2.data.session.selectedSkills[0].name === 'JavaScript', 'Conversation 2 restored with JavaScript skill')

    // ------------------------------------------------------------------------
    console.log('\n[Scenario 7] Renaming a conversation')
    // ------------------------------------------------------------------------
    const renameRes = await api(`/learning/conversations/${conv2Id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title: 'JavaScript Closures Deep Dive' }),
    })
    assert(renameRes.ok && renameRes.data.conversation.title === 'JavaScript Closures Deep Dive', 'Conversation successfully renamed')

    const listRes = await api('/learning/conversations?roleId=frontend-developer')
    const foundRenamed = listRes.data.conversations.find((c) => c.sessionId === conv2Id)
    assert(foundRenamed && foundRenamed.title === 'JavaScript Closures Deep Dive', 'Renamed title reflected in conversation list')

    // ------------------------------------------------------------------------
    console.log('\n[Scenario 8] Safe Soft Deletion: deleting Conv 1 does NOT affect Conv 2')
    // ------------------------------------------------------------------------
    const del1 = await api(`/learning/conversations/${conv1Id}`, { method: 'DELETE' })
    assert(del1.ok && del1.data.success, 'Conversation 1 deleted successfully')

    const listAfterDel = await api('/learning/conversations?roleId=frontend-developer')
    assert(!listAfterDel.data.conversations.some((c) => c.sessionId === conv1Id), 'Deleted Conv 1 is excluded from student list')
    assert(listAfterDel.data.conversations.some((c) => c.sessionId === conv2Id), 'Conv 2 remains active and present in student list')

    const getDeletedDirect = await api(`/learning/conversations/${conv1Id}`)
    assert(getDeletedDirect.status === 404, 'Direct GET on deleted conversation returns 404 Not Found')

    // Verify physical records were preserved in MongoDB (soft delete requirement)
    const rawDeletedDoc = await LearningSession.findById(conv1Id)
    assert(rawDeletedDoc && rawDeletedDoc.status === 'deleted', 'MongoDB record preserved with status: "deleted"')
    const rawMessagesCount = await LearningMessage.countDocuments({ sessionId: conv1Id })
    assert(rawMessagesCount === 2, 'Physical message records in MongoDB were NOT deleted')

    // ------------------------------------------------------------------------
    console.log('\n[Scenario 9] Security & Multi-Tenant Authorization: Student B cannot access Student A')
    // ------------------------------------------------------------------------
    const unauthorizedGet = await api(`/learning/conversations/${conv2Id}`, { token: otherToken })
    assert(unauthorizedGet.status === 403 || unauthorizedGet.status === 404, `Student B blocked from reading Conv 2 (HTTP ${unauthorizedGet.status})`)

    const unauthorizedPost = await api(`/learning/conversations/${conv2Id}/messages`, {
      method: 'POST',
      token: otherToken,
      body: JSON.stringify({ content: 'Malicious post' }),
    })
    assert(unauthorizedPost.status === 403 || unauthorizedPost.status === 404, `Student B blocked from posting to Conv 2 (HTTP ${unauthorizedPost.status})`)

    // ------------------------------------------------------------------------
    console.log('\n[Scenario 10] Independent Skill Context Preservation')
    // ------------------------------------------------------------------------
    // Create Conversation 3 with [HTML, CSS]
    const entry3Res = await api('/learning/conversations', {
      method: 'POST',
      body: JSON.stringify({
        roleId: 'frontend-developer',
        selectedSkillIds: ['html', 'css'],
        initialTitle: 'New Chat',
      }),
    })
    const conv3Id = entry3Res.data.conversation.sessionId
    assert(entry3Res.data.conversation.selectedSkills.length === 2, 'Conv 3 has exactly 2 skills (HTML, CSS)')

    // Verify Conv 2 still has ONLY JavaScript
    const conv2Check = await api(`/learning/conversations/${conv2Id}`)
    assert(conv2Check.data.session.selectedSkills.length === 1 && conv2Check.data.session.selectedSkills[0].name === 'JavaScript', 'Conv 2 skill context remained exclusively JavaScript')

    // ------------------------------------------------------------------------
    console.log('\n[Scenario 11] Returning Student Lifecycle (Logout, Login, Re-open, Create Fresh)')
    // ------------------------------------------------------------------------
    // Step A: Student re-authenticates (simulated fresh token)
    const freshToken = getStudentToken()
    const returningList = await api('/learning/conversations?roleId=frontend-developer', { token: freshToken })
    assert(returningList.ok && returningList.data.conversations.length >= 2, 'Returning student retrieves all saved conversations')

    // Step B: Student opens Conv 2
    const returningOpen = await api(`/learning/conversations/${conv2Id}`, { token: freshToken })
    assert(returningOpen.data.session.title === 'JavaScript Closures Deep Dive', 'Returning student restored Conv 2 title')
    const returningMsgs = await api(`/learning/conversations/${conv2Id}/messages`, { token: freshToken })
    assert(returningMsgs.data.messages.length === 2, 'Returning student restored Conv 2 message history')

    // Step C: Student creates fresh conversation without losing Conv 2 or Conv 3
    const freshChatRes = await api('/learning/conversations', {
      method: 'POST',
      token: freshToken,
      body: JSON.stringify({ roleId: 'frontend-developer' }),
    })
    const freshChatId = freshChatRes.data.conversation.sessionId
    assert(freshChatId !== conv2Id && freshChatId !== conv3Id, 'Fresh conversation created with new ID')

    const finalList = await api('/learning/conversations?roleId=frontend-developer', { token: freshToken })
    assert(finalList.data.conversations.some((c) => c.sessionId === freshChatId), 'Fresh chat present in list')
    assert(finalList.data.conversations.some((c) => c.sessionId === conv2Id), 'Conv 2 still present in list')
    assert(finalList.data.conversations.some((c) => c.sessionId === conv3Id), 'Conv 3 still present in list')

    // ------------------------------------------------------------------------
    console.log('\n[Scenario 12] Legacy Endpoints Compatibility (/sessions)')
    // ------------------------------------------------------------------------
    const legacyGet = await api(`/learning/sessions/${conv2Id}`)
    assert(legacyGet.ok && legacyGet.data.session.sessionId === conv2Id, 'Legacy GET /api/learning/sessions/:sessionId works seamlessly')

    console.log('\n===========================================================================')
    console.log(`PHASE 3.3 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`)
    console.log('===========================================================================')

    if (failed > 0) {
      process.exit(1)
    } else {
      process.exit(0)
    }
  } catch (error) {
    console.error('Fatal test error:', error)
    process.exit(1)
  }
}

// Connect to MongoDB to inspect raw documents during test
mongoose.connect('mongodb://127.0.0.1:27018/careerlaunch').then(() => {
  runTests()
})
