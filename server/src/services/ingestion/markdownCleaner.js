import crypto from 'node:crypto'

/**
 * Maximum document byte size limit (5 MB) as required by security specifications.
 */
export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024

/**
 * Computes a SHA-256 hash of a string for deduplication and change detection.
 *
 * @param {string} text
 * @returns {string} Hex SHA-256 hash
 */
export function computeContentHash(text) {
  return crypto.createHash('sha256').update(text || '', 'utf8').digest('hex')
}

/**
 * Approximates token count based on standard whitespace and punctuation splitting.
 *
 * @param {string} text
 * @returns {number}
 */
export function estimateTokenCount(text) {
  if (!text) return 0
  // Standard heuristic: average word + punctuation token in technical text is ~4 characters
  return Math.ceil(text.length / 4)
}

/**
 * Strips HTML boilerplate, scripts, navigation, and unsafe elements from raw text.
 *
 * @param {string} rawText
 * @returns {string} Cleaned text
 */
export function stripHtmlBoilerplate(rawText) {
  if (!rawText) return ''

  let text = rawText

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '')

  // Remove scripts, styles, iframes, and embedding elements
  text = text.replace(/<(script|style|iframe|object|embed|noscript)[\s\S]*?<\/\1>/gi, '')

  // Remove navigation, header, footer, and cookie banner tags
  text = text.replace(/<(nav|header|footer|aside)[\s\S]*?<\/\1>/gi, '')

  // Strip inline event attributes like onclick, onload, onerror
  text = text.replace(/\s+on[a-z]+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '')

  // Replace common block tags with linebreaks
  text = text.replace(/<\/(p|div|section|article|h[1-6]|li|tr)>/gi, '\n')
  text = text.replace(/<br\s*\/?>/gi, '\n')

  // Remove all remaining HTML tags while preserving their text content
  text = text.replace(/<[^>]+>/g, '')

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  return text
}

/**
 * Cleans, normalizes, and sanitizes collected document content.
 *
 * @param {string} rawContent
 * @param {'markdown' | 'html' | 'text'} contentType
 * @returns {{ cleanedText: string, contentHash: string, tokenCount: number, byteSize: number }}
 */
export function cleanDocumentContent(rawContent, contentType = 'markdown') {
  if (!rawContent || typeof rawContent !== 'string') {
    return { cleanedText: '', contentHash: computeContentHash(''), tokenCount: 0, byteSize: 0 }
  }

  const byteSize = Buffer.byteLength(rawContent, 'utf8')
  if (byteSize > MAX_DOCUMENT_BYTES) {
    throw new Error(`Document exceeds maximum permitted size of 5 MB (actual: ${(byteSize / (1024 * 1024)).toFixed(2)} MB).`)
  }

  let text = rawContent

  // 1. Strip YAML frontmatter (e.g. --- title: ... ---)
  text = text.replace(/^---[\s\S]*?---\s*/, '')

  // 2. Strip HTML boilerplate if content contains HTML
  if (contentType === 'html' || /<[a-z][\s\S]*>/i.test(text)) {
    text = stripHtmlBoilerplate(text)
  }

  // 3. Normalize line endings (\r\n -> \n)
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // 4. Strip zero-width spaces, null bytes, and non-printable control characters (preserve \t, \n)
  // eslint-disable-next-line no-control-regex
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u200B-\u200D\uFEFF]/g, '')

  // 5. Normalize trailing spaces on lines
  text = text
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')

  // 6. Collapse excessive consecutive blank lines (3+ into 2)
  text = text.replace(/\n{3,}/g, '\n\n')

  const cleanedText = text.trim()
  const contentHash = computeContentHash(cleanedText)
  const tokenCount = estimateTokenCount(cleanedText)

  return {
    cleanedText,
    contentHash,
    tokenCount,
    byteSize,
  }
}
