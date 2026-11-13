/**
 * Conversation Title Generator for CareerLaunch AI Learning Assistant (Phase 3.3.7).
 * Extracts clean, human-readable, structured titles formatted as:
 *   [Skill/Technology] — [Topic/Focus]
 *
 * Examples:
 *   "Teach me HTML from scratch" -> "HTML — Learn from Scratch"
 *   "Explain semantic HTML" -> "HTML — Semantic Elements"
 *   "Teach me Git branching" -> "Git — Branching"
 *   "Explain JavaScript closures" -> "JavaScript — Closures"
 *   "Explain useState" -> "React — useState"
 *
 * Operates with rich taxonomy matching and deterministic fallbacks.
 */

const TECH_ACRONYMS = new Set([
  'html', 'css', 'js', 'api', 'apis', 'dom', 'rest', 'sql', 'ui', 'ux', 'http', 'https', 'jwt', 'json', 'aws', 'ci/cd', 'ts', 'seo', 'wasm'
])

const KNOWN_SKILL_PATTERNS = [
  { pattern: /\b(html5?)\b/i, name: 'HTML' },
  { pattern: /\b(css3?|flexbox|grid|styling)\b/i, name: 'CSS' },
  { pattern: /\b(javascript|js|es6|es202\d)\b/i, name: 'JavaScript' },
  { pattern: /\b(typescript|ts)\b/i, name: 'TypeScript' },
  { pattern: /\b(react|reactjs|jsx|hooks?|usestate|useeffect|usecontext|usememo|usecallback|usereducer)\b/i, name: 'React' },
  { pattern: /\b(next\.?js|nextjs)\b/i, name: 'Next.js' },
  { pattern: /\b(node\.?js|nodejs|express)\b/i, name: 'Node.js' },
  { pattern: /\b(git|github|gitlab|version control)\b/i, name: 'Git' },
  { pattern: /\b(api|rest|graphql|endpoints?|fetch|axios)\b/i, name: 'API' },
  { pattern: /\b(browser|dom|event loop|rendering|reflow)\b/i, name: 'Browser' },
  { pattern: /\b(performance|lighthouse|core web vitals|lazy load)\b/i, name: 'Performance' },
  { pattern: /\b(testing|jest|cypress|playwright|vitest|unit test)\b/i, name: 'Testing' },
]

const SPECIFIC_TOPIC_RULES = [
  // Scratch / Roadmap / Curriculum
  { pattern: /\b(from scratch|learn\s+from\s+scratch|zero to hero|roadmap|learning path|curriculum|study plan|know nothing about|start from zero)\b/i, topic: 'Learn from Scratch' },

  // Semantic Elements
  { pattern: /\b(semantic html|semantic elements?|semantic tags?|semantic structure)\b/i, topic: 'Semantic Elements' },

  // Void Elements
  { pattern: /\b(void elements?|void tags?|self[- ]closing tags?|empty elements?)\b/i, topic: 'Void Elements' },

  // Forms & Inputs
  { pattern: /\b(forms?|form handling|input fields?|validation|form inputs?)\b/i, topic: 'Forms & Inputs' },

  // Git specific
  { pattern: /\b(branching|branch|branches)\b/i, topic: 'Branching' },
  { pattern: /\b(merge|merging|rebase|rebasing)\b/i, topic: 'Merging & Rebase' },
  { pattern: /\b(commit|push|pull|fetch|staging|status)\b/i, topic: 'Basic Workflow' },
  { pattern: /\b(conflict|conflicts|merge conflict)\b/i, topic: 'Merge Conflicts' },

  // JavaScript specific
  { pattern: /\b(closures?|lexical scope|lexical environment)\b/i, topic: 'Closures' },
  { pattern: /\b(event loop|microtasks?|macrotasks?|call stack)\b/i, topic: 'Event Loop' },
  { pattern: /\b(promises?|async[- ]await|asynchronous)\b/i, topic: 'Async & Promises' },
  { pattern: /\b(prototypes?|prototypal inheritance|prototype chain)\b/i, topic: 'Prototypes & Inheritance' },
  { pattern: /\b(hoisting|var let const|temporal dead zone|tdz)\b/i, topic: 'Hoisting & Scope' },
  { pattern: /\b(this keyword|call apply bind|execution context)\b/i, topic: 'This & Binding' },

  // React specific
  { pattern: /\b(usestate|state management in react|component state)\b/i, topic: 'useState' },
  { pattern: /\b(useeffect|side effects?|lifecycle)\b/i, topic: 'useEffect' },
  { pattern: /\b(usecontext|context api)\b/i, topic: 'Context API' },
  { pattern: /\b(usememo|usecallback|memoization|react memo)\b/i, topic: 'Performance Hooks' },
  { pattern: /\b(virtual dom|reconciliation|fiber|diffing)\b/i, topic: 'Virtual DOM' },

  // CSS specific
  { pattern: /\b(flexbox|flex container|flex direction|align items|justify content)\b/i, topic: 'Flexbox' },
  { pattern: /\b(grid|css grid|grid template)\b/i, topic: 'CSS Grid' },
  { pattern: /\b(box model|margin padding|border-box)\b/i, topic: 'Box Model' },
  { pattern: /\b(specificity|cascade|inheritance)\b/i, topic: 'Specificity & Cascade' },
  { pattern: /\b(responsive design|media queries?|mobile first)\b/i, topic: 'Responsive Design' },

  // Interview preparation
  { pattern: /\b(interviews?|interview questions?|interview prep|technical interview)\b/i, topic: 'Interview Preparation' },

  // Coding challenges & exercises
  { pattern: /\b(coding challenges?|practical exercise|hands[- ]on practice|code challenge)\b/i, topic: 'Coding Challenge' },

  // Deep dive / elaboration
  { pattern: /\b(more\s+deeply|deeper|deep\s+dive|in[- ]depth)\b/i, topic: 'Deep Dive' },
]

