import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronDown,
  Code,
  Compass,
  Copy,
  Check,
  CheckCircle2,
  HelpCircle,
  Hexagon,
  Lightbulb,
  MapPin,
  Plus,
  RotateCcw,
  Send,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  clearLearningMessages,
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
    <div className="bolt-codeblock">
      <div className="bolt-codeblock__header">
        <span className="bolt-codeblock__lang">{language || 'code'}</span>
        <button
          type="button"
          className="bolt-codeblock__copy"
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
 */
function MarkdownRenderer({ content = '' }) {
  if (!content) return null

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
    <div className="bolt-markdown">
      {segments.map((seg, idx) => {
        if (seg.type === 'code') {
          return <CodeBlock key={idx} code={seg.data} language={seg.language} />
        }

        const lines = seg.data.split('\n')
        const elements = []
        let currentList = []
        let listType = 'ul'

        const flushList = () => {
          if (currentList.length > 0) {
            if (listType === 'ol') {
              elements.push(
                <ol key={`ol-${elements.length}`} className="bolt-ol">
                  {currentList.map((li, lIdx) => (
                    <li key={lIdx}>{formatInline(li)}</li>
                  ))}
                </ol>,
              )
            } else {
              elements.push(
                <ul key={`ul-${elements.length}`} className="bolt-ul">
                  {currentList.map((li, lIdx) => (
                    <li key={lIdx}>{formatInline(li)}</li>
                  ))}
                </ul>,
              )
            }
            currentList = []
            listType = 'ul'
          }
        }

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          const trimmed = line.trim()

          if (!trimmed) {
            flushList()
            continue
          }

          const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/)

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
            if (listType === 'ol') flushList()
            listType = 'ul'
            currentList.push(trimmed.substring(2))
          } else if (olMatch) {
            if (listType === 'ul') flushList()
            listType = 'ol'
            currentList.push(olMatch[2])
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

  // Handle New Chat (Clear Messages back to empty Bolt hero)
  const handleNewChat = async () => {
    if (!session?.sessionId || messages.length === 0) return
    try {
      setErrorMessage(null)
      await clearLearningMessages(session.sessionId)
      setMessages([])
    } catch (err) {
      console.error('Failed to clear conversation:', err)
      setErrorMessage(err.message || 'Failed to reset chat.')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

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

  const hasMessages = messages.length > 0

  if (loadingSession) {
    return (
      <div className="bolt-page">
        <header className="bolt-topbar">
          <Link to="/interview-preparation" className="bolt-topbar__brand">
            <Compass size={20} className="bolt-topbar__brand-icon" />
            <span>CareerLaunch</span>
          </Link>
        </header>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="bolt-typing">
            <div className="bolt-typing__dots">
              <span className="bolt-typing__dot" />
              <span className="bolt-typing__dot" />
              <span className="bolt-typing__dot" />
            </div>
            <span className="bolt-typing__text">Loading learning space...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bolt-page">
      {/* Top Bar */}
      <header className="bolt-topbar">
        <div className="bolt-topbar__left">
          <Link to="/interview-preparation" className="bolt-topbar__brand">
            <Compass size={20} className="bolt-topbar__brand-icon" />
            <span>CareerLaunch</span>
          </Link>

          <span className="bolt-topbar__role-pill">
            <Sparkles size={11} />
            <span>{session?.roleTitle || 'Frontend Developer'}</span>
          </span>

          {allSkills.length > 0 && (
            <div className="bolt-topbar__skills" aria-label="Selected skills">
              {allSkills.map((name) => (
                <span key={name} className="bolt-skill-pill">
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bolt-topbar__right">
          {hasMessages && (
            <button
              type="button"
              className="bolt-topbar__action-btn"
              onClick={handleNewChat}
              title="Start a new blank chat"
            >
              <RotateCcw size={13} />
              <span>New Chat</span>
            </button>
          )}

          <Link
            to={`/interview-preparation/${roleId}/skills`}
            className="bolt-topbar__action-btn"
            title="Change selected skills"
          >
            <ArrowLeft size={13} />
            <span>Change Skills</span>
          </Link>

          <div className="bolt-topbar__avatar">{userInitials}</div>
        </div>
      </header>

      {/* Main Area: Render either Bolt Hero (empty state) OR Conversation Mode */}
      {!hasMessages ? (
        /* ================================================================
           BOLT V2 / CHATGPT HERO (EMPTY STATE — ZERO MESSAGES PRE-WRITTEN)
           ================================================================ */
        <main className="bolt-hero-wrapper">
          {/* Curved Celestial Horizon Background Glow */}
          <div className="bolt-horizon-glow" aria-hidden="true" />

          <div className="bolt-hero-content">
            {/* Top Pill */}
            <div className="bolt-pill">
              <Hexagon size={14} className="bolt-pill__icon" />
              <span>Introducing CareerLaunch AI</span>
            </div>

            {/* Headline with glowing italic 'learn' */}
            <h1 className="bolt-title">
              What will you <em>learn</em> today?
            </h1>

            {/* Subtitle */}
            <p className="bolt-subtitle">
              Master frontend engineering & ace your technical interviews by chatting with AI.
            </p>

            {/* Centered Large Input Card */}
            <div className="bolt-card">
              <textarea
                ref={textareaRef}
                className="bolt-textarea"
                placeholder="What do you want to learn?"
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                disabled={sending}
              />

              <div className="bolt-card__toolbar">
                <div className="bolt-card__left">
                  <button
                    type="button"
                    className="bolt-icon-btn"
                    title="Add context or custom skill"
                    onClick={() => navigate(`/interview-preparation/${roleId}/skills`)}
                  >
                    <Plus size={15} />
                  </button>

                  <div className="bolt-model-pill" title="Active Groq reasoning model">
                    <Zap size={13} color="var(--color-terracotta)" />
                    <span>Groq 120B</span>
                    <ChevronDown size={12} color="var(--color-charcoal-subtle)" />
                  </div>
                </div>

                <div className="bolt-card__right">
                  <button
                    type="button"
                    className="bolt-plan-btn"
                    title="Create structured roadmap"
                    onClick={() =>
                      handleSendMessage(
                        'Create a personalised roadmap to learn frontend development for technical interviews',
                      )
                    }
                  >
                    <Lightbulb size={14} />
                    <span>Roadmap</span>
                  </button>

                  <button
                    type="button"
                    className="bolt-send-btn"
                    onClick={() => handleSendMessage()}
                    disabled={!inputContent.trim() || sending}
                  >
                    <span>Start learning</span>
                    <Send size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Prompt Chips Row Below Card */}
            <div className="bolt-chips-row">
              <span className="bolt-chips-label">or explore</span>

              <button
                type="button"
                className="bolt-chip"
                onClick={() =>
                  handleSendMessage(
                    'Create a personalised roadmap to learn React for frontend technical interviews',
                  )
                }
              >
                <MapPin size={13} color="var(--color-terracotta)" />
                <span>React Roadmap</span>
              </button>

              <button
                type="button"
                className="bolt-chip"
                onClick={() =>
                  handleSendMessage(
                    'Teach me JavaScript closures with practical code examples and interview focal points',
                  )
                }
              >
                <Code size={13} color="var(--color-forest)" />
                <span>JS Closures</span>
              </button>

              <button
                type="button"
                className="bolt-chip"
                onClick={() =>
                  handleSendMessage(
                    'Explain CSS Grid vs Flexbox with code examples for layout interview questions',
                  )
                }
              >
                <Sparkles size={13} color="var(--color-terracotta)" />
                <span>CSS Grid vs Flexbox</span>
              </button>

              <button
                type="button"
                className="bolt-chip"
                onClick={() =>
                  handleSendMessage(
                    'Ask me 3 challenging frontend interview questions on my selected technologies',
                  )
                }
              >
                <HelpCircle size={13} color="var(--color-sage-dark)" />
                <span>Interview Quiz</span>
              </button>
            </div>
          </div>

          {/* Watermark preview badge */}
          <div className="bolt-preview-badge">CareerLaunch AI Assistant</div>
        </main>
      ) : (
        /* ================================================================
           CONVERSATION VIEW (ACTIVE CHAT)
           ================================================================ */
        <main className="bolt-chat-container">
          <div className="bolt-thread">
            {messages.map((msg) => {
              const isUser = msg.role === 'user'
              const roadmap = msg.structuredData?.roadmap
              const prereqCheck = msg.structuredData?.prerequisiteCheck

              return (
                <div
                  key={msg.id || msg._id}
                  className={`bolt-msg ${isUser ? 'bolt-msg--user' : 'bolt-msg--assistant'}`}
                >
                  {!isUser && (
                    <div className="bolt-msg__avatar">
                      <Sparkles size={13} />
                    </div>
                  )}

                  <div className="bolt-msg__bubble">
                    <MarkdownRenderer content={msg.content} />

                    {/* Interactive Roadmap Card */}
                    {roadmap && (
                      <div className="bolt-roadmap-card">
                        <div className="bolt-roadmap-card__banner">
                          <div className="bolt-roadmap-card__badge">
                            <MapPin size={11} />
                            <span>Personalised Roadmap</span>
                          </div>
                          <h3 className="bolt-roadmap-card__title">{roadmap.title}</h3>
                          <p className="bolt-roadmap-card__obj">{roadmap.objective}</p>
                        </div>

                        <div className="bolt-roadmap-card__body">
                          {roadmap.milestones?.map((milestone, mIdx) => {
                            const isExpanded = expandedMilestones.has(mIdx)

                            return (
                              <div
                                key={milestone.milestoneId || mIdx}
                                className="bolt-milestone-item"
                              >
                                <div
                                  className="bolt-milestone-item__header"
                                  onClick={() => toggleMilestone(mIdx)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <h4 className="bolt-milestone-item__title">{milestone.title}</h4>
                                  <span className="bolt-milestone-item__hours">
                                    ~{milestone.estimatedHours}h
                                  </span>
                                </div>

                                {isExpanded && (
                                  <>
                                    <div className="bolt-topic-list">
                                      {milestone.topics?.map((topic, tIdx) => (
                                        <div
                                          key={topic.topicId || tIdx}
                                          className="bolt-topic-row"
                                        >
                                          <div className="bolt-topic-row__info">
                                            <h5 className="bolt-topic-row__name">{topic.title}</h5>
                                            <p className="bolt-topic-row__desc">
                                              {topic.description}
                                            </p>
                                          </div>
                                          <button
                                            type="button"
                                            className="bolt-topic-row__btn"
                                            onClick={() =>
                                              handleSendMessage(
                                                `Teach me ${topic.title} from scratch with practical code examples.`,
                                              )
                                            }
                                          >
                                            Teach this topic →
                                          </button>
                                        </div>
                                      ))}
                                    </div>

                                    {milestone.practicalExercise && (
                                      <div className="bolt-milestone-item__exercise">
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
                      <div className="bolt-prereq-card">
                        <div className="bolt-prereq-card__title">
                          <Lightbulb size={16} />
                          <span>Prerequisite Knowledge Check: {prereqCheck.targetTopic}</span>
                        </div>
                        <p className="bolt-prereq-card__desc">{prereqCheck.question}</p>

                        {Array.isArray(prereqCheck.prerequisites) && (
                          <div className="bolt-prereq-card__list">
                            {prereqCheck.prerequisites.map((p) => (
                              <span key={p} className="bolt-prereq-chip">
                                {p}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="bolt-prereq-card__actions">
                          <button
                            type="button"
                            className="bolt-prereq-btn-primary"
                            onClick={() =>
                              handleSendMessage(
                                `I already know the prerequisites for ${prereqCheck.targetTopic}. Let's jump straight in!`,
                              )
                            }
                          >
                            <CheckCircle2
                              size={14}
                              style={{ marginRight: '4px', verticalAlign: 'middle' }}
                            />
                            I know these — start {prereqCheck.targetTopic}
                          </button>
                          <button
                            type="button"
                            className="bolt-prereq-btn-secondary"
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

                    {/* Follow-up Action Chips */}
                    {Array.isArray(msg.suggestedActions) && msg.suggestedActions.length > 0 && (
                      <div className="bolt-msg__actions">
                        {msg.suggestedActions.map((action, aIdx) => (
                          <button
                            key={aIdx}
                            type="button"
                            className="bolt-msg-action-chip"
                            onClick={() => handleSendMessage(action)}
                          >
                            {action} →
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {isUser && <div className="bolt-msg__avatar">{userInitials}</div>}
                </div>
              )
            })}

            {/* Thinking Indicator */}
            {sending && (
              <div className="bolt-msg bolt-msg--assistant">
                <div className="bolt-msg__avatar">
                  <Sparkles size={13} />
                </div>
                <div className="bolt-typing">
                  <div className="bolt-typing__dots">
                    <span className="bolt-typing__dot" />
                    <span className="bolt-typing__dot" />
                    <span className="bolt-typing__dot" />
                  </div>
                  <span className="bolt-typing__text">Thinking with Groq (gpt-oss-120b)...</span>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="bolt-error">
                <span>{errorMessage}</span>
                <button
                  type="button"
                  className="bolt-error__retry-btn"
                  onClick={() => handleSendMessage(inputContent)}
                >
                  Retry
                </button>
              </div>
            )}

            <div ref={threadEndRef} />
          </div>

          {/* Docked Bottom Input Card in Active Chat */}
          <footer className="bolt-chat-dock">
            <div className="bolt-chat-dock__inner">
              <div className="bolt-card">
                <textarea
                  ref={textareaRef}
                  className="bolt-textarea"
                  placeholder="Ask a follow-up or explore a new concept..."
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                  rows={1}
                />

                <div className="bolt-card__toolbar">
                  <div className="bolt-card__left">
                    <div className="bolt-model-pill">
                      <Zap size={12} color="var(--color-terracotta)" />
                      <span>Groq 120B</span>
                    </div>
                  </div>

                  <div className="bolt-card__right">
                    <button
                      type="button"
                      className="bolt-send-btn"
                      onClick={() => handleSendMessage()}
                      disabled={!inputContent.trim() || sending}
                    >
                      <span>Send</span>
                      <Send size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </main>
      )}
    </div>
  )
}
