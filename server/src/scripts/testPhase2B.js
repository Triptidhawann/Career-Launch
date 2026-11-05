import http from 'node:http'
import mongoose from 'mongoose'
import express from 'express'
import { ContentChunk } from '../models/ContentChunk.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { MockEmbeddingProvider, GeminiEmbeddingProvider, getEmbeddingProvider } from '../services/embeddings/embeddingProvider.js'
import { embedChunksForSource } from '../services/embeddings/embeddingService.js'
import { vectorIndex } from '../services/retrieval/vectorIndex.js'
import { searchKeywords } from '../services/retrieval/keywordSearch.js'
import { searchSemantic } from '../services/retrieval/semanticSearch.js'
import { retrieveKnowledge } from '../services/retrieval/hybridRetriever.js'
import adminRetrievalRoutes from '../routes/adminRetrievalRoutes.js'
import { rateLimiter } from '../middleware/rateLimiter.js'

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

async function runPhase2BTests() {
  console.log('\n=================================================================')
  console.log('   CAREERLAUNCH PHASE 2B: EMBEDDING & RETRIEVAL ACCEPTANCE SUITE ')
  console.log('=================================================================\n')

  await mongoose.connect(MONGODB_URI)
  console.log(`Connected to database at: ${MONGODB_URI}\n`)

  // Baseline student count check
  const studentCount = await StudentProfile.countDocuments()
  assert(studentCount === 2, 'Test 22: Student records baseline verified (count: 2)')

  // --------------------------------------------------------------------------
  // TEST 1: Mock Embedding Provider Initialization & Determinism
  // --------------------------------------------------------------------------
  console.log('\n--- 1. Testing Mock Embedding Provider ---')

  const mockProvider = new MockEmbeddingProvider()
  assert(mockProvider.dimensions === 384, 'Test 1a: Mock provider configured with 384 dimensions')
  assert(mockProvider.isMock === true, 'Test 1b: isMock flag explicitly true')

  const textSample = 'Binary search bisects monotonically sorted arrays in O(log n) time.'
  const vec1 = await mockProvider.embedText(textSample)
  const vec2 = await mockProvider.embedText(textSample)

  assert(Array.isArray(vec1) && vec1.length === 384, 'Test 1c: Generated vector has exactly 384 dimensions')
  let isIdentical = true
  for (let i = 0; i < vec1.length; i++) {
    if (vec1[i] !== vec2[i]) {
      isIdentical = false
      break
    }
  }
  assert(isIdentical, 'Test 1d: Mock embedding provider is strictly deterministic')

  // --------------------------------------------------------------------------
  // TEST 2: Vector Validation & Dimension Checks
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing Vector Validation & Dimension Safeguards ---')

  const nonArrayCheck = mockProvider.validateVector('not-an-array')
  assert(!nonArrayCheck.valid, 'Test 3a: Non-array vector rejected', nonArrayCheck.reason)

  const wrongDimVector = new Array(128).fill(0.1)
  const wrongDimCheck = mockProvider.validateVector(wrongDimVector)
  assert(!wrongDimCheck.valid, 'Test 4a: Dimension mismatch (128 vs 384) rejected', wrongDimCheck.reason)

  const nanVector = new Array(384).fill(0.1)
  nanVector[10] = NaN
  const nanCheck = mockProvider.validateVector(nanVector)
  assert(!nanCheck.valid, 'Test 3b: Vector containing NaN rejected', nanCheck.reason)

  const allZeroVector = new Array(384).fill(0)
  const zeroCheck = mockProvider.validateVector(allZeroVector)
  assert(!zeroCheck.valid, 'Test 3c: Zero-magnitude vector rejected', zeroCheck.reason)

  const validVectorCheck = mockProvider.validateVector(vec1)
  assert(validVectorCheck.valid === true, 'Test 3d: Valid L2-normalized vector accepted')

  // --------------------------------------------------------------------------
  // TEST 3: Cosine Similarity Calculations & Edge Cases
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing Cosine Similarity Mathematics ---')

  const dim = 384
  const vecA = new Float32Array(dim)
  const vecB = new Float32Array(dim)
  const vecC = new Float32Array(dim)

  // A = [1, 0, 0...], B = [1, 0, 0...], C = [-1, 0, 0...]
  vecA[0] = 1.0
  vecB[0] = 1.0
  vecC[0] = -1.0

  const simIdentical = vectorIndex.computeCosineSimilarity(vecA, 1.0, vecB, 1.0)
  assert(Math.abs(simIdentical - 1.0) < 1e-5, 'Test 5a: Cosine similarity of identical vectors = 1.0')

  const vecD = new Float32Array(dim)
  vecD[1] = 1.0 // Orthogonal to vecA
  const simOrthogonal = vectorIndex.computeCosineSimilarity(vecA, 1.0, vecD, 1.0)
  assert(Math.abs(simOrthogonal - 0.0) < 1e-5, 'Test 5b: Cosine similarity of orthogonal vectors = 0.0')

  const simOpposite = vectorIndex.computeCosineSimilarity(vecA, 1.0, vecC, 1.0)
  assert(Math.abs(simOpposite - -1.0) < 1e-5, 'Test 5c: Cosine similarity of opposite vectors = -1.0')

  const zeroNormSim = vectorIndex.computeCosineSimilarity(vecA, 1.0, vecB, 0.0)
  assert(zeroNormSim === 0, 'Test 5d: Zero-norm safely produces 0 similarity without throwing or returning NaN')

  // --------------------------------------------------------------------------
  // TEST 4: Real Provider Adapter Check
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Testing Real Provider Adapter ---')

  try {
    delete process.env.GEMINI_API_KEY
    new GeminiEmbeddingProvider()
    assert(false, 'Test 2a: Gemini provider threw error without API key')
  } catch (err) {
    assert(
      err.message.includes('GEMINI_API_KEY'),
      'Test 2a: Gemini adapter safely requires GEMINI_API_KEY and avoids silent mock masking',
    )
  }

  const resolvedProvider = getEmbeddingProvider('mock')
  assert(resolvedProvider instanceof MockEmbeddingProvider, 'Test 2b: getEmbeddingProvider resolves mock provider cleanly')

  // --------------------------------------------------------------------------
  // TEST 5: Batch Embedding Generation for the 5 Pilot Topics
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Generating Batch Embeddings for Pilot Topics ---')

  const embedResult = await embedChunksForSource('nist-dads', { forceReembed: true })
  assert(embedResult.succeeded === 5, 'Test 15a: Batch embedding generated for all 5 pilot chunks')
  assert(embedResult.failed === 0, 'Test 15b: 0 failures during pilot embedding batch')

  const activeChunks = await ContentChunk.find({ 'embedding.status': 'active' })
  assert(activeChunks.length === 5, 'Test 7a: Exactly 5 chunks have active embeddings in MongoDB')

  for (const c of activeChunks) {
    assert(c.embedding.vector.length === 384, `Test 7b (${c.chunkId}): Vector dimensions verified at 384`)
    assert(c.embedding.contentHash === c.contentHash, `Test 7c (${c.chunkId}): Content hash matches chunk exactly`)
  }

  // --------------------------------------------------------------------------
  // TEST 6: In-Process Vector Index & Memory Benchmarks
  // --------------------------------------------------------------------------
  console.log('\n--- 6. In-Process Vector Index & Memory Profile ---')

  await vectorIndex.ensureIndex(true)
  const memProfile = vectorIndex.getMemoryProfile()
  assert(memProfile.vectorCount === 5, 'Test 8a: Vector index cached 5 active vectors')
  assert(memProfile.dimensions === 384, 'Test 8b: Vector index dimensions = 384')
  assert(memProfile.vectorBufferBytes === 5 * 384 * 4, `Test 8c: Float32Array memory footprint = ${memProfile.vectorBufferBytes} bytes (${memProfile.vectorBufferKb} KB)`)

  // --------------------------------------------------------------------------
  // TEST 7: Keyword-Only Search
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Testing Keyword-Only Search ---')

  const keyMatches = await searchKeywords('binary search lower bound interval', {}, 5)
  assert(keyMatches.length > 0, 'Test 6a: Keyword search returned matches')
  assert(
    keyMatches[0].chunkId.includes('4314b2703ab7'), // Binary search doc
    'Test 6b: Keyword search correctly ranked Binary Search chunk as #1 for query',
  )

  // --------------------------------------------------------------------------
  // TEST 8: Semantic-Only Search
  // --------------------------------------------------------------------------
  console.log('\n--- 8. Testing Semantic-Only Search ---')

  const semMatches = await searchSemantic('How does interval bisection eliminate half the search space?', {}, 5)
  assert(semMatches.length > 0, 'Test 7a: Semantic search returned matches')
  assert(
    semMatches[0].chunkId.includes('4314b2703ab7'), // Binary search doc
    'Test 7b: Semantic search ranked Binary Search as #1 for conceptual bisection question',
  )
  assert(semMatches[0].similarity > 0.5, 'Test 7c: Semantic similarity score > 0.5 for relevant topic')

  // --------------------------------------------------------------------------
  // TEST 9: Hybrid Retrieval (Reciprocal Rank Fusion)
  // --------------------------------------------------------------------------
  console.log('\n--- 9. Testing Hybrid Retrieval (RRF) ---')

  const hybridResult = await retrieveKnowledge({
    query: 'graph traversal cycle detection recursion call stack',
    mode: 'hybrid',
    limit: 3,
  })

  assert(hybridResult.results.length > 0, 'Test 8a: Hybrid retrieval returned results')
  assert(
    hybridResult.results[0].chunkId.includes('77e79b563a21'), // Cycle detection chunk
    'Test 8b: Cycle detection chunk ranked #1 by Hybrid RRF',
  )
  assert(hybridResult.results[0].retrieval.rrfScore > 0, 'Test 8c: RRF score computed and attached')
  assert(hybridResult.results[0].retrieval.method === 'hybrid', 'Test 8d: Retrieval method tagged as hybrid')

  // --------------------------------------------------------------------------
  // TEST 10: Metadata Filtering
  // --------------------------------------------------------------------------
  console.log('\n--- 10. Testing Metadata Filters ---')

  // Filter by topic swe-top-13 (Dynamic Programming)
  const filteredTopic = await retrieveKnowledge({
    query: 'traversal mechanics and recursion',
    topicId: 'swe-top-13',
    limit: 5,
  })
  assert(filteredTopic.results.length === 1, 'Test 9a: Topic filter restricted results to 1 chunk')
  assert(filteredTopic.results[0].topicTags.includes('swe-top-13'), 'Test 9b: Returned chunk matches swe-top-13')

  // Filter by difficulty tier 'advanced'
  const filteredDiff = await retrieveKnowledge({
    query: 'algorithms',
    difficultyTier: 'advanced',
    limit: 5,
  })
  assert(filteredDiff.results.length === 1, 'Test 9c: Difficulty tier filter restricted results')
  assert(filteredDiff.results[0].difficultyTier === 'advanced', 'Test 9d: Returned chunk is advanced tier')

  // --------------------------------------------------------------------------
  // TEST 11: Inactive / Flagged Source Exclusion
  // --------------------------------------------------------------------------
  console.log('\n--- 11. Testing Inactive & Flagged Source Exclusion ---')

  // Attempt retrieving from python-stdlib-ds (status: flagged_for_review)
  const flaggedSearch = await retrieveKnowledge({
    query: 'python collections deque list',
    sourceId: 'python-stdlib-ds',
  })
  assert(
    flaggedSearch.results.length === 0,
    'Test 10a: Flagged source (python-stdlib-ds) strictly excluded from retrieval',
  )

  // --------------------------------------------------------------------------
  // TEST 12: Provenance Preservation in Retrieval Output
  // --------------------------------------------------------------------------
  console.log('\n--- 12. Testing Provenance & Evidence Preservation ---')

  const top1Result = await retrieveKnowledge({
    query: 'two pointer scan array deduplication',
    topicId: 'swe-top-1',
    limit: 1,
  })

  assert(top1Result.results.length === 1, 'Test 12a: Found Topic 1 result')
  const r = top1Result.results[0]
  assert(r.chunkId && r.documentId && r.sourceId === 'nist-dads', 'Test 12b: Source and document IDs preserved')
  assert(r.contentOrigin === 'hybrid_pedagogical', 'Test 12c: Content origin preserved')
  assert(r.canonicalSource.url === 'https://xlinux.nist.gov/dads/HTML/array.html', 'Test 12d: Canonical source URL preserved')
  assert(r.codeExemplar.author === 'CareerLaunch Engineering', 'Test 12e: Code exemplar author preserved')
  assert(r.crossReferences.length > 0, 'Test 12f: Cross-references preserved')
  assert(Boolean(r.groundingPassage), 'Test 12g: Grounding passage preserved')

  // --------------------------------------------------------------------------
  // TEST 13: Stale Embedding Detection & Idempotency
  // --------------------------------------------------------------------------
  console.log('\n--- 13. Testing Stale Embeddings & Idempotency ---')

  // Repeat embedding without force: should skip all 5 unchanged chunks
  const repeatEmbed = await embedChunksForSource('nist-dads', { forceReembed: false })
  assert(repeatEmbed.skipped === 5, 'Test 16a: All 5 unchanged chunks skipped during idempotent re-embed')
  assert(repeatEmbed.succeeded === 0, 'Test 16b: 0 redundant embedding calls executed')

  // Stale detection simulation: alter chunk contentHash in DB
  const testChunk = await ContentChunk.findOne({ topicTags: 'swe-top-1' })
  await ContentChunk.updateOne({ chunkId: testChunk.chunkId }, { $set: { 'embedding.contentHash': 'stale_hash_value' } })

  const staleCheckSummary = await embedChunksForSource('nist-dads', { forceReembed: false })
  assert(staleCheckSummary.succeeded === 1, 'Test 13a: Stale chunk detected by hash mismatch and re-embedded')
  assert(staleCheckSummary.skipped === 4, 'Test 13b: Remaining 4 non-stale chunks preserved')

  // --------------------------------------------------------------------------
  // TEST 14: Rate Limiter Middleware
  // --------------------------------------------------------------------------
  console.log('\n--- 14. Testing Rate Limiter Middleware ---')

  const limiter = rateLimiter({ windowMs: 1000, maxRequests: 3 })
  const mockReq = { ip: '127.0.0.1' }
  const mockRes = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v },
    status(c) { this.statusCode = c; return this },
    json(payload) { this.body = payload; return this },
  }

  let allowedCount = 0
  for (let i = 0; i < 5; i++) {
    limiter(mockReq, mockRes, () => { allowedCount++ })
  }
  assert(allowedCount === 3, 'Test 18a: Allowed exactly 3 requests within threshold')
  assert(mockRes.statusCode === 429, 'Test 18b: Request #4 rejected with 429 Too Many Requests')
  assert(Boolean(mockRes.headers['Retry-After']), 'Test 18c: Retry-After header included')

  // --------------------------------------------------------------------------
  // TEST 15: Retrieval API Endpoints & Auth Security
  // --------------------------------------------------------------------------
  console.log('\n--- 15. Testing Retrieval API & Security Controls ---')

  const app = express()
  app.use(express.json())
  app.use('/api/admin/retrieval', adminRetrievalRoutes)

  const server = http.createServer(app)
  await new Promise((resolve) => server.listen(5098, '127.0.0.1', resolve))
  const baseUrl = 'http://127.0.0.1:5098'

  try {
    // 15a: Unauthenticated access to /api/admin/retrieval/search -> 401
    const unauthRes = await fetch(`${baseUrl}/api/admin/retrieval/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'binary search' }),
    })
    assert(unauthRes.status === 401, 'Test 17a: Unauthenticated retrieval search rejected with 401 Unauthorized')

    // 15b: Non-admin student access -> 403
    const mockStudentUid = 'student_test_uid_88'
    await StudentProfile.findOneAndUpdate(
      { firebaseUid: mockStudentUid },
      { firebaseUid: mockStudentUid, email: 'student88@careerlaunch.com', fullName: 'Student 88', role: 'student' },
      { upsert: true },
    )
    const sHeader = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url')
    const sPayload = Buffer.from(JSON.stringify({ user_id: mockStudentUid, email: 'student88@careerlaunch.com' })).toString('base64url')
    const sToken = `${sHeader}.${sPayload}.sig`

    const nonAdminRes = await fetch(`${baseUrl}/api/admin/retrieval/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sToken}`,
      },
      body: JSON.stringify({ query: 'binary search' }),
    })
    assert(nonAdminRes.status === 403, 'Test 17b: Non-admin request rejected with 403 Forbidden')

    // 15c: Admin access -> 200
    const mockAdminUid = 'admin_test_uid_88'
    await StudentProfile.findOneAndUpdate(
      { firebaseUid: mockAdminUid },
      { firebaseUid: mockAdminUid, email: 'admin88@careerlaunch.com', fullName: 'Admin 88', role: 'admin' },
      { upsert: true },
    )
    const aPayload = Buffer.from(JSON.stringify({ user_id: mockAdminUid, email: 'admin88@careerlaunch.com' })).toString('base64url')
    const aToken = `${sHeader}.${aPayload}.sig`

    const adminSearchRes = await fetch(`${baseUrl}/api/admin/retrieval/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aToken}`,
      },
      body: JSON.stringify({ query: 'binary search interval bisection', limit: 2 }),
    })
    const adminSearchData = await adminSearchRes.json()
    assert(adminSearchRes.status === 200 && adminSearchData.success, 'Test 17c: Verified admin granted access to retrieval search (HTTP 200)')
    assert(adminSearchData.data.results.length > 0, 'Test 17d: Search results successfully returned')

    // 15d: Status endpoint -> 200
    const statusRes = await fetch(`${baseUrl}/api/admin/retrieval/embedding-status`, {
      headers: { Authorization: `Bearer ${aToken}` },
    })
    const statusData = await statusRes.json()
    assert(statusRes.status === 200 && statusData.data.coveragePercentage === 100, 'Test 17e: Embedding status reports 100% coverage')

    // Clean up mock users
    await StudentProfile.deleteOne({ firebaseUid: mockStudentUid })
    await StudentProfile.deleteOne({ firebaseUid: mockAdminUid })
  } finally {
    server.close()
  }

  // --------------------------------------------------------------------------
  // TEST 16: Preservation of Existing Student Profiles
  // --------------------------------------------------------------------------
  console.log('\n--- 16. Verifying Student Records Preservation ---')

  const finalStudentCount = await StudentProfile.countDocuments()
  assert(finalStudentCount === 2, 'Test 22b: Student profiles preserved at exactly 2')

  await mongoose.disconnect()

  console.log('\n=================================================================')
  console.log(`   TEST SUMMARY: ${testResults.passed.length} PASSED | ${testResults.failed.length} FAILED`)
  console.log('=================================================================\n')

  if (testResults.failed.length > 0) {
    process.exit(1)
  }
}

runPhase2BTests().catch((err) => {
  console.error('Fatal test error in Phase 2B test suite:', err)
  process.exit(1)
})
