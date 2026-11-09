import mongoose, { Schema } from 'mongoose'

/**
 * StudentSkillSelection Schema
 * Stores student-selected technical skills and custom requested skills for a specific career role.
 * Grounded in the CareerLaunch Architecture Blueprint (docs/CAREERLAUNCH_NEW_PRODUCT_ARCHITECTURE_BLUEPRINT.md).
 * Enables the student to resume their learning journey seamlessly.
 */
const StudentSkillSelectionSchema = new Schema(
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
    selectedSkills: [
      {
        skillId: { type: String, required: true, trim: true },
        name: { type: String, required: true, trim: true },
        categoryId: { type: String, required: true, trim: true },
        categoryName: { type: String, required: true, trim: true },
        officialTopicId: { type: String, default: null, trim: true },
        knowledgeSupportStatus: {
          type: String,
          enum: ['verified', 'roadmap_topic', 'source_review_required'],
          default: 'roadmap_topic',
        },
      },
    ],
    customSkills: [
      {
        name: { type: String, required: true, trim: true },
        requestedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Unique compound index so each student has one active selection profile per role
StudentSkillSelectionSchema.index({ firebaseUid: 1, roleId: 1 }, { unique: true })

export const StudentSkillSelection =
  mongoose.models.StudentSkillSelection ||
  mongoose.model('StudentSkillSelection', StudentSkillSelectionSchema)
