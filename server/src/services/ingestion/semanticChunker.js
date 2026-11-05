import { computeContentHash, estimateTokenCount } from './markdownCleaner.js'

/**
 * Maximum chunks allowed per single document as required by security specifications.
 */
export const MAX_CHUNKS_PER_DOCUMENT = 200

/**
 * Target token boundaries for semantic retrieval chunks.
 */
export const TARGET_MIN_TOKENS = 250
export const TARGET_MAX_TOKENS = 500
export const OVERLAP_TOKENS = 40

/**
 * Splits document text by markdown headings and structural paragraphs while keeping
 * fenced code blocks (` ```...``` `) intact.
 *
 * @param {string} text
 * @returns {Array<{ heading: string, text: string }>}
 */
function splitByHeadingsAndCodeBlocks(text) {
  const lines = text.split('\n')
  const sections = []

  let currentHeading = 'Overview'
  let currentLines = []
  let inCodeBlock = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      currentLines.push(line)
      continue
    }

    // Only recognize headings when outside code blocks
    if (!inCodeBlock && /^#{1,4}\s+(.+)$/.test(line)) {
      if (currentLines.length > 0) {
        sections.push({
          heading: currentHeading,
          text: currentLines.join('\n').trim(),
        })
        currentLines = []
      }
      currentHeading = line.replace(/^#{1,4}\s+/, '').trim()
    } else {
      currentLines.push(line)
    }
  }

  if (currentLines.length > 0) {
    sections.push({
      heading: currentHeading,
      text: currentLines.join('\n').trim(),
    })
  }

  return sections.filter((s) => s.text.length > 0)
}

/**
 * Divides a cleaned document into meaningful, coherent chunks adhering to token limits.
 * Attaches explicit provenance and content-origin metadata to maintain absolute clarity
 * on canonical source quotes vs original pedagogical implementations.
 *
 * @param {object} params
 * @param {string} params.docId
 * @param {string} params.sourceId
 * @param {string} params.sourceSnapshotHash
 * @param {string} params.cleanedText
 * @param {string[]} [params.roleTags]
 * @param {string[]} [params.topicTags]
 * @param {'beginner' | 'intermediate' | 'advanced'} [params.difficultyTier]
 * @param {string} [params.documentVersion]
 * @param {'canonical_source' | 'careerlaunch_authored' | 'hybrid_pedagogical'} [params.contentOrigin]
 * @param {object} [params.canonicalSource]
 * @param {string} [params.groundingPassage]
 * @param {object} [params.codeExemplar]
 * @param {Array<object>} [params.crossReferences]
 * @returns {Array<object>} Array of ContentChunk specifications
 */
export function chunkDocument({
  docId,
  sourceId,
  sourceSnapshotHash,
  cleanedText,
  roleTags = [],
  topicTags = [],
  difficultyTier = 'intermediate',
  documentVersion = '1.0',
  contentOrigin = 'canonical_source',
  canonicalSource = {},
  groundingPassage = '',
  codeExemplar = {},
  crossReferences = [],
}) {
  if (!cleanedText || !cleanedText.trim()) {
    return []
  }

  const rawSections = splitByHeadingsAndCodeBlocks(cleanedText)
  const chunks = []

  let pendingBuffer = ''
  let pendingHeading = ''

  const flushBuffer = () => {
    if (!pendingBuffer.trim()) return

    const chunkText = pendingBuffer.trim()
    const tokenCount = estimateTokenCount(chunkText)

    if (tokenCount > 0) {
      chunks.push({
        heading: pendingHeading || 'General',
        content: chunkText,
        tokenCount,
      })
    }

    pendingBuffer = ''
    pendingHeading = ''
  }

  for (const section of rawSections) {
    const sectionTokens = estimateTokenCount(section.text)

    // If section fits within target limits, merge or add
    if (sectionTokens < TARGET_MAX_TOKENS) {
      const mergedTokens = estimateTokenCount(pendingBuffer + '\n\n' + section.text)

      if (pendingBuffer && mergedTokens <= TARGET_MAX_TOKENS) {
        pendingBuffer += `\n\n### ${section.heading}\n${section.text}`
      } else {
        flushBuffer()
        pendingHeading = section.heading
        pendingBuffer = `### ${section.heading}\n${section.text}`
      }
    } else {
      // Large section: flush current buffer first
      flushBuffer()

      // Split large section by paragraphs while preserving code blocks
      const paragraphs = section.text.split(/\n{2,}/)
      let subBuffer = `### ${section.heading}\n`

      for (const p of paragraphs) {
        const nextBufferTokens = estimateTokenCount(subBuffer + '\n\n' + p)

        if (nextBufferTokens > TARGET_MAX_TOKENS && subBuffer.length > 50) {
          chunks.push({
            heading: section.heading,
            content: subBuffer.trim(),
            tokenCount: estimateTokenCount(subBuffer.trim()),
          })
          // Keep a short paragraph overlap if not a code block
          const overlap = p.startsWith('```') ? '' : p.substring(0, 200) + '...\n'
          subBuffer = `### ${section.heading} (cont.)\n${overlap}${p}`
        } else {
          subBuffer += `\n\n${p}`
        }
      }

      if (subBuffer.trim()) {
        chunks.push({
          heading: section.heading,
          content: subBuffer.trim(),
          tokenCount: estimateTokenCount(subBuffer.trim()),
        })
      }
    }
  }

  flushBuffer()

  // Enforce security ceiling: max 200 chunks per document
  if (chunks.length > MAX_CHUNKS_PER_DOCUMENT) {
    chunks.length = MAX_CHUNKS_PER_DOCUMENT
  }

  // Format into final ContentChunk specifications with full provenance
  return chunks.map((c, index) => {
    const chunkId = `${docId}_chk_${String(index + 1).padStart(3, '0')}`
    const contentHash = computeContentHash(c.content)

    return {
      chunkId,
      docId,
      sourceId,
      sourceSnapshotHash,
      roleTags,
      topicTags,
      difficultyTier,
      content: c.content,
      tokenCount: c.tokenCount,
      contentHash,
      documentVersion,
      contentOrigin,
      canonicalSource: {
        name: canonicalSource.name || sourceId,
        url: canonicalSource.url || '',
        passage: canonicalSource.passage || '',
      },
      groundingPassage: groundingPassage || c.content,
      codeExemplar: {
        author: codeExemplar.author || 'CareerLaunch Engineering',
        language: codeExemplar.language || 'python',
        code: codeExemplar.code || '',
        notes: codeExemplar.notes || '',
      },
      crossReferences,
      embedding: {
        vector: [],
        provider: '',
        model: '',
        dimensions: 0,
        contentHash: '',
        status: 'pending',
      },
    }
  })
}
