import mongoose from 'mongoose'
import { executeIngestionJob } from '../services/ingestion/ingestionService.js'
import { IngestedDocument } from '../models/IngestedDocument.js'
import { ContentChunk } from '../models/ContentChunk.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { GeneratedLesson } from '../models/GeneratedLesson.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/careerlaunch'

const batch1Documents = [
  {
    title: 'Asymptotic Analysis & Big-O Notation',
    url: 'https://xlinux.nist.gov/dads/HTML/bigOnotation.html',
    contentOrigin: 'hybrid_pedagogical',
    canonicalSource: {
      name: 'NIST DADS: big-O notation',
      url: 'https://xlinux.nist.gov/dads/HTML/bigOnotation.html',
      passage:
        'A theoretical measure of the execution of an algorithm, usually the time or memory needed, given the problem size n, which is usually the number of items. Informally, saying some equation f(n) = O(g(n)) means it is less than some constant multiple of g(n). More formally, f(n) = O(g(n)) means there are positive constants c and k, such that 0 <= f(n) <= c * g(n) for all n >= k. The values of c and k must be fixed for the function f and must not depend on n.',
    },
    groundingPassage:
      'A theoretical measure of the execution of an algorithm, usually the time or memory needed, given the problem size n, which is usually the number of items. Informally, saying some equation f(n) = O(g(n)) means it is less than some constant multiple of g(n). More formally, f(n) = O(g(n)) means there are positive constants c and k, such that 0 <= f(n) <= c * g(n) for all n >= k. The values of c and k must be fixed for the function f and must not depend on n.',
    crossReferences: [
      {
        name: 'NIST DADS: capital omega',
        url: 'https://xlinux.nist.gov/dads/HTML/omegaCapital.html',
      },
      {
        name: 'NIST DADS: capital theta',
        url: 'https://xlinux.nist.gov/dads/HTML/thetaCapital.html',
      },
    ],
    codeExemplar: {
      author: 'CareerLaunch Engineering',
      language: 'python',
      code: `class DynamicArray:
    """Demonstrates amortized O(1) append vs worst-case O(N) array resizing."""
    def __init__(self):
        self.capacity = 1
        self.length = 0
        self.data = [None] * self.capacity

    def append(self, val):
        if self.length == self.capacity:
            self._resize(2 * self.capacity)
        self.data[self.length] = val
        self.length += 1

    def _resize(self, new_capacity):
        new_data = [None] * new_capacity
        for i in range(self.length):
            new_data[i] = self.data[i]
        self.data = new_data
        self.capacity = new_capacity`,
      notes: 'CareerLaunch-authored dynamic array amortized O(1) analysis exemplar. Not from NIST DADS.',
    },
    rawContent: `# Asymptotic Analysis & Big-O Notation

### Canonical Definition (NIST DADS)
A theoretical measure of the execution of an algorithm, usually the time or memory needed, given the problem size n, which is usually the number of items. Informally, saying some equation f(n) = O(g(n)) means it is less than some constant multiple of g(n). More formally, f(n) = O(g(n)) means there are positive constants c and k, such that 0 <= f(n) <= c * g(n) for all n >= k. The values of c and k must be fixed for the function f and must not depend on n.

### Asymptotic Bound Classifications
- Upper Bound O(g(n)): Growth rate of f(n) is asymptotically bounded above by c * g(n).
- Lower Bound Omega(g(n)): Growth rate of f(n) is asymptotically bounded below by c * g(n).
- Tight Bound Theta(g(n)): Growth rate of f(n) is bounded both above and below by constants c1 * g(n) and c2 * g(n).
- Complexity Hierarchy: O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n) < O(n!).

### CareerLaunch Pedagogical Guide: Amortized Complexity Analysis
Amortized analysis averages running times across a sequence of operations rather than evaluating single-step worst cases. For example, a dynamic array doubles capacity upon overflow: individual resizing operations take O(N) time copying elements, but amortized over N insertions, each append costs O(1).

\`\`\`python
# Author: CareerLaunch Engineering (Pedagogical Exemplar)
class DynamicArray:
    """Demonstrates amortized O(1) append vs worst-case O(N) array resizing."""
    def __init__(self):
        self.capacity = 1
        self.length = 0
        self.data = [None] * self.capacity

    def append(self, val):
        if self.length == self.capacity:
            self._resize(2 * self.capacity)
        self.data[self.length] = val
        self.length += 1

    def _resize(self, new_capacity):
        new_data = [None] * new_capacity
        for i in range(self.length):
            new_data[i] = self.data[i]
        self.data = new_data
        self.capacity = new_capacity
\`\`\`
`,
    roleTags: ['software-engineer'],
    topicTags: ['se-top-2', 'asymptotic-analysis-big-o'],
    difficultyTier: 'beginner',
    sectionHierarchy: ['Foundations', 'Algorithm Analysis', 'Asymptotic Complexity'],
  },
  {
    title: 'Linked Lists: Singly, Doubly & Circular',
    url: 'https://xlinux.nist.gov/dads/HTML/doublyLinkedList.html',
    contentOrigin: 'hybrid_pedagogical',
    canonicalSource: {
      name: 'NIST DADS: doubly linked list',
      url: 'https://xlinux.nist.gov/dads/HTML/doublyLinkedList.html',
      passage:
        'A data structure in which each element contains pointers to both the next element and previous element in the sequence, allowing traversal in either direction and O(1) insertion or deletion when the node pointer is known.',
    },
    groundingPassage:
      'A data structure in which each element contains pointers to both the next element and previous element in the sequence, allowing traversal in either direction and O(1) insertion or deletion when the node pointer is known.',
    crossReferences: [
      {
        name: 'NIST DADS: circular list',
        url: 'https://xlinux.nist.gov/dads/HTML/circularlist.html',
      },
      {
        name: 'NIST DADS: link',
        url: 'https://xlinux.nist.gov/dads/HTML/link.html',
      },
      {
        name: 'NIST DADS: cycle',
        url: 'https://xlinux.nist.gov/dads/HTML/cycle.html',
      },
    ],
    codeExemplar: {
      author: 'CareerLaunch Engineering',
      language: 'python',
      code: `class ListNode:
    def __init__(self, val=0, next=None, prev=None):
        self.val = val
        self.next = next
        self.prev = prev

def reverse_linked_list(head):
    """In-place iterative reversal of a singly linked list in O(N) time and O(1) space."""
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev

def has_cycle(head):
    """Floyd's Tortoise and Hare cycle detection in O(N) time and O(1) space."""
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False`,
      notes: 'CareerLaunch-authored in-place list reversal and Floyd cycle detection exemplar. Not from NIST DADS.',
    },
    rawContent: `# Linked Lists: Singly, Doubly & Circular

### Canonical Definition (NIST DADS)
A doubly linked list is a data structure in which each element contains pointers to both the next element and previous element in the sequence, allowing traversal in either direction and O(1) insertion or deletion when the node pointer is known. A circular list has the last node's link pointing back to the first node.

### Linked List Topologies & Pointer Invariants
1. Singly Linked List: Unidirectional navigation via single next pointers; insertions/deletions at known nodes take O(1), but predecessor lookup takes O(N).
2. Doubly Linked List: Bidirectional links enable symmetric O(1) removals without re-traversal.
3. Circular Linked List: Tail points to head, eliminating null terminators for round-robin scheduling.
4. Dummy Head Pattern: Sentinel nodes eliminate boundary conditions for head insertions and removals.

### CareerLaunch Pedagogical Guide: In-Place Reversal and Cycle Detection
In-place iterative reversal maintains three pointers (prev, curr, nxt) mutating pointers with O(1) auxiliary space. Floyd's Tortoise and Hare cycle finding algorithm traverses with two pointers at speeds 1x and 2x; if a cycle exists, fast meets slow in O(N) steps.

\`\`\`python
# Author: CareerLaunch Engineering (Pedagogical Exemplar)
class ListNode:
    def __init__(self, val=0, next=None, prev=None):
        self.val = val
        self.next = next
        self.prev = prev

def reverse_linked_list(head):
    """In-place iterative reversal of a singly linked list in O(N) time and O(1) space."""
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev

def has_cycle(head):
    """Floyd's Tortoise and Hare cycle detection in O(N) time and O(1) space."""
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False
\`\`\`
`,
    roleTags: ['software-engineer'],
    topicTags: ['se-top-4', 'linked-lists-singly-doubly-circular'],
    difficultyTier: 'beginner',
    sectionHierarchy: ['Data Structures', 'Linear Data Structures', 'Linked Lists'],
  },
  {
    title: 'Stacks, Queues & Monotonic Variants',
    url: 'https://xlinux.nist.gov/dads/HTML/queue.html',
    contentOrigin: 'hybrid_pedagogical',
    canonicalSource: {
      name: 'NIST DADS: queue',
      url: 'https://xlinux.nist.gov/dads/HTML/queue.html',
      passage:
        'A data structure for which items are removed in the same order they are added. This is also called first-in, first-out (FIFO). Contrasted with a stack where items are removed in last-in, first-out (LIFO) order.',
    },
    groundingPassage:
      'A data structure for which items are removed in the same order they are added. This is also called first-in, first-out (FIFO). Contrasted with a stack where items are removed in last-in, first-out (LIFO) order.',
    crossReferences: [
      {
        name: 'NIST DADS: bounded stack',
        url: 'https://xlinux.nist.gov/dads/HTML/boundedstack.html',
      },
      {
        name: 'NIST DADS: priority queue',
        url: 'https://xlinux.nist.gov/dads/HTML/priorityque.html',
      },
      {
        name: 'NIST DADS: deque',
        url: 'https://xlinux.nist.gov/dads/HTML/deque.html',
      },
    ],
    codeExemplar: {
      author: 'CareerLaunch Engineering',
      language: 'python',
      code: `def next_greater_element(nums):
    """Monotonic decreasing stack to find next greater element in O(N) time."""
    n = len(nums)
    result = [-1] * n
    stack = []  # stores indices of unresolved elements
    for i in range(n):
        while stack and nums[i] > nums[stack[-1]]:
            idx = stack.pop()
            result[idx] = nums[i]
        stack.append(i)
    return result

class CircularQueue:
    """Ring buffer queue with modulo wrap-around avoiding O(N) array shifts."""
    def __init__(self, capacity):
        self.capacity = capacity
        self.queue = [None] * capacity
        self.head = 0
        self.tail = 0
        self.size = 0

    def enqueue(self, val):
        if self.size == self.capacity:
            raise OverflowError("Queue is full")
        self.queue[self.tail] = val
        self.tail = (self.tail + 1) % self.capacity
        self.size += 1

    def dequeue(self):
        if self.size == 0:
            raise IndexError("Queue is empty")
        val = self.queue[self.head]
        self.queue[self.head] = None
        self.head = (self.head + 1) % self.capacity
        self.size -= 1
        return val`,
      notes: 'CareerLaunch-authored monotonic stack and circular queue exemplar. Not from NIST DADS.',
    },
    rawContent: `# Stacks, Queues & Monotonic Variants

### Canonical Definition (NIST DADS)
A queue is a data structure for which items are removed in the same order they are added (first-in, first-out / FIFO). A stack is a data structure for which items are removed in last-in, first-out (LIFO) order. Both operations (push/pop and enqueue/dequeue) operate in O(1) time.

### Core Stack and Queue Mechanics
- Stack (LIFO): Function call stacks, parenthetical expressions balancing, depth-first backtracking.
- Queue (FIFO): Breadth-first level ordering, task scheduling, message buffering.
- Circular Queue: Array-backed ring buffer using modulo indexing ((tail + 1) % capacity) to prevent O(N) shift penalties.
- Monotonic Stack: Maintains elements in strictly increasing or decreasing order. Elements are popped when an incoming element violates the invariant.

### CareerLaunch Pedagogical Guide: Monotonic Stack & Ring Buffer
The monotonic stack pattern solves Next Greater Element and largest rectangle in histogram challenges in amortized O(N) time because each element index is pushed and popped at most once.

\`\`\`python
# Author: CareerLaunch Engineering (Pedagogical Exemplar)
def next_greater_element(nums):
    """Monotonic decreasing stack to find next greater element in O(N) time."""
    n = len(nums)
    result = [-1] * n
    stack = []  # stores indices of unresolved elements
    for i in range(n):
        while stack and nums[i] > nums[stack[-1]]:
            idx = stack.pop()
            result[idx] = nums[i]
        stack.append(i)
    return result

class CircularQueue:
    """Ring buffer queue with modulo wrap-around avoiding O(N) array shifts."""
    def __init__(self, capacity):
        self.capacity = capacity
        self.queue = [None] * capacity
        self.head = 0
        self.tail = 0
        self.size = 0

    def enqueue(self, val):
        if self.size == self.capacity:
            raise OverflowError("Queue is full")
        self.queue[self.tail] = val
        self.tail = (self.tail + 1) % self.capacity
        self.size += 1

    def dequeue(self):
        if self.size == 0:
            raise IndexError("Queue is empty")
        val = self.queue[self.head]
        self.queue[self.head] = None
        self.head = (self.head + 1) % self.capacity
        self.size -= 1
        return val
\`\`\`
`,
    roleTags: ['software-engineer'],
    topicTags: ['se-top-5', 'stacks-queues-monotonic'],
    difficultyTier: 'beginner',
    sectionHierarchy: ['Data Structures', 'Linear Data Structures', 'Stacks and Queues'],
  },
  {
    title: 'Binary Trees & Traversal Algorithms',
    url: 'https://xlinux.nist.gov/dads/HTML/completeBinaryTree.html',
    contentOrigin: 'hybrid_pedagogical',
    canonicalSource: {
      name: 'NIST DADS: complete binary tree',
      url: 'https://xlinux.nist.gov/dads/HTML/completeBinaryTree.html',
      passage:
        'A binary tree in which every level, except possibly the deepest, is completely filled. At depth n, the height of the tree, all nodes must be as far left as possible. Tree traversal is a systematic process of visiting each node in a tree exactly once.',
    },
    groundingPassage:
      'A binary tree in which every level, except possibly the deepest, is completely filled. At depth n, the height of the tree, all nodes must be as far left as possible. Tree traversal is a systematic process of visiting each node in a tree exactly once.',
    crossReferences: [
      {
        name: 'NIST DADS: tree traversal',
        url: 'https://xlinux.nist.gov/dads/HTML/treeTraversal.html',
      },
      {
        name: 'NIST DADS: preorder traversal',
        url: 'https://xlinux.nist.gov/dads/HTML/preorderTraversal.html',
      },
      {
        name: 'NIST DADS: breadth-first search',
        url: 'https://xlinux.nist.gov/dads/HTML/breadthfirst.html',
      },
      {
        name: 'NIST DADS: depth-first search',
        url: 'https://xlinux.nist.gov/dads/HTML/depthfirst.html',
      },
    ],
    codeExemplar: {
      author: 'CareerLaunch Engineering',
      language: 'python',
      code: `from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def level_order_traversal(root):
    """BFS level-order traversal using deque in O(N) time and O(W) space."""
    if not root:
        return []
    levels = []
    queue = deque([root])
    while queue:
        level_size = len(queue)
        current_level = []
        for _ in range(level_size):
            node = queue.popleft()
            current_level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        levels.append(current_level)
    return levels

def lowest_common_ancestor(root, p, q):
    """Finds lowest common ancestor in a binary tree in O(N) time."""
    if not root or root == p or root == q:
        return root
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    if left and right:
        return root
    return left if left else right`,
      notes: 'CareerLaunch-authored BFS level-order traversal and LCA exemplar. Not from NIST DADS.',
    },
    rawContent: `# Binary Trees & Traversal Algorithms

### Canonical Definition (NIST DADS)
A binary tree is a hierarchical data structure in which each node has at most two children, referred to as the left child and right child. A complete binary tree is completely filled on all levels except possibly the deepest, where nodes are positioned as far left as possible. Tree traversal systematically visits each node exactly once.

### Traversal Classifications & Invariants
- Depth-First Search (DFS):
  - Pre-Order (Root -> Left -> Right): Tree copying, serialization, prefix expressions.
  - In-Order (Left -> Root -> Right): Retrieves nodes in non-decreasing order for BSTs.
  - Post-Order (Left -> Right -> Root): Deletion, bottom-up subtree metric calculation.
- Breadth-First Search (BFS): Level-order exploration using a FIFO queue tracking level width (\`len(queue)\`).
- Lowest Common Ancestor (LCA): The deepest node that has both nodes p and q as descendants.

### CareerLaunch Pedagogical Guide: Level-Order BFS and Lowest Common Ancestor
Level-order traversal isolates tree levels iteratively using a double-ended queue. Recursive LCA exploits post-order traversal to bubble ancestor references up the call stack in O(N) time and O(H) call-stack space.

\`\`\`python
# Author: CareerLaunch Engineering (Pedagogical Exemplar)
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def level_order_traversal(root):
    """BFS level-order traversal using deque in O(N) time and O(W) space."""
    if not root:
        return []
    levels = []
    queue = deque([root])
    while queue:
        level_size = len(queue)
        current_level = []
        for _ in range(level_size):
            node = queue.popleft()
            current_level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        levels.append(current_level)
    return levels

def lowest_common_ancestor(root, p, q):
    """Finds lowest common ancestor in a binary tree in O(N) time."""
    if not root or root == p or root == q:
        return root
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    if left and right:
        return root
    return left if left else right
\`\`\`
`,
    roleTags: ['software-engineer'],
    topicTags: ['se-top-6', 'binary-trees-and-traversals'],
    difficultyTier: 'intermediate',
    sectionHierarchy: ['Data Structures', 'Non-Linear Data Structures', 'Binary Trees'],
  },
]

