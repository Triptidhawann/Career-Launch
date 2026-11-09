import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUp,
  Check,
  CheckCircle2,
  Compass,
  Copy,
  Lightbulb,
  MapPin,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  fetchLearningMessages,
  fetchLearningSession,
  sendLearningMessage,
  startOrGetLearningSession,
} from '@/lib/api'
import '@/styles/learning-assistant.css'

/**
 * CodeBlock Component with Copy to Clipboard functionality
 */
function CodeBlock({ code, language = 'javascript' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <div className="assistant-codeblock">
      <div className="assistant-codeblock__header">
        <span className="assistant-codeblock__lang">{language || 'code'}</span>
        <button
          type="button"
          className="assistant-codeblock__copy"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={13} color="#4ade80" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  )
}

/**
 * Minimalist Markdown Renderer
 * Handles headings, paragraphs, lists, bold text, inline code, and fenced code blocks without external bloated libraries.
 */
function MarkdownRenderer({ content = '' }) {
  if (!content) return null

  // Split by fenced code blocks (```lang ... ```)
  const segments = []
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        data: content.substring(lastIndex, match.index),
      })
    }
    segments.push({
      type: 'code',
      language: match[1] || 'javascript',
      data: match[2].trim(),
    })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      data: content.substring(lastIndex),
    })
  }

  return (
    <div className="assistant-markdown">
      {segments.map((seg, idx) => {
        if (seg.type === 'code') {
          return <CodeBlock key={idx} code={seg.data} language={seg.language} />
        }

        // Render markdown text lines
        const lines = seg.data.split('\n')
        const elements = []
        let currentList = []

        const flushList = () => {
          if (currentList.length > 0) {
            elements.push(
              <ul key={`ul-${elements.length}`}>
                {currentList.map((li, lIdx) => (
                  <li key={lIdx}>{formatInline(li)}</li>
                ))}
              </ul>,
            )
            currentList = []
          }
        }

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          const trimmed = line.trim()

          if (!trimmed) {
            flushList()
            continue
          }

          if (trimmed.startsWith('#### ')) {
            flushList()
            elements.push(<h4 key={`h4-${i}`}>{formatInline(trimmed.substring(5))}</h4>)
          } else if (trimmed.startsWith('### ')) {
            flushList()
            elements.push(<h3 key={`h3-${i}`}>{formatInline(trimmed.substring(4))}</h3>)
          } else if (trimmed.startsWith('## ')) {
            flushList()
            elements.push(<h2 key={`h2-${i}`}>{formatInline(trimmed.substring(3))}</h2>)
          } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            currentList.push(trimmed.substring(2))
          } else {
            flushList()
            elements.push(<p key={`p-${i}`}>{formatInline(trimmed)}</p>)
          }
        }

        flushList()
        return <div key={idx}>{elements}</div>
      })}
    </div>
  )
}

function formatInline(text = '') {
  // Format bold (**text**), inline code (`code`), and italics (*text*)
  const parts = []
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g
  let lastIndex = 0
  let match

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    const token = match[0]
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<strong key={match.index}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="inline-code">
          {token.slice(1, -1)}
        </code>,
      )
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={match.index}>{token.slice(1, -1)}</em>)
    }
    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

