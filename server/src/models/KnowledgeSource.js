import mongoose, { Schema } from 'mongoose'

/**
 * KnowledgeSource Schema
 * Represents an approved technical information source in CareerLaunch's knowledge foundation.
 * Enforces licence verification, permission boundaries, and domain allowlists.
 */
const KnowledgeSourceSchema = new Schema(
  {
    sourceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: String,
      required: true,
      trim: true,
    },
    baseUrl: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['official_docs', 'academic_curriculum', 'spec_standard', 'educational_repository'],
      required: true,
    },
    authorityTier: {
      type: Number,
      enum: [1, 2, 3], // 1 = Canonical/Spec/Standard, 2 = Official Docs, 3 = Peer-Reviewed Material
      required: true,
    },
    licence: {
      spdxId: {
        type: String,
        required: true,
        trim: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      version: {
        type: String,
        default: '1.0',
        trim: true,
      },
      commercialUsePermitted: {
        type: Boolean,
        required: true,
      },
      attributionRequired: {
        type: Boolean,
        required: true,
      },
      attributionText: {
        type: String,
        default: '',
        trim: true,
      },
      storagePermitted: {
        type: Boolean,
        required: true,
      },
      indexingPermitted: {
        type: Boolean,
        required: true,
      },
      quotingPermitted: {
        type: Boolean,
        required: true,
      },
      maxQuoteLengthCharacters: {
        type: Number,
        default: 1000,
      },
    },
    ingestionMethod: {
      type: String,
      enum: ['static_dump', 'structured_api', 'whitelisted_html', 'git_clone'],
      required: true,
    },
    allowedDomains: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one allowed domain must be specified for SSRF defense.',
      },
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'deprecated', 'rejected', 'flagged_for_review'],
      default: 'active',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },
    activeVersionTag: {
      type: String,
      default: '1.0',
      trim: true,
    },
    lastSuccessfulIngestAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

export const KnowledgeSource = mongoose.model('KnowledgeSource', KnowledgeSourceSchema)
