# CareerLaunch — Phase 3.3: ChatGPT-Style Conversation Management & Workspace Redesign Report

**Date**: November 13, 2026  
**Status**: Completed & Verified  
**Stack**: React, Vite, Node.js, Express, MongoDB (Port 27018), Groq API (`openai/gpt-oss-120b`)  

---

## 1. Executive Summary

Phase 3.3 successfully transforms the CareerLaunch AI Learning Assistant from a single-session chat into an **independent, multi-conversation ChatGPT-style workspace**. 

Prior to this phase, students returning to the assistant were locked into a single continuous conversation thread that concatenated old roadmap milestones, previous questions, and mismatched skill contexts. 

With Phase 3.3, CareerLaunch now provides:
- **Independent, Persistent Conversations**: Each chat maintains its own isolated message history, unique ID, and role/skill context.
- **ChatGPT-Style Left Sidebar**: Collapsible 280px sidebar featuring real-time search, date-based grouping (*Today*, *Yesterday*, *Previous 7 Days*, *Older*), active conversation indicator, inline renaming, and safe deletion with confirmation.
- **Fresh Entry Experience**: Entering through the Role or Skill Selection page always starts a clean conversation with an empty message history and the welcoming hero screen.
- **Context-Preserved Skill Snapshots**: A conversation started with `[HTML]` remains strictly focused on HTML; a conversation started with `[JavaScript]` remains strictly focused on JavaScript, even if the student later changes their global skill preferences.
- **Zero Data Loss**: 100% of existing student records, `LearningSession` documents, and `LearningMessage` rows are preserved in MongoDB on port `27018`.
- **Groq 120B AI Integration**: Preserved the full natural teaching and roadmap generation capabilities developed in Phases 3.1 and 3.2.

---

## 2. Mandatory Corrections Addressed

### 2.1 Fresh Entry vs. Existing Conversation
- **Contradiction Resolved**: 
  - Entering through `RoleSkillSelectionPage` ("Save & Continue") now calls `POST /api/learning/conversations` to create a fresh conversation with a clean history and navigates directly to its new ID.
  - Clicking **`+ New Chat`** in the sidebar or topbar explicitly creates a fresh conversation.
  - Clicking an existing conversation in the sidebar opens that exact conversation without appending prior messages.
  - Refreshing an active conversation (`F5`) re-fetches and restores that exact conversation.
  - Under no circumstances does a fresh entry automatically resume a prior conversation.

### 2.2 Independent Skill Context
- Every conversation stores its own snapshot of `selectedSkills` within the `LearningSession` document.
- If Conversation A has `[HTML]`, and the student later selects `[JavaScript]` for Conversation B, Conversation A retains `[HTML]`. When Conversation A is opened, Groq's prompt builder receives strictly `[HTML]`.

### 2.3 Safe Deletion & Multi-Tenant Authorization
- **Soft Deletion**: Calling `DELETE /api/learning/conversations/:sessionId` sets `session.status = 'deleted'` and `session.active = false`. 
- **Zero Physical Deletions**: No physical `LearningMessage` or `LearningSession` rows are purged.
- **Filtering**: Deleted conversations are automatically excluded from student-facing sidebar lists (`status: { $ne: 'deleted' }`).
- **Strict Authorization**: Every conversation API validates `session.firebaseUid === req.user.uid`. Attempted access by other students immediately returns `403 Forbidden` or `404 Not Found`.

### 2.4 Returning Student Lifecycle
- Tested and verified:
  1. Creating multiple distinct conversations.
  2. Closing and reopening the browser session.
  3. Logging out and authenticating with fresh credentials.
  4. Retrieving all saved conversations in the sidebar grouped by date.
  5. Opening an older conversation and continuing the discussion without message loss.
  6. Creating a fresh chat without corrupting or deleting older conversations.

---

## 3. Data Architecture & Model Extension

Rather than creating duplicate or competing collections, we extended the existing `LearningSession` schema:

```javascript
// server/src/models/LearningSession.js
const LearningSessionSchema = new Schema(
  {
    firebaseUid: { type: String, required: true, index: true },
    roleId: { type: String, required: true, enum: [...], index: true },
    roleTitle: { type: String, default: 'Frontend Developer' },
    // Phase 3.3 Extensions
    title: { type: String, default: 'New Chat', trim: true, maxlength: 120 },
    status: { type: String, enum: ['active', 'archived', 'deleted'], default: 'active', index: true },
    lastActivityAt: { type: Date, default: Date.now, index: true },
    selectedSkills: [ ... ],
    customSkills: [ ... ],
    active: { type: Boolean, default: true, index: true },
    currentLearningContext: { ... }
  },
  { timestamps: true }
)

LearningSessionSchema.index({ firebaseUid: 1, roleId: 1, status: 1, lastActivityAt: -1 })
LearningSessionSchema.index({ firebaseUid: 1, status: 1, lastActivityAt: -1 })
```

