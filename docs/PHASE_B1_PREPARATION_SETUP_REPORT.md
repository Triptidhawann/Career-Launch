# CareerLaunch — Phase B1: Personalised Preparation Setup Report

> **Phase**: B1 (Personalised Preparation Setup)  
> **Status**: COMPLETED & VERIFIED  
> **Target Specialization**: Frontend Developer (Pilot Track)  
> **Previous Phase**: Phase A (Product Architecture & Redesign Blueprint)  
> **Strict Stop Condition**: Phase B1 complete; no AI plan generation triggered; awaiting approval for Phase B2.  

---

## 1. Executive Summary

Phase B1 implements the first screen of CareerLaunch's redesigned interview preparation experience: **Personalised Preparation Setup**.

In strict accordance with requirements:
1. **Catalog Preservation**: The approved **"Choose Your Target Role"** catalog (`/interview-preparation`) remains **100% visually and structurally unchanged**. All 8 role cards, icons, descriptions, spacing, and animations are preserved.
2. **Selective Routing**: Selecting **Frontend Developer** navigates the student directly to `/interview-preparation/frontend-developer/setup`. Selecting any of the other seven roles preserves their existing roadmaps.
3. **Dedicated Setup Interface**: A new React 19 + Plain CSS view (`PreparationSetupPage.jsx` and `preparation-setup.css`) collects student goals, experience levels, existing knowledge, challenge areas, timelines, and primary goals with zero generic chatbot aesthetics.
4. **Direct Topic Shortcut**: Students can bypass long prompts via a *"Choose a topic instead"* accordion populated with the 17 standard Frontend Developer curriculum topics.
5. **Secure Persistence**: Backed by a new Mongoose model (`PreparationSession`), authenticated REST endpoints (`POST /api/prep/setup`, `GET /api/prep/setup/:sessionId`), and strict ownership enforcement verifying `firebaseUid === req.user.uid`.
6. **Pending-Plan State**: After saving, the view transitions to a clearly labeled confirmation state confirming that the setup is saved and pending AI curriculum synthesis in Phase B2. **Zero AI generation occurred; no mock or fake plans were generated.**

---

## 2. Files Created and Modified

### 2.1 Backend Files
- **`server/src/models/PreparationSession.js`** (Created):
  - Mongoose schema for student-scoped preparation sessions.
  - Fields: `firebaseUid`, `roleId`, `goalPrompt`, `experienceLevel`, `knownTopics`, `weakTopics`, `preparationTimeline`, `primaryGoal`, `selectedDirectTopicId`, `status`.
  - Timestamps and indices on `firebaseUid`, `roleId`, and `status`.
- **`server/src/controllers/prepController.js`** (Created):
  - `savePreparationSetup`: Validates roleId, goalPrompt (min 5, max 2000 chars), experience level, timeline, and topic arrays; upserts active session.
  - `getPreparationSetup`: Verifies resource ownership (`session.firebaseUid === req.user.uid`), returning 403 Forbidden for cross-student access.
  - `getLatestPreparationSession`: Retrieves student's most recent session for role prefill.
- **`server/src/routes/prepRoutes.js`** (Created):
  - Express router protected by `requireAuth` middleware.
- **`server/src/index.js`** (Modified):
  - Mounted `app.use('/api/prep', prepRoutes)`.
- **`server/src/scripts/testPhaseB1Setup.js`** (Created):
  - 26-assertion automated integration test suite.

### 2.2 Frontend Files
- **`src/pages/PreparationSetupPage.jsx`** (Created):
  - Full implementation of Screen 1.
  - Features: Prominent textarea with example prompt button, 3-card experience selector, interactive known/weak topic chips from curriculum, timeline/goal dropdowns, direct topic picker, accessible error handling, and saved confirmation card.
- **`src/styles/preparation-setup.css`** (Created):
  - Plain CSS styled strictly with CareerLaunch editorial tokens (`--color-ivory`, `--color-forest`, `--color-terracotta`, `--color-sage`, `--color-sand`).
  - Full desktop (1440px) and mobile (<768px) responsive layouts.
- **`src/lib/api.js`** (Modified):
  - Added `savePreparationSetup`, `fetchPreparationSetup`, and `fetchLatestPreparationSession`.
- **`src/App.jsx`** (Modified):
  - Registered route `/interview-preparation/frontend-developer/setup` with `ProtectedRoute`.
- **`src/pages/InterviewPreparationPage.jsx`** (Modified):
  - Updated `handleSelectRole` to route `frontend-developer` to setup while preserving other 7 roles.
  - Added a "Personalise Preparation Plan" button to the Frontend Developer roadmap hero header for seamless bi-directional navigation.
- **`scripts/capture_phaseB1.cjs`** (Created):
  - Headless Edge screenshot automation capturing 7 verification images.

---

## 3. Routes & API Endpoints

### 3.1 Application Routes
| Route | Component | Behavior |
| :--- | :--- | :--- |
| `/interview-preparation` | `InterviewPreparationPage` | **100% Unchanged**. Displays 8 role cards. Clicking Frontend Developer enters setup; other roles open roadmaps. |
| `/interview-preparation/frontend-developer/setup` | `PreparationSetupPage` | **New Phase B1 Screen**. Intake form and saved confirmation state. |
| `/interview-preparation/frontend-developer` | `InterviewPreparationPage` | **Preserved**. Curriculum roadmap view with "Personalise Preparation Plan" action button. |
| `/interview-preparation/:roleId` | `InterviewPreparationPage` | **Preserved**. Full roadmaps for remaining 7 roles continue working as before. |
| `/interview-preparation/:roleId/topic/:topicId` | `InterviewPreparationPage` | **Preserved**. Direct lesson views remain fully functional without breaking. |