async function runBatch1Ingestion() {
  console.log('\n=================================================================')
  console.log('   CAREERLAUNCH PHASE 5.1: BATCH 1 SOURCE INGESTION PIPELINE     ')
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
  console.log(`  - Generated Lessons : ${initialLessonCount} (expected: 5)`)
  console.log(`  - Ingested Documents: ${initialDocCount} (expected: 5)`)
  console.log(`  - Content Chunks    : ${initialChunkCount} (expected: 5)\n`)

  if (initialStudentCount !== 2 || initialLessonCount !== 5) {
    throw new Error('Baseline integrity check failed! Aborting ingestion to protect database.')
  }

  // Execute ingestion job
  console.log('Executing ingestion job for 4 Batch 1 documents...')
  const result = await executeIngestionJob({
    sourceId: 'nist-dads',
    initiatedBy: 'phase_5_1_batch_1_admin',
    documents: batch1Documents,
  })

  console.log('\nIngestion Job Result:')
  console.log(`  - Job ID              : ${result.jobId}`)
  console.log(`  - Status              : ${result.status}`)
  console.log(`  - Documents Discovered: ${result.documentsDiscovered}`)
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

  // Check chunks for each Batch 1 topic
  const batch1TopicIds = ['se-top-2', 'se-top-4', 'se-top-5', 'se-top-6']
  for (const tid of batch1TopicIds) {
    const chunk = await ContentChunk.findOne({ topicTags: tid })
    if (!chunk) {
      throw new Error(`Failed to verify chunk for topic: ${tid}`)
    }
    console.log(`  ✓ Topic ${tid}: Chunk ${chunk.chunkId} verified (origin: ${chunk.contentOrigin}, exemplar author: ${chunk.codeExemplar.author})`)
  }

  console.log('\n=================================================================')
  console.log('   BATCH 1 SOURCE INGESTION COMPLETED SUCCESSFULLY!             ')
  console.log('=================================================================\n')

  await mongoose.disconnect()
}

runBatch1Ingestion().catch((err) => {
  console.error('\n✗ Ingestion error:', err)
  process.exit(1)
})
