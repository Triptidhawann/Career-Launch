import mongoose, { Schema } from 'mongoose'

/**
 * DiagnosticSession Schema
 * Records adaptive knowledge diagnostic sessions for students preparing for career roles.
 * Tracks individual question attempts, deterministic objective scores, rubric evaluations,
 * and compiles demonstrated strengths, gaps, and unassessed topics.
 */
const DiagnosticSessionSchema = new Schema(
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
      enum: ['in_progress', 'completed', 'skipped'],
      default: 'in_progress',
      index: true,
    },
    // The sequence of adaptive questions served to the student
    questions: [
      {
        questionId: { type: String, required: true },
        domain: {
          type: String,
          required: true,
          enum: [
            'html_accessibility',
            'css_responsive',
            'javascript_core',
            'dom_async',
            'react_fundamentals',
            'react_hooks',
            'state_management',
            'performance_debugging',
          ],
        },
        topicId: { type: String, default: null }, // e.g. 'fe-top-1'
        topicTitle: { type: String, required: true },
        difficulty: {
          type: String,
          required: true,
          enum: ['beginner', 'intermediate', 'advanced'],
        },
        type: {
          type: String,
          required: true,
          enum: ['objective', 'written'],
        },
        prompt: { type: String, required: true },
        options: { type: [String], default: [] }, // For objective (MCQ)
        correctOptionIndex: { type: Number, default: null }, // Deterministic correct index (server only)
        explanation: { type: String, default: '' },
        rubric: {
          criteria: { type: [String], default: [] },
          requiredKeywords: { type: [String], default: [] },
        },
        // Student response details
        studentAnswer: { type: Schema.Types.Mixed, default: null },
        isSkipped: { type: Boolean, default: false },
        isCorrect: { type: Boolean, default: null },
        score: { type: Number, default: 0 }, // 0 to 1
        evaluationFeedback: { type: String, default: null },
        answeredAt: { type: Date, default: null },
      },
    ],
    currentIndex: {
      type: Number,
      default: 0,
    },
    maxQuestions: {
      type: Number,
      default: 6,
    },
    demonstratedStrengths: {
      type: [String],
      default: [],
    },
    demonstratedGaps: {
      type: [String],
      default: [],
    },
    unassessedTopics: {
      type: [String],
      default: [],
    },
    diagnosticScore: {
      type: Number,
      default: 0, // Percentage 0-100
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

export const DiagnosticSession =
  mongoose.models.DiagnosticSession ||
  mongoose.model('DiagnosticSession', DiagnosticSessionSchema)
