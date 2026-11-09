import mongoose, { Schema } from 'mongoose'

/**
 * PreparationPlan Schema
 * Stores personalised, AI-synthesized interview preparation plans.
 * Integrates student intake preferences, adaptive diagnostic findings,
 * verified curriculum mappings, and custom topic source availability flags.
 */
const PreparationPlanSchema = new Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'PreparationSession',
      required: true,
      index: true,
    },
    diagnosticId: {
      type: Schema.Types.ObjectId,
      ref: 'DiagnosticSession',
      default: null,
      index: true,
    },
    roleId: {
      type: String,
      required: true,
      enum: [
        'frontend-developer',
        'backend-developer',
        'full-stack-developer',
        'software-engineer',
        'data-analyst',
        'data-scientist',
        'devops-engineer',
        'mobile-app-developer',
      ],
      default: 'frontend-developer',
    },
    status: {
      type: String,
      enum: ['draft', 'customized', 'accepted'],
      default: 'draft',
      index: true,
    },

    // A. Preparation Overview
    overview: {
      roleTitle: { type: String, required: true },
      goalPrompt: { type: String, required: true },
      summary: { type: String, required: true },
      startingLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true,
      },
      recommendedDuration: { type: String, required: true },
      suggestedWeeklyEffort: { type: String, required: true },
    },

    // B. Knowledge Assessment
    knowledgeAssessment: {
      diagnosticStatus: {
        type: String,
        enum: ['completed', 'partial', 'skipped'],
        default: 'skipped',
      },
      studentReportedKnowledge: { type: [String], default: [] },
      demonstratedStrengths: { type: [String], default: [] },
      demonstratedGaps: { type: [String], default: [] },
      unassessedTopics: { type: [String], default: [] },
    },

    // C & D. Learning Milestones
    milestones: [
      {
        milestoneId: { type: String, required: true },
        title: { type: String, required: true },
        officialTopicId: { type: String, default: null }, // e.g. 'fe-top-1', or null for custom
        topicSource: {
          type: String,
          enum: ['curriculum', 'student_custom'],
          required: true,
        },
        difficulty: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced'],
          required: true,
        },
        priority: {
          type: String,
          enum: ['high', 'medium', 'low'],
          required: true,
        },
        reasonForRecommendation: { type: String, required: true },
        learningObjectives: { type: [String], default: [] },
        estimatedHours: { type: Number, required: true, min: 1 },
        recommendedLearningActivities: { type: [String], default: [] },
        prerequisites: { type: [String], default: [] },
        knowledgeSupportStatus: {
          type: String,
          enum: ['verified', 'roadmap_topic', 'source_review_required'],
          default: 'roadmap_topic',
        },
        isCustomMilestone: { type: Boolean, default: false },
        orderIndex: { type: Number, required: true },
      },
    ],

    // E. Weekly Schedule
    weeklySchedule: [
      {
        weekNumber: { type: Number, required: true },
        focus: { type: String, required: true },
        milestoneIds: { type: [String], default: [] },
        targetOutcomes: { type: [String], default: [] },
        estimatedHours: { type: Number, required: true },
      },
    ],

    // F. Practice Recommendations
    practiceRecommendations: {
      mcqs: { type: [String], default: [] },
      writtenQuestions: { type: [String], default: [] },
      codingExercises: { type: [String], default: [] },
      debuggingExercises: { type: [String], default: [] },
      interviewQuestions: { type: [String], default: [] },
    },

    // Generation Metadata
    generationMetadata: {
      provider: { type: String, default: 'groq' },
      model: { type: String, default: 'openai/gpt-oss-120b' },
      tokensUsed: {
        promptTokens: { type: Number, default: 0 },
        completionTokens: { type: Number, default: 0 },
        totalTokens: { type: Number, default: 0 },
      },
      durationMs: { type: Number, default: 0 },
      generatedAt: { type: Date, default: Date.now },
      acceptedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  },
)

export const PreparationPlan =
  mongoose.models.PreparationPlan ||
  mongoose.model('PreparationPlan', PreparationPlanSchema)
