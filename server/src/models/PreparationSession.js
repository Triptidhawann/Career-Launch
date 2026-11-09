import mongoose, { Schema } from 'mongoose'

/**
 * PreparationSession Schema
 * Stores student-scoped personal interview preparation setups and sessions.
 * Enforces ownership by verified Firebase UID.
 */
const PreparationSessionSchema = new Schema(
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
    goalPrompt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    knownTopics: {
      type: [String],
      default: [],
    },
    weakTopics: {
      type: [String],
      default: [],
    },
    preparationTimeline: {
      type: String,
      enum: ['1_week', '2_4_weeks', '1_2_months', 'custom'],
      default: '2_4_weeks',
    },
    primaryGoal: {
      type: String,
      enum: ['internship', 'placement', 'technical_interview', 'skill_improvement'],
      default: 'placement',
    },
    selectedDirectTopicId: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: ['setup_saved', 'plan_pending', 'active', 'completed'],
      default: 'setup_saved',
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

export const PreparationSession =
  mongoose.models.PreparationSession ||
  mongoose.model('PreparationSession', PreparationSessionSchema)
