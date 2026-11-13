# CAREERLAUNCH — PHASE 4: LEARNING MEMORY & PROGRESS TRACKING
## Architectural Blueprint & Implementation Specification (Refined)

**Phase**: Phase 4 — Learning Memory & Progress Tracking  
**Status**: Architecture Refinement & Review (Ready for Approval)  
**Date**: November 9, 2026  
**Document**: `docs/PHASE_4_LEARNING_MEMORY_ARCHITECTURE.md`  
**Target Environment**: React 18, Vite, Express, MongoDB (port `27018`), Groq (`openai/gpt-oss-120b`)  

---

## 1. AUDIT OF EXISTING MODELS & PERSISTENCE

### 1.1 Existing MongoDB Collections & Schemas
CareerLaunch currently persists continuous learning data across three primary Mongoose collections:

1. **`StudentSkillSelection` (`studentskillselections`)**:
   - **Schema**: `firebaseUid` (indexed), `roleId` (indexed), `selectedSkills` (`[{ skillId, name, categoryId, categoryName, officialTopicId, knowledgeSupportStatus }]`), `customSkills` (`[{ name, requestedAt }]`).
   - **Role**: Persists what skills the student chose during Phase 2. Unique compound index `{ firebaseUid: 1, roleId: 1 }`.
2. **`LearningSession` (`learningsessions`)**:
   - **Schema**: `firebaseUid` (indexed), `roleId` (indexed), `roleTitle`, `selectedSkills`, `customSkills`, `active` (boolean), `currentLearningContext` (`{ activeSkill, currentMilestone, currentTopic, statedKnowledge, demonstratedCompetencies, generatedRoadmap }`).
   - **Role**: Acts as the single ongoing conversation thread for a role. Compound index `{ firebaseUid: 1, roleId: 1, active: 1 }`.
3. **`LearningMessage` (`learningmessages`)**:
   - **Schema**: `sessionId` (ref `LearningSession`), `firebaseUid`, `role` (`user` | `assistant` | `system`), `content`, `type` (`text` | `roadmap` | `prerequisite_check` | `checkpoint` | `welcome`), `structuredData`, `suggestedActions`, `providerMetadata` (`provider, model, durationMs, promptTokens, completionTokens, totalTokens`).
   - **Role**: Sequential message log. Indexes: `{ sessionId: 1, createdAt: 1 }`, `{ firebaseUid: 1, sessionId: 1 }`.
4. **`StudentProfile` (`studentprofiles`)**:
   - **Schema**: Student personal info, education, career preferences, general skills array (`[{ name, level, verified }]`), projects, certifications.

### 1.2 Identified Limitations in Current Chat Persistence
- **Context Volatility**: `currentLearningContext` stores loose string arrays (`statedKnowledge: [String]`, `demonstratedCompetencies: [String]`) without timestamps, evidence citations, assistance ratings, or granular state transitions.
- **Short History Horizon**: The controller currently loads only the last 8–10 messages (`.slice(-8)`). Once a conversation exceeds 10 turns, earlier explanations, student struggles, or mastered topics are discarded from the prompt context window.
- **No Dedicated Misconception Tracking**: When a student displays a misconception (e.g., confusing closure scope with global variables or mutating state directly in React), the system has no dedicated place to store this misconception. Subsequent queries may assume the concept is understood.
- **Lack of Multi-Session Continuity**: If a student closes the browser and returns days later, the AI has no structured memory of *where the student left off*, *what misconceptions remain unresolved*, or *what should be practiced next*.

---

## 2. PROPOSED LEARNING-MEMORY DATA STRUCTURE

To preserve backward compatibility, avoid breaking existing sessions, and minimize data duplication, Phase 4 introduces a dedicated, high-performance topic-memory model (`StudentTopicProgress`) while enriching `LearningSession.currentLearningContext`.

### 2.1 The 6 Progress States

Each topic within a student's selected skills track progresses through six formally defined states:

```
[not_started]
      │
      ▼
 [in_progress]
      │
      ▼
   [exposed] ──────(Student struggles / misconception)──────► [needs_revision]
      │                                                               ▲
      ▼                                                               │
  [practised] ────────────────────────────────────────────────────────┘
      │
      ▼ (Multi-faceted independent assessment evidence ONLY)
[demonstrated]
```

1. **`not_started`**: The student has not yet encountered or discussed this topic.
2. **`in_progress`**: The topic has been introduced or the student is currently discussing it in the active session.
3. **`exposed`**: The student read an explanation or example, but has not yet answered questions or written code.
4. **`practised`**: The student attempted a code exercise, answered a practice prompt, or explored variations.
5. **`demonstrated`**: The student proved genuine, independent mastery across multiple pieces of assessment evidence.
6. **`needs_revision`**: The student exhibited confusion, made a conceptual mistake, or regressed during later practice.

### 2.2 Schema Definition: `StudentTopicProgress`

```javascript
// server/src/models/StudentTopicProgress.js
import mongoose, { Schema } from 'mongoose'

const MisconceptionSchema = new Schema(
  {
    misconceptionId: {
      type: String,
      required: true,
    },
    concept: {
      type: String,
      required: true,
      trim: true,
    },
    misunderstoodDetail: {
      type: String,
      required: true,
      maxlength: 500,
    },
    correctedUnderstanding: {
      type: String,
      required: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['unresolved', 'resolved'],
      default: 'unresolved',
      index: true,
    },
    resolutionEvidence: {
      type: String,
      maxlength: 500,
      default: null,
    },
    detectedAt: {
      type: Date,
      default: Date.now,
    },
    lastReviewedAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
)

const EvidenceRecordSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['conceptual_explanation', 'problem_solving', 'code_debugging', 'quiz_response'],
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    assistanceLevel: {
      type: String,
      enum: ['independent', 'ai_assisted'],
      required: true,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
)

const StudentTopicProgressSchema = new Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      index: true,
    },
    roleId: {
      type: String,
      required: true,
      index: true,
    },
    skillId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    topicId: {
      type: String,
      required: true,
      trim: true,
    },
    topicTitle: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'exposed', 'practised', 'demonstrated', 'needs_revision'],
      default: 'not_started',
      index: true,
    },
    source: {
      type: String,
      enum: ['assistant_teaching', 'student_self_report', 'quiz_demonstration', 'code_exercise'],
      default: 'assistant_teaching',
    },
    evidenceHistory: [EvidenceRecordSchema],
    misconceptions: [MisconceptionSchema],
    lastStudiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// One record per student, role, and topic
StudentTopicProgressSchema.index(
  { firebaseUid: 1, roleId: 1, topicId: 1 },
  { unique: true }
)
StudentTopicProgressSchema.index({ firebaseUid: 1, roleId: 1, status: 1 })

export const StudentTopicProgress =
  mongoose.models.StudentTopicProgress ||
  mongoose.model('StudentTopicProgress', StudentTopicProgressSchema)
```

### 2.3 Lightweight Session Extension (`LearningSession`)

Without breaking existing records, we enrich `currentLearningContext` in `LearningSession`:

```javascript
currentLearningContext: {
  activeSkill: { type: String, default: null },
  lastTopicId: { type: String, default: null },
  lastTopicTitle: { type: String, default: null },
  lastActionSummary: { type: String, default: null }, // e.g., "Practiced closures with debounce helper"
  statedKnowledge: { type: [String], default: [] },
  demonstratedCompetencies: { type: [String], default: [] }, // Array of demonstrated topicIds
  activeMisconceptionsCount: { type: Number, default: 0 },
  recommendedNextStep: { type: String, default: null },
  generatedRoadmap: { type: Schema.Types.Mixed, default: null },
}
```

---

## 3. STRONGER EVIDENCE FOR DEMONSTRATED UNDERSTANDING