### 3.2 REST API Specifications
| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/api/prep/setup` | `POST` | Verified JWT | Validates and saves preparation setup for the authenticated student. |
| `/api/prep/setup/:sessionId` | `GET` | Verified JWT | Retrieves saved preparation setup by ObjectId. Returns 403 if accessed by another student. |
| `/api/prep/session/latest` | `GET` | Verified JWT | Retrieves student's most recent session for a role track (prefills form on revisit). |

---

## 4. Visual Verification & Screenshot Artifacts

Seven screenshots were captured in headless Microsoft Edge via Chrome DevTools Protocol and saved to the artifact directory:

1. **`phaseB1_role_catalog_preserved.png`** (1440x1800):
   - Verifies that the `/interview-preparation` catalog is 100% visually intact with all 8 roles, hero text, and pills.
2. **`phaseB1_setup_desktop.png`** (1440x2200):
   - Full desktop view of `PreparationSetupPage` showing breadcrumbs, prominent goal textarea, 3 experience cards, topic chips, and dropdowns.
3. **`phaseB1_setup_mobile.png`** (390x2400):
   - Mobile viewport verification showing responsive stacked cards, accessible touch targets, and full layout adaptation.
4. **`phaseB1_setup_topic_picker.png`** (1440x2400):
   - Demonstrates the *"Choose a topic instead"* drawer expanded, displaying all 17 Frontend Developer curriculum topics for direct selection.
5. **`phaseB1_setup_saved_state.png`** (1440x1800):
   - The confirmation card displayed upon form submission: shows saved prompt, summary data grid, Phase B1 milestone banner, and options to edit setup or view roadmap.
6. **`phaseB1_frontend_roadmap_preserved.png`** (1440x2000):
   - Verifies the Frontend Developer roadmap view continues working directly and displays the new "Personalise Preparation Plan" button.
7. **`phaseB1_other_role_roadmap_preserved.png`** (1440x2000):
   - Verifies that clicking any non-pilot role (e.g. Software Engineer) continues to load its full roadmap without disruption.

---

## 5. Security, Authentication & Ownership Verification

Automated test suite (`server/src/scripts/testPhaseB1Setup.js`) verified:
- **Authentication**:
  - `POST /api/prep/setup` without token: Rejected with `HTTP 401 Unauthorized`.
  - `GET /api/prep/session/latest` without token: Rejected with `HTTP 401 Unauthorized`.
- **Ownership & Cross-Student Isolation**:
  - Student A creates a session $\rightarrow$ Student A can retrieve it (`HTTP 200 OK`).
  - Student B attempts to fetch Student A's `sessionId` $\rightarrow$ **Rejected with `HTTP 403 Forbidden`** (`success: false`).
- **Validation & Size Limits**:
  - Missing `roleId`: Rejected with `HTTP 400 Bad Request`.
  - Invalid `roleId`: Rejected with `HTTP 400 Bad Request`.
  - Missing `goalPrompt`: Rejected with `HTTP 400 Bad Request`.
  - Short `goalPrompt` (<5 chars): Rejected with `HTTP 400 Bad Request`.
  - Invalid `experienceLevel`: Rejected with `HTTP 400 Bad Request`.
- **Privacy**: Zero private prompts leaked in log traces or error responses.

---

## 6. Database Baseline & Document Count Audit

| Collection | Baseline (Pre-B1) | Post-B1 Count | Status |
| :--- | :--- | :--- | :--- |
| `generatedlessons` | 20 (16 SWE + 4 FE) | 20 | **100% UNTOUCHED** |
| `studentprofiles` | 2 | 2 | **100% UNTOUCHED** |
| `knowledgesources` | 7 | 7 | **100% UNTOUCHED** |
| `ingesteddocuments` | 20 | 20 | **100% UNTOUCHED** |
| `contentchunks` | 28 | 28 | **100% UNTOUCHED** |
| `preparationsessions`| 0 | 0* | **New Collection Created** (test sessions cleaned up) |

*\* Note: The collection schema is deployed and tested. Real user sessions are created on demand.*

---

## 7. Quality & Regression Test Suite

- **Phase B1 Integration Tests (`server/src/scripts/testPhaseB1Setup.js`)**: **26 tests executed, 26 PASSED, 0 FAILED**.
- **Phase 6.1 Regression Suite (`server/src/scripts/testPhase6Batch1.js`)**: **101 tests executed, 101 PASSED, 0 FAILED**.
- **Linter (`oxlint`)**: **0 errors, 0 warnings** across 104 files.
- **Production Build (`vite build`)**: **Compiled cleanly in 809 ms, 0 errors**.

---

## 8. Known Limitations & Phase B2 Transition

1. **No AI Generation in B1**: As per specification, no AI curriculum synthesis or preparation plan was generated in this phase. The setup inputs are stored in `setup_saved` status.
2. **Phase B2 Next Steps**: Phase B2 will implement `planOrchestrator.js` using Groq `openai/gpt-oss-120b` to synthesize the saved setup into an interactive 4-milestone preparation plan displayed on `/interview-preparation/frontend-developer/plan`.

---

## 9. Version Control & Git Status

- **Commit**: `feat(prep): complete Phase B1 personalised preparation setup`
- **Branches**: `origin/main` and `origin/migration/javascript`

---

*Phase B1 implementation report completed for CareerLaunch.*
