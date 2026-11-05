import mongoose, { Schema } from 'mongoose'

/**
 * GeneratedLesson Schema
 * Stores canonical, AI-generated technical lessons grounded in retrieved source evidence.
 * Features strict separation of shared educational content from student personalisation.
 * Enforces end-to-end provenance to source snapshot hashes, chunk IDs, and prompt versions.
 */
const GeneratedLessonSchema = new Schema(
  {
    lessonId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    roleId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    topicId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    estimatedMinutes: {
      type: Number,
      default: 15,
    },
    learningObjectives: {
      type: [String],
      default: [],
    },

    // Structured Lesson Content Sections
    content: {
      introduction: {
        meaning: { type: String, required: true },
        whyItMatters: { type: String, required: true },
        realWorldUse: { type: String, required: true },
      },
      coreConcepts: [
        {
          term: { type: String, required: true },
          definition: { type: String, required: true },
          principles: { type: String, default: '' },
        },
      ],
      stepByStep: [
        {
          stepNumber: { type: Number, required: true },
          heading: { type: String, required: true },
          explanation: { type: String, required: true },
        },
      ],
      practicalExamples: [
        {
          title: { type: String, required: true },
          explanation: { type: String, required: true },
          input: { type: String, default: '' },
          output: { type: String, default: '' },
          code: { type: String, required: true },
          language: { type: String, default: 'python' },
          attribution: { type: String, default: 'CareerLaunch Engineering' },
        },
      ],
      complexityAnalysis: {
        timeComplexity: { type: String, default: 'N/A' },
        spaceComplexity: { type: String, default: 'N/A' },
        explanation: { type: String, default: '' },
        assumptions: { type: String, default: '' },
      },
      commonMistakes: [
        {
          mistake: { type: String, required: true },
          consequence: { type: String, required: true },
          correction: { type: String, required: true },
        },
      ],
      interviewInsights: {
        focusAreas: { type: [String], default: [] },
        followUpQuestions: { type: [String], default: [] },
        advice: { type: String, default: '' },
      },
      summary: {
        type: [String],
        default: [],
      },
      references: [
        {
          sourceId: { type: String, required: true },
          sourceTitle: { type: String, required: true },
          canonicalUrl: { type: String, required: true },
          section: { type: String, default: '' },
          chunkId: { type: String, required: true },
          groundingSnippet: { type: String, default: '' },
        },
      ],
    },

    // Provenance, Cache and Validation Metadata
    citationReferences: {
      type: [String],
      default: [],
      index: true,
    },
    sourceSnapshotHashes: {
      type: [String],
      default: [],
    },
    retrievedChunkIds: {
      type: [String],
      default: [],
    },
    aiProvider: {
      type: String,
      required: true,
      default: 'groq',
    },
    aiModel: {
      type: String,
      required: true,
    },
    promptVersion: {
      type: String,
      default: '1.0.0',
    },
    contentVersion: {
      type: String,
      default: '1.0.0',
    },
    generationTimestamp: {
      type: Date,
      default: Date.now,
    },
    validationStatus: {
      type: String,
      enum: ['unvalidated', 'passed', 'failed', 'flagged'],
      default: 'unvalidated',
      index: true,
    },
    validationDetails: {
      integrityPassed: { type: Boolean, default: false },
      evidenceSupportPassed: { type: Boolean, default: false },
      technicalAccuracyPassed: { type: Boolean, default: false },
      errors: { type: [String], default: [] },
      warnings: { type: [String], default: [] },
    },
    generationStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    tokenUsage: {
      promptTokens: { type: Number, default: 0 },
      completionTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
    },
    generationDurationMs: {
      type: Number,
      default: 0,
    },
    isStale: {
      type: Boolean,
      default: false,
      index: true,
    },
    staleReason: {
      type: String,
      default: '',
    },
    lastError: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
)

// Compound index for fast canonical lookup by role, topic, and difficulty
GeneratedLessonSchema.index({ roleId: 1, topicId: 1, difficulty: 1 })
GeneratedLessonSchema.index({ roleId: 1, topicId: 1, isStale: 1, validationStatus: 1 })

export const GeneratedLesson = mongoose.model('GeneratedLesson', GeneratedLessonSchema)
