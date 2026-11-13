import { GroqProvider, MockGroqProvider } from './groqProvider.js'
import { AI_CONFIG } from './aiConfig.js'
import { retrieveKnowledge } from '../retrieval/hybridRetriever.js'

/**
 * Learning Assistant Service (Phase 3.2: Skill-Focused Intelligent Teaching)
 * Orchestrates continuous, single-thread learning conversations powered by real Groq inference.
 * Supports three intelligent teaching modes:
 * - Mode A: Complete Learning Roadmap (8 comprehensive stages from beginner to interview-ready)
 * - Mode B: Detailed Concept Teaching (in-depth interview-ready explanations, mental models, code, pitfall & interview QA)
 * - Mode C: Conversational Follow-up (contextual exploration, exercises, drill-downs, skill transitions)
 */
class LearningAssistantService {
  constructor() {
    this.provider = null
    this.initProvider()
  }

  initProvider() {
    try {
      if (process.env.GROQ_API_KEY) {
        this.provider = new GroqProvider({
          model: process.env.GROQ_MODEL || AI_CONFIG.groq.defaultModel,
        })
      } else {
        console.warn('[LearningAssistantService] GROQ_API_KEY not found. Using MockGroqProvider.')
        this.provider = new MockGroqProvider()
      }
    } catch (err) {
      console.warn('[LearningAssistantService] Failed to init GroqProvider, falling back to mock:', err.message)
      this.provider = new MockGroqProvider()
    }
  }

  /**
   * Generates a conversational assistant response for the student's learning session.
   *
   * @param {object} params
   * @param {object} params.session - The LearningSession document
   * @param {string} params.userMessage - The student's input message
   * @param {Array<object>} [params.conversationHistory=[]] - Recent conversation history
   * @returns {Promise<{ reply: string, type: string, structuredData: object | null, suggestedActions: string[], providerMetadata: object }>}
   */
  async generateAssistantResponse({ session, userMessage, conversationHistory = [] }) {
    if (!this.provider || !this.provider.isAvailable()) {
      this.initProvider()
    }

    const roleTitle = session.roleTitle || 'Frontend Developer'
    const roleId = session.roleId || 'frontend-developer'
    const selectedSkills = session.selectedSkills || []
    const customSkills = session.customSkills || []
    const context = session.currentLearningContext || {}

    const allSkillsList = [
      ...selectedSkills.map((s) => s.name),
      ...customSkills.map((c) => c.name),
    ]
    const skillsString = allSkillsList.length > 0 ? allSkillsList.join(', ') : 'Modern Frontend Technologies'
    const userMsgLower = userMessage.toLowerCase()

    // 1. Target Skill Resolution
    let explicitSkill = null
    const skillPatterns = [
      { name: 'HTML', match: ['html', 'semantic html', 'html5'] },
      { name: 'CSS', match: ['css', 'css3', 'flexbox', 'grid', 'responsive design', 'box model'] },
      { name: 'JavaScript', match: ['javascript', 'js', 'closures', 'event loop', 'es6', 'prototype', 'dom'] },
      { name: 'TypeScript', match: ['typescript', 'ts', 'types', 'generics', 'interfaces'] },
      { name: 'React', match: ['react', 'jsx', 'usestate', 'useeffect', 'hooks', 'virtual dom', 'next.js', 'nextjs'] },
    ]

    for (const sk of skillPatterns) {
      if (sk.match.some((kw) => userMsgLower.includes(kw))) {
        explicitSkill = sk.name
        break
      }
    }

    // Check for skill transition commands: "I already know HTML. Let's start CSS"
    if (userMsgLower.includes('start ') || userMsgLower.includes('switch to ') || userMsgLower.includes('move to ')) {
      for (const sk of skillPatterns) {
        if (userMsgLower.includes(`start ${sk.name.toLowerCase()}`) || userMsgLower.includes(`to ${sk.name.toLowerCase()}`)) {
          explicitSkill = sk.name
          context.activeSkill = sk.name
          break
        }
      }
    }

    const targetSkill = explicitSkill || context.activeSkill || allSkillsList[0] || 'Frontend Development'
    if (explicitSkill && context.activeSkill !== explicitSkill) {
      context.activeSkill = explicitSkill
    }

    // 2. Intelligent Teaching Mode Detection
    const isModeA =
      (userMsgLower.includes('from scratch') ||
        userMsgLower.includes('roadmap') ||
        userMsgLower.includes('learning path') ||
        userMsgLower.includes('study plan') ||
        userMsgLower.includes('curriculum') ||
        userMsgLower.includes('completely') ||
        (userMsgLower.includes('prepare me for') &&
          (userMsgLower.includes('frontend developer interview') || userMsgLower.includes('technical interview')) &&
          !userMsgLower.includes('question'))) &&
      !userMsgLower.includes('explain') &&
      !userMsgLower.includes('teach this topic')

    const isModeB =
      !isModeA &&
      (userMsgLower.includes('explain') ||
        userMsgLower.includes('what is') ||
        userMsgLower.includes('what are') ||
        userMsgLower.includes('how does') ||
        userMsgLower.includes('teach me') ||
        userMsgLower.includes('in detail') ||
        userMsgLower.includes('deep dive'))

    const detectedMode = isModeA ? 'MODE_A_ROADMAP' : isModeB ? 'MODE_B_DETAILED_TEACHING' : 'MODE_C_FOLLOW_UP'

    // 3. Retrieve RAG Evidence if query involves technical concepts
    let retrievedEvidence = []
    try {
      const searchRes = await retrieveKnowledge({
        query: userMessage,
        roleId,
        limit: 3,
      })
      if (searchRes?.results?.length > 0) {
        retrievedEvidence = searchRes.results
      }
    } catch (ragErr) {
      console.warn('[LearningAssistantService] RAG retrieval skipped or failed:', ragErr.message)
    }

    // 4. Format System Prompt with Strict Skill-Focused & 3-Mode Teaching Rules
    const systemPrompt = this.buildSystemPrompt({
      roleTitle,
      roleId,
      skillsString,
      allSkillsList,
      context,
      targetSkill,
      detectedMode,
      retrievedEvidence,
    })

    // 5. Format Conversation History for Groq (take last 8 messages)
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
    ]

