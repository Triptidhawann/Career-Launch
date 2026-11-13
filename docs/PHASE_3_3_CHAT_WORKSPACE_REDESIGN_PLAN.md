# CareerLaunch — Phase 3.3: ChatGPT-Style Conversation Management & Workspace Redesign Plan

## Executive Summary

Phase 3.3 transforms the CareerLaunch AI Learning Assistant from a single-session chat into a **ChatGPT-style multi-conversation workspace**. 

Previously, when a student revisited the assistant or re-selected skills, the application re-routed them back into their single existing conversation thread, mixing unrelated topics, historical roadmaps, and prior questions into one continuous conversation. 

This architecture plan details how to introduce **independent, persistent, date-grouped conversations**, a **collapsible left sidebar**, **automatic conversation naming**, **instant New Chat creation**, and **conversation-isolated role and skill context** while preserving 100% of existing student data, the Groq 120B integration (`openai/gpt-oss-120b`), and the warm editorial CareerLaunch visual identity.

---

## 1. Audit of Existing Implementation & Root Cause Analysis

### 1.1 Root Cause of Conversation Reuse
A thorough audit of the current codebase reveals three coupling points that forced all learning into a single session:

1. **Database Query Restriction (`server/src/controllers/learningController.js`)**:
   - In `startOrGetLearningSession`:
     ```javascript
     let session = await LearningSession.findOne({
       firebaseUid,
       roleId,
       active: true,
     })
     ```
   - If an active session existed for `(firebaseUid, roleId)`, the backend updated its skill references and returned that same session ID. It never created a second conversation for the same student and role.

2. **Entry Flow Coupling (`src/pages/RoleSkillSelectionPage.jsx`)**:
   - In `handleSaveSelection`:
     ```javascript
     await saveStudentSkillSelection(roleId, payload)
     const sessionRes = await startOrGetLearningSession(roleId)
     navigate(`/interview-preparation/${roleId}/assistant/${sessionRes.session.sessionId}`)
     ```
   - Because `startOrGetLearningSession` unconditionally returned the old session ID, clicking "Start Learning" on the skill selection page reloaded the student's prior chat history rather than starting a fresh conversation.

3. **Workspace State & Layout Limitations (`src/pages/LearningAssistantPage.jsx`)**:
   - The workspace layout was designed as a single full-width pane with no sidebar, no conversation list, and no "+ New Chat" control.
   - If a student opened `/interview-preparation/:roleId/assistant`, the page loaded all historical messages for that single session ID into `messages` state.
   - There was no model field for conversation titles (`title`) or date grouping markers (`lastActivityAt`), preventing multi-conversation navigation.

### 1.2 Model & Data Audit

| Component | Current State | Required Phase 3.3 Enhancement |
| :--- | :--- | :--- |
| **`LearningSession` Schema** | Represents a single workspace per role. Has `roleId`, `roleTitle`, `selectedSkills`, `customSkills`, `active`, `currentLearningContext`. Missing `title`, `lastActivityAt`, `status`. | **Extend existing model**: Add `title` (default: `'New Chat'`), `lastActivityAt` (Date), `status` (`'active'`, `'archived'`, `'deleted'`). Add compound index on `(firebaseUid, roleId, status, lastActivityAt)`. **Zero new models needed.** |
| **`LearningMessage` Schema** | Already stores `sessionId` (ref `LearningSession`), `firebaseUid`, `role`, `content`, `type`, `structuredData`, `suggestedActions`, `providerMetadata`. | **Preserve 100% unchanged**. Messages are already cleanly isolated by `sessionId`. |
| **`learningAssistantService.js`** | Prompts Groq with `session.selectedSkills`, `targetSkill`, and `conversationHistory`. | **Preserve AI logic**. Each session's messages will now belong strictly to that conversation. Groq receives only the active conversation's messages. |
| **Backend Port & DB** | Port `5000` (API), Port `27018` (MongoDB), DB `careerlaunch`. | **Preserve 100%**. Zero changes to infrastructure, ports, or databases. |

---

## 2. Target Student Journey & Experience Flow