### Dynamic Title Generation Utility
Titles are generated deterministically upon receiving the student's first prompt via `server/src/utils/conversationTitleGenerator.js`:
- Strips punctuation and leading/trailing quotes.
- Matches intent patterns:
  - `"I want to learn HTML from scratch"` -> `"Learn HTML"`
  - `"Explain closures with examples"` -> `"Closures Explained"`
  - `"Prepare me for HTML interviews"` -> `"HTML Interview Prep"`
  - `"Give me practical CSS Grid examples"` -> `"Practical CSS Grid"`
- Preserves technical acronyms (`HTML`, `CSS`, `JS`, `API`, `DOM`, `REST`, `SQL`).
- Zero latency and zero Groq token overhead.

---

## 4. Backend REST API Implementation

The following endpoints were mounted in `server/src/routes/learningRoutes.js` and implemented in `server/src/controllers/learningController.js`:

| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/learning/conversations` | Creates a fresh, independent conversation with skill snapshot |
| `GET` | `/api/learning/conversations` | Lists student's conversations for the role with search & date sorting |
| `GET` | `/api/learning/conversations/:sessionId` | Retrieves conversation metadata and skill context |
| `GET` | `/api/learning/conversations/:sessionId/messages` | Retrieves ordered messages for the conversation |
| `POST` | `/api/learning/conversations/:sessionId/messages` | Saves user prompt, auto-names chat on 1st prompt, returns Groq AI response |
| `PATCH` | `/api/learning/conversations/:sessionId` | Renames conversation title (validated up to 100 chars) |
| `DELETE` | `/api/learning/conversations/:sessionId` | Soft-deletes conversation (`status: 'deleted'`) |
| `POST` | `/api/learning/sessions` | Legacy endpoint preserved for 100% backward compatibility |

---

## 5. Frontend ChatGPT-Style Workspace & Sidebar UI

### 5.1 Left Sidebar (`bolt-sidebar`)
- **Width**: `280px` on desktop, smooth collapsible off-canvas drawer on mobile (`< 1024px`).
- **Brand Header**: CareerLaunch brand with Compass icon and mobile close `X` button.
- **New Chat Button**: Prominent button with plus icon (`+ New Chat`).
- **Search Bar**: Real-time filtering by conversation title with one-click clear (`X`).
- **Date Grouping**: Categorizes chats into **Today**, **Yesterday**, **Previous 7 Days**, and **Older**.
- **Interactive Actions**:
  - Hovering/tapping an item surfaces **Rename** (`Edit2`) and **Delete** (`Trash2`) icons.
  - Inline rename with auto-focused `<input>`, `Enter` to save, `Esc` to cancel.
  - Non-intrusive inline delete confirmation popover (`Delete? [✓] [✕]`).
- **Sidebar Footer**: Displays student avatar, full name, target role badge, and link back to Target Roles.

### 5.2 Main Conversation Area
- **Clean Welcome Screen (Empty State)**:
  - Celestial horizon glow.
  - Greeting: *"What will you learn today?"*.
  - Large centered input card with Groq 120B reasoning badge, Roadmap button, and Send button.
  - Three prompt inspiration chips (`Teach me HTML from scratch`, `Explain closures with examples`, `Prepare me for technical interviews`).
  - Zero pre-written messages, zero automatic roadmaps.
- **Active Conversation View**:
  - Chronological message thread.
  - Markdown rendered with bold/italic, bullet/numbered lists, inline code.
  - Syntax-highlighted dark-green code blocks with one-click Copy button.
  - Interactive 8-milestone Roadmap cards (rendered only when student asks for a roadmap).
  - Suggested follow-up action pills.
  - Fixed bottom composer with auto-resizing textarea.

---

## 6. Verification & Test Results

An automated integration test suite (`server/src/scripts/testPhase3_3Scenarios.js`) was developed and executed against the live Express server (`http://localhost:5000`) and MongoDB (`mongodb://127.0.0.1:27018/careerlaunch`):

