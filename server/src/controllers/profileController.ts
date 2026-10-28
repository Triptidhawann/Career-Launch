import { Response } from 'express'
import { AuthenticatedRequest } from '../middleware/authMiddleware.js'
import { StudentProfile } from '../models/StudentProfile.js'

/**
 * GET /api/profile/me
 * Retrieves the authenticated student's profile.
 */
export async function getProfile(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const uid = req.user?.uid
    const email = req.user?.email
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized: No UID in token.' })
      return
    }

    const profile = await StudentProfile.findOne({
      $or: [
        { firebaseUid: uid },
        ...(email ? [{ email: email.toLowerCase() }] : []),
      ],
    })

    if (!profile) {
      res.status(200).json({
        profile: null,
        isCompleted: false,
        message: 'No profile exists for this account yet.',
      })
      return
    }

    // Auto-heal UID linkage if user logged in with the same email
    if (profile.firebaseUid !== uid) {
      profile.firebaseUid = uid
      await profile.save()
    }

    res.status(200).json({
      profile,
      isCompleted: profile.onboarding?.isCompleted ?? false,
    })
  } catch (error: any) {
    console.error('[ProfileController] getProfile error:', error)
    res.status(500).json({
      error: 'Failed to retrieve profile',
      details: error.message,
    })
  }
}

/**
 * GET /api/profile/status
 * Quickly checks whether the user has completed onboarding.
 */
export async function getStatus(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const uid = req.user?.uid
    const email = req.user?.email
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const profile = await StudentProfile.findOne(
      {
        $or: [
          { firebaseUid: uid },
          ...(email ? [{ email: email.toLowerCase() }] : []),
        ],
      },
      'onboarding fullName email role firebaseUid',
    )

    if (!profile) {
      res.status(200).json({
        exists: false,
        isCompleted: false,
        stepCompleted: 0,
      })
      return
    }

    // Auto-heal UID linkage if user logged in with the same email
    if (profile.firebaseUid !== uid) {
      profile.firebaseUid = uid
      await profile.save()
    }

    res.status(200).json({
      exists: true,
      isCompleted: Boolean(profile.onboarding?.isCompleted),
      stepCompleted: profile.onboarding?.stepCompleted ?? 0,
      fullName: profile.fullName,
      role: profile.role,
    })
  } catch (error: any) {
    console.error('[ProfileController] getStatus error:', error)
    res.status(500).json({ error: 'Failed to check status' })
  }
}

/**
 * POST /api/profile/onboarding
 * Saves initial onboarding data and marks onboarding as completed.
 */
export async function saveOnboarding(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const uid = req.user?.uid
    const email = req.user?.email || req.body.email

    if (!uid) {
      res.status(401).json({ error: 'Unauthorized: Missing user UID.' })
      return
    }

    const {
      fullName,
      phoneNumber,
      education,
      skills,
      technologies,
      projects,
      certifications,
      careerPreferences,
    } = req.body

    const displayName =
      fullName || req.user?.name || email?.split('@')[0] || 'Student'

    // Clean and validate skills
    const sanitizedSkills = Array.isArray(skills)
      ? skills
          .filter((s) => s && s.name && s.name.trim() !== '')
          .map((s) => ({
            name: s.name.trim(),
            level: ['Beginner', 'Intermediate', 'Advanced'].includes(s.level)
              ? s.level
              : 'Intermediate',
            verified: Boolean(s.verified),
          }))
      : []

    // Clean technologies array
    const sanitizedTechnologies = Array.isArray(technologies)
      ? technologies
          .map((t) => (typeof t === 'string' ? t.trim() : ''))
          .filter(Boolean)
      : []

    // Clean projects
    const sanitizedProjects = Array.isArray(projects)
      ? projects
          .filter((p) => p && p.title && p.title.trim() !== '')
          .map((p) => ({
            title: p.title.trim(),
            description: p.description?.trim() || '',
            technologies: Array.isArray(p.technologies)
              ? p.technologies.filter(Boolean)
              : [],
            repoUrl: p.repoUrl?.trim() || '',
            liveUrl: p.liveUrl?.trim() || '',
          }))
      : []

    // Clean certifications
    const sanitizedCertifications = Array.isArray(certifications)
      ? certifications
          .filter((c) => c && c.name && c.name.trim() !== '')
          .map((c) => ({
            name: c.name.trim(),
            issuer: c.issuer?.trim() || '',
            issueDate: c.issueDate?.trim() || '',
            credentialUrl: c.credentialUrl?.trim() || '',
          }))
      : []

    // Clean career preferences
    const sanitizedCareerPreferences = {
      targetRoles: Array.isArray(careerPreferences?.targetRoles)
        ? careerPreferences.targetRoles.filter(Boolean)
        : [],
      careerInterests: Array.isArray(careerPreferences?.careerInterests)
        ? careerPreferences.careerInterests.filter(Boolean)
        : [],
      preferredLocations: Array.isArray(careerPreferences?.preferredLocations)
        ? careerPreferences.preferredLocations.filter(Boolean)
        : [],
      workType: careerPreferences?.workType || 'both',
      workMode: careerPreferences?.workMode || 'any',
      expectedSalary: careerPreferences?.expectedSalary || '',
    }

    const updateData = {
      firebaseUid: uid,
      email: email || '',
      fullName: displayName,
      phoneNumber: phoneNumber || '',
      education: {
        college: education?.college?.trim() || '',
        degree: education?.degree?.trim() || '',
        branch: education?.branch?.trim() || '',
        graduationYear: education?.graduationYear
          ? Number(education.graduationYear)
          : undefined,
        currentSemester: education?.currentSemester
          ? Number(education.currentSemester)
          : undefined,
        cgpa: education?.cgpa ? Number(education.cgpa) : undefined,
      },
      skills: sanitizedSkills,
      technologies: sanitizedTechnologies,
      projects: sanitizedProjects,
      certifications: sanitizedCertifications,
      careerPreferences: sanitizedCareerPreferences,
      onboarding: {
        isCompleted: true,
        stepCompleted: 4,
        completedAt: new Date(),
      },
    }

    const updatedProfile = await StudentProfile.findOneAndUpdate(
      {
        $or: [
          { firebaseUid: uid },
          ...(email ? [{ email: email.toLowerCase() }] : []),
        ],
      },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true },
    )

    res.status(200).json({
      success: true,
      message: 'Student profile onboarding completed successfully',
      profile: updatedProfile,
    })
  } catch (error: any) {
    console.error('[ProfileController] saveOnboarding error:', error)
    res.status(500).json({
      error: 'Failed to complete onboarding',
      details: error.message,
    })
  }
}

