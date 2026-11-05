import mongoose from 'mongoose'
import { KnowledgeSource } from '../models/KnowledgeSource.js'
import { ContentChunk } from '../models/ContentChunk.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { validateSourceLicence, validateUrlSafety } from '../services/ingestion/sourceValidator.js'
import { cleanDocumentContent } from '../services/ingestion/markdownCleaner.js'
import { chunkDocument } from '../services/ingestion/semanticChunker.js'
import { executeIngestionJob } from '../services/ingestion/ingestionService.js'

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

async function runTests() {
  console.log('\n=================================================================')
  console.log('   CAREERLAUNCH PHASE 2A: COMPREHENSIVE ACCEPTANCE TEST SUITE    ')
  console.log('=================================================================\n')

  await mongoose.connect(MONGODB_URI)
  console.log(`Connected to test database at: ${MONGODB_URI}\n`)

  // Verify existing student profile preservation baseline
  const initialStudentCount = await StudentProfile.countDocuments()
  assert(initialStudentCount === 2, 'Test 17a: Existing student profiles baseline verified (count: 2)')

  // --------------------------------------------------------------------------
  // TEST 1: Source Validation & Rejection of Incompatible Licences (Criteria 2, 3)
  // --------------------------------------------------------------------------
  console.log('\n--- 1. Testing Licence Validation & Non-Commercial Rejection ---')

  // Case A: Commercially compatible source (NIST DADS - Public Domain)
  const validNistSource = {
    sourceId: 'nist-dads',
    name: 'NIST Dictionary of Algorithms and Data Structures',
    owner: 'National Institute of Standards and Technology',
    baseUrl: 'https://xlinux.nist.gov/dads/',
    category: 'official_docs',
    authorityTier: 1,
    licence: {
      spdxId: 'Public-Domain',
      name: 'US Government Public Domain (17 U.S.C. § 105)',
      version: 'Statutory',
      commercialUsePermitted: true,
      attributionRequired: true,
      attributionText: 'National Institute of Standards and Technology (NIST)',
      storagePermitted: true,
      indexingPermitted: true,
      quotingPermitted: true,
      maxQuoteLengthCharacters: 1500,
    },
    ingestionMethod: 'static_dump',
    allowedDomains: ['xlinux.nist.gov', 'www.nist.gov'],
  }
  const nistEval = validateSourceLicence(validNistSource)
  assert(nistEval.approved === true, 'Test 1: Commercially compatible source (NIST DADS) approved')

  // Case B: Non-commercial licence (OpenDSA - CC BY-NC-SA 4.0)
  const nonCommercialSource = {
    sourceId: 'opendsa-cs3',
    name: 'OpenDSA CS3 eTextbook',
    owner: 'Virginia Tech',
    baseUrl: 'https://opendsa-server.cs.vt.edu/',
    category: 'academic_curriculum',
    authorityTier: 2,
    licence: {
      spdxId: 'CC-BY-NC-SA-4.0',
      name: 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0',
      version: '4.0',
      commercialUsePermitted: false,
      attributionRequired: true,
      storagePermitted: true,
      indexingPermitted: true,
      quotingPermitted: true,
    },
    ingestionMethod: 'git_clone',
    allowedDomains: ['opendsa-server.cs.vt.edu'],
  }
  const ncEval = validateSourceLicence(nonCommercialSource)
  assert(
    ncEval.approved === false && ncEval.mode === 'rejected',
    'Test 2: Non-commercial licence (CC-BY-NC-SA) rejected from production ingestion',
    ncEval.reason,
  )

  // Case C: Ambiguous / Missing licence
  const ambiguousSource = {
    sourceId: 'unknown-blog',
    name: 'Arbitrary Web Article',
    owner: 'Unknown',
    baseUrl: 'https://random-site.org/',
    category: 'educational_repository',
    authorityTier: 3,
    licence: null,
    ingestionMethod: 'whitelisted_html',
    allowedDomains: ['random-site.org'],
  }
  const ambEval = validateSourceLicence(ambiguousSource)
  assert(ambEval.approved === false, 'Test 3: Missing/Ambiguous licence rejected immediately')

  // --------------------------------------------------------------------------
  // TEST 2: SSRF & IP Allowlisting Protection (Criteria 15)
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing SSRF & Security Defense ---')

  const allowedDomains = ['xlinux.nist.gov', 'docs.python.org']

  // SSRF Attempt A: Loopback (127.0.0.1)
  const ssrfLoopback = await validateUrlSafety('http://127.0.0.1:27018/admin', allowedDomains)
  assert(ssrfLoopback.valid === false, 'Test 15a: SSRF loopback IP (127.0.0.1) blocked')

  // SSRF Attempt B: Localhost alias
  const ssrfLocalhost = await validateUrlSafety('http://localhost:5000/api', allowedDomains)
  assert(ssrfLocalhost.valid === false, 'Test 15b: SSRF localhost domain blocked')

  // SSRF Attempt C: Cloud Metadata Service (169.254.169.254)
  const ssrfMeta = await validateUrlSafety('http://169.254.169.254/latest/meta-data', allowedDomains)
  assert(ssrfMeta.valid === false, 'Test 15c: SSRF AWS/Cloud metadata IP (169.254.169.254) blocked')

  // SSRF Attempt D: Unauthorized external domain
  const ssrfForeign = await validateUrlSafety('https://attacker-site.com/exploit.md', allowedDomains)
  assert(ssrfForeign.valid === false, 'Test 15d: Unapproved foreign domain blocked by whitelist')

  // SSRF Attempt E: Valid approved URL
  const validUrl = await validateUrlSafety('https://docs.python.org/3/library/bisect.html', allowedDomains)
  assert(validUrl.valid === true, 'Test 15e: Approved domain and public IP permitted')

  // --------------------------------------------------------------------------
  // TEST 3: Text Cleaning & AST Normalization (Criteria 5)
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing Text Cleaning & AST Normalization ---')

  const dirtyText = `---
title: Sample Frontmatter
author: Test
---
<script>alert("exploit");</script>
<nav><a href="/home">Home</a></nav>
# Arrays and Two-Pointer Mechanics

Two-pointer mechanics allow linear $O(n)$ scanning across ordered arrays.
<div onclick="evil()">Click Me</div>
<!-- HTML Comment to strip -->

\`\`\`python
def two_sum(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        curr = arr[left] + arr[right]
        if curr == target:
            return (left, right)
        elif curr < target:
            left += 1
        else:
            right -= 1
\`\`\`
`
  const cleaned = cleanDocumentContent(dirtyText, 'markdown')
  assert(!cleaned.cleanedText.includes('alert('), 'Test 5a: Embedded <script> stripped')
  assert(!cleaned.cleanedText.includes('onclick'), 'Test 5b: Inline onclick handler stripped')
  assert(!cleaned.cleanedText.includes('Sample Frontmatter'), 'Test 5c: YAML frontmatter stripped')
  assert(cleaned.cleanedText.includes('def two_sum'), 'Test 5d: Python code block intact')
  assert(cleaned.contentHash && cleaned.contentHash.length === 64, 'Test 5e: SHA-256 content hash computed')

  // --------------------------------------------------------------------------
  // TEST 4: Semantic Chunking & Code Preservation (Criteria 6, 7)
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Testing Semantic Chunking & Provenance ---')

  const chunks = chunkDocument({
    docId: 'doc_nist_two_pointer',
    sourceId: 'nist-dads',
    sourceSnapshotHash: cleaned.contentHash,
    cleanedText: cleaned.cleanedText,
    roleTags: ['software-engineer'],
    topicTags: ['swe-top-1', 'arrays-and-two-pointers'],
    difficultyTier: 'beginner',
    documentVersion: '1.0',
  })

  assert(chunks.length >= 1, 'Test 6a: Chunks successfully generated')
  assert(chunks[0].chunkId.startsWith('doc_nist_two_pointer_chk_'), 'Test 7a: Chunk ID preserves document prefix')
  assert(chunks[0].sourceId === 'nist-dads', 'Test 7b: Chunk preserves source provenance')
  assert(chunks[0].roleTags.includes('software-engineer'), 'Test 6b: Correct role tagging')
  assert(chunks[0].topicTags.includes('swe-top-1'), 'Test 6c: Correct topic tagging')
  assert(chunks[0].content.includes('def two_sum'), 'Test 6d: Code block preserved inside chunk without corruption')

  // --------------------------------------------------------------------------
  // TEST 5: Real Ingestion Execution for the 5 Software Engineer Pilot Topics
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Ingesting Pilot Knowledge for 5 SE Algorithm Topics ---')

  // Register NIST DADS in MongoDB
  await KnowledgeSource.findOneAndUpdate(
    { sourceId: validNistSource.sourceId },
    validNistSource,
    { upsert: true, new: true },
  )

  // Register Python Stdlib in MongoDB
  const validPythonSource = {
    sourceId: 'python-stdlib-ds',
    name: 'Python Standard Library Data Structures Documentation',
    owner: 'Python Software Foundation',
    baseUrl: 'https://docs.python.org/3/library/',
    category: 'official_docs',
    authorityTier: 1,
    licence: {
      spdxId: 'PSF-2.0',
      name: 'Python Software Foundation License Version 2',
      version: '2.0',
      commercialUsePermitted: true,
      attributionRequired: true,
      attributionText: 'Copyright © 2001-2024 Python Software Foundation',
      storagePermitted: true,
      indexingPermitted: true,
      quotingPermitted: true,
      maxQuoteLengthCharacters: 1500,
    },
    ingestionMethod: 'static_dump',
    allowedDomains: ['docs.python.org'],
    status: 'active',
  }

  await KnowledgeSource.findOneAndUpdate(
    { sourceId: validPythonSource.sourceId },
    validPythonSource,
    { upsert: true, new: true },
  )

  // Curated NIST DADS documents for the 5 Pilot Topics (all URLs match xlinux.nist.gov allowlist)
  const pilotDocuments = [
    {
      title: 'Arrays and Two-Pointer Scanning Mechanics',
      url: 'https://xlinux.nist.gov/dads/HTML/twoPointer.html',
      rawContent: `# Arrays and Two-Pointer Mechanics

An array is a linear data structure composed of contiguous memory cells where elements are accessed via constant-time O(1) index calculation.

## Two-Pointer Technique
The two-pointer technique uses two integer indices to traverse an array simultaneously:
1. Opposite ends (Left and Right pointers) converging toward the center: used in sorted array two-sum, palindrome verification, and Dutch National Flag partition.
2. Fast and Slow pointers moving in the same direction: used in in-place deduplication and sliding window subarray problems.

\`\`\`python
def remove_duplicates(nums):
    if not nums:
        return 0
    slow = 0
    for fast in range(1, len(nums)):
        if nums[fast] != nums[slow]:
            slow += 1
            nums[slow] = nums[fast]
    return slow + 1
\`\`\`

## Complexity Invariants
Two-pointer mechanics reduce brute-force O(n²) quadratic search space down to O(n) linear time by eliminating redundant sub-state evaluations while maintaining O(1) auxiliary space.`,
      roleTags: ['software-engineer'],
      topicTags: ['swe-top-1', 'arrays-and-two-pointers'],
      difficultyTier: 'beginner',
      sectionHierarchy: ['Data Structures', 'Arrays', 'Two Pointers'],
    },
    {
      title: 'Binary Search Mechanics and Interval Bisection',
      url: 'https://xlinux.nist.gov/dads/HTML/binarySearch.html',
      rawContent: `# Binary Search and Interval Partitioning

Binary search locates the target value in a monotonically sorted sequence by repeatedly bisecting the search space in O(log n) time.

## Lower and Upper Bound Invariants
- Lower Bound: Finds the first index i where element >= target.
- Upper Bound: Finds the first index i where element > target.

\`\`\`python
def binary_search_lower_bound(arr, target):
    low, high = 0, len(arr)
    while low < high:
        mid = (low + high) // 2
        if arr[mid] < target:
            low = mid + 1
        else:
            high = mid
    return low
\`\`\`

## Interval Merging Mechanics
When querying or inserting intervals [start, end], sorting intervals by starting boundaries allows linear verification of overlap invariants: Interval A [s1, e1] and Interval B [s2, e2] overlap if and only if s2 <= e1.`,
      roleTags: ['software-engineer'],
      topicTags: ['swe-top-4', 'binary-search-and-intervals'],
      difficultyTier: 'beginner',
      sectionHierarchy: ['Algorithms', 'Searching', 'Binary Search'],
    },
    {
      title: 'Binary Search Trees, Invariants and Balancing',
      url: 'https://xlinux.nist.gov/dads/HTML/binarySearchTree.html',
      rawContent: `# Binary Search Trees and Balancing Invariants

A Binary Search Tree (BST) is a hierarchical node-based data structure where each node satisfies the BST ordering property.

## The BST Invariant
For any node N:
- Every key in N's left subtree is strictly less than N.key.
- Every key in N's right subtree is strictly greater than N.key.

Validating an arbitrary binary tree requires bounding each node recursively within a valid constraint window (min_val < node.val < max_val), rather than simply comparing immediate parent-child nodes.

\`\`\`python
def is_valid_bst(root, min_val=float('-inf'), max_val=float('inf')):
    if not root:
        return True
    if not (min_val < root.val < max_val):
        return False
    return (is_valid_bst(root.left, min_val, root.val) and
            is_valid_bst(root.right, root.val, max_val))
\`\`\`

## Tree Balancing & Height Invariants
Unbalanced BSTs degenerate into O(n) linked lists in worst-case insertion order. Self-balancing architectures (AVL, Red-Black) maintain height h = O(log n) via tree rotations.`,
      roleTags: ['software-engineer'],
      topicTags: ['swe-top-7', 'binary-search-trees'],
      difficultyTier: 'intermediate',
      sectionHierarchy: ['Data Structures', 'Trees', 'BST'],
    },
    {
      title: 'Graph Traversals: BFS, DFS and Cycle Detection',
      url: 'https://xlinux.nist.gov/dads/HTML/cycle.html',
      rawContent: `# Graph Traversals: BFS, DFS and Cycle Detection

Graphs represent entities as vertices and relationships as edges. In campus technical interviews, graph mechanics center on traversal completeness and cycle detection.

## Breadth-First Search (BFS)
BFS explores vertices level by level using a FIFO queue. BFS guarantees the shortest path in unweighted graphs in O(V + E) time.

## Depth-First Search (DFS) and Cycle Invariants
In a directed graph, a cycle exists if and only if a DFS traversal encounters a back-edge pointing to an ancestor currently on the active recursion call stack.

\`\`\`python
def has_cycle_directed(graph, num_nodes):
    # 0 = unvisited, 1 = visiting (in stack), 2 = visited
    state = [0] * num_nodes
    
    def dfs(node):
        state[node] = 1 # Mark active
        for neighbor in graph[node]:
            if state[neighbor] == 1:
                return True # Cycle detected
            if state[neighbor] == 0 and dfs(neighbor):
                return True
        state[node] = 2 # Completed
        return False

    return any(dfs(i) for i in range(num_nodes) if state[i] == 0)
\`\`\`

Undirected graphs identify cycles when an adjacent visited node is not the immediate parent in the DFS tree.`,
      roleTags: ['software-engineer'],
      topicTags: ['swe-top-9', 'bfs-dfs-cycle-detection'],
      difficultyTier: 'intermediate',
      sectionHierarchy: ['Algorithms', 'Graphs', 'Cycle Detection'],
    },
    {
      title: 'Dynamic Programming: Optimal Substructure and Memoization',
      url: 'https://xlinux.nist.gov/dads/HTML/dynamicProgramming.html',
      rawContent: `# Dynamic Programming Foundations

Dynamic Programming (DP) solves complex optimization problems by breaking them down into overlapping subproblems governed by the Principle of Optimality.

## Core DP Prerequisites
1. Optimal Substructure: An optimal solution to the problem contains optimal solutions to subproblems.
2. Overlapping Subproblems: A recursive algorithm revisits the same subproblems repeatedly rather than generating new subproblems.

## Top-Down Memoization vs Bottom-Up Tabulation
- Top-Down: Solves recursively and stores computed results in a hash table or array cache.
- Bottom-Up: Solves base cases first, iteratively filling a table in topological dependency order.

\`\`\`python
# 0/1 Knapsack State Recurrence:
# dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]])
def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [0] * (capacity + 1)
    for i in range(n):
        for w in range(capacity, weights[i] - 1, -1):
            dp[w] = max(dp[w], values[i] + dp[w - weights[i]])
    return dp[capacity]
\`\`\`

Space optimization reduces 2D tables into 1D rolling arrays when state transitions depend solely on the previous row.`,
      roleTags: ['software-engineer'],
      topicTags: ['swe-top-13', 'dynamic-programming'],
      difficultyTier: 'advanced',
      sectionHierarchy: ['Algorithms', 'Dynamic Programming', 'Foundations'],
    },
  ]

  // Execute ingestion job for NIST DADS
  const ingestResult = await executeIngestionJob({
    sourceId: 'nist-dads',
    initiatedBy: 'admin_test_uid',
    documents: pilotDocuments,
  })

  assert(ingestResult.success === true, 'Test 4: Ingestion job completed successfully')
  assert(ingestResult.documentsProcessed === 5, 'Test 4b: All 5 pilot documents processed')
  assert(ingestResult.chunksCreated >= 5, 'Test 4c: Chunks created for all 5 topics')
  assert(ingestResult.snapshotHash && ingestResult.snapshotHash.length === 64, 'Test 4d: Job snapshot hash computed')

  // Verify chunks in database for each of the 5 topics
  const topicsToVerify = [
    { tag: 'swe-top-1', name: 'Arrays & Two Pointers' },
    { tag: 'swe-top-4', name: 'Binary Search & Intervals' },
    { tag: 'swe-top-7', name: 'BST & Invariants' },
    { tag: 'swe-top-9', name: 'BFS/DFS & Cycle Detection' },
    { tag: 'swe-top-13', name: 'Dynamic Programming' },
  ]

  for (const t of topicsToVerify) {
    const topicChunks = await ContentChunk.find({ topicTags: t.tag })
    assert(
      topicChunks.length > 0,
      `Test 6 (${t.tag}): Chunks verified in DB for "${t.name}" (count: ${topicChunks.length})`,
    )
  }

  // --------------------------------------------------------------------------
  // TEST 6: Idempotency & Duplicate Skipping (Criteria 8, 9)
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Testing Idempotency & Unchanged Content Skipping ---')

  const initialTotalChunks = await ContentChunk.countDocuments()

  // Run ingestion again with identical content
  const repeatJob = await executeIngestionJob({
    sourceId: 'nist-dads',
    initiatedBy: 'admin_test_uid',
    documents: pilotDocuments,
  })

  const postRepeatChunks = await ContentChunk.countDocuments()
  assert(
    repeatJob.chunksCreated === 0,
    'Test 8: Unchanged documents skipped; 0 duplicate chunks created on re-run',
  )
  assert(
    initialTotalChunks === postRepeatChunks,
    'Test 9: Total chunk count unchanged across idempotent re-run',
  )

  // --------------------------------------------------------------------------
  // TEST 7: Snapshot Preservation on Failure (Criteria 11)
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Testing Failure Handling & Snapshot Preservation ---')

  // Attempting an ingestion with an unapproved/malicious source URL
  const maliciousDoc = [
    {
      title: 'Malicious Ingestion Attempt',
      url: 'http://169.254.169.254/secret', // AWS metadata SSRF
      rawContent: 'Dangerous content',
      roleTags: ['software-engineer'],
      topicTags: ['swe-top-1'],
    },
  ]

  const failedJob = await executeIngestionJob({
    sourceId: 'nist-dads',
    initiatedBy: 'admin_test_uid',
    documents: maliciousDoc,
  })

  // The job should record the error without deleting existing working chunks
  const chunksAfterFailedJob = await ContentChunk.countDocuments()
  assert(
    chunksAfterFailedJob === initialTotalChunks,
    'Test 11: Previous successful snapshot and chunks preserved after ingestion failure',
  )
  assert(
    failedJob.errorCount > 0,
    'Test 12: Job error log captured SSRF rejection without crashing',
  )

  // --------------------------------------------------------------------------
  // TEST 8: Existing Database & Student Record Preservation (Criteria 17)
  // --------------------------------------------------------------------------
  console.log('\n--- 8. Verifying Existing Student Records Preservation ---')

  const finalStudentCount = await StudentProfile.countDocuments()
  assert(
    finalStudentCount === initialStudentCount && finalStudentCount === 2,
    'Test 17b: Student records completely preserved (count: 2, exactly unchanged)',
  )

  // Disconnect
  await mongoose.disconnect()

  console.log('\n=================================================================')
  console.log(`   TEST SUMMARY: ${testResults.passed.length} PASSED | ${testResults.failed.length} FAILED`)
  console.log('=================================================================\n')

  if (testResults.failed.length > 0) {
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err)
  process.exit(1)
})
