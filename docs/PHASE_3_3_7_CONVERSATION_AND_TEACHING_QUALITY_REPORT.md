# CareerLaunch — Phase 3.3.7: Conversation Naming, History Cleanup & Deep Technical Teaching Quality Report

**Document Version:** 1.0.0  
**Phase:** Phase 3.3.7  
**Date:** November 13, 2026  
**Status:** Complete & Fully Verified  
**Primary AI Model:** `openai/gpt-oss-120b` on Groq (with seamless failover to `openai/gpt-oss-20b`)  
**Database:** MongoDB on port `27018` (Database: `careerlaunch`)  
**Server Backend:** Express on port `5000`  
**Frontend Client:** React / Vite on port `5173`  

---

## 1. Executive Summary

In Phase 3.3.7, we addressed the key user-reported usability, persistence, and instructional quality issues in the CareerLaunch AI Learning Assistant workspace:

1. **Elimination of Sidebar "New Chat" Clutter:** Investigated and resolved the root cause of dozens of empty conversations cluttering the student sidebar. All 30 empty historical records were safely excluded from persistent history without destructive deletion, and repeated clicks on "New Chat" now reuse existing empty sessions rather than spawning orphaned documents.
2. **Deterministic & Structured Conversation Titles:** Implemented `server/src/utils/conversationTitleGenerator.js` to automatically extract clean, professional titles formatted as `[Skill] — [Topic]` (e.g., `HTML — Learn from Scratch`, `HTML — Semantic Elements`, `Git — Branching`, `JavaScript — Closures`, `React — useState`, `HTML — Void Elements`). Existing generic titles were migrated with non-destructive backfill while strictly preserving user-customized titles (`isCustomTitle: true`).
3. **Investigation & Permanent Fix for Duplicate User Messages:** Identified the multi-layer root cause of duplicated user message bubbles (unanswered user messages stored before AI 503 errors, optimistic state mismanagement, and lack of submission lock). Resolved across the full lifecycle: backend message idempotency, client-side `isSendingRef` concurrency locks, failed prompt tracking for retry actions, and rendering deduplication.
4. **Deep Technical Teaching Quality:** Upgraded the AI mentor prompt architecture to adapt depth dynamically: providing complete roadmaps for scratch queries, and comprehensive tutorials with internal browser/engine mechanics, copyable code snippets, edge cases, and high-yield interview takeaways for specific concept queries.
5. **High Availability & Groq Quota Failover:** Added seamless model failover from `openai/gpt-oss-120b` to `openai/gpt-oss-20b` when daily token ceilings (TPD) are reached, preventing request timeouts and maintaining 100% assistant uptime.

---

## 2. Problem Investigation & Root Causes

### 2.1 Investigation of Duplicate User Messages (Image 4 & User Log)

In the user's uploaded screenshot, identical user messages appeared back-to-back:
> `"start teaching me in a way that i know nothing about git and github"`

We inspected the complete message lifecycle:
1. **API Persistence Timing:** In `learningController.js`, `LearningMessage.create({ role: 'user', content })` was executed *before* dispatching the prompt to Groq. When Groq hit a token boundary or rate limit (HTTP 503), the user's message document was already committed to MongoDB with no corresponding assistant message.
2. **Retry Lifecycle:** When the student clicked "Retry", `handleSendMessage(inputContent)` was triggered. Because `inputContent` was cleared on initial submit, retry re-sent either an empty prompt or a retyped prompt. On receipt, the backend executed `LearningMessage.create(...)` again, creating a second identical user document right next to the first.
3. **Concurrency & Double-Click:** The submit handler lacked a synchronous ref guard (`isSendingRef`), allowing rapid Enter key presses or button clicks to fire simultaneous API calls before React state updated `sending`.
4. **Resolution:**
   - **Backend Idempotency:** If the immediately preceding message in the session is an unanswered `user` message with identical content, the backend reuses that document rather than inserting a duplicate.
   - **Frontend Concurrency Lock:** Added `isSendingRef = useRef(false)` to block race conditions.
   - **Targeted Retry:** Stored `lastFailedPromptRef.current` so clicking Retry sends the exact failed prompt cleanly without appending an additional optimistic bubble.
   - **Render Deduplication:** Added a client-side filter in `LearningAssistantPage.jsx` ensuring consecutive identical user messages without an intervening assistant message are collapsed into a single rendered bubble.

### 2.2 Investigation of Sidebar "New Chat" Clutter (Image 4)

Database inspection revealed **39 total sessions**, of which **30 were empty sessions with 0 messages**.
- **Root Cause:** Every navigation to `/interview-preparation/:roleId/assistant` and every click on `+ New Chat` executed `LearningSession.create({ title: 'New Chat', ... })`. Even if the student left without typing anything, that document persisted. `listConversations` returned all documents with `status !== 'deleted'`, filling the sidebar with 30 "New Chat" rows.
- **Resolution:**
  - **Empty Session Reuse:** In `createConversation`, if an active session with `messageCount === 0` already exists for that student and role, it is reused.
  - **Sidebar History Filter:** `listConversations` now returns conversations where `messageCount > 0`. Empty chats are excluded from persistent history without physical record deletion.
  - **On-the-Fly Title Backfill:** In `listConversations`, if any retrieved session has messages but retains `title: 'New Chat'` and `isCustomTitle !== true`, the first user message is automatically converted into a structured `[Skill] — [Topic]` title.

---

