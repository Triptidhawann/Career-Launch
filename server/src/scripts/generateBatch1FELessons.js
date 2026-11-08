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

const batch1FETopics = [
  {
    topicId: 'fe-top-1',
    title: 'Semantic Markup & Accessibility Outlines',
    difficulty: 'beginner',
    module: 'fe-mod-1',
    roleId: 'frontend-developer',
  },
  {
    topicId: 'fe-top-2',
    title: 'CSS Box Model, Flexbox & Grid Systems',
    difficulty: 'beginner',
    module: 'fe-mod-1',
    roleId: 'frontend-developer',
  },
  {
    topicId: 'fe-top-3',
    title: 'Responsive Design & Fluid Typography',
    difficulty: 'beginner',
    module: 'fe-mod-1',
    roleId: 'frontend-developer',
  },
  {
    topicId: 'fe-top-4',
    title: 'Execution Context, Scopes & Closures',
    difficulty: 'beginner',
    module: 'fe-mod-2',
    roleId: 'frontend-developer',
  },
]

async function runGeneration() {
  console.log('\n=================================================================')
  console.log('   CAREERLAUNCH PHASE 6.1: FRONTEND DEVELOPER BATCH 1 GENERATION  ')
  console.log('=================================================================\n')

  await mongoose.connect(MONGODB_URI)
  console.log(`Connected to database at: ${MONGODB_URI}\n`)

  // 1. Baseline Verification
  const initialStudentCount = await StudentProfile.countDocuments()
  const initialLessonCount = await GeneratedLesson.countDocuments()
  const sweLessonsBefore = await GeneratedLesson.find({ roleId: 'software-engineer' }).lean()

  console.log('Baseline Integrity Checks:')
  console.log(`  - Student Profiles         : ${initialStudentCount} (expected: 2)`)
  console.log(`  - Total Existing Lessons   : ${initialLessonCount} (expected: 16)`)
  console.log(`  - Existing SWE Lessons     : ${sweLessonsBefore.length} (expected: 16)\n`)

  if (initialStudentCount !== 2 || initialLessonCount !== 16 || sweLessonsBefore.length !== 16) {
    throw new Error('Baseline integrity check failed! Expected exactly 2 students and 16 SWE lessons. Generation aborted.')
  }

  // 2. AI Provider Verification
  const provider = getAIProvider()
  console.log('AI Provider Configuration:')
  console.log(`  - Provider ID : ${provider.providerId}`)
  console.log(`  - Model ID    : ${provider.modelId}`)
  console.log(`  - Is Mock     : ${provider.isMock}\n`)

  if (provider.isMock) {
    throw new Error('FATAL: Mock provider active! Phase 6.1 requires real Groq API integration (openai/gpt-oss-120b).')
  }

  const generationStats = []

  // 3. Generate Each Lesson in Batch 1
  for (let i = 0; i < batch1FETopics.length; i++) {
    const topic = batch1FETopics[i]
    const targetLessonId = `lesson_${topic.roleId}_${topic.topicId}_${topic.difficulty}`
    console.log(`-----------------------------------------------------------------`)
    console.log(`[${i + 1}/4] Generating Lesson: [${topic.topicId}] ${topic.title} (${topic.difficulty})`)
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
      console.log(`  - Generated Date    : ${existing.generationTimestamp}`)
      console.log(`  Skipping generation to conserve TPM quota.`)
      generationStats.push({
        topicId: topic.topicId,
        lessonId: existing.lessonId,
        status: 'from_cache',
        tokenUsage: existing.tokenUsage,
        durationMs: 0,
      })
      continue
    }

    console.log(`Generating fresh lesson via Groq (${provider.modelId})...`)
    const startTime = Date.now()
    const result = await generateCanonicalLesson({
      topicId: topic.topicId,
      roleId: topic.roleId,
      difficulty: topic.difficulty,
      forceRegenerate: true,
    })
    const durationMs = Date.now() - startTime

    if (!result.success) {
      console.error(`✗ FAILED to generate lesson for ${topic.topicId}:`, result.error)
      if (result.validation) {
        console.error('  Validation Errors:', result.validation.errors)
        console.error('  Validation Warnings:', result.validation.warnings)
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
    console.log(`  - Concepts Count      : ${lesson.content?.coreConcepts?.length || 0}`)
    console.log(`  - Steps Count         : ${lesson.content?.stepByStep?.length || 0}`)
    console.log(`  - Examples Count      : ${lesson.content?.practicalExamples?.length || 0}`)
    console.log(`  - Common Mistakes     : ${lesson.content?.commonMistakes?.length || 0}`)
    console.log(`  - References Cited    : ${lesson.citationReferences?.length || 0} (${lesson.citationReferences?.join(', ')})`)

    generationStats.push({
      topicId: topic.topicId,
      lessonId: lesson.lessonId,
      status: 'generated',
      tokenUsage: lesson.tokenUsage,
      durationMs,
    })

    // Polite pause between generation calls to respect TPM rate limit
    if (i < batch1FETopics.length - 1) {
      console.log('\nWaiting 22 seconds to respect Groq TPM rate limits...')
      await new Promise((r) => setTimeout(r, 22000))
    }
  }

  // 4. Post-Generation Integrity & Isolation Checks
  console.log('\n=================================================================')
  console.log('   POST-GENERATION SAFETY & INTEGRITY VERIFICATION               ')
  console.log('=================================================================\n')

  const finalStudentCount = await StudentProfile.countDocuments()
  const finalLessonCount = await GeneratedLesson.countDocuments()
  const sweLessonsAfter = await GeneratedLesson.find({ roleId: 'software-engineer' }).lean()
  const feLessonsAfter = await GeneratedLesson.find({ roleId: 'frontend-developer' }).lean()

  console.log(`Post-Generation Counts:`)
  console.log(`  - Total Generated Lessons: ${finalLessonCount} (expected: 20)`)
  console.log(`  - Student Profiles       : ${finalStudentCount} (expected: 2)`)
  console.log(`  - SWE Lessons Intact     : ${sweLessonsAfter.length} / 16`)
  console.log(`  - Frontend Lessons Added : ${feLessonsAfter.length} / 4\n`)

  if (finalLessonCount !== 20) {
    throw new Error(`Expected exactly 20 total lessons, but found ${finalLessonCount}!`)
  }

  if (finalStudentCount !== 2) {
    throw new Error(`Student profiles were modified! Found ${finalStudentCount}, expected 2.`)
  }

  if (sweLessonsAfter.length !== 16) {
    throw new Error(`SWE lessons were corrupted! Found ${sweLessonsAfter.length}, expected 16.`)
  }

  // Verify all 16 SWE lesson documents were not altered
  for (const before of sweLessonsBefore) {
    const after = sweLessonsAfter.find((l) => l.lessonId === before.lessonId)
    if (!after) {
      throw new Error(`SWE lesson ${before.lessonId} is missing!`)
    }
    if (after._id.toString() !== before._id.toString()) {
      throw new Error(`SWE lesson ${before.lessonId} ObjectId changed!`)
    }
    if (after.generationTimestamp?.toISOString() !== before.generationTimestamp?.toISOString()) {
      throw new Error(`SWE lesson ${before.lessonId} was overwritten!`)
    }
  }
  console.log('  ✓ All 16 Software Engineer Lessons verified 100% UNTOUCHED and identical to baseline.\n')

  // Verify each Batch 1 FE lesson in detail
  for (const topic of batch1FETopics) {
    const expectedLessonId = `lesson_${topic.roleId}_${topic.topicId}_${topic.difficulty}`
    const lessonDoc = await GeneratedLesson.findOne({ lessonId: expectedLessonId }).lean()
    if (!lessonDoc) {
      throw new Error(`Missing generated lesson doc for ${expectedLessonId}`)
    }
    console.log(`  ✓ Batch 1 FE Lesson [${topic.topicId}]: ${lessonDoc.lessonId}`)
    console.log(`    - Title: "${lessonDoc.title}"`)
    console.log(`    - Validation: ${lessonDoc.validationStatus}`)
    console.log(`    - Model: ${lessonDoc.aiModel}`)
    console.log(`    - Tokens: Prompt ${lessonDoc.tokenUsage?.promptTokens}, Compl ${lessonDoc.tokenUsage?.completionTokens}, Total ${lessonDoc.tokenUsage?.totalTokens}`)
    console.log(`    - Objectives: ${lessonDoc.learningObjectives?.length}`)
    console.log(`    - Introduction: ${Boolean(lessonDoc.content?.introduction?.meaning && lessonDoc.content?.introduction?.whyItMatters && lessonDoc.content?.introduction?.realWorldUse)}`)
    console.log(`    - Concepts: ${lessonDoc.content?.coreConcepts?.length}`)
    console.log(`    - Step-by-Step: ${lessonDoc.content?.stepByStep?.length}`)
    console.log(`    - Practical Examples: ${lessonDoc.content?.practicalExamples?.length} (Attribution: "${lessonDoc.content?.practicalExamples?.[0]?.attribution}")`)
    console.log(`    - Complexity: Time="${lessonDoc.content?.complexityAnalysis?.timeComplexity}", Space="${lessonDoc.content?.complexityAnalysis?.spaceComplexity}"`)
    console.log(`    - Common Mistakes: ${lessonDoc.content?.commonMistakes?.length}`)
    console.log(`    - Interview Insights: FocusAreas=${lessonDoc.content?.interviewInsights?.focusAreas?.length}`)
    console.log(`    - Summary: ${lessonDoc.content?.summary?.length}`)
    console.log(`    - References: ${lessonDoc.citationReferences?.join(', ')}`)
  }

  console.log('\n=================================================================')
  console.log('   BATCH 1 FRONTEND LESSON GENERATION COMPLETED SUCCESSFULLY!    ')
  console.log('=================================================================\n')

  await mongoose.disconnect()
}

runGeneration().catch((err) => {
  console.error('\n✗ Lesson Generation failed:', err)
  process.exit(1)
})
