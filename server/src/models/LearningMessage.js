import mongoose, { Schema } from 'mongoose'

/**
 * LearningMessage Schema
 * Stores individual messages within a student's continuous learning conversation.
 * Supports conversational text, interactive roadmaps, prerequisite checks, and checkpoints.
 * Keeps provider metadata and token counts recorded privately on the backend.
 */
const LearningMessageSchema = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'LearningSession',
      required: true,
      index: true,
    },
    firebaseUid: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'roadmap', 'prerequisite_check', 'checkpoint', 'welcome'],
      default: 'text',
    },
    structuredData: {
      type: Schema.Types.Mixed,
      default: null,
    },
    suggestedActions: {
      type: [String],
      default: [],
    },
    providerMetadata: {
      provider: { type: String, default: null },
      model: { type: String, default: null },
      durationMs: { type: Number, default: null },
      promptTokens: { type: Number, default: 0 },
      completionTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
)

LearningMessageSchema.index({ sessionId: 1, createdAt: 1 })
LearningMessageSchema.index({ firebaseUid: 1, sessionId: 1 })

export const LearningMessage =
  mongoose.models.LearningMessage ||
  mongoose.model('LearningMessage', LearningMessageSchema)
