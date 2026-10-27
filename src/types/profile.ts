export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export interface Skill {
  name: string
  level: SkillLevel
  verified?: boolean
}

export interface Project {
  title: string
  description: string
  technologies: string[]
  repoUrl?: string
  liveUrl?: string
}

export interface Certification {
  name: string
  issuer: string
  issueDate?: string
  credentialUrl?: string
}

export interface Education {
  college: string
  degree: string
  branch: string
  graduationYear?: number
  currentSemester?: number
  cgpa?: number
}

export interface CareerPreferences {
  targetRoles: string[]
  careerInterests: string[]
  preferredLocations: string[]
  workType?: 'full-time' | 'internship' | 'both'
  workMode?: 'remote' | 'hybrid' | 'on-site' | 'any'
  expectedSalary?: string
}

export interface OnboardingStatus {
  isCompleted: boolean
  stepCompleted: number
  completedAt?: string
}

export interface StudentProfile {
  _id?: string
  firebaseUid: string
  email: string
  fullName: string
  phoneNumber?: string
  avatarUrl?: string
  role: 'student' | 'admin'
  education: Education
  skills: Skill[]
  technologies: string[]
  projects: Project[]
  certifications: Certification[]
  careerPreferences: CareerPreferences
  onboarding: OnboardingStatus
  createdAt?: string
  updatedAt?: string
}

export interface OnboardingPayload {
  fullName: string
  phoneNumber?: string
  education: Education
  skills: Skill[]
  technologies: string[]
  projects: Project[]
  certifications: Certification[]
  careerPreferences: CareerPreferences
}
