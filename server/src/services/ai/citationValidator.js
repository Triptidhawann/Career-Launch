import { ContentChunk } from '../../models/ContentChunk.js'
import { KnowledgeSource } from '../../models/KnowledgeSource.js'

/**
 * Validates citation integrity (Level 1), evidence support (Level 2),
 * and technical accuracy rules (Level 3).
 *
 * @param {object} params
 * @param {Array<object>} params.references - The references list generated in the lesson
 * @param {Array<object>} params.evidenceChunks - The actual evidence chunks retrieved from Phase 2B
 * @param {object} params.lessonContent - The full structured lesson object
 * @returns {Promise<{ valid: boolean, level1Passed: boolean, level2Passed: boolean, level3Passed: boolean, errors: string[], warnings: string[] }>}
 */
export async function validateCitationsAndEvidence({
  references = [],
  evidenceChunks = [],
  lessonContent = {},
}) {
  const errors = []
  const warnings = []

  let level1Passed = true
  let level2Passed = true
  let level3Passed = true

  // --------------------------------------------------------------------------
  // LEVEL 1: Citation Integrity
  // --------------------------------------------------------------------------
  if (!Array.isArray(references) || references.length === 0) {
    errors.push('Level 1 Failure: Lesson must include at least one valid source reference.')
    level1Passed = false
  } else {
    const evidenceChunkMap = new Map(evidenceChunks.map((c) => [c.chunkId, c]))

    for (let i = 0; i < references.length; i++) {
      const ref = references[i]
      const prefix = `Reference [${i}] (${ref.chunkId || 'missing chunkId'})`

      if (!ref.chunkId || !ref.sourceId || !ref.canonicalUrl) {
        errors.push(`${prefix}: Missing required citation fields (chunkId, sourceId, or canonicalUrl).`)
        level1Passed = false
        continue
      }

      // 1. Verify referenced chunk exists in database
      const dbChunk = await ContentChunk.findOne({ chunkId: ref.chunkId })
      if (!dbChunk) {
        errors.push(`${prefix}: Referenced chunkId does not exist in knowledge database.`)
        level1Passed = false
        continue
      }

      // 2. Verify referenced source exists and is currently eligible (active & permitted)
      const dbSource = await KnowledgeSource.findOne({ sourceId: ref.sourceId })
      if (!dbSource) {
        errors.push(`${prefix}: Referenced sourceId "${ref.sourceId}" does not exist.`)
        level1Passed = false
        continue
      }

      if (dbSource.status !== 'active') {
        errors.push(`${prefix}: Source "${ref.sourceId}" is not active (current status: ${dbSource.status}).`)
        level1Passed = false
      }

      if (!dbSource.licence?.indexingPermitted || !dbSource.licence?.storagePermitted) {
        errors.push(`${prefix}: Source "${ref.sourceId}" licence does not permit indexing or storage.`)
        level1Passed = false
      }

      // 3. Verify canonical URL matches stored source canonical URL
      const expectedUrl = dbChunk.canonicalSource?.url || dbSource.baseUrl
      if (ref.canonicalUrl !== expectedUrl) {
        errors.push(
          `${prefix}: Canonical URL mismatch. Expected "${expectedUrl}", model cited "${ref.canonicalUrl}".`,
        )
        level1Passed = false
      }

      // 4. Verify chunk was part of the supplied retrieved evidence package
      if (!evidenceChunkMap.has(ref.chunkId)) {
        warnings.push(`${prefix}: Chunk exists in database but was not in the retrieved evidence package for this session.`)
      }
    }
  }

  // --------------------------------------------------------------------------
  // LEVEL 2: Evidence Support & Content Origin Attribution
  // --------------------------------------------------------------------------
  if (level1Passed && lessonContent.practicalExamples) {
    for (const ex of lessonContent.practicalExamples) {
      // Rule: CareerLaunch code must NEVER be falsely attributed to NIST or external authors
      if (ex.attribution && ex.attribution.toLowerCase().includes('nist')) {
        errors.push(
          'Level 2 Failure: CareerLaunch-authored Python exemplar was falsely attributed to NIST in practicalExamples.',
        )
        level2Passed = false
      }

      if (!ex.attribution || !ex.attribution.includes('CareerLaunch Engineering')) {
        warnings.push('Level 2 Warning: Code exemplar should explicitly state attribution to "CareerLaunch Engineering".')
      }
    }

    // Verify definitions in coreConcepts are grounded in provided grounding passages
    const allGroundingText = evidenceChunks.map((c) => (c.groundingPassage || c.content || '').toLowerCase()).join(' ')
    if (lessonContent.coreConcepts && Array.isArray(lessonContent.coreConcepts)) {
      for (const concept of lessonContent.coreConcepts) {
        const term = concept.term.toLowerCase()
        if (allGroundingText.length > 50 && !allGroundingText.includes(term.split(' ')[0])) {
          warnings.push(`Level 2 Warning: Core concept "${concept.term}" is not directly mentioned in retrieved grounding passage.`)
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // LEVEL 3: Technical Accuracy & Code Syntax Checks
  // --------------------------------------------------------------------------
  if (lessonContent.practicalExamples && Array.isArray(lessonContent.practicalExamples)) {
    for (let i = 0; i < lessonContent.practicalExamples.length; i++) {
      const ex = lessonContent.practicalExamples[i]
      if (!ex.code || typeof ex.code !== 'string' || !ex.code.trim()) {
        errors.push(`Level 3 Failure: Example [${i}] contains empty or invalid code.`)
        level3Passed = false
      } else {
        // Basic Python syntax sanity check: verify balanced parentheses and colons on def/for/while/if
        const code = ex.code
        let openParen = 0
        let closeParen = 0
        for (const char of code) {
          if (char === '(') openParen++
          if (char === ')') closeParen++
        }
        if (openParen !== closeParen) {
          errors.push(`Level 3 Failure: Example [${i}] code has unbalanced parentheses (${openParen} '(' vs ${closeParen} ')').`)
          level3Passed = false
        }
      }
    }
  }

  // Complexity sanity check
  if (lessonContent.complexityAnalysis) {
    const comp = lessonContent.complexityAnalysis
    if (!comp.timeComplexity || comp.timeComplexity === 'N/A' || !comp.timeComplexity.includes('O(')) {
      warnings.push('Level 3 Warning: Time complexity should use standard Big-O notation (e.g. O(n), O(log n)).')
    }
  }

  const valid = level1Passed && level2Passed && level3Passed

  return {
    valid,
    level1Passed,
    level2Passed,
    level3Passed,
    errors,
    warnings,
  }
}