export function LearningAssistantPage() {
  const { user } = useAuth()
  const { roleId = 'frontend-developer', sessionId: routeSessionId } = useParams()
  const navigate = useNavigate()

  // State
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputContent, setInputContent] = useState('')
  const [loadingSession, setLoadingSession] = useState(true)
  const [sending, setSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [expandedMilestones, setExpandedMilestones] = useState(new Set([0, 1]))

  const threadEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Scroll to bottom
  const scrollToBottom = (behavior = 'smooth') => {
    threadEndRef.current?.scrollIntoView({ behavior })
  }

  // Initial load
  useEffect(() => {
    let isMounted = true

    async function initSession() {
      try {
        setLoadingSession(true)
        setErrorMessage(null)

        let activeSessionId = routeSessionId

        // If no sessionId in route or placeholder, resolve active session
        if (!activeSessionId) {
          const sessionRes = await startOrGetLearningSession(roleId)
          if (sessionRes?.session?.sessionId) {
            activeSessionId = sessionRes.session.sessionId
            navigate(`/interview-preparation/${roleId}/assistant/${activeSessionId}`, {
              replace: true,
            })
          }
        }

        if (activeSessionId) {
          const [sessionData, messagesData] = await Promise.all([
            fetchLearningSession(activeSessionId),
            fetchLearningMessages(activeSessionId),
          ])

          if (isMounted) {
            setSession(sessionData.session)
            setMessages(messagesData.messages || [])
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to initialize learning assistant session:', err)
          setErrorMessage(err.message || 'Failed to load learning session.')
        }
      } finally {
        if (isMounted) {
          setLoadingSession(false)
          setTimeout(() => scrollToBottom('auto'), 200)
        }
      }
    }

    initSession()

    return () => {
      isMounted = false
    }
  }, [roleId, routeSessionId, navigate])

  // Handle send message
  const handleSendMessage = async (textToSend) => {
    const content = (textToSend || inputContent).trim()
    if (!content || sending || !session?.sessionId) return

    setInputContent('')
    setErrorMessage(null)
    setSending(true)

    // Optimistically add user message to UI
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      type: 'text',
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUserMsg])
    setTimeout(() => scrollToBottom(), 100)

    try {
      const response = await sendLearningMessage(session.sessionId, content)

      if (response?.assistantMessage) {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMsg.id),
          response.userMessage || tempUserMsg,
          response.assistantMessage,
        ])
        if (response.sessionContext) {
          setSession((prev) =>
            prev ? { ...prev, currentLearningContext: response.sessionContext } : prev,
          )
        }
      }
    } catch (err) {
      console.error('Send message error:', err)
      setErrorMessage(err.message || 'Failed to generate response. Please try again.')
    } finally {
      setSending(false)
      setTimeout(() => scrollToBottom(), 150)
      textareaRef.current?.focus()
    }
  }

  // Handle enter key in textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Toggle milestone expand
  const toggleMilestone = (index) => {
    setExpandedMilestones((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const userInitials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'ST'

  const selectedSkills = session?.selectedSkills || []
  const customSkills = session?.customSkills || []
  const allSkills = [...selectedSkills.map((s) => s.name), ...customSkills.map((c) => c.name)]

  return (
    <div className="assistant-page">
      {/* Header Topbar */}
      <header className="assistant-topbar">
        <div className="assistant-topbar__left">
          <Link to="/interview-preparation" className="assistant-topbar__brand">
            <Compass size={22} color="var(--color-terracotta)" />
            <span>CareerLaunch</span>
          </Link>

          <span className="assistant-topbar__role-pill">
            <Sparkles size={12} />
            <span>{session?.roleTitle || 'Frontend Developer'}</span>
          </span>

          {/* Unobtrusive Skill Pills Strip */}
          {allSkills.length > 0 && (
            <div className="assistant-topbar__skills" aria-label="Selected technologies">
              {allSkills.map((skillName) => (
                <span key={skillName} className="assistant-skill-pill">
                  {skillName}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="assistant-topbar__right">
          <Link
            to={`/interview-preparation/${roleId}/skills`}
            className="assistant-topbar__skills-link"
          >
            <ArrowLeft size={14} />
            <span>Change Skills</span>
          </Link>
          <div className="assistant-topbar__avatar">{userInitials}</div>
        </div>
      </header>

      {/* Main Conversation Workspace */}
      <main className="assistant-container">
        {loadingSession ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div className="assistant-typing" style={{ margin: '0 auto' }}>
              <div className="assistant-typing__dots">
                <span className="assistant-typing__dot" />
                <span className="assistant-typing__dot" />
                <span className="assistant-typing__dot" />
              </div>
              <span className="assistant-typing__text">Loading conversation...</span>
            </div>
          </div>
        ) : (
          <div className="assistant-thread">
            {messages.map((msg) => {
              const isUser = msg.role === 'user'
              const roadmap = msg.structuredData?.roadmap
              const prereqCheck = msg.structuredData?.prerequisiteCheck

              return (
                <div
                  key={msg.id || msg._id}
                  className={`assistant-msg ${isUser ? 'assistant-msg--user' : 'assistant-msg--assistant'}`}
                >
                  {!isUser && (
                    <div className="assistant-msg__avatar">
                      <Sparkles size={14} />
                    </div>
                  )}

                  <div className="assistant-msg__bubble">
                    {/* Conversational Text */}
                    <MarkdownRenderer content={msg.content} />

                    {/* Interactive Roadmap Card */}
                    {roadmap && (
                      <div className="assistant-roadmap-card">
                        <div className="assistant-roadmap-card__banner">
                          <div className="assistant-roadmap-card__badge">
                            <MapPin size={12} />
                            <span>In-Conversation Personalised Roadmap</span>
                          </div>
                          <h3 className="assistant-roadmap-card__title">{roadmap.title}</h3>
                          <p className="assistant-roadmap-card__obj">{roadmap.objective}</p>
                        </div>

                        <div className="assistant-roadmap-card__body">
                          {roadmap.milestones?.map((milestone, mIdx) => {
                            const isExpanded = expandedMilestones.has(mIdx)

                            return (
                              <div key={milestone.milestoneId || mIdx} className="assistant-milestone-item">
                                <div
                                  className="assistant-milestone-item__header"
                                  onClick={() => toggleMilestone(mIdx)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <h4 className="assistant-milestone-item__title">
                                    {milestone.title}
                                  </h4>
                                  <span className="assistant-milestone-item__hours">
                                    ~{milestone.estimatedHours}h
                                  </span>
                                </div>

                                {isExpanded && (
                                  <>
                                    <div className="assistant-topic-list">
                                      {milestone.topics?.map((topic, tIdx) => (
                                        <div key={topic.topicId || tIdx} className="assistant-topic-row">
                                          <div className="assistant-topic-row__info">
                                            <h5 className="assistant-topic-row__name">
                                              {topic.title}
                                            </h5>
                                            <p className="assistant-topic-row__desc">
                                              {topic.description}
                                            </p>
                                          </div>
                                          <button
                                            type="button"
                                            className="assistant-topic-row__btn"
                                            onClick={() =>
                                              handleSendMessage(
                                                `Teach me ${topic.title} from scratch with practical examples.`,
                                              )
                                            }
                                          >
                                            Teach this topic →
                                          </button>
                                        </div>
                                      ))}
                                    </div>

                                    {milestone.practicalExercise && (
                                      <div className="assistant-milestone-item__exercise">
                                        <strong>Exercise:</strong> {milestone.practicalExercise}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Interactive Prerequisite Card */}
                    {prereqCheck && (
                      <div className="assistant-prereq-card">
                        <div className="assistant-prereq-card__title">
                          <Lightbulb size={16} />
                          <span>Prerequisite Knowledge Check: {prereqCheck.targetTopic}</span>
                        </div>
                        <p className="assistant-prereq-card__desc">{prereqCheck.question}</p>

                        {Array.isArray(prereqCheck.prerequisites) && (
                          <div className="assistant-prereq-card__list">
                            {prereqCheck.prerequisites.map((p) => (
                              <span key={p} className="assistant-prereq-chip">
                                {p}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="assistant-prereq-card__actions">
                          <button
                            type="button"
                            className="assistant-prereq-btn-primary"
                            onClick={() =>
                              handleSendMessage(
                                `I already know the prerequisites for ${prereqCheck.targetTopic}. Let's jump straight in!`,
                              )
                            }
                          >
                            <CheckCircle2 size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            I know these — start {prereqCheck.targetTopic}
                          </button>
                          <button
                            type="button"
                            className="assistant-prereq-btn-secondary"
                            onClick={() =>
                              handleSendMessage(
                                `Give me a concise 5-minute refresher on the key prerequisites before we start ${prereqCheck.targetTopic}.`,
                              )
                            }
                          >
                            Quick refresher first
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Suggested Action Chips */}
                    {Array.isArray(msg.suggestedActions) && msg.suggestedActions.length > 0 && (
                      <div className="assistant-msg__actions">
                        {msg.suggestedActions.map((action, aIdx) => (
                          <button
                            key={aIdx}
                            type="button"
                            className="assistant-msg-action-chip"
                            onClick={() => handleSendMessage(action)}
                          >
                            {action} →
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="assistant-msg__avatar">{userInitials}</div>
                  )}
                </div>
              )
            })}

            {/* Thinking Indicator */}
            {sending && (
              <div className="assistant-msg assistant-msg--assistant">
                <div className="assistant-msg__avatar">
                  <Sparkles size={14} />
                </div>
                <div className="assistant-typing">
                  <div className="assistant-typing__dots">
                    <span className="assistant-typing__dot" />
                    <span className="assistant-typing__dot" />
                    <span className="assistant-typing__dot" />
                  </div>
                  <span className="assistant-typing__text">
                    Thinking with Groq (gpt-oss-120b)...
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="assistant-error">
                <span>{errorMessage}</span>
                <button
                  type="button"
                  className="assistant-error__retry-btn"
                  onClick={() => handleSendMessage(inputContent)}
                >
                  <RotateCcw size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Retry
                </button>
              </div>
            )}

            <div ref={threadEndRef} />
          </div>
        )}
      </main>

      {/* Fixed Bottom Input Area */}
      <footer className="assistant-input-tray">
        <div className="assistant-input-inner">
          <div className="assistant-input-box">
            <textarea
              ref={textareaRef}
              className="assistant-textarea"
              placeholder="Ask anything (e.g. teach a concept, create a roadmap, explain code line-by-line)..."
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              rows={1}
            />
            <button
              type="button"
              className="assistant-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!inputContent.trim() || sending}
              aria-label="Send message"
            >
              <ArrowUp size={18} />
            </button>
          </div>

          <div className="assistant-input-footer">
            <span>Press Enter to send, Shift + Enter for new line</span>
            <span>{inputContent.length} / 2000</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