```
                      1. TARGET ROLE SELECTION
                     [Frontend Developer chosen]
                                 │
                                 ▼
                     2. SKILL SELECTION PAGE
              [Student selects HTML & CSS, clicks Continue]
                                 │
                                 ▼
             3. CREATE FRESH CONVERSATION (Backend API)
         [New LearningSession created with selected skills snapshot]
                                 │
                                 ▼
           4. CHATGPT-STYLE WORKSPACE (Left Sidebar + Chat Area)
   ┌────────────────────────────────┬────────────────────────────────┐
   │          LEFT SIDEBAR          │         MAIN WORKSPACE         │
   │                                │                                │
   │  [+ New Chat]                  │  • Header: Role & Skills pills │
   │  [Search conversations...]     │  • Clean Welcome Hero          │
   │                                │  • "What will you learn today?"│
   │  ▼ Today                       │  • Prominent input composer    │
   │    ● New Chat (Active)         │  • Zero pre-written messages   │
   │  ▼ Yesterday                   │  • Zero automatic roadmaps     │
   │    ○ JavaScript Closures       │                                │
   │  ▼ Previous 7 Days             │                                │
   │    ○ Learn HTML from Scratch   │                                │
   └────────────────────────────────┴────────────────────────────────┘
                                 │
                                 ▼
                    5. STUDENT SENDS FIRST PROMPT
                     "Explain CSS Flexbox vs Grid"
                                 │
                                 ▼
        6. DYNAMIC TITLE GENERATION & INDEPENDENT PERSISTENCE
     [Title updated to "CSS Flexbox vs Grid", saved to MongoDB]
     [AI response generated using Mode B Detailed Concept Teaching]
                                 │
                                 ▼
            7. MULTI-CONVERSATION SWITCHING & NEW CHAT
    [Student can click "+ New Chat" at any time to open another topic]
    [Student can click previous chat in sidebar to restore full context]
```

### Key Experience Rules
1. **Never auto-resume on fresh entry**: Entering from the Skill Selection page or Target Role page creates a new, independent conversation.
2. **Never mix messages**: Messages belonging to Conversation A are never retrieved or passed to Groq during Conversation B.
3. **Preserve contextual skills**: Conversation A preserves `[HTML]`; Conversation B preserves `[JavaScript]`; Conversation C preserves `[HTML, CSS]`.
4. **No forced templates**: The AI adapts naturally (Mode A roadmap if asked from scratch, Mode B detailed teaching if asking a concept, Mode C conversational follow-up).

---

## 3. Data Architecture & Database Changes

### 3.1 `LearningSession` Schema Extension (Non-Breaking)

We reuse and extend the existing `LearningSession` schema to represent an independent conversation. No duplicate collections are created.

```javascript
// server/src/models/LearningSession.js
const LearningSessionSchema = new Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      index: true,
    },
    roleId: {
      type: String,
      required: true,
      enum: [
        'frontend-developer',
        'backend-developer',
        'full-stack-developer',
        'software-engineer',
        'data-analyst',
        'data-scientist',
        'devops-engineer',
        'mobile-app-developer',
      ],
      index: true,
    },
    roleTitle: {
      type: String,
      default: 'Frontend Developer',
    },
    // NEW in Phase 3.3: Concise, human-readable conversation title
    title: {
      type: String,
      default: 'New Chat',
      trim: true,
      maxlength: 120,
    },
    // NEW in Phase 3.3: Explicit conversation lifecycle status
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
      index: true,
    },
    // NEW in Phase 3.3: High-resolution timestamp for date grouping & sidebar sorting
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // Selected skills snapshot for this specific conversation
    selectedSkills: [
      {
        skillId: { type: String, required: true },
        name: { type: String, required: true },
        officialTopicId: { type: String, default: null },
        knowledgeSupportStatus: { type: String, default: 'roadmap_topic' },
      },
    ],
    customSkills: [
      {
        name: { type: String, required: true },
      },
    ],
    // Backward compatibility flag
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    currentLearningContext: {
      activeSkill: { type: String, default: null },
      currentMilestone: { type: String, default: null },
      currentTopic: { type: String, default: null },
      statedKnowledge: { type: [String], default: [] },
      demonstratedCompetencies: { type: [String], default: [] },
      generatedRoadmap: { type: Schema.Types.Mixed, default: null },
    },
  },
  {
    timestamps: true, // provides createdAt and updatedAt
  }
)

// Optimized compound indexes for sidebar queries and search
LearningSessionSchema.index({ firebaseUid: 1, roleId: 1, status: 1, lastActivityAt: -1 })
LearningSessionSchema.index({ firebaseUid: 1, status: 1, lastActivityAt: -1 })
```

