import { getProviderConfig, EMBEDDING_CONFIG } from './embeddingConfig.js'

/**
 * Base abstract class defining the provider-independent embedding contract.
 */
export class BaseEmbeddingProvider {
  /**
   * @param {object} config
   */
  constructor(config) {
    this.config = config
    this.providerId = config.providerId
    this.modelId = config.modelId
    this.modelVersion = config.modelVersion
    this.dimensions = config.dimensions
    this.isMock = Boolean(config.isMock)
  }

  /**
   * Generates an embedding vector for a single string.
   *
   * @param {string} text
   * @returns {Promise<number[]>} L2-normalized vector
   */
  async embedText(_text) {
    throw new Error('embedText() must be implemented by subclass')
  }

  /**
   * Generates embedding vectors for a batch of strings.
   *
   * @param {string[]} texts
   * @returns {Promise<number[][]>} Array of L2-normalized vectors
   */
  async embedBatch(_texts) {
    throw new Error('embedBatch() must be implemented by subclass')
  }

  /**
   * Validates a vector against required dimensions and numerical sanity.
   *
   * @param {any} vector
   * @param {number} [expectedDim]
   * @returns {{ valid: boolean, reason?: string }}
   */
  validateVector(vector, expectedDim = this.dimensions) {
    if (!Array.isArray(vector)) {
      return { valid: false, reason: 'Vector must be an Array.' }
    }
    if (vector.length !== expectedDim) {
      return {
        valid: false,
        reason: `Vector dimension mismatch: expected ${expectedDim}, received ${vector.length}.`,
      }
    }
    let sumSquares = 0
    for (let i = 0; i < vector.length; i++) {
      const v = vector[i]
      if (typeof v !== 'number' || !Number.isFinite(v)) {
        return {
          valid: false,
          reason: `Invalid non-finite number at index ${i}: ${v}`,
        }
      }
      sumSquares += v * v
    }
    if (sumSquares === 0) {
      return { valid: false, reason: 'Vector has zero magnitude (all zeroes).' }
    }
    return { valid: true }
  }
}

/**
 * Deterministic Semantic Mock Embedding Provider
 *
 * Produces deterministic 384-dimensional unit vectors using token hashing,
 * character n-grams, and semantic cluster projection.
 * Semantically correlated technical terms yield high cosine similarity (>0.60),
 * while unrelated terms yield low similarity (<0.30).
 *
 * Fully offline, zero-network, reliable for tests and benchmarking.
 */
export class MockEmbeddingProvider extends BaseEmbeddingProvider {
  constructor(config = getProviderConfig('mock')) {
    super(config)
  }

