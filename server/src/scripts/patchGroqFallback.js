import fs from 'fs'

const p = 'server/src/services/ai/groqProvider.js'
let content = fs.readFileSync(p, 'utf8')

const target = "const isTpmOverflow = response.status === 413 && (errBody.includes('tokens per minute') || errBody.includes('rate_limit_exceeded'))"
const replacement = `${target}
          const isTpdOverflow = (response.status === 429 || response.status === 413) && (errBody.includes('tokens per day') || errBody.includes('TPD'))
          if (isTpdOverflow && model !== AI_CONFIG.groq.fallbackModel && AI_CONFIG.groq.fallbackModel) {
            console.warn('[GroqProvider] Primary model ' + model + ' reached daily limit (TPD). Seamlessly failing over to ' + AI_CONFIG.groq.fallbackModel + '...')
            clearTimeout(timeout)
            return this.chatCompletion({
              messages,
              responseFormat,
              temperature,
              maxTokens,
              options: { ...options, model: AI_CONFIG.groq.fallbackModel }
            })
          }`

if (!content.includes(target)) {
  console.error('Target not found in groqProvider.js')
  process.exit(1)
}

content = content.replace(target, replacement)
fs.writeFileSync(p, content, 'utf8')
console.log('Successfully updated groqProvider.js with seamless TPD fallback!')