### 3.2 Backward Compatibility & Zero-Downtime Migration Strategy

1. **No Data Deletion**: Existing `learningsessions` and `learningmessages` records remain in MongoDB untouched.
2. **Virtual / Default Fallbacks**:
   - Any legacy session lacking `title` automatically resolves to `session.title || 'General Learning Session'`.
   - Any legacy session lacking `lastActivityAt` automatically resolves to `session.updatedAt || session.createdAt || new Date()`.
   - Any legacy session lacking `status` automatically defaults to `'active'`.
3. **Lazy Schema Migration**: When an existing session is fetched or modified, the backend automatically sets `title` and `lastActivityAt` if undefined. A standalone background migration script will also be provided to backfill existing documents without downtime.

---

## 4. Backend REST API Design

All endpoints require the Firebase bearer token via `requireAuth` middleware and strictly enforce ownership (`session.firebaseUid === req.user.uid`).

### 4.1 Create Independent Conversation
- **Endpoint**: `POST /api/learning/conversations`
- **Description**: Creates a brand new, empty conversation snapshotting the student's selected skills.
- **Request Body**:
  ```json
  {
    "roleId": "frontend-developer",
    "selectedSkillIds": ["javascript", "html", "css"],
    "customSkills": [],
    "initialTitle": "New Chat"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "conversation": {
      "sessionId": "6af694...1a",
      "roleId": "frontend-developer",
      "roleTitle": "Frontend Developer",
      "title": "New Chat",
      "status": "active",
      "selectedSkills": [ ... ],
      "customSkills": [],
      "createdAt": "2026-11-13T10:30:00.000Z",
      "lastActivityAt": "2026-11-13T10:30:00.000Z"
    }
  }
  ```

### 4.2 List Student Conversations
- **Endpoint**: `GET /api/learning/conversations`
- **Query Parameters**:
  - `roleId` (optional): Filter conversations by role (e.g. `frontend-developer`).
  - `search` (optional): Filter conversations by title substring.
  - `limit` (optional, default `50`): Maximum conversations returned.
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "conversations": [
      {
        "sessionId": "6af694...1a",
        "roleId": "frontend-developer",
        "title": "CSS Flexbox vs Grid",
        "status": "active",
        "selectedSkills": [{ "skillId": "css", "name": "CSS" }],
        "lastActivityAt": "2026-11-13T10:32:00.000Z",
        "createdAt": "2026-11-13T10:30:00.000Z",
        "messageCount": 4
      }
    ]
  }
  ```

### 4.3 Get Single Conversation Metadata
- **Endpoint**: `GET /api/learning/conversations/:sessionId`
- **Access Control**: Returns `403 Forbidden` if `session.firebaseUid !== req.user.uid`. Returns `404 Not Found` if `sessionId` does not exist or has `status: 'deleted'`.
- **Response (`200 OK`)**: Returns full conversation metadata, selected skills, and learning context.

### 4.4 Get Conversation Messages
- **Endpoint**: `GET /api/learning/conversations/:sessionId/messages`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "sessionId": "6af694...1a",
    "messages": [
      {
        "id": "6af694...b2",
        "role": "user",
        "content": "Explain CSS Flexbox vs Grid",
        "type": "text",
        "createdAt": "2026-11-13T10:30:15.000Z"
      },
      {
        "id": "6af694...c3",
        "role": "assistant",
        "content": "### Concept Overview & Why It Matters...",
        "type": "text",
        "suggestedActions": ["Show me a Grid layout example", "Give me a Flexbox challenge"],
        "createdAt": "2026-11-13T10:30:18.000Z"
      }
    ]
  }
  ```

