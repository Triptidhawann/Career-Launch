/**
 * Embedding Service Configuration & Provider Registry
 * Provides configuration constants, model specifications, timeouts, and validation rules.
 *
 * Gemini Embedding Verification (Audit 2026):
 * - Model: text-embedding-004 (Official Google Gemini text embedding)
 * - Dimensions: 768 native default (supports Matryoshka reduction to 256/512)
 * - Unified Model Succession: gemini-embedding-001 (up to 3072 dims, Matryoshka scaling)
 * - Pricing: Free tier (1500 RPM on AI Studio) / Pay-as-you-go ~$0.00002 / 1k chars (~$0.15 / 1M tokens)
 * - Terms: Commercial use permitted on paid tier with API key; subject to Google Cloud / AI terms.
 */

export const EMBEDDING_CONFIG = {
  // Active provider: defaults to mock unless GEMINI_API_KEY is available and configured
  defaultProvider: process.env.EMBEDDING_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : 'mock'),

  providers: {
    mock: {
      providerId: 'mock',
      modelId: 'careerlaunch-deterministic-embed-v1',
      modelVersion: '1.0.0',
      dimensions: 384,
      isMock: true,
      description: 'Deterministic 384-dimensional synthetic offline test provider for architectural verification',
    },
    gemini: {
      providerId: 'gemini',
      modelId: 'text-embedding-004',
      modelVersion: '004',
      dimensions: 768,
      isMock: false,
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
      pricing: {
        inputTokensPerMillion: 0.15,
        freeTierRpm: 1500,
      },
      description: 'Google Gemini text-embedding-004 verified production adapter (768 dimensions)',
    },
  },

  // Operational limits
  limits: {
    maxBatchSize: 32,
    maxQueryCharacters: 1000,
    maxChunkCharacters: 8000,
    timeoutMs: 10000, // 10-second timeout per provider request
    maxRetries: 3,
    retryDelayMs: 400,
  },
}

/**
 * Retrieves the configuration for a given provider or the active default.
 *
 * @param {string} [providerId]
 * @returns {object} Provider configuration
 */
export function getProviderConfig(providerId) {
  const id = providerId || EMBEDDING_CONFIG.defaultProvider
  const config = EMBEDDING_CONFIG.providers[id]
  if (!config) {
    throw new Error(`Unsupported embedding provider: "${id}". Supported providers: [${Object.keys(EMBEDDING_CONFIG.providers).join(', ')}]`)
  }
  return config
}
