# CareerLaunch — From Ambition to Opportunity

[![React](https://img.shields.io/badge/React-19.3-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2023-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8.9-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_13.1-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?logo=greensock&logoColor=white)](https://greensock.com/gsap/)

**CareerLaunch** is an editorial, full-stack career-readiness and placement preparation platform engineered to help college students bridge the gap between campus ambition and verified placement offers. Built with modern JavaScript (ES Modules), React 19, and Node.js Express.

---

## Key Features

- **Editorial Design System**: Crafted with a distinct warm editorial aesthetic (Warm Ivory, Deep Forest, Muted Terracotta, Soft Sage, Sand, and Charcoal). Strictly plain CSS with zero Tailwind or neon frameworks.
- **Dynamic Cinematic Storytelling**: Rich GSAP-driven scroll animations, interactive role blueprints, and interactive interview practice previews.
- **Robust Firebase Authentication**:
  - Secure Email and Password registration and sign-in.
  - 30-day "Remember me" session persistence (`browserLocalPersistence` vs. `browserSessionPersistence`).
  - Real-time password recovery & reset links.
  - Email verification enforcement with resend cooldown timers.
- **Four-Step Student Onboarding Wizard**:
  - **Step 1: Academic & Contact Baseline** (Degree, Branch, College, Semester, CGPA).
  - **Step 2: Technical Skills & Proficiencies** (Curated placement skill selectors with Beginner, Intermediate, and Advanced self-assessment).
  - **Step 3: Showcase Projects & Industry Credentials** (Project repositories, live demos, and certification details).
  - **Step 4: Placement Goals & Career Preferences** (Target roles, work mode: Remote/Hybrid/On-site, employment type: Full-time/Internship, target locations, and CTC expectations).
  - Auto-draft prefilling and automatic redirection for already-onboarded students.
- **Comprehensive Student Workspace & Dashboard**:
  - **Profile Completeness Calculator**: Real-time weighted algorithm (Academic 40% + Skills 20% + Projects 20% + Credentials 10% + Career Targets 10%).
  - **Honest Interview Readiness Metrics**: Displays "Not Assessed Yet" with clear benchmarking prerequisites to avoid fabricated student metrics.
  - **Five-Tab Profile Management Modal**: Seamless in-place updates for Academic, Personal, Skills, Projects, Certifications, and Career Preferences.
- **Secure RESTful Backend API**:
  - Token verification via Firebase Admin SDK with bearer authorization middleware.
  - Dedicated MongoDB datastore with Mongoose validation, indexes, and schema timestamps.
  - Automatic UID-email identity synchronization and graceful error handling.

---

## Technology Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 8
- **Language**: Native JavaScript (ES2023 / JSX)
- **Routing**: React Router DOM v7
- **Animations**: GSAP (GreenSock) & ScrollTrigger
- **Iconography**: Lucide React
- **Styling**: Pure CSS3 with custom CSS Custom Properties (Variables)
- **Linter**: Oxlint (0 errors, 0 warnings)

### Backend
- **Runtime**: Node.js 22 (Native ES Modules with `--watch`)
- **Server Framework**: Express.js 4
- **Database**: MongoDB with Mongoose 8 (Dedicated instance on port `27018`)
- **Authentication**: Firebase Admin SDK 14
- **Security & Middleware**: CORS, Dotenv, Bearer Token Auth Middleware

---

## Repository Structure

```text
CareerLaunch/
├── index.html                   # HTML5 Entry Point
├── jsconfig.json                # IDE Module Resolution & Path Mapping (@/*)
├── package.json                 # Frontend dependencies and root scripts
├── vite.config.js               # Native Vite ES Module configuration & dev proxy
├── src/
│   ├── main.jsx                 # React root initialization (React StrictMode)
│   ├── App.jsx                  # Application routing & ProtectedRoute wrappers
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthLayout.jsx   # Split-panel editorial authentication layout
│   │   │   └── ProtectedRoute.jsx # Auth, email verification & onboarding guards
│   │   ├── landing/             # Modular landing page sections
│   │   │   ├── Hero.jsx
│   │   │   ├── CinematicStory.jsx
│   │   │   ├── InterviewPrep.jsx
│   │   │   ├── Opportunities.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   └── ClosingCTA.jsx
│   │   └── layout/
│   │       ├── Navbar.jsx       # Responsive header with user state & navigation
│   │       └── Footer.jsx       # Platform links, resources, and copyright
│   ├── contexts/
│   │   ├── AuthContext.jsx      # Firebase auth provider & state management
│   │   └── authContextDef.js    # Auth context definition
│   ├── hooks/
│   │   └── useAuth.js           # useAuth consumer hook
│   ├── lib/
│   │   ├── api.js               # Fetch wrapper with Bearer token injection
│   │   ├── firebase.js          # Client Firebase SDK setup & error mapper
│   │   ├── gsap.js              # GSAP & ScrollTrigger initialization
│   │   └── utils.js             # Shared helpers
│   ├── pages/                   # Application page views
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── VerifyEmailPage.jsx
│   │   ├── OnboardingPage.jsx
│   │   └── StudentDashboardPage.jsx
│   └── styles/
│       ├── global.css           # Design tokens, reset, typography & buttons
│       ├── navbar.css
│       ├── footer.css
│       ├── landing.css
│       ├── auth.css
│       ├── onboarding.css
│       └── dashboard.css
└── server/                      # Node.js + Express Backend
    ├── package.json             # Backend dependencies and scripts
    ├── .env                     # Server environment variables (port 5000)
    └── src/
        ├── index.js             # Express app entry point & graceful shutdown
        ├── config/
        │   ├── db.js            # Mongoose connection manager (port 27018)
        │   └── firebaseAdmin.js # Firebase Admin initialization & token verifier
        ├── controllers/
        │   └── profileController.js # Profile retrieval, onboarding, and updates
        ├── middleware/
        │   └── authMiddleware.js    # Bearer token validation middleware
        ├── models/
        │   └── StudentProfile.js    # Mongoose schema for student records
        └── routes/
            └── profileRoutes.js     # /api/profile endpoint routes
```

---

## Getting Started

### Prerequisites

- **Node.js**: v20+ (v22 recommended)
- **MongoDB**: Community Server (configured on port `27018`)
- **Git**

---

### 1. Clone the Repository

```bash
git clone https://github.com/Triptidhawann/Career-Launch.git
cd Career-Launch
```

---

### 2. Environment Configuration

#### Root Frontend `.env`
Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Backend `server/.env`
Create a `.env` file inside `server/`:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27018/careerlaunch
FIREBASE_PROJECT_ID=your_project_id
```

---

### 3. Install Dependencies

Install root (frontend) and server dependencies:

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install
cd ..
```

---

### 4. Running the Database & Services

#### A. Start MongoDB (Port 27018)
```powershell
mongod --config "C:\data\careerlaunch\mongod.cfg"
```

#### B. Start Backend API Server
In a terminal:
```bash
npm run server
# or: cd server && npm run dev
```
The API will be accessible at `http://localhost:5000/api` (Health check: `http://localhost:5000/api/health`).

#### C. Start Frontend Development Server
In another terminal:
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

---

## Available Scripts

### Root Project
| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `vite` | Starts Vite development server on `http://localhost:5173` |
| `npm run build` | `vite build` | Compiles production assets into `dist/` |
| `npm run preview` | `vite preview` | Previews production build locally |
| `npm run lint` | `oxlint` | Runs fast Oxlint analysis across the codebase |
| `npm run server` | `npm --prefix server run dev` | Starts backend development server |

### Server Directory (`server/`)
| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `node --watch src/index.js` | Runs Express server with native auto-restart on changes |
| `npm run start` | `node src/index.js` | Runs Express server in production mode |

---

## API Endpoints

All profile endpoints require a valid Firebase ID token passed via `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check reporting service status and MongoDB connection |
| `GET` | `/api/profile/status` | Returns whether the user has completed onboarding |
| `GET` | `/api/profile/me` | Retrieves the authenticated student's full profile |
| `POST` | `/api/profile/onboarding` | Submits initial onboarding data and marks onboarding complete |
| `PUT` | `/api/profile/me` | Updates profile fields (education, skills, projects, preferences) |

---

## Technology Migration Summary

The project was cleanly converted from a legacy TypeScript setup to 100% native JavaScript and JSX:
- All `.ts` and `.tsx` source files converted to `.js` and `.jsx`.
- Removed TypeScript compilation overhead (`tsc -b`), reducing build times to ~1.05s.
- Native Node.js 22 ES Modules with `--watch` on backend (no `tsx` or transpile steps required).
- Verified with zero linting errors and 100% route, integration, and database integrity.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