### 4.5 Send Message & Auto-Generate Title
- **Endpoint**: `POST /api/learning/conversations/:sessionId/messages`
- **Request Body**: `{ "content": "Explain CSS Flexbox vs Grid" }`
- **Behavior**:
  1. Verifies ownership.
  2. Saves student user message.
  3. **Auto-Title Check**: If the conversation is currently titled `"New Chat"` or untitled, extracts a clean 3–6 word title from the user prompt and updates `session.title`.
  4. Generates AI assistant response using Groq 120B strictly with this conversation's context.
  5. Updates `session.lastActivityAt = new Date()`.
  6. Saves assistant response message.
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "userMessage": { ... },
    "assistantMessage": { ... },
    "conversationTitle": "CSS Flexbox vs Grid"
  }
  ```

### 4.6 Rename Conversation
- **Endpoint**: `PATCH /api/learning/conversations/:sessionId`
- **Request Body**: `{ "title": "Mastering CSS Layouts" }`
- **Validation**: Requires trimmed string between 1 and 100 characters.
- **Response (`200 OK`)**: Returns updated conversation object with new title.

### 4.7 Delete Conversation (Soft Delete)
- **Endpoint**: `DELETE /api/learning/conversations/:sessionId`
- **Behavior**: Sets `session.status = 'deleted'`, `session.active = false`. Message records are preserved in the database for auditing and compliance, but excluded from all student-facing queries.
- **Response (`200 OK`)**: `{ "success": true, "message": "Conversation deleted successfully." }`

---

## 5. Intelligent Title Generation & Date Grouping Algorithms

### 5.1 Title Generation Algorithm
To ensure fast, reliable titles without wasting Groq API tokens or hitting rate limits, titles are generated using an intelligent deterministic extractor:

```javascript
// server/src/utils/conversationTitleGenerator.js
export function generateConversationTitle(promptText, activeSkill = 'Tech') {
  if (!promptText || typeof promptText !== 'string') {
    return `${activeSkill} Learning`
  }

  const clean = promptText.trim().replace(/^["']|["']$/g, '')

  // 1. Match "learn X from scratch" / "X roadmap"
  const learnMatch = clean.match(/learn\s+([^.,?!]+?)(?:\s+from\s+scratch|\s+roadmap)?$/i)
  if (learnMatch) {
    return `Learn ${capitalizeWords(learnMatch[1])}`
  }

  // 2. Match "explain X in detail" / "explain X" / "what is X"
  const explainMatch = clean.match(/(?:explain|what is|how does)\s+([^.,?!]+?)(?:\s+in\s+detail|\s+work)?$/i)
  if (explainMatch) {
    return `${capitalizeWords(explainMatch[1])} Explained`
  }

  // 3. Match "prepare me for X interviews" / "X interview questions"
  const interviewMatch = clean.match(/(?:prepare me for\s+|interview questions on\s+)([^.,?!]+)/i)
  if (interviewMatch) {
    return `${capitalizeWords(interviewMatch[1])} Interview Prep`
  }

  // 4. Short prompts (< 35 chars): Clean directly
  if (clean.length <= 35) {
    return capitalizeWords(clean.replace(/[?.!]+$/, ''))
  }

  // 5. Fallback: First 4-6 meaningful words (up to 40 chars)
  const words = clean.split(/\s+/).slice(0, 5).join(' ')
  return capitalizeWords(words.length > 40 ? words.slice(0, 37) + '...' : words)
}
```

### 5.2 Date Grouping Algorithm
Conversations are grouped client-side based on `lastActivityAt` relative to the student's local midnight:

- **Today**: `lastActivityAt >= startOfToday`
- **Yesterday**: `startOfYesterday <= lastActivityAt < startOfToday`
- **Previous 7 Days**: `startOf7DaysAgo <= lastActivityAt < startOfYesterday`
- **Older**: `lastActivityAt < startOf7DaysAgo`

---

## 6. Frontend Workspace Architecture & Visual Layouts

The frontend will be restructured into a ChatGPT-style layout with a collapsible sidebar and clean main chat workspace.

### 6.1 Desktop Layout — Empty New Chat (Zero Messages)

```
┌────────────────────────┬────────────────────────────────────────────────────────────────────────┐
│  CareerLaunch   [<]    │  [=]  FRONTEND DEVELOPER  [JavaScript] [HTML]   [Change Skills]   [ST] │
├────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│  [+ New Chat]          │                                                                        │
│  [Q Search chats... ]  │                                                                        │
│                        │                     * Introducing CareerLaunch AI *                    │
│  ▼ TODAY               │                                                                        │
│  ● New Chat     [..]   │                     What will you learn today?                         │
│                        │       Master frontend engineering & ace your technical interviews      │
│  ▼ YESTERDAY           │                                                                        │
│    JavaScript Closures │          ┌──────────────────────────────────────────────────┐          │
│    CSS Grid Layout     │          │ What do you want to learn?                       │          │
│                        │          │                                                  │          │
│  ▼ PREVIOUS 7 DAYS     │          ├──────────────────────────────────────────────────┤          │
│    Learn HTML Scratch  │          │ [+]  [⚡ Groq 120B]       [💡 Roadmap]    [Send >]│          │
│    HTML Interview Prep │          └──────────────────────────────────────────────────┘          │
│                        │                                                                        │
│  ▼ OLDER               │          [ "Teach me HTML from scratch" ] [ "Explain closures" ]       │
│    React Hooks Deep    │                                                                        │
├────────────────────────┤                                                                        │
│  [ST] Tripti Dhawan    │                                                                        │
│  Frontend Developer    │                                                                        │
└────────────────────────┴────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Desktop Layout — Active Conversation with Messages & Code

```
┌────────────────────────┬────────────────────────────────────────────────────────────────────────┐
│  CareerLaunch   [<]    │  [=]  FRONTEND DEVELOPER  [JavaScript]          [+ New Chat]      [ST] │
├────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│  [+ New Chat]          │                                                                        │
│  [Q Search chats... ]  │  ┌──────────────────────────────────────────────────────────────────┐  │
│                        │  │ You:                                                             │  │
│  ▼ TODAY               │  │ Explain closures with examples.                                  │  │
│  ● JavaScript Closures │  └──────────────────────────────────────────────────────────────────┘  │
│    CSS Grid Layout     │                                                                        │
│                        │  ┌──────────────────────────────────────────────────────────────────┐  │
│  ▼ YESTERDAY           │  │ AI Mentor (Groq 120B):                                           │  │
│    Learn HTML Scratch  │  │ ### Concept Overview & Why It Matters                            │  │
│    HTML Interview Prep │  │ A **closure** is a function that retains access to its outer...  │  │
│                        │  │                                                                  │  │
│  ▼ PREVIOUS 7 DAYS     │  │ ```javascript                                    [Copy Code]     │  │
│    React Hooks Deep    │  │ function createCounter() {                                       │  │
│                        │  │   let count = 0;                                                 │  │
│                        │  │   return () => ++count;                                          │  │
│                        │  │ }                                                                │  │
│                        │  │ ```                                                              │  │
│                        │  │                                                                  │  │
│                        │  │ Suggested Follow-ups:                                            │  │
│                        │  │ [ Try a closure coding challenge ] [ Explain memory leaks ]       │  │
│                        │  └──────────────────────────────────────────────────────────────────┘  │
│                        │                                                                        │
├────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│  [ST] Tripti Dhawan    │  [ Ask a follow-up or explore a new concept...       ] [⚡ 120B] [Send >]│
└────────────────────────┴────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Mobile Layout — Responsive Collapsible Sidebar

```
  [Mobile View: Closed Sidebar]                     [Mobile View: Open Drawer Overlay]
┌──────────────────────────────────────┐          ┌───────────────────────┬──────────────┐
│ [=] CareerLaunch   [+ New]      [ST] │          │ CareerLaunch      [X] │ (Backdrop)   │
├──────────────────────────────────────┤          ├───────────────────────┤ (Tap outside │
│                                      │          │ [+ New Chat]          │  to close)   │
│ What will you learn today?           │          │ [Q Search chats... ]  │              │
│                                      │          │                       │              │
│ ┌──────────────────────────────────┐ │          │ ▼ TODAY               │              │
│ │ Ask anything...                  │ │          │ ● JavaScript Closures │              │
│ ├──────────────────────────────────┤ │          │ ▼ YESTERDAY           │              │
│ │ [⚡ Groq 120B]          [Send >]  │ │          │   Learn HTML Scratch  │              │
│ └──────────────────────────────────┘ │          │                       │              │
└──────────────────────────────────────┘          └───────────────────────┴──────────────┘
```

### 6.4 Sidebar Actions: Rename & Delete Interaction Flow

1. **Rename Flow**:
   - Hovering or tapping conversation shows pencil icon `[✎]`.
   - Clicking pencil replaces title with inline `<input />` auto-focused.
   - Pressing `Enter` or clicking checkmark calls `PATCH /api/learning/conversations/:sessionId`.
   - Pressing `Escape` cancels edit without changes.
2. **Delete Flow**:
   - Clicking trash icon `[🗑]` displays an inline confirmation popover: `"Delete this conversation? This cannot be undone."` with `[Cancel]` and `[Delete]` buttons.
   - Confirming calls `DELETE /api/learning/conversations/:sessionId`.
   - If the deleted conversation was active, the app automatically transitions to another recent conversation or creates a clean New Chat.

---

## 7. Frontend State Management & Routing

### 7.1 Routes Architecture
- **Route 1: `/interview-preparation/:roleId/assistant`**:
  - Automatically loads the student's latest active conversation for this role, OR creates a clean new conversation if none exist.
- **Route 2: `/interview-preparation/:roleId/assistant/:sessionId`**:
  - Directly opens the specified conversation.
  - If the session ID does not exist or was deleted, the client-side self-healer fetches the latest conversation or creates a new one, updating the URL seamlessly.

### 7.2 Component State Structure (`LearningAssistantPage.jsx`)

```javascript
// Sidebar & Conversation List State
const [conversations, setConversations] = useState([])
const [loadingConversations, setLoadingConversations] = useState(true)
const [sidebarOpen, setSidebarOpen] = useState(false) // for mobile/tablet
const [searchQuery, setSearchQuery] = useState('')
const [editingSessionId, setEditingSessionId] = useState(null)
const [editingTitle, setEditingTitle] = useState('')
const [confirmDeleteId, setConfirmDeleteId] = useState(null)

// Active Conversation State
const [activeSession, setActiveSession] = useState(null)
const [messages, setMessages] = useState([])
const [loadingSession, setLoadingSession] = useState(true)
const [sending, setSending] = useState(false)
const [inputContent, setInputContent] = useState('')
const [errorMessage, setErrorMessage] = useState(null)
```

### 7.3 Switching & New Chat Mechanics
- **Clicking "+ New Chat"**:
  1. Calls `POST /api/learning/conversations` with current `roleId` and selected skills.
  2. Receives new `sessionId`.
  3. Prepend new conversation to `conversations` list in state.
  4. Navigates to `/interview-preparation/${roleId}/assistant/${newSessionId}`.
  5. Clears `messages` to `[]`.
  6. Renders clean welcome hero instantly.
- **Clicking Existing Chat in Sidebar**:
  1. If already on that `sessionId`, no-op.
  2. Otherwise, sets `loadingSession = true`, clears current messages to avoid cross-talk.
  3. Navigates to `/interview-preparation/${roleId}/assistant/${clickedId}`.
  4. Fetches conversation metadata & ordered messages in parallel via `Promise.all`.
  5. Renders chronological thread.

---

## 8. Role and Skill Isolation Rules

Every conversation maintains its own independent context:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Conversation A (sessionId: "6af...01")                                 │
│ Role: Frontend Developer | Skills: [HTML]                              │
│ Messages: "Teach me semantic HTML", "Explain <article> vs <section>"   │
│ AI Boundary: Restricted strictly to HTML.                              │
├────────────────────────────────────────────────────────────────────────┤
│ Conversation B (sessionId: "6af...02")                                 │
│ Role: Frontend Developer | Skills: [JavaScript]                        │
│ Messages: "Explain closures", "What is the event loop?"                │
│ AI Boundary: Restricted strictly to JavaScript.                        │
├────────────────────────────────────────────────────────────────────────┤
│ Conversation C (sessionId: "6af...03")                                 │
│ Role: Frontend Developer | Skills: [HTML, CSS]                         │
│ Messages: "Create an accessible responsive navbar"                     │
│ AI Boundary: Integrates HTML and CSS collaboratively.                  │
└────────────────────────────────────────────────────────────────────────┘
```

- When the backend prepares the prompt for Groq (`learningAssistantService.js`), it retrieves ONLY `session.selectedSkills` from the active conversation document.
- It retrieves ONLY `LearningMessage.find({ sessionId })` for that conversation.
- No skills, roadmaps, or messages from Conversation A ever enter the prompt for Conversation B.

---

## 9. Verification & Test Strategy (12 Core Scenarios)

We will execute automated integration and browser tests verifying all 12 required scenarios:

1. **Fresh Entry Test**: Saving skills on `RoleSkillSelectionPage` creates a fresh, empty conversation and navigates to its unique ID.
2. **New Chat Test**: Clicking "+ New Chat" creates a new conversation with zero messages, displaying the clean welcome hero.
3. **Message Persistence Test**: Sending a message persists both user message and assistant reply to the active `sessionId`.
4. **Message Isolation Test**: Creating a second chat displays zero messages from the first chat.
5. **Context Restoration Test**: Switching between Conversation A and Conversation B restores their exact respective message histories.
6. **Refresh Resilience Test**: Hard-refreshing (`F5`) an active conversation restores the exact same conversation and messages.
7. **Title Generation & Rename Test**: The first user prompt generates a relevant title (e.g. "JavaScript Closures Explained"); student can rename it to "My Closures Notes".
8. **Independent Deletion Test**: Deleting Conversation A soft-deletes only Conversation A; Conversation B and C remain intact.
9. **Multi-Tenant Security Test**: Student B cannot access, read, or modify Student A's conversation via direct API request or URL manipulation (returns `403 Forbidden`).
10. **Skill Boundary Test**: Conversation with `[HTML]` does not inject JavaScript or React into AI responses unless specifically requested.
11. **Prompt Isolation Test**: Groq receives only messages from the active conversation in `conversationHistory`.
12. **Legacy Compatibility Test**: Existing sessions created before Phase 3.3 remain readable, navigable, and intact in the sidebar under "Older".

---

## 10. Risk Management & Constraints Compliance

| Risk / Constraint | Mitigation Strategy |
| :--- | :--- |
| **No Data Loss** | All existing `LearningSession` and `LearningMessage` collections are preserved. Deletions are soft deletes (`status = 'deleted'`). |
| **No Schema Corruption** | All new fields (`title`, `status`, `lastActivityAt`) have safe defaults. Existing documents work without manual migration. |
| **Groq TPM Rate Limiting** | MaxTokens dynamically allocated (1200–2400); exponential backoff and TPM window handling in `groqProvider.js` prevents 413/429 failures. |
| **Technology Stack Integrity** | Strictly Node.js, Express, MongoDB (port 27018), React, Vite (port 5173), and plain CSS. Zero Tailwind, zero TypeScript, zero Supabase. |
| **Mobile Responsiveness** | Left sidebar uses off-canvas drawer with backdrop on screens `< 1024px`, ensuring full usability on mobile devices. |

---

## 11. Implementation Roadmap (Post-Approval)

Upon receiving user approval, implementation will proceed in four sequential, verified steps:

- **Step 1: Model & Backend Services**: Extend `LearningSession.js`, add conversation title generator, create new conversation controller endpoints in `learningController.js`, mount routes in `learningRoutes.js`.
- **Step 2: Frontend API Client**: Add `createLearningConversation`, `fetchStudentConversations`, `renameLearningConversation`, `deleteLearningConversation` in `src/lib/api.js`.
- **Step 3: Frontend Workspace & Sidebar UI**: Redesign `LearningAssistantPage.jsx` and `learning-assistant.css` with ChatGPT-style sidebar, date grouping, search, inline rename, delete confirmation, and mobile collapse.
- **Step 4: End-to-End Verification & Evidence**: Execute all 12 verification scenarios with real Groq API inference, capture full desktop and mobile screenshots, and compile the final Phase 3.3 report.
