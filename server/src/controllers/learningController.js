import { StudentSkillSelection } from '../models/StudentSkillSelection.js'
import {
  getSkillsTaxonomyByRoleId,
  validateSkillIds,
} from '../data/roleSkillTaxonomy.js'

const VALID_ROLE_IDS = [
  'frontend-developer',
  'backend-developer',
  'full-stack-developer',
  'software-engineer',
  'data-analyst',
  'data-scientist',
  'devops-engineer',
  'mobile-app-developer',
]

/**
 * GET /api/learning/skills/:roleId
 * Returns the official hierarchical skill taxonomy for a specific role.
 */
export async function getRoleSkills(req, res) {
  try {
    const { roleId } = req.params

    if (!roleId || !VALID_ROLE_IDS.includes(roleId)) {
      return res.status(400).json({
        error: `Invalid or unsupported roleId '${roleId}'. Allowed roles: ${VALID_ROLE_IDS.join(', ')}`,
      })
    }

    const taxonomy = getSkillsTaxonomyByRoleId(roleId)

    if (!taxonomy) {
      return res.status(404).json({
        error: `Skill taxonomy is not yet available for role '${roleId}'. Frontend Developer is currently the primary pilot role.`,
      })
    }

    return res.status(200).json({
      success: true,
      roleId: taxonomy.roleId,
      roleTitle: taxonomy.roleTitle,
      subtitle: taxonomy.subtitle,
      categories: taxonomy.categories,
      totalCategories: taxonomy.categories.length,
      totalSkills: taxonomy.categories.reduce((acc, cat) => acc + cat.skills.length, 0),
    })
  } catch (error) {
    console.error('[LearningController] getRoleSkills error:', error)
    return res.status(500).json({
      error: 'Failed to retrieve role skills taxonomy.',
      details: error.message,
    })
  }
}

/**
 * GET /api/learning/selection/:roleId
 * Retrieves the authenticated student's saved skill selection for a role.
 */
export async function getStudentSkillSelection(req, res) {
  try {
    const firebaseUid = req.user?.uid
    const { roleId } = req.params

    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication.' })
    }

    if (!roleId || !VALID_ROLE_IDS.includes(roleId)) {
      return res.status(400).json({
        error: `Invalid or unsupported roleId '${roleId}'.`,
      })
    }

    const selection = await StudentSkillSelection.findOne({ firebaseUid, roleId })

    if (!selection) {
      return res.status(200).json({
        exists: false,
        roleId,
        selectedSkills: [],
        customSkills: [],
        updatedAt: null,
      })
    }

    return res.status(200).json({
      exists: true,
      roleId: selection.roleId,
      selectedSkills: selection.selectedSkills,
      customSkills: selection.customSkills,
      updatedAt: selection.updatedAt,
      createdAt: selection.createdAt,
    })
  } catch (error) {
    console.error('[LearningController] getStudentSkillSelection error:', error)
    return res.status(500).json({
      error: 'Failed to retrieve student skill selection.',
      details: error.message,
    })
  }
}

/**
 * PUT /api/learning/selection/:roleId
 * Saves or updates the student's selected skills and custom skills for a role.
 */
export async function saveStudentSkillSelection(req, res) {
  try {
    const firebaseUid = req.user?.uid
    const { roleId } = req.params

    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication.' })
    }

    if (!roleId || !VALID_ROLE_IDS.includes(roleId)) {
      return res.status(400).json({
        error: `Invalid or unsupported roleId '${roleId}'.`,
      })
    }

    const { selectedSkillIds = [], customSkills = [] } = req.body

    if (!Array.isArray(selectedSkillIds)) {
      return res.status(400).json({
        error: 'Invalid payload: selectedSkillIds must be an array of skill ID strings.',
      })
    }

    if (!Array.isArray(customSkills)) {
      return res.status(400).json({
        error: 'Invalid payload: customSkills must be an array.',
      })
    }

    // Validate and map official skill IDs
    const { validSkills, invalidIds } = validateSkillIds(roleId, selectedSkillIds)

    const mappedSkills = validSkills.map((s) => ({
      skillId: s.skillId,
      name: s.name,
      categoryId: s.categoryId,
      categoryName: s.categoryName,
      officialTopicId: s.officialTopicId || null,
      knowledgeSupportStatus: s.knowledgeSupportStatus || 'roadmap_topic',
    }))

    // Clean and deduplicate custom skills
    const seenCustom = new Set()
    const cleanedCustom = []

    for (const item of customSkills) {
      const name = typeof item === 'string' ? item.trim() : item?.name?.trim()
      if (!name) continue
      if (name.length > 100) {
        return res.status(400).json({
          error: `Custom skill name '${name.substring(0, 20)}...' exceeds the maximum length of 100 characters.`,
        })
      }

      const lower = name.toLowerCase()
      if (!seenCustom.has(lower)) {
        seenCustom.add(lower)
        cleanedCustom.push({
          name,
          requestedAt: item?.requestedAt ? new Date(item.requestedAt) : new Date(),
        })
      }
    }

    // Upsert the student's selection for this role
    const updatedRecord = await StudentSkillSelection.findOneAndUpdate(
      { firebaseUid, roleId },
      {
        $set: {
          selectedSkills: mappedSkills,
          customSkills: cleanedCustom,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    )

    return res.status(200).json({
      success: true,
      message: 'Student skill selection saved successfully.',
      selection: {
        roleId: updatedRecord.roleId,
        selectedSkills: updatedRecord.selectedSkills,
        customSkills: updatedRecord.customSkills,
        totalSelected: updatedRecord.selectedSkills.length + updatedRecord.customSkills.length,
        updatedAt: updatedRecord.updatedAt,
      },
      ignoredInvalidSkillIds: invalidIds.length > 0 ? invalidIds : undefined,
    })
  } catch (error) {
    console.error('[LearningController] saveStudentSkillSelection error:', error)
    return res.status(500).json({
      error: 'Failed to save student skill selection.',
      details: error.message,
    })
  }
}
