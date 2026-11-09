import { isOfficialFrontendTopicId } from './curriculumRegistry.js'

/**
 * Strict Schema Validator for Personalised Preparation Plans
 *
 * Ensures all AI-synthesized plans conform to domain invariants,
 * official topic registries, valid difficulty and priority tiers,
 * and realistic scheduling constraints before persisting to MongoDB.
 */

const ALLOWED_DIFFICULTIES = ['beginner', 'intermediate', 'advanced']
const ALLOWED_PRIORITIES = ['high', 'medium', 'low']
const ALLOWED_SOURCES = ['curriculum', 'student_custom']
const ALLOWED_SUPPORT_STATUSES = ['verified', 'roadmap_topic', 'source_review_required']
const ALLOWED_DIAGNOSTIC_STATUSES = ['completed', 'partial', 'skipped']

export function validatePreparationPlan(plan) {
  const errors = []

  if (!plan || typeof plan !== 'object') {
    return { isValid: false, errors: ['Plan must be a valid non-null object.'] }
  }

  // 1. Overview Validation
  if (!plan.overview || typeof plan.overview !== 'object') {
    errors.push('overview is missing or not an object.')
  } else {
    const ov = plan.overview
    if (!ov.roleTitle || typeof ov.roleTitle !== 'string') errors.push('overview.roleTitle is required.')
    if (!ov.goalPrompt || typeof ov.goalPrompt !== 'string') errors.push('overview.goalPrompt is required.')
    if (!ov.summary || typeof ov.summary !== 'string') errors.push('overview.summary is required.')
    if (!ALLOWED_DIFFICULTIES.includes(ov.startingLevel)) {
      errors.push(`overview.startingLevel must be one of: [${ALLOWED_DIFFICULTIES.join(', ')}].`)
    }
    if (!ov.recommendedDuration || typeof ov.recommendedDuration !== 'string') {
      errors.push('overview.recommendedDuration is required.')
    }
    if (!ov.suggestedWeeklyEffort || typeof ov.suggestedWeeklyEffort !== 'string') {
      errors.push('overview.suggestedWeeklyEffort is required.')
    }
  }

  // 2. Knowledge Assessment Validation
  if (!plan.knowledgeAssessment || typeof plan.knowledgeAssessment !== 'object') {
    errors.push('knowledgeAssessment is missing or not an object.')
  } else {
    const ka = plan.knowledgeAssessment
    if (!ALLOWED_DIAGNOSTIC_STATUSES.includes(ka.diagnosticStatus)) {
      errors.push(`knowledgeAssessment.diagnosticStatus must be one of: [${ALLOWED_DIAGNOSTIC_STATUSES.join(', ')}].`)
    }
    if (!Array.isArray(ka.studentReportedKnowledge)) errors.push('knowledgeAssessment.studentReportedKnowledge must be an array.')
    if (!Array.isArray(ka.demonstratedStrengths)) errors.push('knowledgeAssessment.demonstratedStrengths must be an array.')
    if (!Array.isArray(ka.demonstratedGaps)) errors.push('knowledgeAssessment.demonstratedGaps must be an array.')
    if (!Array.isArray(ka.unassessedTopics)) errors.push('knowledgeAssessment.unassessedTopics must be an array.')
  }

  // 3. Milestones Validation
  if (!Array.isArray(plan.milestones) || plan.milestones.length < 3) {
    errors.push('milestones must be an array with at least 3 milestones.')
  } else {
    const seenMilestoneIds = new Set()
    plan.milestones.forEach((m, idx) => {
      const prefix = `milestones[${idx}]`
      if (!m.milestoneId || typeof m.milestoneId !== 'string') {
        errors.push(`${prefix}.milestoneId is required.`)
      } else if (seenMilestoneIds.has(m.milestoneId)) {
        errors.push(`${prefix}.milestoneId '${m.milestoneId}' is duplicated.`)
      } else {
        seenMilestoneIds.add(m.milestoneId)
      }

      if (!m.title || typeof m.title !== 'string') errors.push(`${prefix}.title is required.`)

      if (!ALLOWED_SOURCES.includes(m.topicSource)) {
        errors.push(`${prefix}.topicSource must be one of: [${ALLOWED_SOURCES.join(', ')}].`)
      }

      // Check official topic ID validity
      if (m.topicSource === 'curriculum') {
        if (!m.officialTopicId) {
          errors.push(`${prefix}.officialTopicId is required for curriculum topics.`)
        } else if (!isOfficialFrontendTopicId(m.officialTopicId)) {
          errors.push(`${prefix}.officialTopicId '${m.officialTopicId}' is not an authorized official curriculum topic ID.`)
        }
      } else if (m.topicSource === 'student_custom') {
        // Custom topics should have null officialTopicId or null
        if (m.officialTopicId && isOfficialFrontendTopicId(m.officialTopicId)) {
          // If it matches an official ID, topicSource should have been curriculum
        }
      }

      if (!ALLOWED_DIFFICULTIES.includes(m.difficulty)) {
        errors.push(`${prefix}.difficulty must be one of: [${ALLOWED_DIFFICULTIES.join(', ')}].`)
      }

      if (!ALLOWED_PRIORITIES.includes(m.priority)) {
        errors.push(`${prefix}.priority must be one of: [${ALLOWED_PRIORITIES.join(', ')}].`)
      }

      if (!m.reasonForRecommendation || typeof m.reasonForRecommendation !== 'string') {
        errors.push(`${prefix}.reasonForRecommendation is required.`)
      }

      if (!Array.isArray(m.learningObjectives) || m.learningObjectives.length === 0) {
        errors.push(`${prefix}.learningObjectives must contain at least 1 objective.`)
      }

      const hours = Number(m.estimatedHours)
      if (isNaN(hours) || hours <= 0) {
        errors.push(`${prefix}.estimatedHours must be a positive number.`)
      }

      if (!ALLOWED_SUPPORT_STATUSES.includes(m.knowledgeSupportStatus)) {
        errors.push(`${prefix}.knowledgeSupportStatus must be one of: [${ALLOWED_SUPPORT_STATUSES.join(', ')}].`)
      }
    })
  }

  // 4. Weekly Schedule Validation
  if (!Array.isArray(plan.weeklySchedule) || plan.weeklySchedule.length === 0) {
    errors.push('weeklySchedule must be a non-empty array.')
  } else {
    plan.weeklySchedule.forEach((w, idx) => {
      const prefix = `weeklySchedule[${idx}]`
      if (typeof w.weekNumber !== 'number') errors.push(`${prefix}.weekNumber is required.`)
      if (!w.focus || typeof w.focus !== 'string') errors.push(`${prefix}.focus is required.`)
      if (!Array.isArray(w.milestoneIds)) errors.push(`${prefix}.milestoneIds must be an array.`)
      if (typeof w.estimatedHours !== 'number' || w.estimatedHours <= 0) {
        errors.push(`${prefix}.estimatedHours must be a positive number.`)
      }
    })
  }

  // 5. Practice Recommendations Validation
  if (!plan.practiceRecommendations || typeof plan.practiceRecommendations !== 'object') {
    errors.push('practiceRecommendations is missing or not an object.')
  } else {
    const pr = plan.practiceRecommendations
    if (!Array.isArray(pr.mcqs)) errors.push('practiceRecommendations.mcqs must be an array.')
    if (!Array.isArray(pr.writtenQuestions)) errors.push('practiceRecommendations.writtenQuestions must be an array.')
    if (!Array.isArray(pr.codingExercises)) errors.push('practiceRecommendations.codingExercises must be an array.')
    if (!Array.isArray(pr.debuggingExercises)) errors.push('practiceRecommendations.debuggingExercises must be an array.')
    if (!Array.isArray(pr.interviewQuestions)) errors.push('practiceRecommendations.interviewQuestions must be an array.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
