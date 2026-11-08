import mongoose from 'mongoose'
import { executeIngestionJob } from '../services/ingestion/ingestionService.js'
import { IngestedDocument } from '../models/IngestedDocument.js'
import { ContentChunk } from '../models/ContentChunk.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { GeneratedLesson } from '../models/GeneratedLesson.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/careerlaunch'

const batch2aDocuments = [
  {
    title: 'Heaps & Priority Queues',
    url: 'https://xlinux.nist.gov/dads/HTML/binaryheap.html',
    contentOrigin: 'hybrid_pedagogical',
    canonicalSource: {
      name: 'NIST DADS: binary heap',
      url: 'https://xlinux.nist.gov/dads/HTML/binaryheap.html',
      passage:
        'A complete binary tree where every node is less than or equal to its children (in a min heap) or greater than or equal to its children (in a max heap). A binary heap can be efficiently stored in an array with the root at index 0, left child at 2i + 1, right child at 2i + 2, and parent at floor((i - 1) / 2). Building a heap takes O(n) time using bottom-up heapify.',
    },
    groundingPassage:
      'A complete binary tree where every node is less than or equal to its children (in a min heap) or greater than or equal to its children (in a max heap). A binary heap can be efficiently stored in an array with the root at index 0, left child at 2i + 1, right child at 2i + 2, and parent at floor((i - 1) / 2). Building a heap takes O(n) time using bottom-up heapify.',
    crossReferences: [
      {
        name: 'NIST DADS: priority queue',
        url: 'https://xlinux.nist.gov/dads/HTML/priorityque.html',
      },
      {
        name: 'NIST DADS: complete binary tree',
        url: 'https://xlinux.nist.gov/dads/HTML/completeBinaryTree.html',
      },
      {
        name: 'NIST DADS: heapify',
        url: 'https://xlinux.nist.gov/dads/HTML/heapify.html',
      },
    ],
    codeExemplar: {
      author: 'CareerLaunch Engineering',
      language: 'python',
      code: `import heapq

def top_k_frequent(nums, k):
    """Finds top k frequent elements using a min-heap in O(N log K) time and O(N) space."""
    frequency_map = {}
    for num in nums:
        frequency_map[num] = frequency_map.get(num, 0) + 1

    min_heap = []
    for num, count in frequency_map.items():
        heapq.heappush(min_heap, (count, num))
        if len(min_heap) > k:
            heapq.heappop(min_heap)

    return [num for count, num in min_heap]

class MedianFinder:
    """Tracks continuous median from data stream using two balancing heaps in O(log N) per insert."""
    def __init__(self):
        self.small = []  # max-heap (invert values)
        self.large = []  # min-heap

    def add_num(self, num):
        heapq.heappush(self.small, -num)
        if self.small and self.large and (-self.small[0] > self.large[0]):
            val = -heapq.heappop(self.small)
            heapq.heappush(self.large, val)
        if len(self.small) > len(self.large) + 1:
            val = -heapq.heappop(self.small)
            heapq.heappush(self.large, val)
        elif len(self.large) > len(self.small):
            val = heapq.heappop(self.large)
            heapq.heappush(self.small, -val)

    def find_median(self):
        if len(self.small) > len(self.large):
            return float(-self.small[0])
        return (-self.small[0] + self.large[0]) / 2.0`,
      notes: 'CareerLaunch-authored Top-K frequent elements and Dual-Heap Median Stream Tracker. Not from NIST DADS.',
    },
    rawContent: `# Heaps & Priority Queues

### Canonical Definition (NIST DADS)
A binary heap is a complete binary tree where every node satisfies the heap-order property: in a min heap, each node's key is less than or equal to its children's keys; in a max heap, each node's key is greater than or equal to its children's keys. Because the tree is complete, it is compactly mapped to a 0-indexed array where index 0 is the root, index 2i + 1 is the left child, index 2i + 2 is the right child, and index floor((i - 1) / 2) is the parent.

### Heap Mechanics & Asymptotic Complexities
- Insertion (Sift-Up): Appends element at the end of the array and sifts it up along the ancestor path in O(log n) time.
- Deletion / Extract-Min (Sift-Down): Replaces root with the last leaf, decrements size, and sifts the new root down to its proper position in O(log n) time.
- Heapify (Build-Heap): Converts an arbitrary array of n elements into a valid heap in linear O(n) time via bottom-up sift-downs.
- Priority Queue Interface: Abstracts highest/lowest priority retrieval without requiring a fully sorted array.

### CareerLaunch Pedagogical Guide: Top-K Pattern & Dual-Heap Median Tracking
Priority queues power classical interview patterns:
1. Top-K Elements: Maintaining a size-K min-heap bounds auxiliary memory to O(K) and execution time to O(N log K), avoiding full O(N log N) sorting.
2. Dual Balancing Heaps: Splitting data into lower-half (max-heap) and upper-half (min-heap) enables O(1) continuous median lookups with O(log N) stream insertions.

\`\`\`python
# Author: CareerLaunch Engineering (Pedagogical Exemplar)
import heapq

def top_k_frequent(nums, k):
    """Finds top k frequent elements using a min-heap in O(N log K) time and O(N) space."""
    frequency_map = {}
    for num in nums:
        frequency_map[num] = frequency_map.get(num, 0) + 1

    min_heap = []
    for num, count in frequency_map.items():
        heapq.heappush(min_heap, (count, num))
        if len(min_heap) > k:
            heapq.heappop(min_heap)

    return [num for count, num in min_heap]

class MedianFinder:
    """Tracks continuous median from data stream using two balancing heaps in O(log N) per insert."""
    def __init__(self):
        self.small = []  # max-heap (invert values)
        self.large = []  # min-heap

    def add_num(self, num):
        heapq.heappush(self.small, -num)
        if self.small and self.large and (-self.small[0] > self.large[0]):
            val = -heapq.heappop(self.small)
            heapq.heappush(self.large, val)
        if len(self.small) > len(self.large) + 1:
            val = -heapq.heappop(self.small)
            heapq.heappush(self.large, val)
        elif len(self.large) > len(self.small):
            val = heapq.heappop(self.large)
            heapq.heappush(self.small, -val)

    def find_median(self):
        if len(self.small) > len(self.large):
            return float(-self.small[0])
        return (-self.small[0] + self.large[0]) / 2.0
\`\`\`
`,
    roleTags: ['software-engineer'],
    topicTags: ['se-top-8', 'heaps-and-priority-queues'],
    difficultyTier: 'intermediate',
    sectionHierarchy: ['Data Structures', 'Non-Linear Data Structures', 'Heaps and Priority Queues'],
  },
  {
    title: 'Topological Sort & Shortest Paths',
    url: 'https://xlinux.nist.gov/dads/HTML/topologicalOrder.html',
    contentOrigin: 'hybrid_pedagogical',
    canonicalSource: {
      name: 'NIST DADS: topological sort',
      url: 'https://xlinux.nist.gov/dads/HTML/topologicalOrder.html',
      passage:
        'An ordering of vertices in a directed acyclic graph (DAG) such that for every directed edge from vertex u to vertex v, u appears before v in the ordering. Topological sort exists if and only if the directed graph contains no directed cycles. Dijkstra\'s algorithm finds the shortest path from a single source vertex to all other vertices in a directed graph with non-negative edge weights using a priority queue in O((V + E) log V) time.',
    },
    groundingPassage:
      'An ordering of vertices in a directed acyclic graph (DAG) such that for every directed edge from vertex u to vertex v, u appears before v in the ordering. Topological sort exists if and only if the directed graph contains no directed cycles. Dijkstra\'s algorithm finds the shortest path from a single source vertex to all other vertices in a directed graph with non-negative edge weights using a priority queue in O((V + E) log V) time.',
    crossReferences: [
      {
        name: "NIST DADS: Dijkstra's algorithm",
        url: 'https://xlinux.nist.gov/dads/HTML/dijkstraalgo.html',
      },
      {
        name: 'NIST DADS: Bellman-Ford algorithm',
        url: 'https://xlinux.nist.gov/dads/HTML/bellmanford.html',
      },
    ],
    codeExemplar: {
      author: 'CareerLaunch Engineering',
      language: 'python',
      code: `from collections import deque
import heapq

def topological_sort_kahn(num_nodes, edges):
    """Kahn's algorithm using in-degree array and queue in O(V + E) time."""
    adj = {i: [] for i in range(num_nodes)}
    in_degree = [0] * num_nodes
    for u, v in edges:
        adj[u].append(v)
        in_degree[v] += 1

    queue = deque([i for i in range(num_nodes) if in_degree[i] == 0])
    order = []

    while queue:
        curr = queue.popleft()
        order.append(curr)
        for neighbor in adj[curr]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(order) != num_nodes:
        return []  # Cycle detected, no topological ordering exists
    return order

def dijkstra_shortest_path(graph, start, num_nodes):
    """Dijkstra's single-source shortest path algorithm using min-heap in O((V + E) log V) time."""
    distances = {i: float('inf') for i in range(num_nodes)}
    distances[start] = 0
    pq = [(0, start)]  # (dist, node)

    while pq:
        curr_dist, u = heapq.heappop(pq)
        if curr_dist > distances[u]:
            continue

        for v, weight in graph.get(u, []):
            new_dist = curr_dist + weight
            if new_dist < distances[v]:
                distances[v] = new_dist
                heapq.heappush(pq, (new_dist, v))

    return distances`,
      notes: 'CareerLaunch-authored Kahn\'s topological sort and Dijkstra\'s shortest path exemplar. Not from NIST DADS.',
    },
    rawContent: `# Topological Sort & Shortest Paths

### Canonical Definition (NIST DADS)
A topological sort of a directed acyclic graph (DAG) is a linear ordering of its vertices such that for every directed edge (u, v), vertex u precedes vertex v in the ordering. A graph has a topological order if and only if it is acyclic. Dijkstra's algorithm computes single-source shortest paths on directed graphs with non-negative edge weights using greedy vertex relaxation and a priority queue in O((V + E) log V) time.

### Core Algorithmic Invariants
1. Kahn's Algorithm (BFS In-Degree):
   - Computes in-degrees for all vertices.
   - Enqueues vertices with in-degree 0 (unblocked dependencies).
   - Decrements neighbor in-degrees on dequeuing; enqueues new 0-degree vertices.
   - If total visited vertices < V, a directed cycle exists.
2. Dijkstra's Algorithm (Greedy Relaxation):
   - Greedily selects the unvisited vertex with the minimum tentative distance.
   - Relaxes outgoing edges: if dist[u] + weight(u, v) < dist[v], update dist[v] and push to min-heap.
   - Failure condition: Dijkstra fails on negative-weight edges because the greedy assumption (visited vertices have finalized shortest paths) is violated.
3. Bellman-Ford: Handles negative edge weights by relaxing all E edges V - 1 times in O(V * E) time, detecting negative cycles on an optional V-th pass.

### CareerLaunch Pedagogical Guide: Dependency Scheduling & Shortest Paths
Topological sorting resolves real-world build systems (Webpack, Make), course prerequisites, and package manager dependency trees. Dijkstra's algorithm is foundational for network routing and geographic GPS pathfinding.

\`\`\`python
# Author: CareerLaunch Engineering (Pedagogical Exemplar)
from collections import deque
import heapq

def topological_sort_kahn(num_nodes, edges):
    """Kahn's algorithm using in-degree array and queue in O(V + E) time."""
    adj = {i: [] for i in range(num_nodes)}
    in_degree = [0] * num_nodes
    for u, v in edges:
        adj[u].append(v)
        in_degree[v] += 1

    queue = deque([i for i in range(num_nodes) if in_degree[i] == 0])
    order = []

    while queue:
        curr = queue.popleft()
        order.append(curr)
        for neighbor in adj[curr]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(order) != num_nodes:
        return []  # Cycle detected, no topological ordering exists
    return order

def dijkstra_shortest_path(graph, start, num_nodes):
    """Dijkstra's single-source shortest path algorithm using min-heap in O((V + E) log V) time."""
    distances = {i: float('inf') for i in range(num_nodes)}
    distances[start] = 0
    pq = [(0, start)]  # (dist, node)

    while pq:
        curr_dist, u = heapq.heappop(pq)
        if curr_dist > distances[u]:
            continue

        for v, weight in graph.get(u, []):
            new_dist = curr_dist + weight
            if new_dist < distances[v]:
                distances[v] = new_dist
                heapq.heappush(pq, (new_dist, v))

    return distances
\`\`\`
`,
    roleTags: ['software-engineer'],
    topicTags: ['se-top-10', 'topological-sort-shortest-paths'],
    difficultyTier: 'intermediate',
    sectionHierarchy: ['Algorithms', 'Graph Algorithms', 'Topological Sort and Shortest Paths'],
  },
  {
    title: 'Recursion & Backtracking Strategies',
    url: 'https://xlinux.nist.gov/dads/HTML/recursive.html',
    contentOrigin: 'hybrid_pedagogical',
    canonicalSource: {
      name: 'NIST DADS: recursive',
      url: 'https://xlinux.nist.gov/dads/HTML/recursive.html',
      passage:
        'An algorithm or procedure that calls itself directly or indirectly to solve smaller instances of the same problem until reaching a base condition that terminates the recursion without further calls. In backtracking algorithms, a candidate solution is built incrementally, abandoning a candidate (backtracking) as soon as it is determined that the candidate cannot possibly lead to a valid solution.',
    },
    groundingPassage:
      'An algorithm or procedure that calls itself directly or indirectly to solve smaller instances of the same problem until reaching a base condition that terminates the recursion without further calls. In backtracking algorithms, a candidate solution is built incrementally, abandoning a candidate (backtracking) as soon as it is determined that the candidate cannot possibly lead to a valid solution.',
    crossReferences: [
      {
        name: 'NIST DADS: recursion tree',
        url: 'https://xlinux.nist.gov/dads/HTML/recursionTree.html',
      },
      {
        name: 'NIST DADS: tail recursion',
        url: 'https://xlinux.nist.gov/dads/HTML/tailRecursion.html',
      },
    ],
    codeExemplar: {
      author: 'CareerLaunch Engineering',
      language: 'python',
      code: `def solve_n_queens(n):
    """N-Queens solver using coordinate hashing for O(1) conflict validation."""
    solutions = []
    cols = set()
    pos_diags = set()  # (r + c)
    neg_diags = set()  # (r - c)
    board = [['.'] * n for _ in range(n)]

    def backtrack(r):
        if r == n:
            solutions.append([''.join(row) for row in board])
            return

        for c in range(n):
            if c in cols or (r + c) in pos_diags or (r - c) in neg_diags:
                continue

            cols.add(c)
            pos_diags.add(r + c)
            neg_diags.add(r - c)
            board[r][c] = 'Q'

            backtrack(r + 1)

            cols.remove(c)
            pos_diags.remove(r + c)
            neg_diags.remove(r - c)
            board[r][c] = '.'

    backtrack(0)
    return solutions`,
      notes: 'CareerLaunch-authored canonical choose-explore-unchoose backtracking and N-Queens exemplar. Not from NIST DADS.',
    },
    rawContent: `# Recursion & Backtracking Strategies

### Canonical Definition (NIST DADS)
A recursive algorithm solves a computational problem by reducing it to smaller subproblems of the same type, terminating at explicit base cases that do not call the function. Backtracking is a systematic state-space search algorithm that incrementally builds candidate solutions and abandons (prunes) a candidate path as soon as constraints are violated.

### Anatomy of Backtracking & State-Space Trees
1. The Canonical Template:
   - Base Case: Have we reached a complete valid candidate? If yes, record solution.
   - Candidates Loop: Iterate through possible decisions for the current step.
   - Choose: Apply decision to active path and update constraint tracking data structures.
   - Explore: Recurse to next step (depth d + 1).
   - Unchoose (Backtrack): Revert decision from active path and constraint tracking.
2. Coordinate Hashing & Constant-Time Pruning:
   - In N-Queens, two queens conflict on diagonals if row + col is identical (positive diagonal) or row - col is identical (negative diagonal).
   - Using hash sets for column, positive diagonal, and negative diagonal enables O(1) conflict checking per placement candidate.
3. Call Stack Dynamics:
   - Each recursive call creates a new stack frame (activation record) consuming O(H) auxiliary memory where H is recursion depth.
   - Tail recursion occurs when the recursive call is the final statement, allowing compiler frame reuse where supported.

### CareerLaunch Pedagogical Guide: State-Space Search & Constraint Satisfaction
Backtracking is required for NP-complete search challenges including Sudoku solving, subset generation, permutations with duplicates, and the Knapsack problem when exact combinatorial enumeration is required.

\`\`\`python
# Author: CareerLaunch Engineering (Pedagogical Exemplar)
def solve_n_queens(n):
    """N-Queens solver using coordinate hashing for O(1) conflict validation."""
    solutions = []
    cols = set()
    pos_diags = set()  # (r + c)
    neg_diags = set()  # (r - c)
    board = [['.'] * n for _ in range(n)]

    def backtrack(r):
        if r == n:
            solutions.append([''.join(row) for row in board])
            return

        for c in range(n):
            if c in cols or (r + c) in pos_diags or (r - c) in neg_diags:
                continue

            # Choose
            cols.add(c)
            pos_diags.add(r + c)
            neg_diags.add(r - c)
            board[r][c] = 'Q'

            # Explore
            backtrack(r + 1)

            # Unchoose
            cols.remove(c)
            pos_diags.remove(r + c)
            neg_diags.remove(r - c)
            board[r][c] = '.'

    backtrack(0)
    return solutions
\`\`\`
`,
    roleTags: ['software-engineer'],
    topicTags: ['se-top-11', 'recursion-and-backtracking'],
    difficultyTier: 'intermediate',
    sectionHierarchy: ['Algorithms', 'Algorithmic Paradigms', 'Recursion and Backtracking'],
  },
]

