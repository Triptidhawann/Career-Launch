import mongoose, { Schema } from 'mongoose'

/**
 * ContentChunk Schema
 * Represents an atomic, searchable text passage extracted from an IngestedDocument.
 * Retains end-to-end provenance to original source, document, snapshot hash, and version.
 * Embeddings are explicitly excluded in Phase 2A.
 */
const ContentChunkSchema = new Schema(
  {
    chunkId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    docId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    sourceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    sourceSnapshotHash: {
      type: String,
      required: true,
      trim: true,
    },
    roleTags: {
      type: [String],
      default: [],
    },
    topicTags: {
      type: [String],
      default: [],
    },
    difficultyTier: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    tokenCount: {
      type: Number,
      required: true,
    },
    contentHash: {
      type: String,
      required: true,
      trim: true,
    },
    documentVersion: {
      type: String,
      default: '1.0',
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

// Individual multikey indexes for role and topic filtering
ContentChunkSchema.index({ roleTags: 1 })
ContentChunkSchema.index({ topicTags: 1 })
ContentChunkSchema.index({ sourceId: 1, docId: 1 })

// Text index for keyword discovery
ContentChunkSchema.index({ content: 'text', topicTags: 'text' })

export const ContentChunk = mongoose.model('ContentChunk', ContentChunkSchema)