/**
 * PUT /api/profile/me
 * Updates student profile details after onboarding with deep validation and field merging.
 */
export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const uid = req.user?.uid
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const profile = await StudentProfile.findOne({ firebaseUid: uid })

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' })
      return
    }

    const {
      fullName,
      phoneNumber,
      education,
      skills,
      projects,
      certifications,
      careerPreferences,
    } = req.body

    if (fullName !== undefined) {
      profile.fullName = fullName.trim() || profile.fullName
    }

    if (phoneNumber !== undefined) {
      profile.phoneNumber = phoneNumber.trim()
    }

    if (education && typeof education === 'object') {
      profile.education = {
        college: education.college !== undefined ? education.college.trim() : (profile.education?.college || ''),
        degree: education.degree !== undefined ? education.degree.trim() : (profile.education?.degree || ''),
        branch: education.branch !== undefined ? education.branch.trim() : (profile.education?.branch || ''),
        graduationYear: education.graduationYear ? Number(education.graduationYear) : profile.education?.graduationYear,
        currentSemester: education.currentSemester ? Number(education.currentSemester) : profile.education?.currentSemester,
        cgpa: education.cgpa !== undefined && education.cgpa !== '' ? Number(education.cgpa) : profile.education?.cgpa,
      }
    }

    if (Array.isArray(skills)) {
      const seen = new Set<string>()
      const sanitizedSkills: any[] = []
      for (const s of skills) {
        if (s && s.name && s.name.trim()) {
          const lower = s.name.trim().toLowerCase()
          if (!seen.has(lower)) {
            seen.add(lower)
            sanitizedSkills.push({
              name: s.name.trim(),
              level: ['Beginner', 'Intermediate', 'Advanced'].includes(s.level)
                ? s.level
                : 'Intermediate',
              verified: Boolean(s.verified),
            })
          }
        }
      }
      profile.skills = sanitizedSkills
    }

    if (Array.isArray(projects)) {
      profile.projects = projects
        .filter((p: any) => p && p.title && p.title.trim())
        .map((p: any) => ({
          title: p.title.trim(),
          description: p.description?.trim() || '',
          technologies: Array.isArray(p.technologies)
            ? p.technologies.map((t: any) => (typeof t === 'string' ? t.trim() : '')).filter(Boolean)
            : [],
          repoUrl: p.repoUrl?.trim() || '',
          liveUrl: p.liveUrl?.trim() || '',
        }))
    }

    if (Array.isArray(certifications)) {
      profile.certifications = certifications
        .filter((c: any) => c && c.name && c.name.trim())
        .map((c: any) => ({
          name: c.name.trim(),
          issuer: c.issuer?.trim() || '',
          issueDate: c.issueDate?.trim() || '',
          credentialUrl: c.credentialUrl?.trim() || '',
        }))
    }

    if (careerPreferences && typeof careerPreferences === 'object') {
      profile.careerPreferences = {
        targetRoles: Array.isArray(careerPreferences.targetRoles)
          ? careerPreferences.targetRoles.filter(Boolean)
          : (profile.careerPreferences?.targetRoles || []),
        careerInterests: Array.isArray(careerPreferences.careerInterests)
          ? careerPreferences.careerInterests.filter(Boolean)
          : (profile.careerPreferences?.careerInterests || []),
        preferredLocations: Array.isArray(careerPreferences.preferredLocations)
          ? careerPreferences.preferredLocations.filter(Boolean)
          : (profile.careerPreferences?.preferredLocations || []),
        workType: careerPreferences.workType || profile.careerPreferences?.workType || 'both',
        workMode: careerPreferences.workMode || profile.careerPreferences?.workMode || 'any',
        expectedSalary: careerPreferences.expectedSalary !== undefined
          ? careerPreferences.expectedSalary.trim()
          : (profile.careerPreferences?.expectedSalary || ''),
      }
    }

    // Synchronize unique technologies across skills and projects
    const techSet = new Set<string>()
    profile.skills.forEach((s) => techSet.add(s.name))
    profile.projects.forEach((p) => {
      p.technologies.forEach((t) => techSet.add(t))
    })
    profile.technologies = Array.from(techSet)

    const updatedProfile = await profile.save()

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile,
    })
  } catch (error: any) {
    console.error('[ProfileController] updateProfile error:', error)
    res.status(500).json({
      error: 'Failed to update profile',
      details: error.message,
    })
  }
}
