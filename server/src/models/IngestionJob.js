import mongoose, { Schema } from 'mongoose'

/**
 * IngestionJob Schema
 * Tracks operational ingestion pipeline executions, progress, retries, and failure logs.
 */
const IngestionJobSchema = new Schema(
  {
    jobId: {
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
    initiatedBy: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['queued', 'running', 'completed', 'failed', 'partial'],
      default: 'queued',
      index: true,
    },
    startedAt: {
      type: Date,
    },
    finishedAt: {
      type: Date,
    },
    documentsDiscovered: {
      type: Number,
      default: 0,
      min: 0,
    },
    documentsProcessed: {
      type: Number,
      default: 0,
      min: 0,
    },
    chunksCreated: {
      type: Number,
      default: 0,
      min: 0,
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    errorLog: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        documentUrl: {
          type: String,
          default: '',
        },
        errorMessage: {
          type: String,
          required: true,
        },
        errorCode: {
          type: String,
          default: 'INGEST_ERR',
        },
      },
    ],
    snapshotHash: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

export const IngestionJob = mongoose.model('IngestionJob', IngestionJobSchema)