### 3.1 Strict Criteria for Demonstrated Understanding
A student must never be credited with mastery based on superficial signals:
- **A single correct quiz answer MUST NOT mark a topic as demonstrated**: A lucky multiple-choice guess or a single short affirmative response only transitions the topic to `practised`.
- **Require Multi-Faceted Evidence**: To transition to `demonstrated`, the student must provide **at least two distinct evidence items** across different assessment modalities:
  1. *Accurate Conceptual Explanation*: Explaining the core mechanism in their own words.
  2. *Independent Problem Solving*: Writing or structuring a solution to a real scenario without boilerplate templates.
  3. *Independent Code Debugging*: Identifying and fixing a bug in code without AI suggestions.
- **Independence vs. AI Assistance**:
  - If the student received leading hints, structural templates, or iterative corrections from the assistant, the evidence is tagged `assistanceLevel: 'ai_assisted'`.
  - Only evidence tagged `assistanceLevel: 'independent'` contributes toward the `demonstrated` threshold.
- **Uncertainty Fallback**: If evidence is partial, ambiguous, or the assistant cannot definitively confirm independence, the topic remains `practised`.

### 3.2 Evidence Evaluation & Storage Pipeline

```
[Student Message]
       │
       ▼
[Groq Assistant Inference]
  - Generates conversational response
  - Emits structured evaluation payload:
    {
      topicId: "javascript-closures",
      evaluation: {
        evidenceType: "conceptual_explanation" | "problem_solving" | "code_debugging" | "quiz_response",
        assistanceLevel: "independent" | "ai_assisted",
        summary: "Student clearly articulated lexical environment retention in counter function",
        confidence: 0.95
      }
    }
       │
       ▼
[Backend Rule Validator: learningMemoryService]
  1. Append evidence item to `evidenceHistory`.
  2. Filter `evidenceHistory` for entries with `assistanceLevel === 'independent'`.
  3. Condition for `demonstrated`:
     - Must have >= 2 independent evidence records (or 1 comprehensive code implementation + 1 valid explanation).
     - Must have ZERO `unresolved` misconceptions for this topic.
     - If conditions met: status -> `demonstrated`.
     - Otherwise: status remains `practised` or `in_progress`.
```

---

## 4. MISCONCEPTION TRACKING & RESOLUTION

### 4.1 Misconception Lifecycle & Storage
Misconceptions are treated as first-class learning entities stored inside `StudentTopicProgress.misconceptions`:

1. **Detection**:
   When a student reveals an incorrect mental model (e.g. *"I thought `setState` updates the variable right on the next line"*), the model tags it:
   - `misconceptionId`: `misc_react_state_async_01`
   - `concept`: `react_state_batching`
   - `misunderstoodDetail`: *"Assumed useState updates counter synchronously in the same execution frame."*
   - `correctedUnderstanding`: *"State updates are scheduled and batched; values reflect only on the subsequent render."*
   - `status`: `'unresolved'`
   - `lastReviewedAt`: Current timestamp
2. **Persistence Guarantee**:
   - The assistant explaining the misconception **DOES NOT** resolve it!
   - A misconception **NEVER** gets deleted or resolved simply because the AI explained the right way.
3. **Resolution Rule**:
   - The misconception remains `'unresolved'` until a subsequent turn where the student **actively demonstrates the corrected understanding** in their own response (e.g. correctly explaining why two `setCount(c + 1)` calls in the same handler need a functional updater `setCount(prev => prev + 1)`).
   - Once demonstrated, the system records `resolutionEvidence`, sets `status = 'resolved'`, and sets `resolvedAt = new Date()`.
4. **Pedagogical Use in System Prompt**:
   - The assistant uses unresolved misconceptions to tailor follow-up prompts or targeted exercises.
   - The assistant is strictly instructed **never to repeatedly challenge or badger** the student on misconceptions that have already been marked `'resolved'`.

---

## 5. ACCURATE PROGRESS INDICATOR & COUNTING LOGIC

### 5.1 Strict Mastered-Topic Formula
The top-bar indicator displays the student's mastered topics:
`● {count} Topics Mastered`

