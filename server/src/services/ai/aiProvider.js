/**
 * Base AI Text Generation Provider Contract
 * Enforces replaceable architecture while maintaining strict provider separation.
 */
export class BaseAIProvider {
  /**
   * @param {object} config
   */
  constructor(config = {}) {
    this.config = config
    this.providerId = config.providerId || 'generic'
    this.modelId = config.modelId || 'generic-model'
    this.isMock = Boolean(config.isMock)
  }

  /**
   * Generates a structured JSON response from user and system prompts.
   *
   * @param {object} params
   * @param {string} params.systemPrompt
   * @param {string} params.userPrompt
   * @param {object} [params.schema]
   * @param {object} [params.options]
   * @returns {Promise<{ content: object, rawText: string, tokenUsage: object, durationMs: number }>}
   */
  async generateLesson(_params) {
    throw new Error('generateLesson() must be implemented by concrete subclass.')
  }

  /**
   * Checks whether the provider is currently available and configured with valid credentials.
   *
   * @returns {boolean}
   */
  isAvailable() {
    return false
  }
}
