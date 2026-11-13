import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Code,
  Compass,
  Copy,
  Edit2,
  HelpCircle,
  Hexagon,
  Lightbulb,
  MapPin,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  createLearningConversation,
  deleteLearningConversation,
  fetchLearningMessages,
  fetchLearningSession,
  fetchStudentConversations,
  renameLearningConversation,
  sendLearningMessage,
  startOrGetLearningSession,
} from '@/lib/api'
import '@/styles/learning-assistant.css'

/**
 * CodeBlock Component with Language Tag & Copy to Clipboard
 */
function CodeBlock({ code, language = 'javascript' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="cl-codeblock">
      <div className="cl-codeblock__header">
        <span className="cl-codeblock__lang">{language}</span>
        <button
          type="button"
          className="cl-codeblock__copy"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check size={13} color="#879477" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className="cl-codeblock__pre">
        <code>{code}</code>
      </pre>
    </div>
  )
}

/**
 * Inline text parser for bold, italic, inline code, and links
 */
function renderInlineStyles(text) {
  if (!text) return ''
  const parts = []
  const tokenRegex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g
  let lastIndex = 0
  let match

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    if (match[2]) {
      parts.push(<strong key={match.index}>{match[2]}</strong>)
    } else if (match[3]) {
      parts.push(<em key={match.index}>{match[3]}</em>)
    } else if (match[4]) {
      parts.push(<code key={match.index} className="cl-inline-code">{match[4]}</code>)
    } else if (match[5] && match[6]) {
      parts.push(
        <a key={match.index} href={match[6]} target="_blank" rel="noopener noreferrer" className="cl-link">
          {match[5]}
        </a>
      )
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

/**
 * ProseBlock parses markdown text into headings, paragraphs, lists, tables, and blockquotes
 */
function ProseBlock({ text }) {
  if (!text) return null
  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const rawLine = lines[i]
    const trimmed = rawLine.trim()

    if (!trimmed) {
      i++
      continue
    }

    // Markdown Table: | Header | Header | followed by | --- |
    if (
      trimmed.startsWith('|') &&
      trimmed.endsWith('|') &&
      i + 1 < lines.length &&
      lines[i + 1].includes('---')
    ) {
      const headerLine = trimmed
      i += 2 // skip header and divider line
      const bodyRows = []
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        bodyRows.push(lines[i].trim())
        i++
      }

      const parseCells = (row) =>
        row
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim())

      const headers = parseCells(headerLine)
      const rows = bodyRows.map(parseCells)

      elements.push(
        <div key={`table-${i}`} className="cl-table-wrapper">
          <table className="cl-table">
            <thead>
              <tr>
                {headers.map((h, hIdx) => (
                  <th key={hIdx}>{renderInlineStyles(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, rIdx) => (
                <tr key={rIdx}>
                  {r.map((c, cIdx) => (
                    <td key={cIdx}>{renderInlineStyles(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    }

    // Headings
    if (trimmed.startsWith('#### ')) {
      elements.push(<h4 key={`h4-${i}`} className="cl-h4">{renderInlineStyles(trimmed.slice(5))}</h4>)
      i++
      continue
    }
    if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={`h3-${i}`} className="cl-h3">{renderInlineStyles(trimmed.slice(4))}</h3>)
      i++
      continue
    }
    if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={`h2-${i}`} className="cl-h2">{renderInlineStyles(trimmed.slice(3))}</h2>)
      i++
      continue
    }
    if (trimmed.startsWith('# ')) {
      elements.push(<h1 key={`h1-${i}`} className="cl-h1">{renderInlineStyles(trimmed.slice(2))}</h1>)
      i++
      continue
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      const quoteLines = []
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2))
        i++
      }
      elements.push(
        <blockquote key={`quote-${i}`} className="cl-blockquote">
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx}>{renderInlineStyles(ql)}</p>
          ))}
        </blockquote>
      )
      continue
    }

    // Unordered List (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items = []
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        items.push(lines[i].trim().slice(2))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className="cl-ul">
          {items.map((it, itIdx) => (
            <li key={itIdx}>{renderInlineStyles(it)}</li>
          ))}
        </ul>
      )
      continue
    }

    // Ordered List (1. )
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/)
    if (numMatch) {
      const items = []
      while (i < lines.length) {
        const m = lines[i].trim().match(/^(\d+)\.\s+(.*)/)
        if (!m) break
        items.push({ num: m[1], text: m[2] })
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} className="cl-ol">
          {items.map((it, itIdx) => (
            <li key={itIdx}>
              <span className="cl-ol__num">{it.num}.</span>
              <span>{renderInlineStyles(it.text)}</span>
            </li>
          ))}
        </ol>
      )
      continue
    }

    // Standard Paragraph
    elements.push(
      <p key={`p-${i}`} className="cl-p">
        {renderInlineStyles(rawLine)}
      </p>
    )
    i++
  }

  return <>{elements}</>
}

