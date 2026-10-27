import mongoose, { Document, Schema } from 'mongoose'

export interface ISkill {
  name: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  verified?: boolean
}

export interface IProject {
  title: string
  description: string
  technologies: string[]
  repoUrl?: string
  liveUrl?: string
}

export interface ICertification {
  name: string
  issuer: string
  issueDate?: string
  credentialUrl?: string
}

export interface IEducation {
  college: string
  degree: string
  branch: string
  graduationYear?: number
  currentSemester?: number
  cgpa?: number
}

export interface ICareerPreferences {
  targetRoles: string[]
  careerInterests: string[]
  preferredLocations: string[]
  workType?: 'full-time' | 'internship' | 'both'
  workMode?: 'remote' | 'hybrid' | 'on-site' | 'any'
  expectedSalary?: string
}

export interface IOnboardingStatus {
  isCompleted: boolean
  stepCompleted: number
  completedAt?: Date
}

export interface IStudentProfile extends Document {
  firebaseUid: string
  email: string
  fullName: string
  phoneNumber?: string
  avatarUrl?: string
  role: 'student' | 'admin'
  education: IEducation
  skills: ISkill[]
  technologies: string[]
  projects: IProject[]
  certifications: ICertification[]
  careerPreferences: ICareerPreferences
  onboarding: IOnboardingStatus
  createdAt: Date
  updatedAt: Date
}

const StudentProfileSchema = new Schema<IStudentProfile>(
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

export const StudentProfile = mongoose.model<IStudentProfile>(
  'StudentProfile',
  StudentProfileSchema,
)