async function runBatch2aIngestion() {
  console.log('\n=================================================================')
  console.log('   CAREERLAUNCH PHASE 5.1: BATCH 2A SOURCE INGESTION PIPELINE    ')
  console.log('=================================================================\n')

  await mongoose.connect(MONGODB_URI)
  console.log(`Connected to MongoDB at: ${MONGODB_URI}\n`)

  // Baseline verification
  const initialStudentCount = await StudentProfile.countDocuments()
  const initialLessonCount = await GeneratedLesson.countDocuments()
  const initialDocCount = await IngestedDocument.countDocuments()
  const initialChunkCount = await ContentChunk.countDocuments()

  console.log(`Baseline Verification:`)
  console.log(`  - Student Profiles  : ${initialStudentCount} (expected: 2)`)
  console.log(`  - Generated Lessons : ${initialLessonCount} (expected: 9)`)
  console.log(`  - Ingested Documents: ${initialDocCount} (expected: 9)`)
  console.log(`  - Content Chunks    : ${initialChunkCount} (expected: 11)\n`)

  if (initialStudentCount !== 2 || initialLessonCount !== 9) {
    throw new Error('Baseline integrity check failed! Aborting ingestion.')
  }

  // Execute ingestion job
  console.log('Executing ingestion job for 3 Batch 2A documents...')
  const result = await executeIngestionJob({
    sourceId: 'nist-dads',
    initiatedBy: 'phase_5_1_batch_2a_admin',
    documents: batch2aDocuments,
  })

  console.log('\nIngestion Job Result:')
  console.log(`  - Job ID              : ${result.jobId}`)
  console.log(`  - Status              : ${result.status}`)
  console.log(`  - Documents Processed : ${result.documentsProcessed}`)
  console.log(`  - Chunks Created      : ${result.chunksCreated}`)
  console.log(`  - Snapshot Hash       : ${result.snapshotHash}`)

  // Post-ingestion verification
  const finalDocCount = await IngestedDocument.countDocuments()
  const finalChunkCount = await ContentChunk.countDocuments()
  const finalLessonCount = await GeneratedLesson.countDocuments()
  const finalStudentCount = await StudentProfile.countDocuments()

  console.log('\nPost-Ingestion Verification:')
  console.log(`  - Total Ingested Docs : ${finalDocCount} (before: ${initialDocCount}, delta: +${finalDocCount - initialDocCount})`)
  console.log(`  - Total Content Chunks: ${finalChunkCount} (before: ${initialChunkCount}, delta: +${finalChunkCount - initialChunkCount})`)
  console.log(`  - Generated Lessons   : ${finalLessonCount} (unchanged: ${finalLessonCount === initialLessonCount})`)
  console.log(`  - Student Profiles    : ${finalStudentCount} (unchanged: ${finalStudentCount === initialStudentCount})`)

  // Check chunks for each Batch 2A topic
  const batch2aTopicIds = ['se-top-8', 'se-top-10', 'se-top-11']
  for (const tid of batch2aTopicIds) {
    const chunk = await ContentChunk.findOne({ topicTags: tid })
    if (!chunk) {
      throw new Error(`Failed to verify chunk for topic: ${tid}`)
    }
    console.log(`  ✓ Topic ${tid}: Chunk ${chunk.chunkId} verified (origin: ${chunk.contentOrigin}, exemplar author: ${chunk.codeExemplar.author})`)
  }

  // Verify se-top-1 was NOT ingested
  const seTop1Chunk = await ContentChunk.findOne({ topicTags: 'se-top-1' })
  if (seTop1Chunk) {
    throw new Error('FATAL: se-top-1 chunk was ingested! Memory topic restriction violated.')
  }
  console.log('  ✓ Verified se-top-1 was NOT ingested (memory topic restriction honored).')

  console.log('\n=================================================================')
  console.log('   BATCH 2A SOURCE INGESTION COMPLETED SUCCESSFULLY!            ')
  console.log('=================================================================\n')

  await mongoose.disconnect()
}

runBatch2aIngestion().catch((err) => {
  console.error('\n✗ Ingestion error:', err)
  process.exit(1)
})
