import mongoose, { Schema } from 'mongoose'

/**
 * LearningSession Schema
 * Represents an independent, persistent conversation in CareerLaunch.
 * Grounded in the CareerLaunch Architecture Blueprint and Phase 3.3 ChatGPT-style workspace.
 * Maintains role alignment, independent selected skill references, and evolving learning context.
 */
const LearningSessionSchema = new Schema(
  {
    firebaseUid: {
      type: String,
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
      index: true,
    },
    roleTitle: {
      type: String,
      default: 'Frontend Developer',
    },
    // Phase 3.3: Concise, human-readable conversation title
    title: {
      type: String,
      default: 'New Chat',
      trim: true,
      maxlength: 120,
    },
    // Phase 3.3: Explicit conversation lifecycle status
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
      index: true,
    },
    // Phase 3.3: High-resolution timestamp for date grouping & sidebar sorting
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    selectedSkills: [
      {
        skillId: { type: String, required: true },
        name: { type: String, required: true },
        officialTopicId: { type: String, default: null },
        knowledgeSupportStatus: { type: String, default: 'roadmap_topic' },
      },
    ],
    customSkills: [
      {
        name: { type: String, required: true },
      },
    ],
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    currentLearningContext: {
      activeSkill: { type: String, default: null },
      currentMilestone: { type: String, default: null },
      currentTopic: { type: String, default: null },
      statedKnowledge: { type: [String], default: [] },
      demonstratedCompetencies: { type: [String], default: [] },
      generatedRoadmap: { type: Schema.Types.Mixed, default: null },
    },
  },
  {
    timestamps: true,
  },
)

LearningSessionSchema.index({ firebaseUid: 1, roleId: 1, active: 1 })
LearningSessionSchema.index({ firebaseUid: 1, roleId: 1, status: 1, lastActivityAt: -1 })
LearningSessionSchema.index({ firebaseUid: 1, status: 1, lastActivityAt: -1 })

export const LearningSession =
  mongoose.models.LearningSession ||
  mongoose.model('LearningSession', LearningSessionSchema)