/**
 * FormattedMarkdown Component
 */
function FormattedMarkdown({ content }) {
  if (!content) return null

  const parts = []
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex, match.index),
      })
    }
    parts.push({
      type: 'code',
      language: match[1] || 'javascript',
      code: match[2].trim(),
    })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.substring(lastIndex),
    })
  }

  return (
    <div className="cl-markdown">
      {parts.map((p, idx) => {
        if (p.type === 'code') {
          return <CodeBlock key={idx} code={p.code} language={p.language} />
        }
        return <ProseBlock key={idx} text={p.content} />
      })}
    </div>
  )
}

/**
 * Editorial Learning Roadmap Guide (Clean document layout, no nested cards)
 */
function RoadmapGuide({ roadmap, expandedMilestones, toggleMilestone, onTeachTopic }) {
  if (!roadmap || !Array.isArray(roadmap.milestones) || roadmap.milestones.length === 0) {
    return null
  }

  return (
    <section className="cl-roadmap-guide" aria-label="Learning Roadmap">
      <div className="cl-roadmap-guide__header">
        <div className="cl-roadmap-guide__badge">
          <MapPin size={13} />
          <span>Curriculum Guide</span>
          {roadmap.estimatedWeeks && (
            <>
              <span className="cl-roadmap-guide__dot">•</span>
              <span>{roadmap.estimatedWeeks} Weeks Track</span>
            </>
          )}
        </div>
        <h3 className="cl-roadmap-guide__title">{roadmap.title}</h3>
        {roadmap.objective && (
          <p className="cl-roadmap-guide__intro">{roadmap.objective}</p>
        )}
      </div>

      <div className="cl-roadmap-guide__milestones">
        {roadmap.milestones.map((milestone, mIdx) => {
          const isExpanded = expandedMilestones.has(mIdx)
          const numStr = String(mIdx + 1).padStart(2, '0')

          return (
            <div
              key={milestone.milestoneId || mIdx}
              className={`cl-milestone ${isExpanded ? 'cl-milestone--expanded' : ''}`}
            >
              <button
                type="button"
                className="cl-milestone__header"
                onClick={() => toggleMilestone(mIdx)}
                aria-expanded={isExpanded}
              >
                <div className="cl-milestone__header-left">
                  <span className="cl-milestone__num">{numStr}</span>
                  <div className="cl-milestone__title-block">
                    <h4 className="cl-milestone__title">{milestone.title}</h4>
                    <span className="cl-milestone__meta">
                      {milestone.topics?.length ? `${milestone.topics.length} topics` : ''}
                      {milestone.estimatedHours ? ` • ~${milestone.estimatedHours} hrs` : ''}
                    </span>
                  </div>
                </div>
                <div className="cl-milestone__header-right">
                  <span className="cl-milestone__toggle-icon">
                    {isExpanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="cl-milestone__body">
                  {Array.isArray(milestone.topics) && milestone.topics.length > 0 && (
                    <div className="cl-milestone__topics">
                      {milestone.topics.map((topic, tIdx) => (
                        <div key={topic.topicId || tIdx} className="cl-topic-row">
                          <div className="cl-topic-row__info">
                            <h5 className="cl-topic-row__title">{topic.title}</h5>
                            <p className="cl-topic-row__desc">{topic.description}</p>

                            {Array.isArray(topic.subtopics) && topic.subtopics.length > 0 && (
                              <div className="cl-topic-row__subtopics">
                                <span className="cl-topic-row__label">Covers:</span>
                                <span>{topic.subtopics.join(', ')}</span>
                              </div>
                            )}

                            {Array.isArray(topic.interviewCheckpoints) && topic.interviewCheckpoints.length > 0 && (
                              <div className="cl-topic-row__interview">
                                <span className="cl-topic-row__label cl-topic-row__label--interview">
                                  Interview focus:
                                </span>
                                <span>{topic.interviewCheckpoints.join(' • ')}</span>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            className="cl-topic-row__teach-btn"
                            onClick={() => onTeachTopic(topic.title)}
                            title={`Teach ${topic.title}`}
                          >
                            <span>Teach this</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {milestone.practicalExercise && (
                    <div className="cl-milestone__exercise">
                      <div className="cl-milestone__exercise-tag">Hands-on Challenge</div>
                      <p className="cl-milestone__exercise-text">{milestone.practicalExercise}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function LearningAssistantPage() {
  const { user } = useAuth()
  const { roleId = 'frontend-developer', sessionId: routeSessionId } = useParams()
  const navigate = useNavigate()

  // Sidebar State (Desktop Collapsible + Mobile Drawer)
  const [conversations, setConversations] = useState([])
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingSessionId, setEditingSessionId] = useState(null)
  const [editingTitleText, setEditingTitleText] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  // Active Conversation State
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputContent, setInputContent] = useState('')
  const [loadingSession, setLoadingSession] = useState(true)
  const [sending, setSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [expandedMilestones, setExpandedMilestones] = useState(new Set([0, 1]))

  const threadEndRef = useRef(null)
  const textareaRef = useRef(null)
  const renameInputRef = useRef(null)

  const scrollToBottom = (behavior = 'smooth') => {
    threadEndRef.current?.scrollIntoView({ behavior })
  }

  // Load conversation list for the sidebar
  const loadConversations = useCallback(async () => {
    try {
      setLoadingConversations(true)
      const data = await fetchStudentConversations(roleId)
      if (data?.conversations) {
        setConversations(data.conversations)
      }
    } catch (err) {
      console.warn('[LearningAssistant] Failed to load conversations:', err)
    } finally {
      setLoadingConversations(false)
    }
  }, [roleId])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Date grouping for sidebar: Today, Yesterday, Previous 7 Days, Older
  const groupedConversations = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const startOfYesterday = startOfToday - 86400000
    const startOf7DaysAgo = startOfToday - 7 * 86400000

    const query = searchQuery.trim().toLowerCase()
    const filtered = conversations.filter((c) => {
      if (!query) return true
      return (c.title || '').toLowerCase().includes(query)
    })

    const groups = {
      today: [],
      yesterday: [],
      last7Days: [],
      older: [],
    }

    filtered.forEach((c) => {
      const time = new Date(c.lastActivityAt || c.updatedAt || c.createdAt).getTime()
      if (time >= startOfToday) {
        groups.today.push(c)
      } else if (time >= startOfYesterday) {
        groups.yesterday.push(c)
      } else if (time >= startOf7DaysAgo) {
        groups.last7Days.push(c)
      } else {
        groups.older.push(c)
      }
    })

    return groups
  }, [conversations, searchQuery])

  // Load active session and messages
  useEffect(() => {
    let isMounted = true

    async function initSession() {
      try {
        setLoadingSession(true)
        setErrorMessage(null)

        let activeSessionId = routeSessionId

        // If no sessionId in URL, create a fresh conversation
        if (!activeSessionId) {
          const createRes = await createLearningConversation(roleId)
          if (createRes?.conversation?.sessionId) {
            activeSessionId = createRes.conversation.sessionId
            if (isMounted) {
              setConversations((prev) => [createRes.conversation, ...prev])
              navigate(`/interview-preparation/${roleId}/assistant/${activeSessionId}`, {
                replace: true,
              })
            }
          }
        }

        if (activeSessionId) {
          try {
            const [sessionData, messagesData] = await Promise.all([
              fetchLearningSession(activeSessionId),
              fetchLearningMessages(activeSessionId),
            ])

            if (isMounted) {
              setSession(sessionData.session)
              setMessages(messagesData.messages || [])
            }
          } catch (sessionErr) {
            console.warn('[LearningAssistant] Session not found, creating fresh conversation:', sessionErr?.message)
            try {
              const freshRes = await createLearningConversation(roleId)
              if (freshRes?.conversation?.sessionId && isMounted) {
                const freshId = freshRes.conversation.sessionId
                setConversations((prev) => [
                  freshRes.conversation,
                  ...prev.filter((c) => c.sessionId !== freshId && c.sessionId !== activeSessionId),
                ])
                setSession(freshRes.conversation)
                setMessages([])
                navigate(`/interview-preparation/${roleId}/assistant/${freshId}`, {
                  replace: true,
                })
                return
              }
            } catch (fallbackErr) {
              console.warn('[LearningAssistant] Fallback to startOrGetLearningSession:', fallbackErr?.message)
              try {
                const fallbackRes = await startOrGetLearningSession(roleId)
                if (fallbackRes?.session?.sessionId && isMounted) {
                  const fallbackId = fallbackRes.session.sessionId
                  setSession(fallbackRes.session)
                  setMessages(fallbackRes.messages || [])
                  navigate(`/interview-preparation/${roleId}/assistant/${fallbackId}`, {
                    replace: true,
                  })
                  return
                }
              } catch (innerErr) {
                console.error('[LearningAssistant] Auto-heal fallback failed:', innerErr)
              }
            }
            throw sessionErr
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('[LearningAssistant] Failed to init session:', err)
          setErrorMessage(err.message || 'Failed to load conversation.')
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

  // Focus rename input when editing starts
  useEffect(() => {
    if (editingSessionId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [editingSessionId])

  // Start fresh conversation
  const handleNewChat = async () => {
    try {
      setErrorMessage(null)
      setSending(false)
      const res = await createLearningConversation(roleId)
      if (res?.conversation?.sessionId) {
        const newConv = res.conversation
        setConversations((prev) => [newConv, ...prev])
        setSession(newConv)
        setMessages([])
        setMobileDrawerOpen(false)
        navigate(`/interview-preparation/${roleId}/assistant/${newConv.sessionId}`)
      }
    } catch (err) {
      console.error('Failed to create new chat:', err)
      setErrorMessage('Failed to start a new chat. Please try again.')
    }
  }

  // Switch conversation
  const handleSelectConversation = (targetSessionId) => {
    if (targetSessionId === session?.sessionId) {
      setMobileDrawerOpen(false)
      return
    }
    setMessages([])
    setSession(null)
    setMobileDrawerOpen(false)
    navigate(`/interview-preparation/${roleId}/assistant/${targetSessionId}`)
  }

  // Rename conversation
  const handleStartRename = (e, conv) => {
    e.stopPropagation()
    setEditingSessionId(conv.sessionId)
    setEditingTitleText(conv.title || 'Untitled Chat')
    setConfirmDeleteId(null)
  }

  const handleSaveRename = async (sessionId) => {
    const trimmed = editingTitleText.trim()
    if (!trimmed) {
      setEditingSessionId(null)
      return
    }
    try {
      await renameLearningConversation(sessionId, trimmed)
      setConversations((prev) =>
        prev.map((c) => (c.sessionId === sessionId ? { ...c, title: trimmed } : c)),
      )
      if (session?.sessionId === sessionId) {
        setSession((prev) => (prev ? { ...prev, title: trimmed } : null))
      }
    } catch (err) {
      console.error('Failed to rename conversation:', err)
    } finally {
      setEditingSessionId(null)
    }
  }

  // Soft delete conversation
  const handleDeleteConversation = async (sessionId) => {
    try {
      await deleteLearningConversation(sessionId)
      setConversations((prev) => prev.filter((c) => c.sessionId !== sessionId))
      setConfirmDeleteId(null)

      if (session?.sessionId === sessionId) {
        const remaining = conversations.filter((c) => c.sessionId !== sessionId)
        if (remaining.length > 0) {
          navigate(`/interview-preparation/${roleId}/assistant/${remaining[0].sessionId}`)
        } else {
          handleNewChat()
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err)
      setErrorMessage('Failed to delete conversation.')
    }
  }

  // Send message
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
      const res = await sendLearningMessage(session.sessionId, content)

      if (res?.assistantMessage) {
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== tempUserMsg.id)
          return [
            ...filtered,
            res.userMessage || tempUserMsg,
            res.assistantMessage,
          ]
        })

        if (res.conversationTitle) {
          setSession((prev) => (prev ? { ...prev, title: res.conversationTitle } : null))
          setConversations((prev) =>
            prev.map((c) =>
              c.sessionId === session.sessionId
                ? { ...c, title: res.conversationTitle, lastActivityAt: new Date().toISOString() }
                : c,
            ),
          )
        }
      }
    } catch (err) {
      console.error('[LearningAssistant] send message error:', err)
      setErrorMessage(
        err.message || 'The learning assistant is temporarily unavailable. Please try again.',
      )
    } finally {
      setSending(false)
      setTimeout(() => scrollToBottom(), 200)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleMilestone = (idx) => {
    setExpandedMilestones((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else {
        next.add(idx)
      }
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

  const hasMessages = messages.length > 0
  const activeSkills = session?.selectedSkills || []

  // Helper to render conversation items in the sidebar
  const renderConversationItem = (conv) => {
    const isActive = session?.sessionId === conv.sessionId
    const isEditing = editingSessionId === conv.sessionId
    const isConfirmingDelete = confirmDeleteId === conv.sessionId

    return (
      <div
        key={conv.sessionId}
        className={`cl-sidebar-item ${isActive ? 'cl-sidebar-item--active' : ''}`}
        onClick={() => !isEditing && handleSelectConversation(conv.sessionId)}
        role="button"
        tabIndex={0}
      >
        <MessageSquare size={14} className="cl-sidebar-item__icon" />

        {isEditing ? (
          <div className="cl-sidebar-item__edit" onClick={(e) => e.stopPropagation()}>
            <input
              ref={renameInputRef}
              type="text"
              className="cl-sidebar-item__edit-input"
              value={editingTitleText}
              onChange={(e) => setEditingTitleText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename(conv.sessionId)
                if (e.key === 'Escape') setEditingSessionId(null)
              }}
              maxLength={100}
            />
            <button
              type="button"
              className="cl-sidebar-item__edit-btn"
              onClick={() => handleSaveRename(conv.sessionId)}
              title="Save"
            >
              <Check size={13} color="#16a34a" />
            </button>
            <button
              type="button"
              className="cl-sidebar-item__edit-btn"
              onClick={() => setEditingSessionId(null)}
              title="Cancel"
            >
              <X size={13} color="#dc2626" />
            </button>
          </div>
        ) : (
          <span className="cl-sidebar-item__title">{conv.title || 'New Chat'}</span>
        )}

        {!isEditing && (
          <div className="cl-sidebar-item__actions" onClick={(e) => e.stopPropagation()}>
            {isConfirmingDelete ? (
              <div className="cl-sidebar-item__confirm">
                <span className="cl-sidebar-item__confirm-text">Delete?</span>
                <button
                  type="button"
                  className="cl-sidebar-item__confirm-btn"
                  onClick={() => handleDeleteConversation(conv.sessionId)}
                  title="Confirm delete"
                >
                  <Check size={12} color="#dc2626" />
                </button>
                <button
                  type="button"
                  className="cl-sidebar-item__cancel-btn"
                  onClick={() => setConfirmDeleteId(null)}
                  title="Cancel"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="cl-sidebar-item__action-btn"
                  onClick={(e) => handleStartRename(e, conv)}
                  title="Rename chat"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  type="button"
                  className="cl-sidebar-item__action-btn cl-sidebar-item__action-btn--delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    setConfirmDeleteId(conv.sessionId)
                    setEditingSessionId(null)
                  }}
                  title="Delete chat"
                >
                  <Trash2 size={13} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`cl-workspace ${sidebarCollapsed ? 'cl-workspace--sidebar-collapsed' : ''}`}>
      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="cl-backdrop"
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ================================================================
         LEFT SIDEBAR (COLLAPSIBLE ON DESKTOP, DRAWER ON MOBILE)
         ================================================================ */}
      <aside className={`cl-sidebar ${mobileDrawerOpen ? 'cl-sidebar--mobile-open' : ''}`}>
        {/* Brand & Desktop Collapse Button */}
        <div className="cl-sidebar__header">
          <Link to="/interview-preparation" className="cl-sidebar__brand">
            <Compass size={18} className="cl-sidebar__brand-icon" />
            <span>CareerLaunch</span>
          </Link>
          <div className="cl-sidebar__header-actions">
            <button
              type="button"
              className="cl-sidebar__collapse-btn"
              onClick={() => setSidebarCollapsed(true)}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={17} />
            </button>
            <button
              type="button"
              className="cl-sidebar__mobile-close-btn"
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="Close sidebar drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="cl-sidebar__new-chat-wrap">
          <button
            type="button"
            className="cl-sidebar__new-chat-btn"
            onClick={handleNewChat}
            disabled={sending}
          >
            <Plus size={15} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="cl-sidebar__search-wrap">
          <Search size={13} className="cl-sidebar__search-icon" />
          <input
            type="text"
            className="cl-sidebar__search-input"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="cl-sidebar__search-clear"
              onClick={() => setSearchQuery('')}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Conversation List Grouped by Date */}
        <div className="cl-sidebar__list">
          {loadingConversations ? (
            <div className="cl-sidebar__loading">Loading chats...</div>
          ) : conversations.length === 0 ? (
            <div className="cl-sidebar__empty">
              <Sparkles size={18} color="var(--color-terracotta)" />
              <p>No chats yet.</p>
              <button
                type="button"
                className="cl-sidebar__empty-btn"
                onClick={handleNewChat}
              >
                Start your first chat
              </button>
            </div>
          ) : (
            <>
              {groupedConversations.today.length > 0 && (
                <div className="cl-sidebar__group">
                  <div className="cl-sidebar__group-title">Today</div>
                  {groupedConversations.today.map(renderConversationItem)}
                </div>
              )}

              {groupedConversations.yesterday.length > 0 && (
                <div className="cl-sidebar__group">
                  <div className="cl-sidebar__group-title">Yesterday</div>
                  {groupedConversations.yesterday.map(renderConversationItem)}
                </div>
              )}

              {groupedConversations.last7Days.length > 0 && (
                <div className="cl-sidebar__group">
                  <div className="cl-sidebar__group-title">Previous 7 Days</div>
                  {groupedConversations.last7Days.map(renderConversationItem)}
                </div>
              )}

              {groupedConversations.older.length > 0 && (
                <div className="cl-sidebar__group">
                  <div className="cl-sidebar__group-title">Older</div>
                  {groupedConversations.older.map(renderConversationItem)}
                </div>
              )}

              {searchQuery &&
                groupedConversations.today.length === 0 &&
                groupedConversations.yesterday.length === 0 &&
                groupedConversations.last7Days.length === 0 &&
                groupedConversations.older.length === 0 && (
                  <div className="cl-sidebar__no-results">
                    No conversations matching "{searchQuery}"
                  </div>
                )}
            </>
          )}
        </div>

        {/* Student Profile Footer */}
        <div className="cl-sidebar__footer">
          <div className="cl-sidebar__user">
            <div className="cl-sidebar__avatar">{userInitials}</div>
            <div className="cl-sidebar__user-details">
              <span className="cl-sidebar__user-name">
                {user?.displayName || user?.email?.split('@')[0] || 'Student'}
              </span>
              <span className="cl-sidebar__user-sub">{session?.roleTitle || 'Frontend Developer'}</span>
            </div>
          </div>
          <Link
            to="/interview-preparation"
            className="cl-sidebar__exit-btn"
            title="Return to Target Roles"
          >
            <ArrowLeft size={13} />
            <span>Roles</span>
          </Link>
        </div>
      </aside>

      {/* ================================================================
         MAIN CONVERSATION AREA (EXPANDS WHEN SIDEBAR IS COLLAPSED)
         ================================================================ */}
      <main className="cl-main">
        {/* Workspace Topbar */}
        <header className="cl-topbar">
          <div className="cl-topbar__left">
            {/* Sidebar Toggle for Desktop / Mobile */}
            <button
              type="button"
              className="cl-topbar__toggle-btn"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileDrawerOpen(true)
                } else {
                  setSidebarCollapsed((prev) => !prev)
                }
              }}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label="Toggle sidebar"
            >
              {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <Menu size={18} />}
            </button>

            <div className="cl-topbar__role-badge">
              <Sparkles size={12} />
              <span>{session?.roleTitle || 'Frontend Developer'}</span>
            </div>

            {/* Active Skills Pills */}
            <div className="cl-topbar__skills">
              {activeSkills.map((s) => (
                <span key={s.skillId || s.name} className="cl-topbar__skill-pill">
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          <div className="cl-topbar__right">
            <Link
              to={`/interview-preparation/${roleId}/skills`}
              className="cl-topbar__change-skills-btn"
            >
              <span>Change Skills</span>
            </Link>

            <button
              type="button"
              className="cl-topbar__new-chat-btn"
              onClick={handleNewChat}
              title="Start a new conversation"
            >
              <Plus size={14} />
              <span>New Chat</span>
            </button>

            <div className="cl-topbar__avatar">{userInitials}</div>
          </div>
        </header>

        {/* Content View: Loading / Empty State / Chat Thread */}
        {loadingSession && !session ? (
          <div className="cl-loading-view">
            <Sparkles size={22} color="var(--color-terracotta)" />
            <span>Loading conversation...</span>
          </div>
        ) : !hasMessages ? (
          /* ================================================================
             EMPTY STATE — EDITORIAL WELCOME HERO
             ================================================================ */
          <div className="cl-welcome-view">
            <div className="cl-welcome-container">
              <div className="cl-welcome-badge">
                <Hexagon size={13} />
                <span>CareerLaunch AI Mentor</span>
              </div>

              <h1 className="cl-welcome-title">
                What will you <em>learn</em> today?
              </h1>

              <p className="cl-welcome-subtitle">
                Master frontend engineering & ace technical interviews through conversation with your personal AI mentor.
              </p>

              {/* Large Centered Hero Card */}
              <div className="cl-hero-card">
                <textarea
                  ref={textareaRef}
                  className="cl-hero-textarea"
                  placeholder="What do you want to learn? (e.g. 'Teach me HTML from scratch', 'Explain closures with examples')"
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  disabled={sending}
                  autoFocus
                />

                <div className="cl-hero-card__footer">
                  <div className="cl-hero-card__left">
                    <div className="cl-model-indicator" title="Active Groq 120B model">
                      <Zap size={11} color="var(--color-terracotta)" />
                      <span>Groq 120B</span>
                    </div>
                  </div>

                  <div className="cl-hero-card__right">
                    <button
                      type="button"
                      className="cl-hero-roadmap-btn"
                      title="Request a complete structured learning roadmap"
                      onClick={() =>
                        handleSendMessage(
                          `Create a comprehensive ${activeSkills[0]?.name || 'frontend'} learning roadmap from scratch for interviews`,
                        )
                      }
                      disabled={sending}
                    >
                      <Lightbulb size={13} />
                      <span>Roadmap</span>
                    </button>

                    <button
                      type="button"
                      className="cl-hero-send-btn"
                      onClick={() => handleSendMessage()}
                      disabled={!inputContent.trim() || sending}
                      aria-label="Send message"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Inspiration Chips */}
              <div className="cl-inspiration-chips">
                <button
                  type="button"
                  className="cl-inspiration-chip"
                  onClick={() =>
                    handleSendMessage(
                      `I want to learn ${activeSkills[0]?.name || 'HTML'} from scratch.`,
                    )
                  }
                >
                  <Sparkles size={12} />
                  <span>Teach me {activeSkills[0]?.name || 'HTML'} from scratch</span>
                </button>

                <button
                  type="button"
                  className="cl-inspiration-chip"
                  onClick={() =>
                    handleSendMessage('Explain closures with practical code examples.')
                  }
                >
                  <Code size={12} />
                  <span>Explain closures with examples</span>
                </button>

                <button
                  type="button"
                  className="cl-inspiration-chip"
                  onClick={() =>
                    handleSendMessage(
                      `Prepare me for ${activeSkills[0]?.name || 'frontend'} technical interviews.`,
                    )
                  }
                >
                  <HelpCircle size={12} />
                  <span>Prepare me for technical interviews</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================================================================
             CONVERSATION THREAD & DOCKED MESSAGE COMPOSER
             ================================================================ */
          <div className="cl-chat-view">
            <div className="cl-chat-thread">
              {messages.map((msg) => {
                const isUser = msg.role === 'user'

                if (isUser) {
                  return (
                    <div key={msg.id} className="cl-msg cl-msg--user">
                      <div className="cl-msg__user-bubble">
                        <p className="cl-msg__user-text">{msg.content}</p>
                      </div>
                    </div>
                  )
                }

                // Assistant Message: Unboxed, Natural Reading Flow
                const roadmap = msg.structuredData?.roadmap
                return (
                  <div key={msg.id} className="cl-msg cl-msg--assistant">
                    <div className="cl-msg__avatar">
                      <Sparkles size={15} />
                    </div>

                    <div className="cl-msg__body">
                      {/* Markdown Content */}
                      <FormattedMarkdown content={msg.content} />

                      {/* Editorial Roadmap Guide */}
                      {roadmap && (
                        <RoadmapGuide
                          roadmap={roadmap}
                          expandedMilestones={expandedMilestones}
                          toggleMilestone={toggleMilestone}
                          onTeachTopic={(topicTitle) =>
                            handleSendMessage(
                              `Teach me ${topicTitle} in detail with practical code examples and interview relevance.`,
                            )
                          }
                        />
                      )}

                      {/* Follow-up Chips */}
                      {Array.isArray(msg.suggestedActions) && msg.suggestedActions.length > 0 && (
                        <div className="cl-followup-chips">
                          {msg.suggestedActions.map((action, aIdx) => (
                            <button
                              key={aIdx}
                              type="button"
                              className="cl-followup-chip"
                              onClick={() => handleSendMessage(action)}
                            >
                              <span>{action}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Typing / Loading Indicator */}
              {sending && (
                <div className="cl-msg cl-msg--assistant">
                  <div className="cl-msg__avatar">
                    <Sparkles size={15} />
                  </div>
                  <div className="cl-msg__body cl-typing">
                    <span className="cl-typing__dot" />
                    <span className="cl-typing__dot" />
                    <span className="cl-typing__dot" />
                    <span className="cl-typing__label">AI Mentor is thinking...</span>
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {errorMessage && (
                <div className="cl-error-banner">
                  <span>{errorMessage}</span>
                  <button
                    type="button"
                    className="cl-error-retry-btn"
                    onClick={() => {
                      setErrorMessage(null)
                      if (!session?.sessionId) {
                        handleNewChat()
                      } else {
                        handleSendMessage(inputContent)
                      }
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              <div ref={threadEndRef} className="cl-thread-end-anchor" />
            </div>

            {/* Bottom Docked Message Composer */}
            <div className="cl-composer-dock">
              <div className="cl-composer-box">
                <textarea
                  className="cl-composer-textarea"
                  placeholder="Ask a question, request code, or explore a new concept..."
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={sending}
                />

                <div className="cl-composer-footer">
                  <div className="cl-model-indicator cl-model-indicator--subtle" title="Active Groq reasoning model">
                    <Zap size={11} color="var(--color-terracotta)" />
                    <span>Groq 120B</span>
                  </div>

                  <button
                    type="button"
                    className="cl-composer-send-btn"
                    onClick={() => handleSendMessage()}
                    disabled={!inputContent.trim() || sending}
                    aria-label="Send message"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
