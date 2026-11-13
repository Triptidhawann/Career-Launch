/**
 * Role-Specific Skill Definitions for CareerLaunch
 *
 * Grounded in the approved Architecture Blueprint (docs/CAREERLAUNCH_NEW_PRODUCT_ARCHITECTURE_BLUEPRINT.md).
 * Simplified specification: Clean, top-level skill names only (no sub-topics, no descriptions).
 * Each skill has a single checkbox for the student to select or deselect.
 */

export const FRONTEND_DEVELOPER_ROLE = {
  roleId: 'frontend-developer',
  roleTitle: 'Frontend Developer',
  subtitle: 'UI Engineering & Web Architecture',
  skills: [
    { id: 'html', name: 'HTML', canonicalTopics: ['fe-top-1', 'fe-top-13'] },
    { id: 'css', name: 'CSS', canonicalTopics: ['fe-top-2', 'fe-top-3'] },
    { id: 'javascript', name: 'JavaScript', canonicalTopics: ['fe-top-4', 'fe-top-5', 'fe-top-6'] },
    { id: 'typescript', name: 'TypeScript', canonicalTopics: [] },
    { id: 'react', name: 'React', canonicalTopics: ['fe-top-7', 'fe-top-8', 'fe-top-9'] },
    { id: 'nextjs', name: 'Next.js', canonicalTopics: [] },
    { id: 'state-management', name: 'State Management', canonicalTopics: ['fe-top-10', 'fe-top-11', 'fe-top-12'] },
    { id: 'api-integration', name: 'API Integration', canonicalTopics: ['fe-top-12'] },
    { id: 'browser-fundamentals', name: 'Browser Fundamentals', canonicalTopics: [] },
    { id: 'web-performance', name: 'Web Performance', canonicalTopics: ['fe-top-14', 'fe-top-15', 'fe-top-17'] },
    { id: 'testing', name: 'Testing', canonicalTopics: ['fe-top-16'] },
    { id: 'git-github', name: 'Git & GitHub', canonicalTopics: [] },
  ],
}

/**
 * Returns role skills definition by roleId.
 */
export function getSkillsByRoleId(roleId) {
  if (roleId === 'frontend-developer') {
    return FRONTEND_DEVELOPER_ROLE
  }
  return null
}

/**
 * Finds a skill by its ID for a specific role.
 */
export function findSkillById(roleId, skillId) {
  const role = getSkillsByRoleId(roleId)
  if (!role) return null
  return role.skills.find((s) => s.id === skillId || s.name.toLowerCase() === skillId.toLowerCase()) || null
}

/**
 * Validates an array of skill IDs or names.
 */
export function validateSkillIds(roleId, skillIds) {
  const role = getSkillsByRoleId(roleId)
  if (!role || !Array.isArray(skillIds)) {
    return { valid: false, validSkills: [], invalidIds: [] }
  }

  const validSkills = []
  const invalidIds = []

  for (const id of skillIds) {
    const found = findSkillById(roleId, id)
    if (found) {
      validSkills.push(found)
    } else {
      invalidIds.push(id)
    }
  }

  return {
    valid: invalidIds.length === 0,
    validSkills,
    invalidIds,
  }
}
