import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LearningSession } from '../models/LearningSession.js'
import { LearningMessage } from '../models/LearningMessage.js'
import { generateConversationTitle } from '../utils/conversationTitleGenerator.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/careerlaunch'

async function run() {
  console.log('[Backfill] Connecting to MongoDB on port 27018...')
  await mongoose.connect(MONGODB_URI)
  console.log('[Backfill] Connected successfully.')

  const sessions = await LearningSession.find({ status: { $ne: 'deleted' } }).sort({ createdAt: 1 })
  console.log(`[Backfill] Found ${sessions.length} non-deleted learning sessions.`)

  let updatedCount = 0
  let emptyCount = 0
  let preservedCustom = 0

  for (const session of sessions) {
    const messages = await LearningMessage.find({ sessionId: session._id }).sort({ createdAt: 1 })
    const msgCount = messages.length

    if (msgCount === 0) {
      emptyCount++
      console.log(`[Backfill] Session ${session._id} (${session.roleId}): 0 messages, title: "${session.title}" (empty)`)
      continue
    }

    if (session.isCustomTitle) {
      preservedCustom++
      console.log(`[Backfill] Session ${session._id}: custom title preserved -> "${session.title}" (${msgCount} msgs)`)
      continue
    }

    const firstUserMsg = messages.find((m) => m.role === 'user')
    if (!firstUserMsg || !firstUserMsg.content) {
      console.log(`[Backfill] Session ${session._id}: has ${msgCount} msgs but no user msg`)
      continue
    }

    const activeSkill = session.currentLearningContext?.activeSkill || session.selectedSkills?.[0]?.name || 'Tech'
    const newTitle = generateConversationTitle(firstUserMsg.content, activeSkill)

    if (session.title === 'New Chat' || session.title.startsWith('New Chat') || session.title === 'Frontend Developer Learning') {
      const oldTitle = session.title
      session.title = newTitle
      await session.save()
      updatedCount++
      console.log(`[Backfill] Session ${session._id}: "${oldTitle}" -> "${newTitle}" (${msgCount} msgs, prompt: "${firstUserMsg.content.slice(0, 40)}...")`)
    } else {
      console.log(`[Backfill] Session ${session._id}: existing title "${session.title}" kept`)
    }
  }

  console.log(`\n[Backfill Summary]`)
  console.log(`Total sessions inspected: ${sessions.length}`)
  console.log(`Empty sessions (0 messages): ${emptyCount}`)
  console.log(`Custom renamed titles preserved: ${preservedCustom}`)
  console.log(`Generic titles backfilled: ${updatedCount}`)

  await mongoose.disconnect()
  console.log('[Backfill] Complete. Disconnected.')
}

run().catch((err) => {
  console.error('[Backfill] Error:', err)
  process.exit(1)
})
