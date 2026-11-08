import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import { GeneratedLesson } from '../models/GeneratedLesson.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { generateCanonicalLesson } from '../services/ai/lessonGenerator.js'
import { getAIProvider } from '../services/ai/groqProvider.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/careerlaunch'

const batch2aTopics = [
  { topicId: 'se-top-8', title: 'Heaps & Priority Queues', difficulty: 'intermediate', module: 'se-mod-3' },
  { topicId: 'se-top-10', title: 'Topological Sort & Shortest Paths', difficulty: 'intermediate', module: 'se-mod-4' },
  { topicId: 'se-top-11', title: 'Recursion & Backtracking Strategies', difficulty: 'intermediate', module: 'se-mod-5' },
]

const EXISTING_LESSON_IDS = [
  // 5 Pilots
  'lesson_software-engineer_swe-top-1_beginner',
  'lesson_software-engineer_swe-top-4_beginner',
  'lesson_software-engineer_swe-top-7_intermediate',
  'lesson_software-engineer_swe-top-9_intermediate',
  'lesson_software-engineer_swe-top-13_advanced',
  // 4 Batch 1
  'lesson_software-engineer_se-top-2_beginner',
  'lesson_software-engineer_se-top-4_beginner',
  'lesson_software-engineer_se-top-5_beginner',
  'lesson_software-engineer_se-top-6_intermediate',
]