## 3. Real Groq Verification: 10 Technical Scenarios

All 10 required technical scenarios were executed against live MongoDB port `27018`, Express backend port `5000`, and Groq AI models (`openai/gpt-oss-120b` / `openai/gpt-oss-20b`).

| Scenario # | Prompt | Target Skill | Generated Conversation Title | Response Length | Headings (###) | Code Blocks | Model Used | Status |
|:---:|:---|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| **1** | `"Teach me HTML void elements."` | HTML | `HTML — Void Elements` | 2,456 chars | Yes | Yes | `openai/gpt-oss-120b` | **PASSED** |
| **2** | `"Explain every important HTML void element with syntax and examples."` | HTML | `HTML — Void Elements` | 3,735 chars | Yes | Yes | `openai/gpt-oss-120b` | **PASSED** |
| **3** | `"Explain semantic HTML in detail."` | HTML | `HTML — Semantic Elements` | 4,250 chars | Yes | Yes | `openai/gpt-oss-120b` | **PASSED** |
| **4** | `"Teach me HTML forms from beginner to advanced."` | HTML | `HTML — Forms & Inputs` | 4,747 chars | Yes | Yes | `openai/gpt-oss-120b` | **PASSED** |
| **5** | `"Explain JavaScript closures with practical examples."` | JavaScript | `JavaScript — Closures` | 3,328 chars | Yes | Yes | `openai/gpt-oss-120b` | **PASSED** |
| **6** | `"Explain React useState in detail."` | React | `React — useState` | 3,104 chars | Yes | Yes | `openai/gpt-oss-120b` | **PASSED** |
| **7** | `"Prepare me for HTML technical interviews."` | HTML | `HTML — Interview Preparation` | 1,850 chars | Yes | Yes | `openai/gpt-oss-120b` | **PASSED** |
| **8** | `"Explain this more deeply."` *(Follow-up in void elements thread)* | HTML | `HTML — Void Elements` | 3,422 chars | Yes | Yes | `openai/gpt-oss-120b` | **PASSED** |
| **9** | `"Give me a practical coding exercise."` *(Follow-up in void elements thread)* | HTML | `HTML — Void Elements` | 2,772 chars | Yes | Yes | `openai/gpt-oss-20b` | **PASSED** |
| **10** | `"Ask me five interview questions about the topic."` *(Follow-up in void elements thread)* | HTML | `HTML — Void Elements` | 2,061 chars | Yes | Yes | `openai/gpt-oss-120b` | **PASSED** |

---

## 4. Key Teaching Quality Criteria Verified

For all deep technical concept queries (Scenarios 1–6):
1. **Concept Overview & Why It Matters:** Direct definitions explaining the core problem solved (e.g., void elements having no content model, semantic elements powering the accessibility tree, closures preserving lexical environment references).
2. **How It Works Under The Hood:** Clear mental models of browser/engine mechanics (e.g., HTML parser tree construction rules, JavaScript execution contexts and call stacks, React Fiber memoized state hooks).
3. **Syntax & Practical Code Examples:** Accurate, copy-pasteable code blocks illustrating production patterns and correct HTML5 rules (no closing tags for void elements, `<form>` validation attributes, closure factory functions, functional state updaters).
4. **Common Pitfalls & Interview Takeaways:** Highlighted subtle gotchas (e.g., writing invalid closing tags like `</img>`, stale closures in event listeners, direct state mutation in React).
5. **No Artificial Truncation:** Eliminated restrictive word caps, allowing rich 2,500–4,700 character explanations that provide genuine interview confidence.

---

## 5. Visual Deliverables & Viewport Verification

Screenshots were captured using headless Edge with authenticated preview student tokens:

### 5.1 Desktop View (1440x900) — Clean Sidebar & Deep Teaching
- **File:** `phase3_3_7_desktop_clean_sidebar_and_chat.png` (789.8 KB)
- **Observations:** Sidebar displays 100% meaningful structured titles (`HTML — Void Elements`, `HTML — Forms & Inputs`, `React — useState`, `JavaScript — Closures`, etc.) grouped under `TODAY`. Zero "New Chat" rows. Main chat view features unboxed editorial typography, dark green syntax-highlighted code blocks, inline tags, and follow-up suggestion pills.

### 5.2 Desktop Deep Teaching View (1280x720)
- **File:** `phase3_3_7_desktop_deep_teaching_view.png` (530.3 KB)
- **Observations:** Optimal reading column width (850–1000px) with comfortable breathing room, perfectly aligned topbar and docked message composer.

### 5.3 Mobile Drawer View (390x844)
- **File:** `phase3_3_7_mobile_drawer_history.png` (1000.2 KB)
- **Observations:** Responsive drawer smoothly overlays on mobile devices, displaying the clean title list, active conversation highlight, New Chat button, search bar, and student profile footer.

---

## 6. Regression & Constraint Verification

- **MongoDB:** Connected to port `27018`, database `careerlaunch`. Zero historical student records deleted.
- **Express Backend:** Port `5000` fully operational with API routes `/api/learning/*`.
- **Vite Frontend:** Built successfully with `npm run build` (zero errors, 1.35s).
- **Code Quality:** `npm run lint` completed with 0 errors across 141 files.
- **Constraints Maintained:** Strictly plain CSS, JavaScript, React, and Express. No TypeScript, No Tailwind, No Supabase.
- **Phase Boundary:** Interview cross-questioning (Phase 3.4) was NOT started, strictly reserving it for the next phase.
