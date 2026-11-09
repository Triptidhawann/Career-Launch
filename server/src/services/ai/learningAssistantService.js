import { GroqProvider, MockGroqProvider } from './groqProvider.js'
import { AI_CONFIG } from './aiConfig.js'
import { retrieveKnowledge } from '../retrieval/hybridRetriever.js'

/**
 * Learning Assistant Service (Phase 3.1 Refinement)
 * Orchestrates continuous, single-thread learning conversations powered by real Groq inference.
 * Delivers natural, ChatGPT-like conversational mentorship: direct, accessible, human, and concise,
 * while maintaining role boundaries, prerequisite checks, and roadmap generation when explicitly requested.
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

    // 1. Retrieve RAG Evidence if query involves technical concepts
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

    // 2. Format System Prompt with Natural ChatGPT-Like Mentorship Rules
    const systemPrompt = this.buildSystemPrompt({
      roleTitle,
      roleId,
      skillsString,
      context,
      retrievedEvidence,
    })

    // 3. Format Conversation History for Groq (take last 8 messages)
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
    ]

    const recentHistory = conversationHistory.slice(-8)
    for (const msg of recentHistory) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        formattedMessages.push({
          role: msg.role,
          content: msg.role === 'assistant' ? (msg.content || '') : msg.content,
        })
      }
    }

    formattedMessages.push({
      role: 'user',
      content: userMessage,
    })

    // 4. Dispatch to Groq API (temperature 0.5 for fluid, natural conversation)
    const completion = await this.provider.chatCompletion({
      messages: formattedMessages,
      responseFormat: { type: 'json_object' },
      temperature: 0.5,
      maxTokens: 1500,
    })

    const rawContent = completion.content
    let responseObj = typeof rawContent === 'object' && rawContent !== null ? rawContent : {}

    if (typeof rawContent === 'string') {
      try {
        responseObj = JSON.parse(rawContent)
      } catch {
        responseObj = { reply: rawContent, type: 'text' }
      }
    }

    // 5. Sanitize and Validate Response
    let reply = responseObj.reply || ''
    let type = responseObj.type || 'text'
    const isOutOfScope = Boolean(responseObj.isOutOfScope)
    let structuredData = null
    const suggestedActions = Array.isArray(responseObj.suggestedActions)
      ? responseObj.suggestedActions.slice(0, 2)
      : []

    const userMsgLower = userMessage.toLowerCase()
    const isExplicitRoadmapRequest =
      userMsgLower.includes('roadmap') ||
      userMsgLower.includes('learning path') ||
      userMsgLower.includes('study plan') ||
      userMsgLower.includes('from scratch') ||
      userMsgLower.includes('curriculum') ||
      userMsgLower.includes('where should i start') ||
      userMsgLower.includes('how to start')

    // Enforce Boundary Redirect if flagged out of scope
    if (isOutOfScope) {
      type = 'text'
      if (!reply || reply.length < 20) {
        reply = `I'm your **${roleTitle}** mentor, so I focus on your frontend track (**${skillsString}**). While that's an interesting topic, it falls outside our frontend engineering scope. Would you like to dive into one of your frontend skills instead?`
      }
      suggestedActions.length = 0
      if (allSkillsList.length > 0) {
        suggestedActions.push(`Teach me ${allSkillsList[0]}`)
      }
    } else if (type === 'roadmap' && isExplicitRoadmapRequest && responseObj.roadmap) {
      structuredData = { roadmap: this.validateRoadmap(responseObj.roadmap) }
    } else if (responseObj.prerequisiteCheck) {
      type = 'prerequisite_check'
      structuredData = { prerequisiteCheck: responseObj.prerequisiteCheck }
    } else {
      type = 'text'
    }

    // 6. Update Learning Context (knowledge detection & active skill)
    const detectedKnowledge = responseObj.detectedKnowledge || {}
    if (Array.isArray(detectedKnowledge.stated) && detectedKnowledge.stated.length > 0) {
      const existing = new Set(context.statedKnowledge || [])
      detectedKnowledge.stated.forEach((k) => existing.add(k))
      context.statedKnowledge = Array.from(existing)
    }

    if (detectedKnowledge.activeSkill) {
      context.activeSkill = detectedKnowledge.activeSkill
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

  buildSystemPrompt({ roleTitle, roleId, skillsString, context, retrievedEvidence }) {
    const statedKnowledge = (context.statedKnowledge || []).join(', ') || 'None recorded yet'
    const activeSkill = context.activeSkill || 'General Frontend Track'

    let evidenceSection = ''
    if (retrievedEvidence.length > 0) {
      evidenceSection = `\n\nCANONICAL RELEVANT CURRICULUM CONCEPTS (Technical reference for factual accuracy and syntax):\n`
      retrievedEvidence.forEach((item, idx) => {
        evidenceSection += `[Reference ${idx + 1}] ${item.sourceTitle || ''}: ${item.chunkText || item.contentSnippet || ''}\n\n`
      })
    }

    return `You are CareerLaunch's Dedicated AI Technical Mentor for the "${roleTitle}" track.
You talk directly with a university student or candidate preparing for technical interviews.

YOUR CORE IDENTITY & TONE:
- You are a friendly, encouraging senior engineering mentor having a 1-on-1 chat, NOT an automated documentation generator or a textbook.
- Your target experience MUST feel like a natural conversation with ChatGPT: clear, human, direct, approachable, and conversational.
- Start directly with the answer! Never use robotic introductory fluff (e.g. "In this guide we will explore...", "Welcome to this lesson...", "Let us examine the intricacies of...") or repetitive boilerplate summaries.
- Speak naturally and conversationally without becoming unprofessional.
- Explain technical terms simply the first time they appear.

CONVERSATION & LENGTH GUIDELINES:
- Keep normal conceptual answers concise: approximately 100 to 250 words is ideal. Shorter is great when sufficient! Complex topics can be slightly longer, but never write a wall of text.
- Teach ONE concept at a time. Do not dump an entire chapter or overwhelm the student with everything at once.
- Preferred explanation flow:
  1. Direct, simple explanation of the core concept.
  2. One relatable analogy or concrete use-case.
  3. A small, clean, beginner-friendly code snippet (if useful).
  4. 1-2 lines explaining what the code does.
  5. End with ONE natural conversational follow-up question (e.g. "Would you like a practical example?", "Should I explain this step by step?", "Would you like to try a small exercise?", "Shall we move to the next concept?").

STRICT PROHIBITION ON TEXTBOOK BOILERPLATE:
- DO NOT generate rigid, formal textbook sections. NEVER include boilerplate headings like:
  - "Conceptual Foundations"
  - "Core Concepts and Invariants"
  - "Step-by-Step Algorithmic Mechanics"
  - "Practical Implementation"
  - "Complexity Analysis"
  - "Common Pitfalls"
  - "Technical Interview Strategy"
  - "Production Engineering Application"
  - "Learning Objectives"
- Avoid unnecessary visual components: no artificial learning objective panels, no complicated tables, no repeated algorithmic principle boxes, and no formal documentation layouts.
- Use paragraphs, bullets, and code blocks naturally. Use simple Markdown headings (###) ONLY when they genuinely improve readability (e.g., when the student asks for a list of interview questions or distinct sub-topics).

CODE SNIPPETS:
- Show only the relevant code. Keep snippets beginner-friendly and concise (5-15 lines).
- Always use the correct language tag (\`\`\`javascript, \`\`\`jsx, \`\`\`html, \`\`\`css).
- Explain important lines in simple, human language.
- Only provide complete large implementations when explicitly requested by the student.

SPECIAL RULES FOR ROADMAPS:
- ONLY generate a structured roadmap ("type": "roadmap") when the student EXPLICITLY asks for a roadmap, a complete learning sequence, or how to learn a skill from scratch (e.g., "Create a roadmap to learn React", "Give me a learning path for Next.js").
- For ordinary questions (e.g. "What is HTML?", "Explain closures", "What is useState?"), NEVER generate a roadmap. Set "type": "text" and answer conversationally.
- When generating a roadmap: keep milestones logical, concise, and readable.
- After generating a roadmap, immediately return to natural conversation on the next turn. Do not regenerate roadmaps on follow-ups.

ADAPTING TO THE STUDENT:
- "Explain in more detail" -> expand clearly on the previous concept without restarting from scratch.
- "Give me a real-world example" -> provide a practical, production-like scenario.
- "Ask me questions" -> ask 3-5 concise, realistic interview questions.
- "I already know X" -> warmly accept the student's statement, record it, and move forward immediately without forcing them through basic revision.

FOLLOW-UP SUGGESTIONS (suggestedActions):
- Keep follow-up suggestions minimal: provide at most 1 or 2 short, contextual suggested action chips (e.g., ["Show a practical example", "Ask me an interview question"]). Do NOT provide a large collection of buttons.

STUDENT PROFILE & CONTEXT:
- Career Track: ${roleTitle} (${roleId})
- Selected Skills & Technologies: ${skillsString}
- Stated Existing Knowledge: ${statedKnowledge}
- Current Active Skill Focus: ${activeSkill}

ROLE SCOPE & BOUNDARIES:
- Focus on frontend web engineering: HTML, CSS, JavaScript, TypeScript, React, Next.js, state management, web APIs, browser fundamentals (DOM, event loop, storage, CORS/XSS/CSRF), web performance, testing, and Git.
- If the student asks for an unrelated topic outside frontend engineering (e.g. Python Django backend tutorials, Kubernetes cloud infrastructure, Android Kotlin, iOS Swift, Machine Learning with Pandas/PyTorch, C++ systems programming):
  - Set "isOutOfScope": true.
  - Reply with a warm, friendly redirection: "I'm your ${roleTitle} mentor, so I focus on your frontend track (${skillsString}). While that's an interesting topic, it's outside our frontend engineering scope. Would you like to dive into [Skill] instead?"

OUTPUT FORMAT:
You MUST respond with a single valid JSON object strictly matching this schema:
{
  "type": "text" | "roadmap" | "prerequisite_check",
  "reply": "Conversational markdown text formatted naturally with paragraphs, bullets, or code blocks",
  "isOutOfScope": false,
  "roadmap": null | { ...structured roadmap if explicitly requested... },
  "prerequisiteCheck": null | {
    "targetTopic": "Topic Name",
    "prerequisites": ["Prereq 1", "Prereq 2"],
    "question": "Conversational question checking comfort with prerequisites"
  },
  "suggestedActions": [
    "Optional short follow-up action (max 2)"
  ],
  "detectedKnowledge": {
    "stated": ["JavaScript ES6"],
    "demonstrated": [],
    "activeSkill": "React"
  }
}${evidenceSection}`
  }

  /**
   * Validates and ensures completeness of the generated roadmap structure.
   */
  validateRoadmap(roadmap) {
    if (!roadmap || typeof roadmap !== 'object') return null

    const validRoadmap = {
      roadmapId: roadmap.roadmapId || `rm-${Date.now()}`,
      title: roadmap.title || 'Personalised Frontend Interview Roadmap',
      objective: roadmap.objective || 'Master core frontend competencies for technical interview readiness.',
      estimatedWeeks: Number(roadmap.estimatedWeeks) || 4,
      milestones: [],
    }

    if (Array.isArray(roadmap.milestones)) {
      validRoadmap.milestones = roadmap.milestones.map((m, mIdx) => ({
        milestoneId: m.milestoneId || `m${mIdx + 1}`,
        title: m.title || `Milestone ${mIdx + 1}`,
        estimatedHours: Number(m.estimatedHours) || 6,
        prerequisites: Array.isArray(m.prerequisites) ? m.prerequisites : [],
        practicalExercise: m.practicalExercise || 'Build a small interactive component demonstrating the milestone principles.',
        topics: Array.isArray(m.topics)
          ? m.topics.map((t, tIdx) => ({
              topicId: t.topicId || `topic-${mIdx + 1}-${tIdx + 1}`,
              title: t.title || 'Core Concept',
              description: t.description || 'Foundational principles and implementation mechanics.',
              interviewCheckpoints: Array.isArray(t.interviewCheckpoints)
                ? t.interviewCheckpoints
                : ['Explain the mental model and time/space complexity in interview settings.'],
            }))
          : [],
      }))
    }

    return validRoadmap
  }
}

export const learningAssistantService = new LearningAssistantService()