  /**
   * Hashes a string using 32-bit FNV-1a.
   * @private
   */
  _fnv1a(str) {
    let hash = 0x811c9dc5
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i)
      hash = Math.imul(hash, 0x01000193)
    }
    return hash >>> 0
  }

  /**
   * Maps text to a 384-dimensional L2-normalized vector.
   *
   * @param {string} text
   * @returns {Promise<number[]>}
   */
  async embedText(text) {
    if (typeof text !== 'string' || !text.trim()) {
      throw new Error('Cannot embed empty or non-string input.')
    }

    const clean = text.toLowerCase().trim()
    const vector = new Float64Array(this.dimensions)

    // Domain semantic anchor clusters to provide natural topical affinity
    const conceptClusters = [
      {
        terms: ['array', 'arrays', 'pointer', 'pointers', 'two-pointer', 'two_pointer', 'partition', 'scan', 'sliding', 'window', 'left', 'right', 'indices'],
        center: 30,
        span: 25,
      },
      {
        terms: ['binary', 'search', 'interval', 'intervals', 'bisect', 'bisection', 'logarithmic', 'log n', 'lower_bound', 'upper_bound', 'sorted', 'overlap'],
        center: 100,
        span: 25,
      },
      {
        terms: ['tree', 'trees', 'bst', 'binary search tree', 'inorder', 'traversal', 'balancing', 'avl', 'red-black', 'subtree', 'height', 'invariants'],
        center: 170,
        span: 25,
      },
      {
        terms: ['graph', 'graphs', 'bfs', 'dfs', 'cycle', 'cycles', 'vertex', 'vertices', 'edge', 'edges', 'visited', 'stack', 'recursion', 'unweighted'],
        center: 240,
        span: 25,
      },
      {
        terms: ['dynamic', 'programming', 'dp', 'memoization', 'memoize', 'tabulation', 'subproblem', 'subproblems', 'knapsack', 'recurrence', 'optimal', 'substructure'],
        center: 310,
        span: 25,
      },
    ]

    // 1. Concept Cluster Projection
    for (const cluster of conceptClusters) {
      let clusterMatchWeight = 0
      for (const term of cluster.terms) {
        if (clean.includes(term)) {
          clusterMatchWeight += 1.5
        }
      }
      if (clusterMatchWeight > 0) {
        for (let i = 0; i < cluster.span; i++) {
          const idx = (cluster.center + i) % this.dimensions
          const dist = Math.abs(i - cluster.span / 2) / (cluster.span / 2)
          vector[idx] += clusterMatchWeight * Math.cos(dist * Math.PI * 0.5)
        }
      }
    }

    // 2. Token and Trigram Feature Hashing
    const tokens = clean.split(/[^a-z0-9_#]+/).filter((t) => t.length > 1)
    for (const token of tokens) {
      const h = this._fnv1a(token)
      const dim1 = h % this.dimensions
      const dim2 = (h >> 8) % this.dimensions
      const dim3 = (h >> 16) % this.dimensions
      const sign = (h & 1) === 0 ? 1 : -1

      vector[dim1] += 0.8 * sign
      vector[dim2] += 0.6 * -sign
      vector[dim3] += 0.4 * sign

      // Character trigrams
      if (token.length >= 3) {
        for (let i = 0; i <= token.length - 3; i++) {
          const tri = token.slice(i, i + 3)
          const triHash = this._fnv1a(tri)
          const triDim = triHash % this.dimensions
          vector[triDim] += 0.25 * ((triHash & 1) === 0 ? 1 : -1)
        }
      }
    }

    // 3. Compute L2 Norm and Normalize to Unit Length
    let sumSquares = 0
    for (let i = 0; i < this.dimensions; i++) {
      sumSquares += vector[i] * vector[i]
    }

    const norm = Math.sqrt(sumSquares)
    const result = new Array(this.dimensions)

    if (norm > 0) {
      for (let i = 0; i < this.dimensions; i++) {
        result[i] = Number((vector[i] / norm).toFixed(6))
      }
    } else {
      // Deterministic fallback if text contained no recognizable tokens
      result.fill(0)
      result[0] = 1.0
    }

    return result
  }

  /**
   * Generates embeddings for an array of strings sequentially.
   *
   * @param {string[]} texts
   * @returns {Promise<number[][]>}
   */
  async embedBatch(texts) {
    if (!Array.isArray(texts)) {
      throw new Error('embedBatch expects an array of strings.')
    }
    const results = []
    for (const text of texts) {
      const vec = await this.embedText(text)
      results.push(vec)
    }
    return results
  }
}

/**
 * Google Gemini Embedding Provider Adapter
 *
 * Implements official Gemini text-embedding-004 API (768 dimensions).
 * Activated automatically when GEMINI_API_KEY is configured.
 */
export class GeminiEmbeddingProvider extends BaseEmbeddingProvider {
  /**
   * @param {object} [config]
   */
  constructor(config = getProviderConfig('gemini')) {
    super(config)
    this.apiKey = process.env.GEMINI_API_KEY
    if (!this.apiKey) {
      throw new Error(
        'GeminiEmbeddingProvider requires GEMINI_API_KEY environment variable. If unavailable, use MockEmbeddingProvider.',
      )
    }
  }

  /**
   * Generates embedding via Gemini REST API.
   *
   * @param {string} text
   * @returns {Promise<number[]>}
   */
  async embedText(text) {
    if (typeof text !== 'string' || !text.trim()) {
      throw new Error('Cannot embed empty or non-string input.')
    }

    const url = `${this.config.baseUrl}/${this.modelId}:embedContent?key=${this.apiKey}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), EMBEDDING_CONFIG.limits.timeoutMs)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${this.modelId}`,
          content: {
            parts: [{ text: text.substring(0, EMBEDDING_CONFIG.limits.maxChunkCharacters) }],
          },
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errBody = await response.text()
        throw new Error(`Gemini Embedding API Error (${response.status}): ${errBody}`)
      }

      const data = await response.json()
      const values = data?.embedding?.values

      const validation = this.validateVector(values, this.dimensions)
      if (!validation.valid) {
        throw new Error(`Gemini vector validation failed: ${validation.reason}`)
      }

      return values
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Generates embeddings in batches using batchEmbedContents endpoint.
   *
   * @param {string[]} texts
   * @returns {Promise<number[][]>}
   */
  async embedBatch(texts) {
    if (!Array.isArray(texts)) {
      throw new Error('embedBatch expects an array of strings.')
    }
    if (texts.length === 0) return []

    const url = `${this.config.baseUrl}/${this.modelId}:batchEmbedContents?key=${this.apiKey}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), EMBEDDING_CONFIG.limits.timeoutMs * 2)

    try {
      const requests = texts.map((t) => ({
        model: `models/${this.modelId}`,
        content: { parts: [{ text: t.substring(0, EMBEDDING_CONFIG.limits.maxChunkCharacters) }] },
      }))

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errBody = await response.text()
        throw new Error(`Gemini Batch Embedding API Error (${response.status}): ${errBody}`)
      }

      const data = await response.json()
      const embeddings = data?.embeddings?.map((e) => e.values) || []

      for (let i = 0; i < embeddings.length; i++) {
        const validation = this.validateVector(embeddings[i], this.dimensions)
        if (!validation.valid) {
          throw new Error(`Batch vector validation failed at index ${i}: ${validation.reason}`)
        }
      }

      return embeddings
    } finally {
      clearTimeout(timeout)
    }
  }
}

/**
 * Factory to instantiate the designated embedding provider.
 *
 * @param {string} [providerId]
 * @returns {BaseEmbeddingProvider}
 */
export function getEmbeddingProvider(providerId) {
  const targetId = providerId || EMBEDDING_CONFIG.defaultProvider
  if (targetId === 'gemini') {
    if (!process.env.GEMINI_API_KEY) {
      console.warn(
        '[EmbeddingProvider] GEMINI_API_KEY not configured. Falling back to deterministic MockEmbeddingProvider.',
      )
      return new MockEmbeddingProvider()
    }
    return new GeminiEmbeddingProvider()
  }
  return new MockEmbeddingProvider()
}
