import mongoose, { Schema } from 'mongoose'

/**
 * IngestedDocument Schema
 * Stores normalized document text, metadata, section hierarchies, and content hashes.
 * Strictly respects source storage permissions (content is omitted if storage is not permitted).
 * Distinguishes canonical source documents from hybrid pedagogical guides.
 */
const IngestedDocumentSchema = new Schema(
  {
    docId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    sourceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    jobId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    contentHash: {
      type: String,
      required: true,
      trim: true,
    },
    cleanedContent: {
      type: String,
      default: '',
    },
    contentType: {
      type: String,
      enum: ['markdown', 'text', 'html', 'json'],
      default: 'markdown',
    },
    documentVersion: {
      type: String,
      default: '1.0',
      trim: true,
    },
    author: {
      type: String,
      default: '',
      trim: true,
    },
    publishedDate: {
      type: Date,
    },
    sectionHierarchy: {
      type: [String],
      default: [],
    },
    storagePermitted: {
      type: Boolean,
      default: true,
    },
    contentOrigin: {
      type: String,
      enum: ['canonical_source', 'careerlaunch_authored', 'hybrid_pedagogical'],
      default: 'canonical_source',
    },
    crossReferences: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        relationship: { type: String, default: 'cross_reference' },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Index url per source for duplicate lookup
IngestedDocumentSchema.index({ sourceId: 1, url: 1 })

export const IngestedDocument = mongoose.model('IngestedDocument', IngestedDocumentSchema)