**Strict Mathematical Rule**:
$$\text{Mastered Count} = \sum \mathbf{1}_{[\text{status} = \text{'demonstrated'}]}$$

- **`demonstrated` topics ONLY**: Only topics that meet the multi-faceted independent evidence standard are included in this count.
- **`exposed` & `practised` NEVER counted**: Topics the student has merely read about or practiced with AI assistance are strictly excluded.
- **`needs_revision` EXCLUDED**: If a previously mastered topic is flagged with a new misconception or regressed in a review, its status becomes `needs_revision` and it is **immediately subtracted** from the mastered count until re-demonstrated.
- **Backend Grounding**: The count is calculated directly via MongoDB aggregation on the server (`StudentTopicProgress.countDocuments({ firebaseUid, roleId, status: 'demonstrated' })`) and returned via API. It is **never** estimated or mocked in client state.

### 5.2 Progress Breakdown Modal
Clicking the pill opens a slide-over panel displaying the exact breakdown:
- **Mastered (`demonstrated`)**: e.g., 4 topics
- **Practised**: e.g., 2 topics
- **Encountered (`exposed` / `in_progress`)**: e.g., 1 topic
- **Needs Revision**: e.g., 0 topics

---

## 6. MEMORY RETRIEVAL & GROQ PROMPT INJECTION

### 6.1 Token-Efficient Context Construction
Memory is compiled into a lightweight block (<250 tokens) injected into the system prompt:

```
STUDENT LEARNING MEMORY & PROGRESS (CONFIDENTIAL):
- Target Role: Frontend Developer (frontend-developer)
- Selected Skills: HTML, CSS, JavaScript, React
- Mastered Topics (Demonstrated): HTML5 Semantic Elements, DOM Tree Navigation
- Currently Practising: JavaScript Closures (1 independent evidence item recorded)
- Active Unresolved Misconceptions:
  * Topic: React State Batching | Detail: Assumed useState updates synchronously
- Resolved Misconceptions:
  * Topic: JS Scoping | Detail: Confused var hoisting with block scope (Resolved via code snippet)
- Prior Stated Knowledge: Modern JavaScript (ES6+, Arrow Functions)
- Recommended Next Step: Practice closures with an independent counter exercise, then address React state batching

PEDAGOGICAL DIRECTIVES:
1. Do NOT re-explain demonstrated topics unless explicitly requested.
2. The student has an unresolved misconception about React State Batching. When moving to React, guide them to discover why synchronous expectations fail.
3. Do NOT challenge them on var hoisting; that misconception is already resolved.
```

---

## 7. BACKEND API SPECIFICATION

All endpoints leverage existing Express routers and JWT authentication (`requireAuth` middleware).

### 7.1 Route Definitions (`server/src/routes/learningRoutes.js`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/learning/sessions/:sessionId/memory` | Retrieves current student learning memory, progress recap, and next recommended step. |
| `GET` | `/api/learning/progress/:roleId` | Retrieves comprehensive topic-by-topic progress across all selected skills for a role. |
| `PATCH` | `/api/learning/progress/:roleId/topic` | Allows student to manually override or correct a topic's status. |
| `POST` | `/api/learning/progress/:roleId/reset` | Resets progress on a specific topic or skill without wiping conversation history. |

### 7.2 Memory Endpoint Response Contract

```json
{
  "success": true,
  "roleId": "frontend-developer",
  "roleTitle": "Frontend Developer",
  "activeSkill": "JavaScript",
  "masteredCount": 4,
  "breakdown": {
    "demonstrated": 4,
    "practised": 2,
    "exposed": 1,
    "needsRevision": 0
  },
  "lastTopic": {
    "topicId": "javascript-closures",
    "topicTitle": "JavaScript Closures",
    "status": "practised",
    "lastStudiedAt": "2026-11-09T16:20:00.000Z"
  },
  "unresolvedMisconceptions": [
    {
      "topicId": "react-state",
      "concept": "react_state_batching",
      "misunderstoodDetail": "Assumed useState updates counter synchronously",
      "detectedAt": "2026-11-09T15:30:00.000Z"
    }
  ],
  "recommendedNextTopic": {
    "skillId": "javascript",
    "topicId": "javascript-closures",
    "action": "Complete independent debounce exercise to achieve demonstrated status"
  }
}
```

