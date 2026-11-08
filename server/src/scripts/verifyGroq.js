import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { GroqProvider } from '../services/ai/groqProvider.js'
import { AI_CONFIG } from '../services/ai/aiConfig.js'

// Explicitly ensure server/.env is loaded
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config()

async function testGroqConnection() {
  console.log('\n=================================================================')
  console.log('       CAREERLAUNCH PHASE 3: REAL GROQ API INTEGRATION AUDIT     ')
  console.log('=================================================================\n')

  // 1. Verify environment configuration safely
  const hasKey = Boolean(process.env.GROQ_API_KEY)
  const keyLength = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 0
  const isGsk = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.startsWith('gsk_') : false
  const provider = process.env.AI_PROVIDER
  const genEnabled = process.env.AI_GENERATION_ENABLED
  const model = process.env.GROQ_MODEL || AI_CONFIG.groq.defaultModel

  console.log(`1. Backend GROQ_API_KEY loaded securely : ${hasKey} (length: ${keyLength}, prefix: ${isGsk ? 'gsk_' : 'unknown'})`)
  console.log(`2. AI_PROVIDER                           : ${provider}`)
  console.log(`   AI_GENERATION_ENABLED                 : ${genEnabled}`)
  console.log(`   Configured Model                      : ${model}`)

  if (!hasKey) {
    console.error('FAIL: GROQ_API_KEY is not loaded in process.env!')
    process.exit(1)
  }

  // 3. Verify Model Availability via Groq models endpoint
  console.log('\n3. Checking Groq Model Availability (GET /openai/v1/models)...')
  try {
    const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
    })

    if (!modelsRes.ok) {
      const errText = await modelsRes.text()
      console.error(`FAIL: Models endpoint returned status ${modelsRes.status}: ${errText}`)
      process.exit(1)
    }

    const modelsData = await modelsRes.json()
    const availableModelIds = (modelsData.data || []).map((m) => m.id)
    const isModelPresent = availableModelIds.includes(model)
    console.log(`   Model "${model}" available on Groq: ${isModelPresent}`)
    if (!isModelPresent) {
      console.warn(`   Available models (${availableModelIds.length}): ${availableModelIds.slice(0, 10).join(', ')}...`)
    }
  } catch (err) {
    console.error(`FAIL: Failed to reach Groq models endpoint: ${err.message}`)
    process.exit(1)
  }

  // 4. Instantiate GroqProvider and verify properties
  console.log('\n4. Instantiating GroqProvider directly...')
  const groq = new GroqProvider()
  console.log(`   providerId : ${groq.providerId}`)
  console.log(`   modelId    : ${groq.modelId}`)
  console.log(`   isMock     : ${groq.isMock}`)

  if (groq.isMock === true) {
    console.error('FAIL: GroqProvider instantiated as mock!')
    process.exit(1)
  }

  // 5. Make a real structured test request to Groq
  console.log('\n5. Dispatching real test completion to Groq...')
  const testSystemPrompt = 'You are an educational AI assistant. Always return valid JSON matching {"status": string, "provider": string, "model": string, "testResponse": string}.'
  const testUserPrompt = 'Return a brief status object confirming connection to Groq API with model ' + model + '.'

  const startTime = performance.now()
  const result = await groq.generateLesson({
    systemPrompt: testSystemPrompt,
    userPrompt: testUserPrompt,
    options: {
      maxTokens: 150,
      temperature: 0.1,
    },
  })
  const elapsed = Number((performance.now() - startTime).toFixed(2))

  console.log(`   Success! Response received in ${elapsed} ms`)
  console.log(`   Parsed JSON content:`, result.content)
  console.log(`   Reported Token Usage:`, result.tokenUsage)

  console.log('\n=================================================================')
  console.log('       GROQ API CONNECTION & MODEL VERIFICATION SUCCESSFUL!      ')
  console.log('=================================================================\n')
}

testGroqConnection().catch((err) => {
  console.error('Unexpected audit failure:', err.message)
  process.exit(1)
})
