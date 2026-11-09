import { GroqProvider } from './groqProvider.js'
import { AI_CONFIG } from './aiConfig.js'
import {
  OFFICIAL_FRONTEND_TOPICS,
  isOfficialFrontendTopicId,
  checkTopicKnowledgeSupport,
} from './curriculumRegistry.js'
import { validatePreparationPlan } from './planValidator.js'

/**
 * AI Personalised Preparation Plan Generator
 *
 * Utilizes Groq model `openai/gpt-oss-120b` to synthesize tailored,
 * curriculum-grounded learning itineraries based on student goals,
 * adaptive diagnostic findings, official curriculum standards, and
 * custom topic verification flags.
 */

const TIMELINE_DURATION_MAP = {
  '1_week': '1-2 Weeks Intensive',
  '2_4_weeks': '3-4 Weeks Structured',
  '1_2_months': '6-8 Weeks Comprehensive',
  custom: '4-6 Weeks Flexible',
}

const TIMELINE_WEEKS_COUNT = {
  '1_week': 2,
  '2_4_weeks': 4,
  '1_2_months': 6,
  custom: 4,
}

const TIMELINE_EFFORT_MAP = {
  '1_week': '15-20 Hours / Week',
  '2_4_weeks': '10-12 Hours / Week',
  '1_2_months': '8-10 Hours / Week',
  custom: '10 Hours / Week',
}

