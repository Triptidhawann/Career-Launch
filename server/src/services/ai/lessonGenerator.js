import { retrieveKnowledge } from '../retrieval/hybridRetriever.js'
import { getAIProvider } from './groqProvider.js'
import { SYSTEM_PROMPT, AI_CONFIG } from './aiConfig.js'
import { validateLessonStructure } from './lessonValidator.js'
import { GeneratedLesson } from '../../models/GeneratedLesson.js'

// In-flight generation locks to prevent duplicate concurrent generation on the same topic
const activeGenerations = new Set()

/**
 * Supported Software Engineer Pilot Topics
 */
export const SUPPORTED_PILOT_TOPICS = {
  'swe-top-1': {
    title: 'Arrays and Two-Pointer Scanning Mechanics',
    defaultDifficulty: 'beginner',
    roleId: 'software-engineer',
  },
  'swe-top-4': {
    title: 'Binary Search Mechanics and Interval Bisection',
    defaultDifficulty: 'beginner',
    roleId: 'software-engineer',
  },
  'swe-top-7': {
    title: 'Binary Search Trees, Invariants and Balancing',
    defaultDifficulty: 'intermediate',
    roleId: 'software-engineer',
  },
  'swe-top-9': {
    title: 'Graph Traversals: BFS, DFS and Cycle Detection',
    defaultDifficulty: 'intermediate',
    roleId: 'software-engineer',
  },
  'swe-top-13': {
    title: 'Dynamic Programming: Optimal Substructure and Memoization',
    defaultDifficulty: 'advanced',
    roleId: 'software-engineer',
  },
}

/**
 * Builds a bounded evidence package text from Phase 2B hybrid retrieval results.
 *
 * @param {Array<object>} results
 * @returns {string} Formatted evidence context
 */
function constructEvidencePackage(results) {
  if (!results || results.length === 0) {
    return 'NO CANONICAL SOURCE EVIDENCE AVAILABLE. State limitation explicitly.'
  }

  const sections = results.map((r, i) => {
    let exemplarText = 'None'
    if (r.codeExemplar && r.codeExemplar.code) {
      exemplarText = `[Author: ${r.codeExemplar.author || 'CareerLaunch Engineering'}] (${r.codeExemplar.language || 'python'})\n${r.codeExemplar.code}\nNotes: ${r.codeExemplar.notes || ''}`
    }

    return `--- EVIDENCE ITEM ${i + 1} ---
Chunk ID: ${r.chunkId}
Document ID: ${r.documentId}
Source ID: ${r.sourceId}
Source Title: ${r.sourceTitle}
Canonical Source URL: ${r.canonicalSourceUrl}
Source Snapshot Hash: ${r.sourceSnapshotHash}
Content Origin: ${r.contentOrigin}
Difficulty: ${r.difficultyTier}
Grounding Passage:
${r.groundingPassage || r.content}

CareerLaunch-Authored Code Exemplar:
${exemplarText}

Cross-References:
${r.crossReferences?.map((c) => `${c.name}: ${c.url}`).join('\n') || 'None'}
`
  })

  return sections.join('\n\n')
}

/**
 * Orchestrates full AI lesson generation for a pilot topic.
 *
 * @param {object} params
 * @param {string} params.topicId
 * @param {string} [params.roleId='software-engineer']
 * @param {'beginner' | 'intermediate' | 'advanced'} [params.difficulty]
 * @param {boolean} [params.forceRegenerate=false]
 * @param {string} [params.providerId]
 * @returns {Promise<{ success: boolean, lesson?: object, fromCache?: boolean, validation?: object, error?: string }>}
 */