```
===========================================================================
CAREERLAUNCH PHASE 3.3: CHATGPT-STYLE CONVERSATION MANAGEMENT TEST SUITE
===========================================================================

[Scenario 1] Fresh Entry via Skill Selection creates independent conversation
  ✓ Conversation created successfully
  ✓ Conversation snapshot contains HTML skill
  ✓ Initial title is "New Chat"

[Scenario 2] Creating New Chat opens empty conversation with clean initial state
  ✓ New conversation starts with 0 messages

[Scenario 3] Sending message persists to active conversation & triggers auto-title
  ✓ First message sent and AI replied
  ✓ Title auto-generated correctly: "Learn HTML"
  ✓ Assistant message content persisted
  ✓ Conversation 1 now contains exactly 2 messages (has 2)

[Scenario 4] Creating Conversation 2 with different skills does NOT leak messages
  ✓ Conversation 2 has a distinct unique session ID
  ✓ Conversation 2 snapshot contains JavaScript
  ✓ Conversation 2 does NOT have HTML
  ✓ Conversation 2 starts with ZERO messages (no leakage from Conv 1)

[Scenario 5] Context restoration when switching between Conversation 1 and 2
  ✓ Message sent to Conversation 2
  ✓ Conv 2 title auto-generated: "Closures Explained"
  ✓ Conv 1 still has exactly 2 messages
  ✓ Conv 1 preserved original user prompt
  ✓ Conv 2 has its own 2 messages
  ✓ Conv 2 preserved its user prompt

[Scenario 6] Refreshing active conversation restores exact metadata and messages
  ✓ Conversation 2 restored with title "Closures Explained"
  ✓ Conversation 2 restored with JavaScript skill

[Scenario 7] Renaming a conversation
  ✓ Conversation successfully renamed
  ✓ Renamed title reflected in conversation list

[Scenario 8] Safe Soft Deletion: deleting Conv 1 does NOT affect Conv 2
  ✓ Conversation 1 deleted successfully
  ✓ Deleted Conv 1 is excluded from student list
  ✓ Conv 2 remains active and present in student list
  ✓ Direct GET on deleted conversation returns 404 Not Found
  ✓ MongoDB record preserved with status: "deleted"
  ✓ Physical message records in MongoDB were NOT deleted

[Scenario 9] Security & Multi-Tenant Authorization: Student B cannot access Student A
  ✓ Student B blocked from reading Conv 2 (HTTP 403)
  ✓ Student B blocked from posting to Conv 2 (HTTP 403)

[Scenario 10] Independent Skill Context Preservation
  ✓ Conv 3 has exactly 2 skills (HTML, CSS)
  ✓ Conv 2 skill context remained exclusively JavaScript

[Scenario 11] Returning Student Lifecycle (Logout, Login, Re-open, Create Fresh)
  ✓ Returning student retrieves all saved conversations
  ✓ Returning student restored Conv 2 title
  ✓ Returning student restored Conv 2 message history
  ✓ Fresh conversation created with new ID
  ✓ Fresh chat present in list
  ✓ Conv 2 still present in list
  ✓ Conv 3 still present in list

[Scenario 12] Legacy Endpoints Compatibility (/sessions)
  ✓ Legacy GET /api/learning/sessions/:sessionId works seamlessly

===========================================================================
PHASE 3.3 TEST SUMMARY: 40 PASSED | 0 FAILED
===========================================================================
```

### Build & Lint Verification
- `npm run build`: Production bundle transformed and built in **1.96s** with zero errors.
- `npm run lint`: **0 errors** across all 134 files.

---

## 7. Visual Deliverables (Screenshots)

All screenshots were captured using Microsoft Edge headless and saved to the artifact repository:

1. **Desktop Workspace with Open Sidebar & Empty New Chat**:  
   `phase3_3_desktop_workspace_sidebar.png` (1440x900)  
   Shows the date-grouped conversation sidebar, active chat highlight, rename/delete controls, welcome hero, and prompt inspiration pills.

2. **Desktop Workspace with Active Conversation**:  
   `phase3_3_desktop_active_chat.png` (1440x900)  
   Shows the active chat "JavaScript Closures Deep Dive", JavaScript skill tag, Markdown code explanation, copy-code button, suggested follow-ups, and sticky bottom composer.

3. **Mobile Workspace Collapsed**:  
   `phase3_3_mobile_workspace_collapsed.png` (390x844 Mobile)  
   Shows the clean mobile view with topbar hamburger menu button, role pill, Change Skills link, and welcome composer.

4. **Mobile Drawer Open Overlay**:  
   `phase3_3_mobile_drawer_open.png` (390x844 Mobile)  
   Shows the slide-over conversation drawer with backdrop dimming, search bar, date-grouped items, and mobile close button.

---

## 8. Changed Files Summary

| File | Status | Description |
| :--- | :--- | :--- |
| `server/src/models/LearningSession.js` | Modified | Added `title`, `status`, `lastActivityAt` fields and compound indexes |
| `server/src/utils/conversationTitleGenerator.js` | Created | Deterministic title extractor with acronym preservation |
| `server/src/controllers/learningController.js` | Modified | Added `createConversation`, `listConversations`, `renameConversation`, `deleteConversation`, and auto-titling logic |
| `server/src/routes/learningRoutes.js` | Modified | Mounted `/api/learning/conversations` routes alongside legacy session routes |
| `src/lib/api.js` | Modified | Added client methods for conversation creation, listing, renaming, and deletion |
| `src/pages/RoleSkillSelectionPage.jsx` | Modified | Updated save handler to always create a fresh conversation on entry |
| `src/pages/LearningAssistantPage.jsx` | Modified | Implemented ChatGPT-style dual-pane workspace, sidebar, date grouping, rename/delete |
| `src/styles/learning-assistant.css` | Modified | Added styles for sidebar, mobile drawer, date groups, suggestion chips, follow-ups |
| `server/src/scripts/testPhase3_3Scenarios.js` | Created | Automated 12-scenario integration test suite verifying 40 assertions |
| `scripts/capture_phase3_3_screenshots.cjs` | Created | Automated screenshot capture script for desktop and mobile views |
| `docs/PHASE_3_3_CHAT_WORKSPACE_REDESIGN_REPORT.md` | Created | Comprehensive verification report |
