import { validateCitationsAndEvidence } from './citationValidator.js'

/**
 * Validates a generated lesson structure against application constraints,
 * schema completeness, non-emptiness, and citation integrity.
 *
 * @param {object} params
 * @param {object} params.lessonContent - The parsed JSON object produced by AI
 * @param {Array<object>} params.evidenceChunks - The retrieved evidence chunks used as context
 * @returns {Promise<{ valid: boolean, errors: string[], warnings: string[], citationValidation: object }>}
 */
export async function validateLessonStructure({ lessonContent, evidenceChunks = [] }) {
  const errors = []
  const warnings = []

  if (!lessonContent || typeof lessonContent !== 'object') {
    return {
      valid: false,
      errors: ['Lesson content must be a valid non-null object.'],
      warnings: [],
      citationValidation: { valid: false, errors: ['No content provided to validate citations.'] },
    }
  }

  // 1. Validate Required Metadata
  if (!lessonContent.title || typeof lessonContent.title !== 'string' || !lessonContent.title.trim()) {
    errors.push('Missing or empty "title".')
  }

  const validDifficulties = ['beginner', 'intermediate', 'advanced']
  if (!validDifficulties.includes(lessonContent.difficulty)) {
    errors.push(`Invalid "difficulty": "${lessonContent.difficulty}". Expected one of: [${validDifficulties.join(', ')}].`)
  }

  if (typeof lessonContent.estimatedMinutes !== 'number' || lessonContent.estimatedMinutes <= 0) {
    errors.push('"estimatedMinutes" must be a positive number.')
  }

  if (!Array.isArray(lessonContent.learningObjectives) || lessonContent.learningObjectives.length < 2) {
    errors.push('"learningObjectives" must be an array containing at least 2 objectives.')
  }

  // 2. Validate Introduction Section
  if (!lessonContent.introduction || typeof lessonContent.introduction !== 'object') {
    errors.push('Missing required "introduction" section.')
  } else {
    const { meaning, whyItMatters, realWorldUse } = lessonContent.introduction
    if (!meaning || !meaning.trim()) errors.push('introduction.meaning cannot be empty.')
    if (!whyItMatters || !whyItMatters.trim()) errors.push('introduction.whyItMatters cannot be empty.')
    if (!realWorldUse || !realWorldUse.trim()) errors.push('introduction.realWorldUse cannot be empty.')
  }

  // 3. Validate Core Concepts Section
  if (!Array.isArray(lessonContent.coreConcepts) || lessonContent.coreConcepts.length === 0) {
    errors.push('"coreConcepts" must be a non-empty array.')
  } else {
    for (let i = 0; i < lessonContent.coreConcepts.length; i++) {
      const c = lessonContent.coreConcepts[i]
      if (!c.term || !c.term.trim()) errors.push(`coreConcepts[${i}].term cannot be empty.`)
      if (!c.definition || !c.definition.trim()) errors.push(`coreConcepts[${i}].definition cannot be empty.`)
    }
  }

  // 4. Validate Step-by-Step Section
  if (!Array.isArray(lessonContent.stepByStep) || lessonContent.stepByStep.length === 0) {
    errors.push('"stepByStep" must be a non-empty array.')
  } else {
    for (let i = 0; i < lessonContent.stepByStep.length; i++) {
      const s = lessonContent.stepByStep[i]
      if (typeof s.stepNumber !== 'number') errors.push(`stepByStep[${i}].stepNumber must be a number.`)
      if (!s.heading || !s.heading.trim()) errors.push(`stepByStep[${i}].heading cannot be empty.`)
      if (!s.explanation || !s.explanation.trim()) errors.push(`stepByStep[${i}].explanation cannot be empty.`)
    }
  }

  // 5. Validate Practical Examples Section
  if (!Array.isArray(lessonContent.practicalExamples) || lessonContent.practicalExamples.length === 0) {
    errors.push('"practicalExamples" must be a non-empty array.')
  } else {
    for (let i = 0; i < lessonContent.practicalExamples.length; i++) {
      const ex = lessonContent.practicalExamples[i]
      if (!ex.title || !ex.title.trim()) errors.push(`practicalExamples[${i}].title cannot be empty.`)
      if (!ex.code || !ex.code.trim()) errors.push(`practicalExamples[${i}].code cannot be empty.`)
      if (!ex.attribution || !ex.attribution.trim()) {
        errors.push(`practicalExamples[${i}].attribution must explicitly state authorship attribution.`)
      }
    }
  }

  // 6. Validate Complexity Analysis Section
  if (!lessonContent.complexityAnalysis || typeof lessonContent.complexityAnalysis !== 'object') {
    errors.push('Missing required "complexityAnalysis" section.')
  }

  // 7. Validate Common Mistakes Section
  if (!Array.isArray(lessonContent.commonMistakes) || lessonContent.commonMistakes.length === 0) {
    errors.push('"commonMistakes" must be a non-empty array.')
  }

  // 8. Validate Interview Insights Section
  if (!lessonContent.interviewInsights || typeof lessonContent.interviewInsights !== 'object') {
    errors.push('Missing required "interviewInsights" section.')
  }

  // 9. Validate Summary Section
  if (!Array.isArray(lessonContent.summary) || lessonContent.summary.length === 0) {
    errors.push('"summary" must be a non-empty array.')
  }

  // 10. Run Citation & Evidence Validation (Levels 1, 2, 3)
  const citationValidation = await validateCitationsAndEvidence({
    references: lessonContent.references || [],
    evidenceChunks,
    lessonContent,
  })

  if (!citationValidation.valid) {
    errors.push(...citationValidation.errors)
  }
  if (citationValidation.warnings?.length > 0) {
    warnings.push(...citationValidation.warnings)
  }

  const valid = errors.length === 0 && citationValidation.valid

  return {
    valid,
    errors,
    warnings,
    citationValidation,
  }
}