export async function generateCanonicalLesson({
  topicId,
  roleId = 'software-engineer',
  difficulty,
  forceRegenerate = false,
  providerId,
}) {
  // 1. Validate topic is part of the approved pilot
  const pilotConfig = SUPPORTED_PILOT_TOPICS[topicId]
  if (!pilotConfig) {
    throw new Error(
      `Unsupported topicId: "${topicId}". Phase 3 pilot supports only: [${Object.keys(SUPPORTED_PILOT_TOPICS).join(', ')}].`,
    )
  }

  const resolvedDifficulty = difficulty || pilotConfig.defaultDifficulty
  const lockKey = `${roleId}_${topicId}_${resolvedDifficulty}`

  // 2. Prevent concurrent duplicate generation for the same topic
  if (activeGenerations.has(lockKey)) {
    throw new Error(`Lesson generation for ${topicId} (${resolvedDifficulty}) is already in progress. Duplicate request rejected.`)
  }

  activeGenerations.add(lockKey)

  try {
    const lessonId = `lesson_${roleId}_${topicId}_${resolvedDifficulty}`

    // 3. Check for existing valid, non-stale cached lesson
    const existingLesson = await GeneratedLesson.findOne({
      lessonId,
      isStale: false,
      validationStatus: 'passed',
    })

    if (existingLesson && !forceRegenerate) {
      return {
        success: true,
        fromCache: true,
        lesson: existingLesson.toObject(),
      }
    }

    // 4. Retrieve evidence using Phase 2B Hybrid Retrieval
    const retrieval = await retrieveKnowledge({
      query: pilotConfig.title,
      roleId,
      topicId,
      difficultyTier: resolvedDifficulty,
      mode: 'hybrid',
      limit: AI_CONFIG.limits.maxEvidenceChunks,
    })

    if (retrieval.results.length === 0) {
      throw new Error(`Insufficient retrieval evidence for topic "${topicId}". No eligible active sources found.`)
    }

    const evidenceText = constructEvidencePackage(retrieval.results)

    // 5. Build User Prompt
    const userPrompt = `Generate a comprehensive, structured technical lesson for:
Role: ${roleId}
Topic ID: ${topicId}
Topic Title: ${pilotConfig.title}
Difficulty: ${resolvedDifficulty}

RETRIEVED CANONICAL SOURCE EVIDENCE:
${evidenceText}

Ensure every factual definition, algorithmic property, and complexity claim is grounded in the above evidence.
Attribute code exemplars to "CareerLaunch Engineering". Never attribute CareerLaunch code to NIST.
Cite the exact chunk IDs in the "references" array.`

    // 6. Invoke AI Provider (Groq / MockGroq)
    const provider = getAIProvider(providerId)
    const aiResponse = await provider.generateLesson({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
    })

    // 7. Validate Lesson Structure & Citation Integrity (Level 1, 2, 3)
    const validation = await validateLessonStructure({
      lessonContent: aiResponse.content,
      evidenceChunks: retrieval.results,
    })

    if (!validation.valid) {
      // Record failure without overwriting previously working lesson if present
      console.warn(`[LessonGenerator] Validation failed for lesson ${lessonId}:`, validation.errors)
      return {
        success: false,
        error: `Generated lesson failed strict validation: ${validation.errors.join('; ')}`,
        validation,
      }
    }

    // 8. Atomic Upsert of Validated Canonical Lesson
    const lessonData = {
      lessonId,
      roleId,
      topicId,
      difficulty: resolvedDifficulty,
      title: aiResponse.content.title || pilotConfig.title,
      estimatedMinutes: aiResponse.content.estimatedMinutes || 15,
      learningObjectives: aiResponse.content.learningObjectives || [],
      content: aiResponse.content,
      citationReferences: (aiResponse.content.references || []).map((r) => r.chunkId),
      sourceSnapshotHashes: retrieval.results.map((r) => r.sourceSnapshotHash),
      retrievedChunkIds: retrieval.results.map((r) => r.chunkId),
      aiProvider: provider.providerId,
      aiModel: provider.modelId,
      promptVersion: AI_CONFIG.promptVersion,
      contentVersion: AI_CONFIG.contentVersion,
      generationTimestamp: new Date(),
      validationStatus: 'passed',
      validationDetails: {
        integrityPassed: validation.citationValidation.level1Passed,
        evidenceSupportPassed: validation.citationValidation.level2Passed,
        technicalAccuracyPassed: validation.citationValidation.level3Passed,
        errors: validation.errors,
        warnings: validation.warnings,
      },
      generationStatus: 'completed',
      tokenUsage: aiResponse.tokenUsage,
      generationDurationMs: aiResponse.durationMs,
      isStale: false,
      staleReason: '',
      lastError: '',
    }

    const savedLesson = await GeneratedLesson.findOneAndUpdate(
      { lessonId },
      lessonData,
      { upsert: true, new: true, runValidators: true },
    )

    return {
      success: true,
      fromCache: false,
      lesson: savedLesson.toObject(),
      validation,
    }
  } finally {
    activeGenerations.delete(lockKey)
  }
}
