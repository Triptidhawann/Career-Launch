import { FRONTEND_DIAGNOSTIC_BANK } from './diagnosticBank.js'

/**
 * Adaptive Diagnostic Engine for CareerLaunch
 *
 * Implements deterministic objective evaluation, structured rubric scoring,
 * dynamic difficulty adaptation based on candidate performance, and
 * outcome synthesis (strengths, gaps, and unassessed topics).
 */

const ALL_FRONTEND_DOMAINS = [
  'html_accessibility',
  'css_responsive',
  'javascript_core',
  'dom_async',
  'react_fundamentals',
  'react_hooks',
  'state_management',
  'performance_debugging',
]

/**
 * Strips confidential answer fields before sending question object to client.
 */
export function sanitizeQuestionForClient(question) {
  if (!question) return null
  return {
    questionId: question.questionId,
    domain: question.domain,
    topicId: question.topicId,
    topicTitle: question.topicTitle,
    difficulty: question.difficulty,
    type: question.type,
    prompt: question.prompt,
    options: question.options || [],
    hasRubric: Boolean(question.rubric),
    rubricCriteria: question.rubric?.criteria || [],
  }
}

/**
 * Initializes a new adaptive diagnostic session.
 */
export function initializeDiagnosticQuestions({ session, maxQuestions = 6 }) {
  const goalText = (session.goalPrompt || '').toLowerCase()
  const startingLevel = session.experienceLevel || 'intermediate'

  // Determine domain priority based on student's goal prompt and selected topics
  const prioritizedDomains = []
  if (goalText.includes('react') || goalText.includes('hook') || goalText.includes('component')) {
    prioritizedDomains.push('react_fundamentals', 'react_hooks')
  }
  if (goalText.includes('state') || goalText.includes('redux') || goalText.includes('context')) {
    prioritizedDomains.push('state_management')
  }
  if (goalText.includes('css') || goalText.includes('flexbox') || goalText.includes('responsive')) {
    prioritizedDomains.push('css_responsive')
  }
  if (goalText.includes('perf') || goalText.includes('vitals') || goalText.includes('optimi')) {
    prioritizedDomains.push('performance_debugging')
  }
  if (goalText.includes('js') || goalText.includes('javascript') || goalText.includes('async')) {
    prioritizedDomains.push('javascript_core', 'dom_async')
  }
  if (goalText.includes('html') || goalText.includes('accessib') || goalText.includes('aria')) {
    prioritizedDomains.push('html_accessibility')
  }

  // Append remaining domains
  for (const d of ALL_FRONTEND_DOMAINS) {
    if (!prioritizedDomains.includes(d)) {
      prioritizedDomains.push(d)
    }
  }

  // Pick first question aligned with starting experience level
  const initialDomain = prioritizedDomains[0] || 'html_accessibility'
  const firstQuestion =
    FRONTEND_DIAGNOSTIC_BANK.find(
      (q) => q.domain === initialDomain && q.difficulty === startingLevel,
    ) ||
    FRONTEND_DIAGNOSTIC_BANK.find((q) => q.domain === initialDomain) ||
    FRONTEND_DIAGNOSTIC_BANK[0]

  return {
    initialQuestion: { ...firstQuestion },
    maxQuestions: Math.min(Math.max(maxQuestions, 5), 8),
  }
}

/**
 * Evaluates a candidate's answer deterministically (MCQ) or via structured rubric (Written).
 */
export function evaluateAnswer({ question, studentAnswer, isSkipped }) {
  if (isSkipped) {
    return {
      isCorrect: false,
      score: 0,
      feedback: 'Question skipped by candidate.',
      explanation: question.explanation || '',
    }
  }

  // 1. Objective Question (MCQ) - Deterministic evaluation
  if (question.type === 'objective') {
    const parsedOption = Number(studentAnswer)
    const isCorrect = !isNaN(parsedOption) && parsedOption === question.correctOptionIndex
    const score = isCorrect ? 1.0 : 0.0

    const feedback = isCorrect
      ? `Correct! ${question.explanation}`
      : `Incorrect. The correct answer was option ${question.correctOptionIndex + 1}: "${question.options[question.correctOptionIndex]}". ${question.explanation}`

    return {
      isCorrect,
      score,
      feedback,
      explanation: question.explanation || '',
    }
  }

  // 2. Written Question - Structured Rubric Evaluation
  if (question.type === 'written') {
    const text = String(studentAnswer || '').trim().toLowerCase()
    if (text.length < 15) {
      return {
        isCorrect: false,
        score: 0.1,
        feedback: 'Response was too brief to verify technical comprehension. Expected a detailed conceptual explanation.',
        explanation: question.explanation || '',
      }
    }

    const requiredKeywords = question.rubric?.requiredKeywords || []
    let matchedKeywords = 0
    for (const kw of requiredKeywords) {
      if (text.includes(kw.toLowerCase())) {
        matchedKeywords++
      }
    }

    const keywordRatio = requiredKeywords.length > 0 ? matchedKeywords / requiredKeywords.length : 1.0
    const lengthScore = Math.min(text.length / 120, 1.0)
    const totalScore = Number((keywordRatio * 0.7 + lengthScore * 0.3).toFixed(2))
    const isCorrect = totalScore >= 0.55

    let feedback = ''
    if (isCorrect) {
      feedback = `Strong technical answer! Your explanation accurately addresses the core principles (${matchedKeywords}/${requiredKeywords.length} key concepts identified). ${question.explanation}`
    } else {
      feedback = `Partial or incomplete explanation (${matchedKeywords}/${requiredKeywords.length} key concepts covered). Recommended focus area: ${question.explanation}`
    }

    return {
      isCorrect,
      score: totalScore,
      feedback,
      explanation: question.explanation || '',
    }
  }

  return {
    isCorrect: false,
    score: 0,
    feedback: 'Unsupported question type.',
    explanation: '',
  }
}

