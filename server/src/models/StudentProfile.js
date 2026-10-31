import mongoose, { Schema } from 'mongoose'

const StudentProfileSchema = new Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    education: {
      college: { type: String, default: '' },
      degree: { type: String, default: '' },
      branch: { type: String, default: '' },
      graduationYear: { type: Number },
      currentSemester: { type: Number },
      cgpa: { type: Number },
    },
    skills: [
      {
        name: { type: String, required: true },
        level: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced'],
          default: 'Intermediate',
        },
        verified: { type: Boolean, default: false },
      },
    ],
    technologies: [{ type: String }],
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        technologies: [{ type: String }],
        repoUrl: { type: String, default: '' },
        liveUrl: { type: String, default: '' },
      },
    ],
    certifications: [
      {
        name: { type: String, required: true },
        issuer: { type: String, default: '' },
        issueDate: { type: String, default: '' },
        credentialUrl: { type: String, default: '' },
      },
    ],
    careerPreferences: {
      targetRoles: [{ type: String }],
      careerInterests: [{ type: String }],
      preferredLocations: [{ type: String }],
      workType: {
        type: String,
        enum: ['full-time', 'internship', 'both'],
        default: 'both',
      },
      workMode: {
        type: String,
        enum: ['remote', 'hybrid', 'on-site', 'any'],
        default: 'any',
      },
      expectedSalary: { type: String, default: '' },
    },
    onboarding: {
      isCompleted: { type: Boolean, default: false, index: true },
      stepCompleted: { type: Number, default: 0 },
      completedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  },
)

export const StudentProfile = mongoose.model(
  'StudentProfile',
  StudentProfileSchema,
)