---

## 8. MINIMAL FRONTEND UX SPECIFICATION

To adhere to the strict principle: *"Keep the existing chatbot interface and avoid adding a complicated dashboard"*:

1. **Top Bar Subtle Indicator**:
   - A minimalist, warm editorial pill in the chat header next to the role badge:
     `● 4 Topics Mastered`
   - Displays strictly the backend-verified `masteredCount`.
   - Clicking the pill opens a compact slide-over panel displaying the student's breakdown by status, active misconceptions needing attention, and the recommended next step.
2. **Context-Aware Welcome Card**:
   - When returning to an existing session, the initial greeting acknowledges prior progress:
     *"Welcome back! Last time, we practiced JavaScript closures with a debounce helper. Would you like to review closures with a quick quiz, or jump into React components?"*
3. **Conversational Controls**:
   - Two minimal suggestion chips on return:
     `["Continue where I left off", "Review my progress"]`
4. **Zero Layout Shifts**:
   - The message stream, fixed input bar, syntax highlighter, and copy-code functionality remain 100% untouched.

---

## 9. PRIVACY, DATA INTEGRITY & PERFORMANCE RISKS

| Risk Category | Potential Issue | Architectural Mitigation |
|---|---|---|
| **Token Budget & Latency** | Full topic histories inflating the Groq prompt. | Ingestion compiles only the active topic, top 3 demonstrated competencies, and active misconceptions (<250 tokens total). |
| **Hallucinatory Updates** | Model falsely marking a student as `demonstrated` after merely reading text or one lucky answer. | Dual-tier verification requires $\ge 2$ independent evidence records. Single quiz responses stay at `practised`. |
| **Data Integrity & Concurrency** | Race condition between rapid successive student messages. | Atomic `$set` / `$push` / `$addToSet` operations using MongoDB `findOneAndUpdate` with `{ upsert: true }`. |
| **Privacy & Multi-Tenancy** | Leaking memory across student accounts. | Enforce `firebaseUid` scoping on every database query and ensure strict route authorization. |

---

## 10. COMPREHENSIVE TEST CASES & VERIFICATION SUITE

The implementation plan requires verification against the following 6 definitive test cases:

### Test Case 1: One Correct Answer Does NOT Automatically Establish Mastery
- **Scenario**: Assistant asks a multiple-choice or direct question: *"What keyword declares a block-scoped variable?"* Student replies: *"let"*.
- **Expected Outcome**:
  - Evidence item recorded with `type: 'quiz_response'`.
  - Topic status transitions to `practised` (or remains `practised`), **NOT** `demonstrated`.
  - `masteredCount` does NOT increment.

### Test Case 2: Multi-Faceted Meaningful Evidence Establishes Demonstrated Understanding
- **Scenario**:
  1. Student explains closures accurately in their own words: *"A closure happens when an inner function retains access to variables from its outer enclosing scope even after the outer function has returned."* (Evidence 1: `conceptual_explanation`, `independent`).
  2. In the next turn, student independently writes a working debounce or memoization function without AI templates (Evidence 2: `problem_solving`, `independent`).
- **Expected Outcome**:
  - `evidenceHistory` contains $\ge 2$ independent evidence records.
  - No active unresolved misconceptions exist for closures.
  - Status transitions to `demonstrated`.
  - `masteredCount` increments by exactly 1.

### Test Case 3: Unresolved Misconception Remains in Memory After an Explanation
- **Scenario**:
  - Student asks: *"If I call setCount(count + 1) twice in one click handler, count increases by 2 immediately, right?"*
  - Assistant responds with an explanation of React state batching and asynchronous updates.
- **Expected Outcome**:
  - Misconception recorded: `react_state_batching`, `status: 'unresolved'`.
  - Even though the assistant provided a complete, friendly explanation, the misconception remains `'unresolved'` in the database.
  - Next turn's system prompt includes this active misconception.

