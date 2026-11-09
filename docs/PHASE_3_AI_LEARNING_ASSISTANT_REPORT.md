# CAREERLAUNCH — PHASE 3: DEDICATED AI LEARNING ASSISTANT REPORT
## Continuous Chatbot Workspace & In-Conversation Personalised Roadmap

**Execution Date:** 09 November 2026  
**Status:** COMPLETE & FULLY VERIFIED  
**Target Role:** Frontend Developer (`frontend-developer` pilot track)  
**Assistant Route:** `/interview-preparation/:roleId/assistant/:sessionId`  
**Model Configured:** Real Groq `openai/gpt-oss-120b` (128k context, high-speed LPU inference)  
**Reference Document:** [CAREERLAUNCH_NEW_PRODUCT_ARCHITECTURE_BLUEPRINT.md](file:///c:/Users/Tripti%20Dhawan/OneDrive/Desktop/CareerLaunch/docs/CAREERLAUNCH_NEW_PRODUCT_ARCHITECTURE_BLUEPRINT.md)

---

## 1. Executive Summary

Phase 3 delivers the dedicated AI learning assistant for CareerLaunch, fulfilling the approved student journey:
$$\text{Target Role Selection} \longrightarrow \text{Role-Specific Skills} \longrightarrow \text{One Continuous AI Learning Assistant}$$

Frontend Developer serves as the pilot role. All of a student's selected technologies (e.g. `HTML`, `CSS`, `JavaScript`, `React`, `TypeScript`, `Tailwind CSS`, etc.) are supported in **one single, continuous conversation thread**. The student can switch between selected skills naturally, receive personalised dynamic roadmaps inside the chat, review prerequisites adaptively, and learn interactively with progressive explanations, syntax-highlighted code blocks, and copy-code actions.

### Key Invariants Maintained:
- **Zero Mocking / Real Groq Inference:** All conversational completions, prerequisite checks, and dynamic roadmaps are powered exclusively by real Groq inference using `openai/gpt-oss-120b`.
- **Zero Regression on Preceding Interfaces:**
  - Target Role Selection (`/interview-preparation`) remains 100% untouched.
  - Phase 2 Skill Selection (`/interview-preparation/frontend-developer/skills`) remains 100% untouched.
- **Database & Data Integrity:** All 20 generated lessons, 7 knowledge sources, 20 ingested documents, 28 content chunks, and 2 student profiles remain strictly preserved.
- **Backend Role Boundary Enforcement:** Enforced strictly on the server; out-of-scope requests (e.g. Kubernetes, Python Django backend, iOS Swift) receive a polite, pedagogical redirection to the student's selected frontend skills without naive keyword blacklisting.
- **Design System Fidelity:** Exclusively plain CSS adhering to CareerLaunch editorial design tokens (Warm Ivory, Deep Forest, Muted Terracotta, Soft Sage, Charcoal, and Sand).

---

## 2. Technical Architecture & File Structure

```
CareerLaunch/
├── src/
│   ├── pages/
│   │   ├── LearningAssistantPage.jsx      # Phase 3 Chatbot Workspace (Thread, Roadmap, Prereq, Input)
│   │   ├── RoleSkillSelectionPage.jsx      # Phase 2 Skill Selection (Updated launcher action)
│   │   └── InterviewPreparationPage.jsx    # Role selection router preservation
│   ├── styles/
│   │   ├── learning-assistant.css          # Editorial tokens, chat bubbles, code blocks, roadmap cards
│   │   └── skill-selection.css             # Phase 2 simplified technology grid
│   ├── lib/
│   │   └── api.js                          # startOrGetLearningSession, fetchLearningMessages, sendLearningMessage
│   └── App.jsx                             # Mounted /interview-preparation/:roleId/assistant routes
├── server/
│   └── src/
│       ├── models/
│       │   ├── LearningSession.js          # Mongoose schema (firebaseUid, roleId, selectedSkills, context)
│       │   └── LearningMessage.js          # Mongoose schema (sessionId, role, content, type, structuredData)
│       ├── services/
│       │   └── ai/
│       │       ├── learningAssistantService.js # Boundary enforcement, prerequisite engine, roadmap generator
│       │       └── groqProvider.js         # chatCompletion with JSON Object mode, 429 backoff, LPU timing
│       ├── controllers/
│       │   └── learningController.js       # Session start/resume, message history, chat completion handler
│       ├── routes/
│       │   └── learningRoutes.js           # Endpoints mounted at /api/learning
│       └── scripts/
│           └── testPhase3Assistant.js      # 49-assertion automated integration test suite
└── scripts/
    └── capture_phase3_assistant.cjs        # Headless Edge CDP visual verification automation
```

---

## 3. Data Models & API Endpoints

### 1. `LearningSession` Mongoose Schema (`server/src/models/LearningSession.js`)
- `firebaseUid`: String (indexed, required)
- `roleId`: String (`frontend-developer`, indexed, required)
- `roleTitle`: String (`Frontend Developer`)
- `selectedSkills`: Array of `{ skillId, name, officialTopicId, knowledgeSupportStatus }`
- `customSkills`: Array of `{ name }`
- `active`: Boolean (default `true`, indexed)
- `currentLearningContext`:
  - `activeSkill`: String (e.g. `'React'`)
  - `statedKnowledge`: Array of Strings (e.g. `['JavaScript ES6', 'Functions and Scope']`)
  - `demonstratedCompetencies`: Array of Strings
  - `generatedRoadmap`: Object (stores the latest in-conversation dynamic roadmap)
- Compound index: `{ firebaseUid: 1, roleId: 1, active: 1 }`

### 2. `LearningMessage` Mongoose Schema (`server/src/models/LearningMessage.js`)
- `sessionId`: ObjectId (ref: `LearningSession`, required, indexed)
- `firebaseUid`: String (required, indexed)
- `role`: String (`'user'` | `'assistant'` | `'system'`)
- `content`: String (Markdown formatted text)
- `type`: String (`'text'` | `'roadmap'` | `'prerequisite_check'` | `'checkpoint'` | `'welcome'`)
- `structuredData`: Mixed (contains roadmap trees, prerequisite checks)
- `suggestedActions`: Array of Strings (contextual follow-up chips)
- `providerMetadata`: Private backend telemetry `{ provider, model, durationMs, promptTokens, completionTokens, totalTokens }`
- Compound index: `{ sessionId: 1, createdAt: 1 }`, `{ firebaseUid: 1, sessionId: 1 }`

### 3. API Endpoints
- `POST /api/learning/sessions`: Starts or retrieves the active continuous learning session for the student and role. Injects an onboarding welcome message if starting fresh.
- `GET /api/learning/sessions/:sessionId`: Retrieves session metadata and selected skills. Enforces Firebase ownership (`req.user.uid`).
- `GET /api/learning/sessions/:sessionId/messages`: Retrieves ordered message history.
- `POST /api/learning/sessions/:sessionId/messages`: Validates input, saves the student's message, invokes the Groq learning assistant, validates output, and saves the assistant response. Protected by rate limiting (30 req/min).

---

## 4. Real Groq Provider Verification & Telemetry

Tested against real Groq endpoints using configured model `openai/gpt-oss-120b`:
- **Model ID:** `openai/gpt-oss-120b`
- **Provider:** `groq`
- **Response Format:** `json_object` mode with strict schema enforcement
- **Average Inference Latency:** 2,100ms – 3,800ms per comprehensive conversational turn
- **Rate Limit Resilience:** Automatic exponential backoff and retry handling on HTTP 429 with `Retry-After` parsing.

---

## 5. Automated Test Suite Results (`testPhase3Assistant.js`)

**49 PASSED | 0 FAILED (100% Success Rate)**

| Test Group | Assertions | Status |
|---|---|---|
| [1] Session Initialization (`POST /api/learning/sessions`) | 6 | PASSED |
| [2] Initial Welcoming Conversation (`GET .../messages`) | 6 | PASSED |
| [3] Real Groq Conversational Inference (Teaching Concept) | 7 | PASSED |
| [4] Dynamic In-Conversation Roadmap Generation | 9 | PASSED |
| [5] Contextual Prerequisite Stating & Skipping | 4 | PASSED |
| [6] Role Boundary Enforcement (Polite Redirection) | 2 | PASSED |
| [7] Natural Skill Switching within Continuous Thread | 2 | PASSED |
| [8] Conversation History Restoration across Refreshes | 1 | PASSED |
| [9] Security, Validation & Student Isolation (HTTP 403/401/400) | 5 | PASSED |
| [10] Core Database Invariants Verification | 7 | PASSED |
| **Total** | **49** | **ALL PASSED** |

### Regression Suites:
- `testPhase2SkillSelection.js`: 45 PASSED | 0 FAILED
- `testPhaseB2DiagnosticAndPlan.js`: 43 PASSED | 0 FAILED
- `testPhaseB1Setup.js`: 26 PASSED | 0 FAILED
- `testPhase6Batch1.js`: 101 PASSED | 0 FAILED
- `npx oxlint`: 0 warnings, 0 errors across 131 files
- `npm run build`: Production bundle compiled cleanly in 739ms

---

## 6. Visual Evidence Artifacts

All screenshots captured via Microsoft Edge Headless Chrome DevTools Protocol at native viewports:

1. **Desktop Learning Assistant Conversation Overview (`phase3_assistant_desktop_conversation.png`):**  
   ![Desktop Learning Assistant](/C:/Users/Tripti Dhawan/.gemini/antigravity/brain/bb47f723-df86-42ba-9e78-5b46672d66af/phase3_assistant_desktop_conversation.png)  
   *Complete multi-turn thread showing welcome greeting, closures deep-dive with code blocks, in-chat roadmap, React component architecture, polite boundary redirect, and Tailwind CSS switch.*

2. **In-Conversation Dynamic Roadmap Card (`phase3_assistant_roadmap_interactive.png`):**  
   ![In-Conversation Roadmap](/C:/Users/Tripti Dhawan/.gemini/antigravity/brain/bb47f723-df86-42ba-9e78-5b46672d66af/phase3_assistant_roadmap_interactive.png)  
   *Interactive structured roadmap card embedded inside the chat with milestones, estimated hours, topic rows with "Teach this topic →" buttons, and practical exercises.*

3. **Code Blocks & Progressive Teaching (`phase3_assistant_teaching_code.png`):**  
   ![Teaching Code Blocks](/C:/Users/Tripti Dhawan/.gemini/antigravity/brain/bb47f723-df86-42ba-9e78-5b46672d66af/phase3_assistant_teaching_code.png)  
   *Dark-themed syntax code blocks with language header and copy-to-clipboard functionality, accompanied by interview focal points and quick-action chips.*

4. **Mobile Responsiveness (`phase3_assistant_mobile_view.png`):**  
   ![Mobile Responsiveness](/C:/Users/Tripti Dhawan/.gemini/antigravity/brain/bb47f723-df86-42ba-9e78-5b46672d66af/phase3_assistant_mobile_view.png)  
   *390px mobile viewport demonstrating responsive message bubbles, horizontal code scrolling, and fixed bottom input bar.*

---

## 7. Database Invariant Audit

| Collection | Baseline Before Phase 3 | Count After Phase 3 | Variance |
|---|---|---|---|
| `studentprofiles` | 2 | 2 | 0 |
| `generatedlessons` | 20 | 20 | 0 |
| `knowledgesources` | 7 | 7 | 0 |
| `ingesteddocuments` | 20 | 20 | 0 |
| `contentchunks` | 28 | 28 | 0 |
| `preparationsessions` | 1 | 1 | 0 |
| `diagnosticsessions` | 9 | 9 | 0 |
| `preparationplans` | 5 | 5 | 0 |
| `studentskillselections` | 1 | 1 | 0 |
| `learningsessions` | 0 | 1 | +1 (New Phase 3) |
| `learningmessages` | 0 | 11 | +11 (New Phase 3) |

---

## 8. Commit & Sync Status

- Branch `main` and `migration/javascript` ready for commit.
- Strict stop condition enforced: awaiting user review and direction.