    const recentHistory = conversationHistory.slice(-4)
    for (const msg of recentHistory) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        let content = msg.content || ''
        // Compact long previous assistant messages in prompt history to preserve token budget
        if (msg.role === 'assistant' && content.length > 500) {
          content = content.slice(0, 450) + '... [earlier response truncated for brevity]'
        }
        formattedMessages.push({
          role: msg.role,
          content,
        })
      }
    }

    formattedMessages.push({
      role: 'user',
      content: userMessage,
    })

    const targetMaxTokens =
      detectedMode === 'MODE_A_ROADMAP' ? 2200 : detectedMode === 'MODE_B_DETAILED_TEACHING' ? 1600 : 1000

    // 6. Dispatch to Groq API with automatic fallback for token boundary / JSON validation
    let completion
    try {
      completion = await this.provider.chatCompletion({
        messages: formattedMessages,
        responseFormat: { type: 'json_object' },
        temperature: 0.4,
        maxTokens: targetMaxTokens,
      })
    } catch (groqErr) {
      const isJsonBoundaryErr =
        groqErr.message?.includes('json_validate_failed') ||
        groqErr.message?.includes('max completion tokens') ||
        groqErr.message?.includes('Failed to generate JSON')

      if (isJsonBoundaryErr) {
        console.warn(
          '[LearningAssistantService] Groq JSON completion token boundary reached, retrying with streamlined context...',
        )
        const streamlinedMessages = [
          formattedMessages[0], // system prompt
          {
            role: 'user',
            content: `${userMessage}\n\n[INSTRUCTION: Provide a direct, friendly, conversational explanation under 350 words. Return a strictly valid JSON object matching: { "reply": "...", "type": "text", "suggestedActions": ["..."] }]`,
          },
        ]
        completion = await this.provider.chatCompletion({
          messages: streamlinedMessages,
          responseFormat: { type: 'json_object' },
          temperature: 0.3,
          maxTokens: 1100,
        })
      } else {
        throw groqErr
      }
    }

    const rawContent = completion.content
    let responseObj = typeof rawContent === 'object' && rawContent !== null ? rawContent : {}

    if (typeof rawContent === 'string') {
      try {
        responseObj = JSON.parse(rawContent)
      } catch {
        responseObj = { reply: rawContent, type: 'text' }
      }
    }

    // 7. Sanitize and Validate Response
    let reply = responseObj.reply || ''

    // Sanitize any lingering textbook boilerplate headings
    const FORBIDDEN_HEADER_MAP = [
      [/^#{1,4}\s*Common Pitfalls:?/gim, '### Common Pitfalls & Things to Watch Out For:'],
      [/^#{1,4}\s*Conceptual Foundations:?/gim, '### Concept Overview & Why It Matters:'],
      [/^#{1,4}\s*Core Concepts and Invariants:?/gim, '### Key Concepts & Rules:'],
      [/^#{1,4}\s*Step-by-Step Algorithmic Mechanics:?/gim, '### How It Works Under The Hood:'],
      [/^#{1,4}\s*Practical Implementation:?/gim, '### Practical Code Examples:'],
      [/^#{1,4}\s*Complexity Analysis:?/gim, '### Performance & Memory Considerations:'],
      [/^#{1,4}\s*Technical Interview Strategy:?/gim, '### In Technical Interviews:'],
      [/^#{1,4}\s*Production Engineering Application:?/gim, '### Real-World Production Patterns:'],
      [/^#{1,4}\s*Learning Objectives:?/gim, ''],
    ]
    for (const [pattern, rep] of FORBIDDEN_HEADER_MAP) {
      reply = reply.replace(pattern, rep)
    }

    let type = responseObj.type || 'text'
    const isOutOfScope = Boolean(responseObj.isOutOfScope)
    let structuredData = null
    const suggestedActions = Array.isArray(responseObj.suggestedActions)
      ? responseObj.suggestedActions.slice(0, 2)
      : []

    // Enforce Boundary Redirect if flagged out of scope
    if (isOutOfScope) {
      type = 'text'
      if (!reply || reply.length < 20) {
        reply = `I'm your **${roleTitle}** mentor, so I focus strictly on your frontend engineering track (**${skillsString}**). While that's an interesting subject, it falls outside our frontend scope. Would you like to dive into **${targetSkill}** or another frontend technology instead?`
      }
      suggestedActions.length = 0
      if (allSkillsList.length > 0) {
        suggestedActions.push(`Teach me ${allSkillsList[0]}`)
      }
    } else if (type === 'roadmap' && isModeA && responseObj.roadmap) {
      structuredData = { roadmap: this.validateRoadmap(responseObj.roadmap, targetSkill) }
    } else if (responseObj.prerequisiteCheck) {
      type = 'prerequisite_check'
      structuredData = { prerequisiteCheck: responseObj.prerequisiteCheck }
    } else {
      type = 'text'
    }

    // 8. Update Learning Context (knowledge detection & active skill)
    const detectedKnowledge = responseObj.detectedKnowledge || {}
    if (Array.isArray(detectedKnowledge.stated) && detectedKnowledge.stated.length > 0) {
      const existing = new Set(context.statedKnowledge || [])
      detectedKnowledge.stated.forEach((k) => existing.add(k))
      context.statedKnowledge = Array.from(existing)
    }

    if (detectedKnowledge.activeSkill) {
      context.activeSkill = detectedKnowledge.activeSkill
    } else if (targetSkill) {
      context.activeSkill = targetSkill
    }

    if (structuredData?.roadmap) {
      context.generatedRoadmap = structuredData.roadmap
    }

    return {
      reply,
      type,
      structuredData,
      suggestedActions,
      providerMetadata: {
        provider: this.provider.providerId || 'groq',
        model: completion.model || this.provider.modelId || 'openai/gpt-oss-120b',
        durationMs: completion.durationMs,
        promptTokens: completion.tokenUsage?.promptTokens || 0,
        completionTokens: completion.tokenUsage?.completionTokens || 0,
        totalTokens: completion.tokenUsage?.totalTokens || 0,
      },
    }
  }

  buildSystemPrompt({
    roleTitle,
    roleId: _roleId,
    skillsString,
    allSkillsList: _allSkillsList,
    context,
    targetSkill,
    detectedMode,
    retrievedEvidence,
  }) {
    const activeSkill = targetSkill || context.activeSkill || 'Frontend Development'

    let evidenceSection = ''
    if (retrievedEvidence.length > 0) {
      evidenceSection = `\n\nCANONICAL RELEVANT CURRICULUM CONCEPTS (Technical reference for factual accuracy and syntax):\n`
      retrievedEvidence.forEach((item, idx) => {
        evidenceSection += `[Reference ${idx + 1}] ${item.sourceTitle || ''}: ${item.chunkText || item.contentSnippet || ''}\n\n`
      })
    }

    return `You are CareerLaunch's Dedicated AI Technical Mentor for the "${roleTitle}" track.
You teach students and aspiring engineers preparing for high-stakes technical interviews.

YOUR CORE IDENTITY & TONE:
- You are an expert senior engineering mentor: knowledgeable, encouraging, direct, and conversational (like ChatGPT).
- Answer the student's prompt directly without robotic filler (e.g. "Welcome to this guide", "In this tutorial we will...").
- Write with clarity, technical rigor, and interview preparation depth.

STRICT SKILL-FOCUSED BEHAVIOUR:
- The current target skill focus is: **${activeSkill}**.
- When teaching a specific skill, teach ONLY that skill!
  * If the student asks for HTML, teach ONLY HTML. DO NOT automatically introduce CSS, JavaScript, React, Next.js, or backend frameworks!
  * If the student asks for JavaScript, focus strictly on JavaScript.
  * If the student asks for React, focus strictly on React (only mentioning JavaScript prerequisites when essential to explain hooks/closures).
  * If the student asks to switch (e.g., "I already know HTML. Let's start CSS."), acknowledge HTML, update focus, and teach CSS.
- Keep all explanations, code snippets, exercises, and interview questions strictly aligned with the target skill.

CURRENT TEACHING MODE: ${detectedMode}

GUIDELINES FOR THREE TEACHING MODES:

--- MODE A: COMPLETE LEARNING ROADMAP ---
Triggered when the student asks to learn a skill from scratch, complete path, curriculum, or interview prep.
- Set "type": "roadmap" in your JSON response and populate the "roadmap" object.
- The roadmap MUST be a comprehensive, structured path containing ALL 8 essential stages:
  1. Beginner Foundations (core syntax, mental model, document/program structure)
  2. Core Concepts (essential tags/constructs/APIs used every day)
  3. Intermediate Concepts (architecture, semantic patterns, data flow)
  4. Advanced Concepts (under-the-hood engine/browser mechanics, security, lifecycle)
  5. Practical Implementation (accessibility/standards, modular design, API integration)
  6. Real-World Projects (concrete production projects demonstrating mastery)
  7. Technical Interview Preparation (high-frequency interview patterns, trivia vs coding)
  8. Revision and Assessment (coding challenges, mock interview checkpoints)
- For every milestone:
  * Provide milestoneId ("m1", "m2", ... "m8"), title, estimatedHours, practicalExercise.
  * Include 2 to 3 detailed topics per milestone: { topicId, title, description, subtopics: string[], interviewCheckpoints: string[] }.
- IMPORTANT: The roadmap must focus STRICTLY on **${activeSkill}** (e.g., an HTML roadmap contains ONLY HTML concepts; a JavaScript roadmap contains ONLY JavaScript concepts). If the student explicitly asked for the entire "${roleTitle}" track, then cover the selected skills (${skillsString}) in logical sequence.
- In "reply", write an engaging 40-70 word introduction explaining how the roadmap guides them to interview confidence.

--- MODE B: DETAILED CONCEPT TEACHING ---
Triggered when the student asks about a concept (e.g. "Explain semantic HTML in detail", "Explain closures with examples", "start teaching me in a way that i know nothing about git and github").
- Set "type": "text".
- Deliver a clear, conversational, high-quality tutorial (typically 250-450 words) suitable for real understanding and interview confidence.
- Speak like a friendly senior mentor explaining to a beginner or junior developer.
- Organize your explanation with clean, readable Markdown headings (###):
  ### Concept Overview & Why It Matters
  (Direct definition, purpose, and problem it solves)
  ### How It Works Under The Hood
  (Mental model, engine/git/browser mechanics explained simply)
  ### Syntax & Practical Code Examples
  (Clean, beginner-friendly code snippet or commands with brief explanation)
  ### Common Pitfalls & Interview Takeaway
  (Common mistakes to avoid and high-frequency interview focus)
- End with ONE natural conversational follow-up question (e.g. "Would you like to try a small hands-on command exercise, or explore the next concept?").

--- MODE C: CONVERSATIONAL FOLLOW-UP ---
Triggered on follow-ups, practical examples, interview questions, or skill transitions.
- Set "type": "text".
- Use conversation history to understand context.
- If asked "Explain this more deeply": dive into the advanced internal mechanics without repeating the basic definition.
- If asked "Give me practical examples": provide production-grade, accessible code snippets with line-by-line breakdowns.
- If asked "Prepare me for [Skill] interviews" or "Ask me interview questions": provide 4-5 high-yield technical interview questions with clear model answers, followed by a practice question for the student.
- If student says "I already know X. Let's start Y": warmly acknowledge X, record X in stated knowledge, switch focus to Y, and begin teaching Y.

ROLE SCOPE & BOUNDARIES:
- Focus strictly on frontend engineering: HTML, CSS, JavaScript, TypeScript, React, Next.js, web APIs, browser fundamentals, web performance, and testing.
- If student asks for an unrelated topic outside frontend (e.g. Kubernetes cluster deployment on AWS, Terraform, Ansible, Python Django backend, Machine Learning with PyTorch, iOS Swift):
  - Set "isOutOfScope": true.
  - Reply with a warm, friendly redirection: "I'm your ${roleTitle} mentor, so I focus strictly on your frontend track (${skillsString}). While that's an interesting topic, it's outside our frontend engineering scope. Would you like to dive into ${activeSkill} instead?"
  - Suggest ["Teach me ${activeSkill}"]

OUTPUT FORMAT:
You MUST respond with a single valid JSON object strictly matching this schema:
{
  "type": "text" | "roadmap" | "prerequisite_check",
  "isOutOfScope": false,
  "reply": "Your conversational response in Markdown (detailed for Mode B/C, brief intro for Mode A)",
  "roadmap": {
    "title": "Comprehensive ${activeSkill} Learning Roadmap",
    "objective": "Master ${activeSkill} from fundamentals to technical interview readiness",
    "estimatedWeeks": 4,
    "milestones": [
      {
        "milestoneId": "m1",
        "title": "1. Beginner Foundations",
        "estimatedHours": 5,
        "practicalExercise": "Build a hands-on project demonstrating these concepts.",
        "topics": [
          {
            "topicId": "topic-1-1",
            "title": "Topic Name",
            "description": "What you will learn in this topic.",
            "subtopics": ["Subtopic 1", "Subtopic 2"],
            "interviewCheckpoints": ["Key interview question or concept to master"]
          }
        ]
      }
    ]
  },
  "prerequisiteCheck": null,
  "suggestedActions": [
    "Optional short follow-up action (max 2)"
  ],
  "detectedKnowledge": {
    "stated": ["Skills or topics the student mentioned knowing"],
    "demonstrated": [],
    "activeSkill": "${activeSkill}"
  }
}${evidenceSection}`
  }

  /**
   * Validates and ensures completeness of the generated roadmap structure.
   */
  validateRoadmap(roadmap, targetSkill = 'Frontend Development') {
    if (!roadmap || typeof roadmap !== 'object') return null

    const validRoadmap = {
      roadmapId: roadmap.roadmapId || `rm-${Date.now()}`,
      title: roadmap.title || `Comprehensive ${targetSkill} Learning Roadmap`,
      objective: roadmap.objective || `Master ${targetSkill} from fundamentals to technical interview readiness.`,
      estimatedWeeks: Number(roadmap.estimatedWeeks) || 6,
      targetSkill,
      milestones: [],
    }

    if (Array.isArray(roadmap.milestones)) {
      validRoadmap.milestones = roadmap.milestones.map((m, mIdx) => ({
        milestoneId: m.milestoneId || `m${mIdx + 1}`,
        title: m.title || `Milestone ${mIdx + 1}`,
        estimatedHours: Number(m.estimatedHours) || 6,
        prerequisites: Array.isArray(m.prerequisites) ? m.prerequisites : [],
        practicalExercise: m.practicalExercise || 'Build a small hands-on project demonstrating these concepts.',
        topics: Array.isArray(m.topics)
          ? m.topics.map((t, tIdx) => ({
              topicId: t.topicId || `topic-${mIdx + 1}-${tIdx + 1}`,
              title: t.title || 'Core Concept',
              description: t.description || 'Foundational principles and implementation mechanics.',
              subtopics: Array.isArray(t.subtopics) ? t.subtopics : [],
              interviewCheckpoints: Array.isArray(t.interviewCheckpoints)
                ? t.interviewCheckpoints
                : ['Core mental model and interview patterns.'],
            }))
          : [],
      }))
    }

    return validRoadmap
  }
}

export const learningAssistantService = new LearningAssistantService()