async function runGeneration() {
  console.log('\n=================================================================')
  console.log('   CAREERLAUNCH PHASE 5.1 BATCH 2A: THREE ALGORITHM LESSONS (GROQ)')
  console.log('=================================================================\n')

  await mongoose.connect(MONGODB_URI)
  console.log(`Connected to database at: ${MONGODB_URI}\n`)

  // 1. Baseline Verification
  const initialStudentCount = await StudentProfile.countDocuments()
  const initialLessonCount = await GeneratedLesson.countDocuments()
  const existingLessonsBefore = await GeneratedLesson.find({ lessonId: { $in: EXISTING_LESSON_IDS } }).lean()

  console.log('Baseline Integrity Checks:')
  console.log(`  - Student Profiles        : ${initialStudentCount} (expected: 2)`)
  console.log(`  - Generated Lessons Total : ${initialLessonCount} (expected: 9)`)
  console.log(`  - Existing Lessons in DB  : ${existingLessonsBefore.length} (expected: 9)\n`)

  if (initialStudentCount !== 2 || initialLessonCount !== 9 || existingLessonsBefore.length !== 9) {
    throw new Error('Baseline integrity check failed! Generation aborted.')
  }

  // 2. Provider Check
  const provider = getAIProvider()
  console.log('AI Provider Configuration:')
  console.log(`  - Provider ID : ${provider.providerId}`)
  console.log(`  - Model ID    : ${provider.modelId}`)
  console.log(`  - Is Mock     : ${provider.isMock}\n`)

  if (provider.isMock) {
    throw new Error('FATAL: Mock provider active! Phase 5.1 requires real Groq API integration.')
  }

  // 3. Generate Each Lesson in Batch 2A
  for (let i = 0; i < batch2aTopics.length; i++) {
    const topic = batch2aTopics[i]
    const targetLessonId = `lesson_software-engineer_${topic.topicId}_${topic.difficulty}`
    console.log(`-----------------------------------------------------------------`)
    console.log(`[${i + 1}/3] Generating Lesson: [${topic.topicId}] ${topic.title} (${topic.difficulty})`)
    console.log(`Target Lesson ID: ${targetLessonId}`)

    // Check if already generated and valid
    const existing = await GeneratedLesson.findOne({
      lessonId: targetLessonId,
      validationStatus: 'passed',
      isStale: false,
    }).lean()

    if (existing) {
      console.log(`✓ Lesson already exists and passed validation:`)
      console.log(`  - Lesson ID         : ${existing.lessonId}`)
      console.log(`  - Model Used        : ${existing.aiModel}`)
      console.log(`  - Token Usage       :`, existing.tokenUsage)
      console.log(`  Skipping generation to conserve TPM quota.`)
      continue
    }

    console.log(`Generating fresh lesson via Groq (${provider.modelId})...`)
    const startTime = Date.now()
    const result = await generateCanonicalLesson({
      topicId: topic.topicId,
      roleId: 'software-engineer',
      difficulty: topic.difficulty,
      forceRegenerate: true,
    })
    const durationMs = Date.now() - startTime

    if (!result.success) {
      console.error(`✗ FAILED to generate lesson for ${topic.topicId}:`, result.error)
      if (result.validation) {
        console.error('  Validation Errors:', result.validation.errors)
      }
      throw new Error(`Generation failed for topic: ${topic.topicId}`)
    }

    const lesson = result.lesson
    console.log(`✓ SUCCESS in ${durationMs} ms!`)
    console.log(`  - Saved Lesson ID     : ${lesson.lessonId}`)
    console.log(`  - Title               : ${lesson.title}`)
    console.log(`  - Validation Status   : ${lesson.validationStatus}`)
    console.log(`  - AI Model            : ${lesson.aiModel}`)
    console.log(`  - Token Usage         :`, lesson.tokenUsage)
    console.log(`  - Objectives Count    : ${lesson.learningObjectives?.length || 0}`)
    console.log(`  - Examples Count      : ${lesson.content?.practicalExamples?.length || 0}`)
    console.log(`  - References Cited    : ${lesson.citationReferences?.length || 0} (${lesson.citationReferences?.join(', ')})`)

    // Polite pause between generation calls to respect TPM rate limit
    if (i < batch2aTopics.length - 1) {
      console.log('Waiting 15 seconds to respect Groq TPM rate limits...')
      await new Promise((r) => setTimeout(r, 15000))
    }
  }

  // 4. Post-Generation Integrity & Isolation Checks
  console.log('\n=================================================================')
  console.log('   POST-GENERATION SAFETY & INTEGRITY VERIFICATION               ')
  console.log('=================================================================\n')

  const finalStudentCount = await StudentProfile.countDocuments()
  const finalLessonCount = await GeneratedLesson.countDocuments()
  const existingLessonsAfter = await GeneratedLesson.find({ lessonId: { $in: EXISTING_LESSON_IDS } }).lean()

  console.log(`Post-Generation Counts:`)
  console.log(`  - Total Generated Lessons: ${finalLessonCount} (before: ${initialLessonCount}, delta: +${finalLessonCount - initialLessonCount}, expected: 12)`)
  console.log(`  - Student Profiles       : ${finalStudentCount} (before: ${initialStudentCount}, unchanged: ${finalStudentCount === initialStudentCount})`)
  console.log(`  - Previous Lessons Intact: ${existingLessonsAfter.length} / 9`)

  if (finalLessonCount !== 12) {
    throw new Error(`Expected exactly 12 total lessons, but found ${finalLessonCount}!`)
  }

  if (finalStudentCount !== 2) {
    throw new Error(`Student profiles were modified! Found ${finalStudentCount}, expected 2.`)
  }

  // Verify all 9 previous lessons were not altered
  for (const before of existingLessonsBefore) {
    const after = existingLessonsAfter.find((l) => l.lessonId === before.lessonId)
    if (!after) {
      throw new Error(`Previous lesson ${before.lessonId} is missing!`)
    }
    if (after._id.toString() !== before._id.toString()) {
      throw new Error(`Previous lesson ${before.lessonId} ObjectId changed!`)
    }
    if (after.generationTimestamp?.toISOString() !== before.generationTimestamp?.toISOString()) {
      throw new Error(`Previous lesson ${before.lessonId} was overwritten!`)
    }
  }
  console.log('  ✓ All 9 previous lessons verified 100% UNTOUCHED and identical to baseline.\n')

  // Verify se-top-1 was NOT generated
  const seTop1Lesson = await GeneratedLesson.findOne({ topicId: 'se-top-1' })
  if (seTop1Lesson) {
    throw new Error('FATAL: se-top-1 lesson was generated! Memory topic restriction violated.')
  }
  console.log('  ✓ Verified se-top-1 was NOT generated (memory topic restriction strictly honored).\n')

  // Verify each Batch 2A lesson in detail
  for (const topic of batch2aTopics) {
    const expectedLessonId = `lesson_software-engineer_${topic.topicId}_${topic.difficulty}`
    const lessonDoc = await GeneratedLesson.findOne({ lessonId: expectedLessonId }).lean()
    if (!lessonDoc) {
      throw new Error(`Missing generated lesson doc for ${expectedLessonId}`)
    }
    console.log(`  ✓ Batch 2A Lesson [${topic.topicId}]: ${lessonDoc.lessonId}`)
    console.log(`    - Title: "${lessonDoc.title}"`)
    console.log(`    - Validation: ${lessonDoc.validationStatus}`)
    console.log(`    - Model: ${lessonDoc.aiModel}`)
    console.log(`    - Tokens: Prompt ${lessonDoc.tokenUsage?.promptTokens}, Compl ${lessonDoc.tokenUsage?.completionTokens}, Total ${lessonDoc.tokenUsage?.totalTokens}`)
  }

  console.log('\n=================================================================')
  console.log('   BATCH 2A LESSON GENERATION COMPLETED SUCCESSFULLY!            ')
  console.log('=================================================================\n')

  await mongoose.disconnect()
}

runGeneration().catch((err) => {
  console.error('\n✗ Lesson Generation failed:', err)
  process.exit(1)
})
