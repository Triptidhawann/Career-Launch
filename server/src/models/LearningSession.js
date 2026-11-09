import mongoose, { Schema } from 'mongoose'

/**
 * LearningSession Schema
 * Represents a student's continuous learning workspace for a selected career role.
 * Grounded in the CareerLaunch Architecture Blueprint (docs/CAREERLAUNCH_NEW_PRODUCT_ARCHITECTURE_BLUEPRINT.md).
 * Maintains role alignment, active/selected skill references, and evolving learning context.
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

export const LearningSession =
  mongoose.models.LearningSession ||
  mongoose.model('LearningSession', LearningSessionSchema)