export async function generatePersonalisedPlan({ session, diagnosticSession = null, customProvider = null }) {
  if (!session) {
    throw new Error('PreparationSession is required to generate a plan.')
  }

  const roleTitle = 'Frontend Developer'
  const goalPrompt = session.goalPrompt || ''
  const experienceLevel = session.experienceLevel || 'intermediate'
  const timelineKey = session.preparationTimeline || '2_4_weeks'
  const recommendedDuration = TIMELINE_DURATION_MAP[timelineKey] || '3-4 Weeks Structured'
  const suggestedWeeklyEffort = TIMELINE_EFFORT_MAP[timelineKey] || '10-12 Hours / Week'
  const weeksCount = TIMELINE_WEEKS_COUNT[timelineKey] || 4

  const officialTopics = session.officialTopics || []
  const customTopics = session.customTopics || []

  // Compile diagnostic context
  const diagnosticStatus = diagnosticSession?.status || 'skipped'
  const demonstratedStrengths = diagnosticSession?.demonstratedStrengths || []
  const demonstratedGaps = diagnosticSession?.demonstratedGaps || []
  const unassessedTopics = diagnosticSession?.unassessedTopics || []

  const curriculumTopicListPrompt = Object.entries(OFFICIAL_FRONTEND_TOPICS)
    .map(([id, t]) => `- ${id}: "${t.title}" (${t.moduleTitle}, ${t.difficulty})`)
    .join('\n')

  const systemPrompt = `You are CareerLaunch's Principal Technical Curriculum Architect.
Generate an actionable, personalised, high-rigor interview preparation plan for a candidate targeting the ${roleTitle} role.

### CRITICAL INVARIANTS:
1. ONLY use valid official topic IDs from this approved curriculum:
${curriculumTopicListPrompt}
Never invent fake or hallucinated official topic IDs.

2. CUSTOM TOPICS:
If candidate specified custom topics (e.g. Next.js, Redux Toolkit, TypeScript):
- Set topicSource to "student_custom".
- Set officialTopicId to null.
- Set knowledgeSupportStatus to "source_review_required".
- DO NOT invent external citations.

3. KNOWLEDGE ASSESSMENT GROUNDING:
- Self-reported knowledge is NOT verified competence.
- Demonstrated gaps from the diagnostic must be prioritized with "high" priority milestones.
- Demonstrated strengths can be designated "medium" or "low" priority for rapid review.
- If the diagnostic was skipped or partial, note this explicitly.

4. REQUIRED JSON OUTPUT SCHEMA:
{
  "overview": {
    "roleTitle": "${roleTitle}",
    "goalPrompt": "${goalPrompt.replace(/"/g, '\\"')}",
    "summary": "Detailed paragraph explaining the curated curriculum strategy...",
    "startingLevel": "${experienceLevel}",
    "recommendedDuration": "${recommendedDuration}",
    "suggestedWeeklyEffort": "${suggestedWeeklyEffort}"
  },
  "knowledgeAssessment": {
    "diagnosticStatus": "${diagnosticStatus}",
    "studentReportedKnowledge": ["string"],
    "demonstratedStrengths": ["string"],
    "demonstratedGaps": ["string"],
    "unassessedTopics": ["string"]
  },
  "milestones": [
    {
      "milestoneId": "m-1",
      "title": "string",
      "officialTopicId": "fe-top-X or null",
      "topicSource": "curriculum or student_custom",
      "difficulty": "beginner, intermediate, or advanced",
      "priority": "high, medium, or low",
      "reasonForRecommendation": "string explaining specific reasoning",
      "learningObjectives": ["string", "string"],
      "estimatedHours": number,
      "recommendedLearningActivities": ["string", "string"],
      "prerequisites": ["string"],
      "knowledgeSupportStatus": "verified, roadmap_topic, or source_review_required",
      "isCustomMilestone": boolean,
      "orderIndex": 0
    }
  ],
  "weeklySchedule": [
    {
      "weekNumber": 1,
      "focus": "string summary of the week",
      "milestoneIds": ["m-1", "m-2"],
      "targetOutcomes": ["string"],
      "estimatedHours": number
    }
  ],
  "practiceRecommendations": {
    "mcqs": ["string"],
    "writtenQuestions": ["string"],
    "codingExercises": ["string"],
    "debuggingExercises": ["string"],
    "interviewQuestions": ["string"]
  }
}`

  const userPrompt = `Synthesize a complete ${weeksCount}-week preparation plan for the candidate:
- Candidate Goal: "${goalPrompt}"
- Stated Experience: ${experienceLevel}
- Primary Focus: ${session.primaryGoal}
- Requested Curriculum Topics: ${officialTopics.map((t) => `${t.topicId}: ${t.title}`).join('; ') || 'None selected'}
- Explicit Custom Topics: ${customTopics.map((t) => t.title).join('; ') || 'None added'}
- Diagnostic Status: ${diagnosticStatus}
- Demonstrated Strengths: ${demonstratedStrengths.join('; ') || 'None tested'}
- Demonstrated Gaps: ${demonstratedGaps.join('; ') || 'None tested'}
- Unassessed Curriculum Topics: ${unassessedTopics.slice(0, 8).join('; ') || 'None'}

Generate 4 to 7 focused learning milestones covering their demonstrated gaps, core requested topics, and any custom subjects. Include a ${weeksCount}-week breakdown and practical assessment recommendations.`

  // Execute Groq generation
  const provider = customProvider || new GroqProvider({ model: AI_CONFIG.groq.defaultModel })
  const result = await provider.generateLesson({
    systemPrompt,
    userPrompt,
    options: {
      temperature: 0.2,
      maxTokens: 4096,
    },
  })

  let planData = result.content
  if (typeof planData === 'string') {
    try {
      planData = JSON.parse(planData)
    } catch {
      throw new Error('Groq returned non-parseable response for preparation plan.')
    }
  }

  // Sanitize and enforce deterministic consistency
  if (planData && typeof planData === 'object') {
    // 1. Enforce overview constants
    planData.overview = {
      ...planData.overview,
      roleTitle,
      goalPrompt,
      startingLevel: experienceLevel,
      recommendedDuration,
      suggestedWeeklyEffort,
    }

    // 2. Enforce knowledge assessment alignment
    planData.knowledgeAssessment = {
      diagnosticStatus,
      studentReportedKnowledge: Array.isArray(planData.knowledgeAssessment?.studentReportedKnowledge) && planData.knowledgeAssessment.studentReportedKnowledge.length > 0
        ? planData.knowledgeAssessment.studentReportedKnowledge
        : officialTopics.map((t) => t.title),
      demonstratedStrengths,
      demonstratedGaps,
      unassessedTopics: unassessedTopics.length > 0
        ? unassessedTopics
        : planData.knowledgeAssessment?.unassessedTopics || [],
    }

    // 3. Sanitize milestones & official topic IDs
    if (Array.isArray(planData.milestones)) {
      planData.milestones = planData.milestones.map((m, idx) => {
        const milestoneId = m.milestoneId || `m-${idx + 1}`
        let officialTopicId = m.officialTopicId
        let topicSource = m.topicSource || 'curriculum'

        // Check if officialTopicId is valid
        if (officialTopicId && !isOfficialFrontendTopicId(officialTopicId)) {
          // If Groq invented an invalid ID, clear it or convert to custom
          officialTopicId = null
          topicSource = 'student_custom'
        }

        if (topicSource === 'student_custom') {
          officialTopicId = null
        }

        const knowledgeSupportStatus = checkTopicKnowledgeSupport(officialTopicId, topicSource)

        return {
          ...m,
          milestoneId,
          officialTopicId,
          topicSource,
          knowledgeSupportStatus,
          isCustomMilestone: topicSource === 'student_custom',
          orderIndex: idx,
          estimatedHours: Number(m.estimatedHours) || 6,
        }
      })
    }

    // 4. Ensure custom topics requested by student are represented
    for (const ct of customTopics) {
      const alreadyHas = planData.milestones.some(
        (m) => m.title.toLowerCase().includes(ct.title.toLowerCase()) || ct.title.toLowerCase().includes(m.title.toLowerCase()),
      )
      if (!alreadyHas) {
        const nextIdx = planData.milestones.length
        planData.milestones.push({
          milestoneId: `m-${nextIdx + 1}`,
          title: ct.title,
          officialTopicId: null,
          topicSource: 'student_custom',
          difficulty: 'intermediate',
          priority: 'medium',
          reasonForRecommendation: `Requested by candidate for specialized preparation.`,
          learningObjectives: [
            `Master practical implementation patterns in ${ct.title}.`,
            `Integrate ${ct.title} architecture into standard frontend workflows.`,
          ],
          estimatedHours: 8,
          recommendedLearningActivities: [
            `Build a focused proof-of-concept project with ${ct.title}.`,
            `Analyze real-world architecture examples and patterns.`,
          ],
          prerequisites: ['Modern JavaScript', 'React Component Architecture'],
          knowledgeSupportStatus: 'source_review_required',
          isCustomMilestone: true,
          orderIndex: nextIdx,
        })
      }
    }
  }

  // Schema validation
  const validation = validatePreparationPlan(planData)
  if (!validation.isValid) {
    throw new Error(`Plan validation failed: ${validation.errors.join('; ')}`)
  }

  return {
    plan: planData,
    tokenUsage: result.tokenUsage,
    durationMs: result.durationMs,
    provider: 'groq',
    model: AI_CONFIG.groq.defaultModel,
  }
}