function capitalizeWords(str) {
  if (!str) return ''
  const minorWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'with', 'in', 'of'])
  return str
    .split(/\s+/)
    .map((word, index) => {
      const cleanWord = word.replace(/[^\w-]/g, '')
      const lower = cleanWord.toLowerCase()
      if (TECH_ACRONYMS.has(lower)) {
        return lower.toUpperCase()
      }
      if (lower === 'javascript') return 'JavaScript'
      if (lower === 'typescript') return 'TypeScript'
      if (lower === 'react') return 'React'
      if (lower === 'nextjs' || lower === 'next.js') return 'Next.js'
      if (lower === 'nodejs' || lower === 'node.js') return 'Node.js'
      if (lower === 'usestate') return 'useState'
      if (lower === 'useeffect') return 'useEffect'
      if (lower === 'usecontext') return 'useContext'
      if (lower === 'usememo') return 'useMemo'
      if (lower === 'usecallback') return 'useCallback'
      if (lower === 'github') return 'GitHub'

      if (index === 0 || !minorWords.has(lower)) {
        return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase()
      }
      return cleanWord.toLowerCase()
    })
    .join(' ')
}

/**
 * Generates an editorial [Skill] — [Topic] conversation title from a student prompt.
 */
export function generateConversationTitle(promptText, activeSkill = 'Tech') {
  if (!promptText || typeof promptText !== 'string') {
    return `${activeSkill} — Learning Session`
  }

  // Clean prompt text
  let clean = promptText.trim().replace(/^["'`]+|["'`]+$/g, '').trim()
  clean = clean.replace(/[?.!:]+$/, '').trim()

  // 1. Identify primary technology / skill
  let detectedSkill = null
  for (const { pattern, name } of KNOWN_SKILL_PATTERNS) {
    if (pattern.test(clean)) {
      detectedSkill = name
      break
    }
  }

  // Fallback to activeSkill if prompt doesn't explicitly name a known technology
  if (!detectedSkill) {
    const activeLower = (activeSkill || '').toLowerCase()
    for (const { pattern, name } of KNOWN_SKILL_PATTERNS) {
      if (pattern.test(activeLower)) {
        detectedSkill = name
        break
      }
    }
    if (!detectedSkill) {
      detectedSkill = capitalizeWords(activeSkill) || 'Frontend'
    }
  }

  // 2. Identify primary topic or focus
  let detectedTopic = null
  for (const { pattern, topic } of SPECIFIC_TOPIC_RULES) {
    if (pattern.test(clean)) {
      detectedTopic = topic
      break
    }
  }

  // If both skill and topic were identified, produce "[Skill] — [Topic]"
  if (detectedSkill && detectedTopic) {
    // Avoid redundant repetition like "HTML — Semantic HTML"
    if (detectedTopic.toLowerCase().startsWith(detectedSkill.toLowerCase() + ' ')) {
      detectedTopic = detectedTopic.slice(detectedSkill.length).trim()
    }
    return `${detectedSkill} — ${detectedTopic}`
  }

  // 3. Fallback extraction: Remove conversational filler prefixes
  let coreText = clean
    .replace(/^(?:i want to learn|teach me about|teach me|can you teach me|explain in detail|explain deeply|explain|what is|what are|how does|how to use|prepare me for|start teaching me in a way that i know nothing about|start teaching me about|start with)\s+/i, '')
    .replace(/\s+(?:from scratch|in detail|step by step|with practical examples|with examples|deeply|please|for technical interviews|for beginners)$/i, '')
    .trim()

  // Remove the skill name if it appears at the start of coreText to avoid "HTML — HTML Tags"
  const skillRegex = new RegExp(`^${detectedSkill}\\s*`, 'i')
  coreText = coreText.replace(skillRegex, '').trim()

  if (coreText.length > 0) {
    // Take first 2-4 meaningful words
    const words = coreText.split(/\s+/).slice(0, 4).join(' ')
    const formattedTopic = capitalizeWords(words)
    if (formattedTopic.length > 2) {
      return `${detectedSkill} — ${formattedTopic}`
    }
  }

  // 4. Deterministic final fallback
  return `${detectedSkill} — Concept Overview`
}