### Test Case 4: Misconception Resolves ONLY After Supporting Evidence
- **Scenario**:
  - In a later turn, assistant asks student how to fix the double-increment issue.
  - Student replies: *"You need to use a functional updater: setCount(prev => prev + 1) so it accesses the pending state."*
- **Expected Outcome**:
  - Misconception transitions from `'unresolved'` to `'resolved'`.
  - `resolutionEvidence` is populated with the student's functional updater response.
  - `resolvedAt` timestamp is recorded.
  - Future prompts omit challenging the student on this resolved misconception.

### Test Case 5: Mastered-Topic Count Includes ONLY Demonstrated Topics
- **Scenario**:
  - Student progress database state:
    - Topic A (`html-semantic-elements`): `demonstrated`
    - Topic B (`dom-manipulation`): `demonstrated`
    - Topic C (`javascript-closures`): `practised`
    - Topic D (`css-box-model`): `exposed`
    - Topic E (`react-components`): `in_progress`
- **Expected Outcome**:
  - API returns `masteredCount: 2`.
  - Top-bar pill renders strictly: `● 2 Topics Mastered`.
  - Topics C, D, and E are excluded from the mastered count.

### Test Case 6: Topic Marked `needs_revision` is Immediately Excluded from Mastered Count
- **Scenario**:
  - Topic A (`html-semantic-elements`) was previously `demonstrated`.
  - In a later discussion or quiz, student exhibits severe confusion regarding semantic landmark roles (`<main>` vs `<div>`).
  - Assistant flags regression; status updates to `needs_revision`.
- **Expected Outcome**:
  - `StudentTopicProgress.status` becomes `needs_revision`.
  - Mastered count drops immediately from 2 to 1 (`● 1 Topic Mastered`).
  - Topic A remains excluded from the count until the student independently re-demonstrates competency.

---

## 11. PHASED IMPLEMENTATION ROADMAP

```
Phase 4.1: Database Schemas & Memory Service (Backend)
  ├── Create StudentTopicProgress model with EvidenceRecord & Misconception sub-schemas
  ├── Extend LearningSession currentLearningContext
  └── Implement learningMemoryService (fetchMemory, recordEvidence, updateMisconception, calculateMasteredCount)

Phase 4.2: Groq Integration & Dynamic Prompt Memory Injection
  ├── Inject memory block (<250 tokens) into buildSystemPrompt
  ├── Parse progressEvaluation in response normalization
  └── Maintain role/skill boundary enforcement and conversational tone

Phase 4.3: Backend APIs & Test Suite Execution
  ├── Add memory and progress endpoints
  ├── Implement testPhase4Memory.js covering all 6 test cases
  └── Verify zero regression on existing 11 Phase 3.1 conversation prompts

Phase 4.4: Minimal Frontend Presentation & Slide-Over Panel
  ├── Add minimalist progress pill to chat topbar (masteredCount only)
  ├── Implement compact progress breakdown slide-over panel
  ├── Support "What have I learned so far?" and "What's next?" queries
  └── Verify desktop and mobile responsiveness

Phase 4.5: Quality Assurance & Final Report
  ├── Multi-session continuity tests
  ├── Full build and lint verification
  └── Document PHASE_4_IMPLEMENTATION_REPORT.md
```

---

## 12. BACKWARD COMPATIBILITY GUARANTEE

- **Zero Data Loss**: Existing collections (`studentskillselections`, `learningsessions`, `learningmessages`, `studentprofiles`) will remain untouched.
- **Graceful Fallback**: If an existing session has no `StudentTopicProgress` records, it defaults to `masteredCount: 0` and reads existing `statedKnowledge` from the session context without throwing errors.
- **Port & Connection Safety**: MongoDB configuration remains isolated on port `27018` with database `careerlaunch`.
- **Inference Stability**: The existing Groq API model (`openai/gpt-oss-120b`) and temperature settings remain preserved.
