import { GeneratedLesson } from '../models/GeneratedLesson.js'

const ROADMAP_TO_CANONICAL_PILOT_MAP = {
  'se-top-3': 'swe-top-1',
  'se-top-7': 'swe-top-7',
  'se-top-9': 'swe-top-9',
  'se-top-12': 'swe-top-13',
}

/**
 * Retrieves the canonical generated lesson for a topic, filtered for student consumption.
 * Accessible to authenticated students. Read-only.
 *
 * GET /api/lessons/:topicId
 * GET /api/lessons/:roleId/:topicId
 */
export async function getStudentLesson(req, res) {
  const { topicId, roleId: paramRoleId } = req.params
  const roleId = paramRoleId || req.query.roleId || 'software-engineer'

  if (!topicId || typeof topicId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'A valid topicId parameter is required.',
    })
  }

  try {
    const canonicalTopicId = ROADMAP_TO_CANONICAL_PILOT_MAP[topicId.trim()] || topicId.trim()

    // Look up verified canonical lesson (active, passed validation, non-stale)
    const lesson = await GeneratedLesson.findOne({
      topicId: canonicalTopicId,
      roleId: roleId.trim(),
      validationStatus: 'passed',
      isStale: false,
    }).lean()

    if (!lesson) {
      return res.status(404).json({
        success: false,
        available: false,
        lesson: null,
        message: 'Learning content for this topic is not available yet.',
      })
    }

    // Filter response to strictly student-facing content
    const studentPayload = {
      lessonId: lesson.lessonId,
      roleId: lesson.roleId,
      topicId: lesson.topicId,
      difficulty: lesson.difficulty || 'intermediate',
      title: lesson.title,
      estimatedMinutes: lesson.estimatedMinutes || 15,
      learningObjectives: lesson.learningObjectives || [],
      content: {
        introduction: lesson.content?.introduction || null,
        coreConcepts: lesson.content?.coreConcepts || [],
        stepByStep: lesson.content?.stepByStep || [],
        practicalExamples: (lesson.content?.practicalExamples || []).map((ex) => ({
          title: ex.title,
          explanation: ex.explanation,
          input: ex.input || '',
          output: ex.output || '',
          code: ex.code,
          language: ex.language || 'python',
          attribution: ex.attribution || 'CareerLaunch Engineering',
        })),
        complexityAnalysis: lesson.content?.complexityAnalysis || null,
        commonMistakes: lesson.content?.commonMistakes || [],
        interviewInsights: lesson.content?.interviewInsights || null,
        summary: lesson.content?.summary || [],
        references: (lesson.content?.references || []).map((ref) => ({
          sourceId: ref.sourceId,
          sourceTitle: ref.sourceTitle,
          canonicalUrl: ref.canonicalUrl,
          section: ref.section || '',
          groundingSnippet: ref.groundingSnippet || '',
        })),
      },
      generatedAt: lesson.generationTimestamp || lesson.createdAt,
      updatedAt: lesson.updatedAt,
    }

    res.status(200).json({
      success: true,
      available: true,
      lesson: studentPayload,
    })
  } catch (error) {
    console.error(`[LessonController] Error retrieving lesson for topic "${topicId}":`, error)
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while retrieving the lesson.',
    })
  }
}