/**
 * Dynamically selects the next adaptive question based on candidate performance.
 */
export function selectNextAdaptiveQuestion({ answeredQuestions, maxQuestions = 6 }) {
  if (answeredQuestions.length >= maxQuestions) {
    return null
  }

  const lastAttempt = answeredQuestions[answeredQuestions.length - 1]
  const lastWasSuccessful = Boolean(lastAttempt?.isCorrect && (lastAttempt?.score ?? 0) >= 0.6)

  // Target difficulty progression:
  // If last correct: beginner -> intermediate -> advanced
  // If last incorrect or skipped: advanced -> intermediate -> beginner
  let targetDifficulty = 'intermediate'
  if (lastAttempt) {
    if (lastWasSuccessful) {
      if (lastAttempt.difficulty === 'beginner') targetDifficulty = 'intermediate'
      else if (lastAttempt.difficulty === 'intermediate') targetDifficulty = 'advanced'
      else targetDifficulty = 'advanced'
    } else {
      if (lastAttempt.difficulty === 'advanced') targetDifficulty = 'intermediate'
      else if (lastAttempt.difficulty === 'intermediate') targetDifficulty = 'beginner'
      else targetDifficulty = 'beginner'
    }
  }

  // Identify domains already tested
  const testedDomains = new Set(answeredQuestions.map((q) => q.domain))
  const answeredIds = new Set(answeredQuestions.map((q) => q.questionId))

  // Find candidate questions from untested domains matching target difficulty
  let candidates = FRONTEND_DIAGNOSTIC_BANK.filter(
    (q) => !answeredIds.has(q.questionId) && !testedDomains.has(q.domain) && q.difficulty === targetDifficulty,
  )

  // If no candidates match exact target difficulty in untested domains, relax difficulty requirement
  if (candidates.length === 0) {
    candidates = FRONTEND_DIAGNOSTIC_BANK.filter(
      (q) => !answeredIds.has(q.questionId) && !testedDomains.has(q.domain),
    )
  }

  // If all domains were tested, pick from any untested question
  if (candidates.length === 0) {
    candidates = FRONTEND_DIAGNOSTIC_BANK.filter((q) => !answeredIds.has(q.questionId))
  }

  if (candidates.length === 0) {
    return null // Out of questions
  }

  return { ...candidates[0] }
}

/**
 * Compiles final diagnostic outcomes: demonstrated strengths, gaps, and unassessed areas.
 */
export function compileDiagnosticOutcomes({ questions, allCurriculumTopics = [], wasSkipped = false }) {
  if (wasSkipped || !Array.isArray(questions) || questions.length === 0) {
    return {
      status: 'skipped',
      demonstratedStrengths: [],
      demonstratedGaps: [],
      unassessedTopics: allCurriculumTopics.map((t) => t.title || t.topicId || t),
      diagnosticScore: 0,
    }
  }

  const strengthsSet = new Set()
  const gapsSet = new Set()
  const assessedTopicIds = new Set()

  let totalScore = 0
  let evaluatedCount = 0

  for (const q of questions) {
    if (q.topicId) assessedTopicIds.add(q.topicId)

    if (q.isSkipped) {
      // Skipped questions count as gaps or unverified
      gapsSet.add(`${q.topicTitle} (${q.domain.replace('_', ' ')}) [Skipped]`)
    } else if (q.isCorrect && (q.score ?? 0) >= 0.6) {
      strengthsSet.add(`${q.topicTitle} (${q.domain.replace('_', ' ')})`)
      totalScore += q.score ?? 1
      evaluatedCount++
    } else {
      gapsSet.add(`${q.topicTitle} (${q.domain.replace('_', ' ')})`)
      totalScore += q.score ?? 0
      evaluatedCount++
    }
  }

  // Calculate unassessed curriculum topics
  const unassessedTopics = allCurriculumTopics
    .filter((ct) => !assessedTopicIds.has(ct.topicId))
    .map((ct) => ct.title)

  const finalScore = evaluatedCount > 0 ? Math.round((totalScore / questions.length) * 100) : 0

  return {
    status: evaluatedCount === questions.length ? 'completed' : 'partial',
    demonstratedStrengths: Array.from(strengthsSet),
    demonstratedGaps: Array.from(gapsSet),
    unassessedTopics,
    diagnosticScore: finalScore,
  }
}
