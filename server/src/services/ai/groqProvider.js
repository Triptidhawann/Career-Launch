import { BaseAIProvider } from './aiProvider.js'
import { AI_CONFIG } from './aiConfig.js'

/**
 * Real Groq API Text Generation Provider
 *
 * Interacts directly with Groq's high-speed LPU inference endpoints
 * using JSON Object Mode to deliver structured educational content.
 */
export class GroqProvider extends BaseAIProvider {
  /**
   * @param {object} [options]
   * @param {string} [options.apiKey]
   * @param {string} [options.model]
   */
  constructor(options = {}) {
    super({
      providerId: 'groq',
      modelId: options.model || AI_CONFIG.groq.defaultModel,
      isMock: false,
    })
    this.apiKey = options.apiKey || process.env.GROQ_API_KEY
    if (!this.apiKey) {
      throw new Error(
        'GroqProvider requires a valid GROQ_API_KEY in the backend environment. If unavailable, use MockGroqProvider.',
      )
    }
  }

  isAvailable() {
    return Boolean(this.apiKey)
  }

  /**
   * Executes Groq chat completion with JSON Object formatting.
   *
   * @param {object} params
   * @param {string} params.systemPrompt
   * @param {string} params.userPrompt
   * @param {object} [params.options]
   * @returns {Promise<{ content: object, rawText: string, tokenUsage: object, durationMs: number }>}
   */
  async generateLesson({ systemPrompt, userPrompt, options = {} }) {
    const url = AI_CONFIG.groq.baseUrl
    const model = options.model || this.modelId
    const temperature = options.temperature ?? AI_CONFIG.groq.temperature
    const maxTokens = options.maxTokens ?? AI_CONFIG.groq.maxTokens

    let lastError = null
    const maxRetries = AI_CONFIG.groq.maxRetries

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), AI_CONFIG.groq.timeoutMs)
      const startTime = performance.now()

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature,
            max_tokens: maxTokens,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeout)
        const durationMs = Number((performance.now() - startTime).toFixed(2))

        if (!response.ok) {
          const errBody = await response.text()
          if (response.status === 429) {
            console.warn(`[GroqProvider] Rate limit (429) encountered on attempt ${attempt}. Retrying...`)
            lastError = new Error(`Groq Rate Limit Exceeded (429): ${errBody}`)
            await new Promise((r) => setTimeout(r, AI_CONFIG.groq.retryDelayMs * Math.pow(2, attempt)))
            continue
          }
          throw new Error(`Groq API Error (${response.status}): ${errBody}`)
        }

        const data = await response.json()
        const rawText = data?.choices?.[0]?.message?.content

        if (!rawText) {
          throw new Error('Groq returned empty completion content.')
        }

        let parsed
        try {
          parsed = JSON.parse(rawText)
        } catch (jsonErr) {
          throw new Error(`Failed to parse Groq response as JSON: ${jsonErr.message}. Raw text: ${rawText.substring(0, 200)}...`)
        }

        return {
          content: parsed,
          rawText,
          tokenUsage: {
            promptTokens: data?.usage?.prompt_tokens || 0,
            completionTokens: data?.usage?.completion_tokens || 0,
            totalTokens: data?.usage?.total_tokens || 0,
          },
          durationMs,
        }
      } catch (err) {
        clearTimeout(timeout)
        lastError = err
        if (attempt < maxRetries && err.name !== 'AbortError') {
          await new Promise((r) => setTimeout(r, AI_CONFIG.groq.retryDelayMs * attempt))
        } else {
          break
        }
      }
    }

    throw lastError || new Error('Groq generation failed after maximum retries.')
  }
}

/**
 * Deterministic Mock AI Provider for Offline Testing & Verification
 *
 * Emits complete, educational, schema-adherent lesson structures for the 5 pilot topics
 * grounded strictly in the pilot NIST DADS chunks.
 * Used when GROQ_API_KEY is not configured or in unit test mode.
 */
export class MockGroqProvider extends BaseAIProvider {
  constructor(options = {}) {
    super({
      providerId: 'mock_groq',
      modelId: options.model || 'mock-llama-3.3-70b',
      isMock: true,
    })
  }

  isAvailable() {
    return true
  }

  /**
   * Generates deterministic mock lessons tailored to the evidence chunks supplied.
   *
   * @param {object} params
   * @param {string} params.userPrompt
   * @returns {Promise<{ content: object, rawText: string, tokenUsage: object, durationMs: number }>}
   */
  async generateLesson({ userPrompt }) {
    const startTime = performance.now()

    // Determine topic from user prompt
    let topicId = 'swe-top-1'
    if (userPrompt.includes('swe-top-4')) topicId = 'swe-top-4'
    else if (userPrompt.includes('swe-top-7')) topicId = 'swe-top-7'
    else if (userPrompt.includes('swe-top-9')) topicId = 'swe-top-9'
    else if (userPrompt.includes('swe-top-13')) topicId = 'swe-top-13'

    const mockLessons = {
      'swe-top-1': {
        title: 'Arrays and Two-Pointer Scanning Mechanics',
        difficulty: 'beginner',
        estimatedMinutes: 15,
        learningObjectives: [
          'Understand constant-time random memory access invariants in linear arrays',
          'Master converging and sliding window two-pointer techniques',
          'Apply in-place array manipulation to reduce quadratic complexity to linear O(n)',
        ],
        introduction: {
          meaning: 'The two-pointer technique uses two directional index markers moving across a contiguous array to search, partition, or transform elements.',
          whyItMatters: 'It allows solving searching and partition subproblems in O(n) linear time and O(1) auxiliary space, bypassing expensive O(n²) nested iterations.',
          realWorldUse: 'Widely used in high-throughput data processing, log parsing, string tokenization, and in-place memory buffer deduplication.',
        },
        coreConcepts: [
          {
            term: 'Array',
            definition: 'A contiguous collection of cells accessed by integer indices via constant-time address arithmetic.',
            principles: 'Guarantees O(1) random lookup by memory offset; mutations require shifting elements.',
          },
          {
            term: 'Converging Pointers',
            definition: 'Left and right pointers initialized at opposite boundaries moving toward each other until meeting.',
            principles: 'Essential for sorted two-sum, palindrome verification, and Dutch National Flag partitioning.',
          },
        ],
        stepByStep: [
          {
            stepNumber: 1,
            heading: 'Establish Invariant Boundaries',
            explanation: 'Initialize a slow write pointer at index 0 and a fast read pointer at index 1.',
          },
          {
            stepNumber: 2,
            heading: 'Evaluate Convergence Condition',
            explanation: 'Traverse the array with the fast pointer. When nums[fast] != nums[slow], increment slow and copy value.',
          },
          {
            stepNumber: 3,
            heading: 'Finalize Boundary',
            explanation: 'Return slow + 1 as the length of unique elements with zero auxiliary memory allocation.',
          },
        ],
        practicalExamples: [
          {
            title: 'In-Place Duplicate Removal',
            explanation: 'Removes duplicates from a sorted array in O(n) time and O(1) space using fast/slow indices.',
            input: 'nums = [1, 1, 2, 2, 3]',
            output: '3 (nums prefix = [1, 2, 3])',
            code: `def remove_duplicates(nums):
    if not nums:
        return 0
    slow = 0
    for fast in range(1, len(nums)):
        if nums[fast] != nums[slow]:
            slow += 1
            nums[slow] = nums[fast]
    return slow + 1`,
            language: 'python',
            attribution: 'CareerLaunch Engineering',
          },
        ],
        complexityAnalysis: {
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
          explanation: 'The fast pointer inspects each element exactly once. No supplementary data structures are allocated.',
          assumptions: 'Input array is sorted in non-decreasing order.',
        },
        commonMistakes: [
          {
            mistake: 'Incrementing pointers simultaneously without condition',
            consequence: 'Skips consecutive duplicate elements or creates index-out-of-range exceptions.',
            correction: 'Always advance the write pointer only after confirming element distinctness.',
          },
        ],
        interviewInsights: {
          focusAreas: ['Edge cases with empty arrays or single elements', 'In-place memory requirements without extra copies'],
          followUpQuestions: ['How would you allow at most two duplicates per element?', 'How does this apply to linked lists?'],
          advice: 'Always explicitly state the loop invariant before writing the while/for loop.',
        },
        summary: [
          'Arrays provide O(1) random access but require O(n) space to re-allocate.',
          'Two-pointer scanning eliminates quadratic loops by advancing bounds monotonically.',
        ],
        references: [
          {
            sourceId: 'nist-dads',
            sourceTitle: 'NIST Dictionary of Algorithms and Data Structures',
            canonicalUrl: 'https://xlinux.nist.gov/dads/HTML/array.html',
            section: 'Data Structures / Arrays',
            chunkId: 'doc_nist-dads_5049a48a20fa_chk_001',
            groundingSnippet: 'A contiguous collection of cells, each of which stores an element accessed by one or more integer indices.',
          },
        ],
      },
      'swe-top-4': {
        title: 'Binary Search Mechanics and Interval Bisection',
        difficulty: 'beginner',
        estimatedMinutes: 18,
        learningObjectives: [
          'Understand logarithmic space bisection on monotonically sorted sequences',
          'Implement lower bound and upper bound invariant conditions cleanly',
          'Apply interval overlap tests in technical interview problems',
        ],
        introduction: {
          meaning: 'Binary search repeatedly bisects a monotonic search interval in half to locate a target value or boundary condition.',
          whyItMatters: 'Reduces search complexity from O(n) linear scan to O(log n) logarithmic steps.',
          realWorldUse: 'Database index lookups (B-Tree leaf bisection), OS memory page allocation, and numerical root finding.',
        },
        coreConcepts: [
          {
            term: 'Search Space Monotonicity',
            definition: 'A predicate function whose truth values are sorted (e.g. False, False, True, True).',
            principles: 'Enables deterministic exclusion of entire half-spaces without individual item inspection.',
          },
        ],
        stepByStep: [
          {
            stepNumber: 1,
            heading: 'Define Half-Open Range',
            explanation: 'Set low = 0 and high = len(arr).',
          },
          {
            stepNumber: 2,
            heading: 'Bisect Safely',
            explanation: 'Compute mid = low + (high - low) // 2 to avoid integer overflow.',
          },
          {
            stepNumber: 3,
            heading: 'Narrow Invariant Window',
            explanation: 'If arr[mid] < target, advance low = mid + 1; otherwise narrow high = mid.',
          },
        ],
        practicalExamples: [
          {
            title: 'Lower Bound Binary Search',
            explanation: 'Finds the first index where element >= target in O(log n) time.',
            input: 'arr = [1, 2, 4, 4, 5], target = 4',
            output: 'Index 2',
            code: `def binary_search_lower_bound(arr, target):
    low, high = 0, len(arr)
    while low < high:
        mid = (low + high) // 2
        if arr[mid] < target:
            low = mid + 1
        else:
            high = mid
    return low`,
            language: 'python',
            attribution: 'CareerLaunch Engineering',
          },
        ],
        complexityAnalysis: {
          timeComplexity: 'O(log n)',
          spaceComplexity: 'O(1)',
          explanation: 'Each comparison eliminates 50% of the remaining search space. Only scalar pointers are stored.',
          assumptions: 'Random access array with monotonic ordering.',
        },
        commonMistakes: [
          {
            mistake: 'Using mid = (low + high) // 2 with high = len(arr) - 1 and while low <= high',
            consequence: 'Infinite loop when target is greater than all elements or boundary condition fails.',
            correction: 'Use standard lower bound invariant (while low < high with high = mid).',
          },
        ],
        interviewInsights: {
          focusAreas: ['Off-by-one errors on boundaries', 'Binary searching on answer spaces'],
          followUpQuestions: ['How would you find the first and last position of an element?', 'How to search in a rotated sorted array?'],
          advice: 'Draw the 2-element base case on a whiteboard to verify termination.',
        },
        summary: [
          'Binary search operates on any monotonic condition, not just sorted arrays.',
          'Always verify low < high vs low <= high termination invariants.',
        ],
        references: [
          {
            sourceId: 'nist-dads',
            sourceTitle: 'NIST Dictionary of Algorithms and Data Structures',
            canonicalUrl: 'https://xlinux.nist.gov/dads/HTML/binarySearch.html',
            section: 'Algorithms / Searching',
            chunkId: 'doc_nist-dads_4314b2703ab7_chk_001',
            groundingSnippet: 'Search a sorted array by repeatedly dividing the search interval in half.',
          },
        ],
      },
      'swe-top-7': {
        title: 'Binary Search Trees, Invariants and Balancing',
        difficulty: 'intermediate',
        estimatedMinutes: 20,
        learningObjectives: [
          'Understand the strict Binary Search Tree ordering property',
          'Implement recursive validation bounding min and max constraint windows',
          'Recognize why tree balancing (AVL / Red-Black) is necessary to avoid O(n) degeneration',
        ],
        introduction: {
          meaning: 'A Binary Search Tree is a node-based data structure where every left descendant is strictly smaller and every right descendant is strictly greater than the node.',
          whyItMatters: 'Enables dynamic insertion, deletion, and searching in average O(log n) time.',
          realWorldUse: 'Database indices, file system hierarchies, and symbol tables in compilers.',
        },
        coreConcepts: [
          {
            term: 'BST Invariant',
            definition: 'For any node N, all keys in N.left are < N.key, and all keys in N.right are > N.key.',
            principles: 'Local parent-child checks are insufficient; validation must propagate global range windows.',
          },
        ],
        stepByStep: [
          {
            stepNumber: 1,
            heading: 'Propagate Valid Window',
            explanation: 'Define recursive helper taking node, min_val, and max_val.',
          },
          {
            stepNumber: 2,
            heading: 'Validate Current Node',
            explanation: 'If not (min_val < node.val < max_val), return False immediately.',
          },
          {
            stepNumber: 3,
            heading: 'Recurse Subtrees',
            explanation: 'Left subtree inherits max_val = node.val; right subtree inherits min_val = node.val.',
          },
        ],
        practicalExamples: [
          {
            title: 'Recursive BST Validation',
            explanation: 'Validates complete BST invariant using constraint windows.',
            input: 'root = [5, 1, 4, null, null, 3, 6]',
            output: 'False (4 has child 3 which is <= 5)',
            code: `def is_valid_bst(root, min_val=float('-inf'), max_val=float('inf')):
    if not root:
        return True
    if not (min_val < root.val < max_val):
        return False
    return (is_valid_bst(root.left, min_val, root.val) and
            is_valid_bst(root.right, root.val, max_val))`,
            language: 'python',
            attribution: 'CareerLaunch Engineering',
          },
        ],
        complexityAnalysis: {
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(h)',
          explanation: 'Every node is visited once. Recursion stack requires space proportional to tree height h.',
          assumptions: 'Tree contains n total nodes.',
        },
        commonMistakes: [
          {
            mistake: 'Only comparing root.val with root.left.val and root.right.val',
            consequence: 'Fails on deep tree violations where a right subtree contains an element smaller than an ancestor.',
            correction: 'Pass valid constraint bounds (min_val, max_val) down recursion calls.',
          },
        ],
        interviewInsights: {
          focusAreas: ['In-order traversal yielding monotonic sorted sequence', 'Handling tree degeneration on sorted input'],
          followUpQuestions: ['How does an AVL tree maintain balance?', 'How would you find the k-th smallest element?'],
          advice: 'Mention that in-order traversal of a valid BST is strictly increasing.',
        },
        summary: [
          'BST invariants apply globally across entire subtrees.',
          'Unbalanced BST degenerates to O(n) linked list on sorted input.',
        ],
        references: [
          {
            sourceId: 'nist-dads',
            sourceTitle: 'NIST Dictionary of Algorithms and Data Structures',
            canonicalUrl: 'https://xlinux.nist.gov/dads/HTML/binarySearchTree.html',
            section: 'Data Structures / Trees',
            chunkId: 'doc_nist-dads_50ab0de92398_chk_001',
            groundingSnippet: 'A binary tree where every node in the left subtree has a key less than the node key.',
          },
        ],
      },
      'swe-top-9': {
        title: 'Graph Traversals: BFS, DFS and Cycle Detection',
        difficulty: 'intermediate',
        estimatedMinutes: 22,
        learningObjectives: [
          'Distinguish BFS FIFO queue exploration from DFS recursion stack exploration',
          'Detect directed graph cycles using 3-state active recursion markers',
          'Recognize undirected graph cycle conditions via parent back-edges',
        ],
        introduction: {
          meaning: 'Graph traversal explores vertices and edges systematically to discover connectivity, topological order, and cyclic dependencies.',
          whyItMatters: 'Fundamental to dependency resolution, dead-lock detection, and shortest-path calculation in networks.',
          realWorldUse: 'Build systems (Webpack/Make dependency graphs), package managers (npm cycle resolution), and social networks.',
        },
        coreConcepts: [
          {
            term: 'Directed Cycle',
            definition: 'A closed path of positive length starting and ending at the same vertex.',
            principles: 'In DFS, a directed cycle exists if and only if a back-edge encounters a vertex on the active recursion stack.',
          },
        ],
        stepByStep: [
          {
            stepNumber: 1,
            heading: 'Maintain Tri-State Array',
            explanation: '0 = unvisited, 1 = visiting (on active recursion stack), 2 = completed (visited).',
          },
          {
            stepNumber: 2,
            heading: 'Traverse Neighbors',
            explanation: 'If a neighbor is in state 1, a back-edge is found and a cycle is confirmed.',
          },
          {
            stepNumber: 3,
            heading: 'Backtrack State',
            explanation: 'Once all neighbors of a node are explored, mark state as 2 and return False.',
          },
        ],
        practicalExamples: [
          {
            title: 'Directed Graph Cycle Detection',
            explanation: 'Detects cycles using DFS tri-color recursion stack tracking.',
            input: 'num_nodes = 2, prerequisites = [[1, 0], [0, 1]]',
            output: 'True (Cycle detected)',
            code: `def has_cycle_directed(graph, num_nodes):
    state = [0] * num_nodes
    def dfs(node):
        state[node] = 1 # Active
        for neighbor in graph[node]:
            if state[neighbor] == 1:
                return True
            if state[neighbor] == 0 and dfs(neighbor):
                return True
        state[node] = 2 # Completed
        return False
    return any(dfs(i) for i in range(num_nodes) if state[i] == 0)`,
            language: 'python',
            attribution: 'CareerLaunch Engineering',
          },
        ],
        complexityAnalysis: {
          timeComplexity: 'O(V + E)',
          spaceComplexity: 'O(V)',
          explanation: 'Visits each vertex and edge once. Recursion stack and state array require O(V) auxiliary space.',
          assumptions: 'Graph represented as adjacency list with V vertices and E edges.',
        },
        commonMistakes: [
          {
            mistake: 'Using a simple boolean visited set for directed graph cycles',
            consequence: 'Falsely flags diamond structures as cycles.',
            correction: 'Use 3-color states (unvisited, visiting, visited) to track the active recursion branch.',
          },
        ],
        interviewInsights: {
          focusAreas: ['Topological sort (Kahn algorithm vs DFS post-order)', 'Distinguishing directed vs undirected cycle logic'],
          followUpQuestions: ['How would you return the actual cycle path?', 'How would you implement this iteratively using Kahn BFS?'],
          advice: 'Always ask the interviewer if the graph is directed or undirected before picking cycle detection logic.',
        },
        summary: [
          'BFS uses FIFO queue for shortest unweighted paths.',
          'DFS directed cycle detection requires 3-state tracking on the recursion stack.',
        ],
        references: [
          {
            sourceId: 'nist-dads',
            sourceTitle: 'NIST Dictionary of Algorithms and Data Structures',
            canonicalUrl: 'https://xlinux.nist.gov/dads/HTML/cycle.html',
            section: 'Algorithms / Graphs',
            chunkId: 'doc_nist-dads_77e79b563a21_chk_001',
            groundingSnippet: 'A path of positive length that starts and ends at the same vertex and has no other repeated vertices.',
          },
        ],
      },
      'swe-top-13': {
        title: 'Dynamic Programming: Optimal Substructure and Memoization',
        difficulty: 'advanced',
        estimatedMinutes: 25,
        learningObjectives: [
          'Recognize optimal substructure and overlapping subproblems',
          'Formulate state transition recurrences',
          'Optimize 2D dynamic programming tables into 1D rolling memory arrays',
        ],
        introduction: {
          meaning: 'Dynamic Programming solves complex optimization problems by decomposing them into subproblems, caching results to avoid redundant recomputation.',
          whyItMatters: 'Transforms exponential O(2^n) brute-force recursion into polynomial O(n · W) execution time.',
          realWorldUse: 'Resource scheduling, diff algorithms (git merge), network routing (Bellman-Ford), and sequence alignment (DNA/Bioinformatics).',
        },
        coreConcepts: [
          {
            term: 'Optimal Substructure',
            definition: 'An optimal solution to the problem contains optimal solutions to its subproblems.',
            principles: 'Governed by Bellman Principle of Optimality.',
          },
          {
            term: 'Overlapping Subproblems',
            definition: 'A recursive solution revisits identical subproblems repeatedly rather than generating new ones.',
            principles: 'Enables memoization (caching) to eliminate redundant exponential computation.',
          },
        ],
        stepByStep: [
          {
            stepNumber: 1,
            heading: 'Define State Representation',
            explanation: 'dp[w] represents the maximum value achievable with weight capacity w.',
          },
          {
            stepNumber: 2,
            heading: 'Derive State Transition Recurrence',
            explanation: 'dp[w] = max(dp[w], val[i] + dp[w - wt[i]]).',
          },
          {
            stepNumber: 3,
            heading: 'Iterate Backwards for 1D Rolling Array',
            explanation: 'Iterate capacity backwards from capacity down to weights[i] to prevent reusing the same item multiple times in 0/1 knapsack.',
          },
        ],
        practicalExamples: [
          {
            title: '0/1 Knapsack with Space Optimization',
            explanation: 'Solves 0/1 knapsack in O(n · W) time and O(W) auxiliary space using a 1D rolling array.',
            input: 'weights = [1, 3, 4], values = [15, 20, 30], capacity = 4',
            output: '35 (Take item 1 and item 2)',
            code: `def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [0] * (capacity + 1)
    for i in range(n):
        for w in range(capacity, weights[i] - 1, -1):
            dp[w] = max(dp[w], values[i] + dp[w - weights[i]])
    return dp[capacity]`,
            language: 'python',
            attribution: 'CareerLaunch Engineering',
          },
        ],
        complexityAnalysis: {
          timeComplexity: 'O(n · W)',
          spaceComplexity: 'O(W)',
          explanation: 'Iterates through n items and W capacity states. Backward iteration reduces 2D table into a 1D array of size W+1.',
          assumptions: 'Item weights are non-negative integers.',
        },
        commonMistakes: [
          {
            mistake: 'Iterating capacity forward (0 to W) in 0/1 knapsack',
            consequence: 'Transforms the problem into unbounded knapsack by allowing an item to be picked repeatedly.',
            correction: 'Iterate backwards when using 1D space optimization to ensure values come from the previous item state.',
          },
        ],
        interviewInsights: {
          focusAreas: ['Identifying state variables and base cases', 'Top-down recursion with memoization vs bottom-up tabulation'],
          followUpQuestions: ['How would you reconstruct the exact items chosen?', 'How to solve unbounded knapsack?'],
          advice: 'Always start with the recursive recurrence relation before attempting space optimization.',
        },
        summary: [
          'Dynamic programming requires both optimal substructure and overlapping subproblems.',
          'Rolling arrays reduce space complexity when transitions depend only on previous rows.',
        ],
        references: [
          {
            sourceId: 'nist-dads',
            sourceTitle: 'NIST Dictionary of Algorithms and Data Structures',
            canonicalUrl: 'https://xlinux.nist.gov/dads/HTML/dynamicProgramming.html',
            section: 'Algorithms / Dynamic Programming',
            chunkId: 'doc_nist-dads_e5e48de67b02_chk_001',
            groundingSnippet: 'An algorithm design technique where an optimization problem is solved by caching subproblem solutions rather than recomputing them.',
          },
        ],
      },
    }

    const lesson = mockLessons[topicId] || mockLessons['swe-top-1']
    const durationMs = Number((performance.now() - startTime).toFixed(2))

    return {
      content: lesson,
      rawText: JSON.stringify(lesson, null, 2),
      tokenUsage: {
        promptTokens: 1250,
        completionTokens: 890,
        totalTokens: 2140,
      },
      durationMs,
    }
  }
}

/**
 * Factory function to retrieve designated AI provider.
 *
 * @param {string} [providerId]
 * @returns {BaseAIProvider}
 */
export function getAIProvider(providerId) {
  const targetId = providerId || AI_CONFIG.defaultProvider
  if (targetId === 'groq') {
    if (!process.env.GROQ_API_KEY) {
      if (process.env.AI_GENERATION_ENABLED === 'true' || AI_CONFIG.generationEnabled) {
        throw new Error(
          'AI generation is enabled with provider "groq", but GROQ_API_KEY is missing from environment. Real generation cannot proceed and mock fallback is disallowed.',
        )
      }
      console.warn('[AIProvider] GROQ_API_KEY not configured. Falling back to MockGroqProvider for offline verification.')
      return new MockGroqProvider()
    }
    return new GroqProvider()
  }
  return new MockGroqProvider()
}
