# CAREERLAUNCH — PHASE 5.0: TRUSTED KNOWLEDGE FOUNDATION & CURRICULUM AUDIT

**Audit Date**: `2026-11-08`  
**Status**: `RESEARCH & AUDIT ONLY — NO IMPLEMENTATION`  
**Governing Standard**: Production Knowledge Ingestion, Verification, and Commercial Licensing Compliance Standard  

---

## 1. Executive Summary

This audit establishes the empirical knowledge baseline, licensing governance framework, and curriculum expansion roadmap for CareerLaunch. CareerLaunch currently provides eight technical role preparation roadmaps spanning 56 modules and 118 learning topics. 

To date, five pilot topics in the **Software Engineer** roadmap have been fully generated using the real Groq API (`openai/gpt-oss-120b`), validated across three evidence-grounding levels, and deployed to student-facing views. All five pilot lessons are strictly grounded in public domain U.S. Government works from the **National Institute of Standards and Technology (NIST) Dictionary of Algorithms and Data Structures (DADS)**.

### Key Audit Findings
1. **Curriculum Scale**: The curriculum encompasses 8 technical roles, 56 modules, and 118 topics. Exactly 5 topics (4.2%) have verified AI-generated lessons, leaving 113 topics (95.8%) to be systematically sourced, ingested, and generated.
2. **Pilot Lesson Health**: All 5 canonical pilot lessons (`swe-top-1`, `swe-top-4`, `swe-top-7`, `swe-top-9`, `swe-top-13`) in MongoDB (`mongodb://127.0.0.1:27018/careerlaunch`) are healthy, validated, and intact, with full token usage, provenance, and source snapshot hashes.
3. **Licensing Hazards Identified**:
   - **MongoDB Documentation**: Carries a **CC BY-NC-SA 3.0 (NonCommercial)** license. Ingesting MongoDB official docs into a commercial SaaS knowledge base violates copyright without an enterprise agreement. **Decision: REJECTED**.
   - **Apple Developer Documentation**: Entirely proprietary (`All Rights Reserved`). Ingesting or redistributing content from `developer.apple.com` is prohibited. **Decision: REJECTED** (Swift open-source documentation under Apache 2.0 approved as conditional replacement).
   - **Pro Git Book**: Hosted on `git-scm.com` but explicitly licensed under **CC BY-NC-SA 3.0**. **Decision: REJECTED** (Git core man-pages under GPLv2 approved for reference).
   - **MIT OpenCourseWare**: Explicitly carries **CC BY-NC-SA 4.0**. **Decision: REJECTED** for production knowledge ingestion.
4. **Permissible High-Trust Foundations**:
   - **NIST DADS**: Public domain (17 U.S.C. § 105) — **APPROVED**.
   - **W3C Specifications**: W3C Document License (Permissive commercial use) — **APPROVED**.
   - **Python Software Foundation (PSF)**: PSF-2.0 / 0BSD — **APPROVED**.
   - **PostgreSQL Documentation**: PostgreSQL License (MIT/BSD-style permissive) — **APPROVED**.
   - **Node.js Documentation**: CC-BY 4.0 / MIT — **APPROVED**.
   - **React Documentation**: CC-BY 4.0 / MIT — **APPROVED**.
   - **Kubernetes Documentation**: CC-BY 4.0 / Apache 2.0 — **APPROVED**.
   - **OWASP Projects**: CC-BY-SA 4.0 — **APPROVED**.
   - **Android Open Source Project (AOSP)**: CC-BY 4.0 / Apache 2.0 — **APPROVED**.
   - **NumFOCUS (NumPy, Pandas, Scikit-Learn)**: BSD 3-Clause — **APPROVED**.
5. **Recommended Expansion Strategy**: Expand the remaining 13 topics in **Software Engineer** first to complete a full 100% roadmap baseline, followed by high-demand tracks with verified open documentation: **Frontend Developer** (MDN/W3C/React) and **Backend Developer** (Node.js/PostgreSQL/OWASP).

---

## 2. Eight-Role Curriculum Inventory

The CareerLaunch curriculum taxonomy is defined in [`src/data/interviewRoadmaps.js`](file:///c:/Users/Tripti%20Dhawan/OneDrive/Desktop/CareerLaunch/src/data/interviewRoadmaps.js) and configured via [`src/data/interviewRoles.js`](file:///c:/Users/Tripti%20Dhawan/OneDrive/Desktop/CareerLaunch/src/data/interviewRoles.js).

### Curriculum Statistics Table

| Role Identifier | Role Title | Subtitle | Modules | Topics | Generated Lessons | Pending Topics | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `software-engineer` | Software Engineer | Algorithms & Core Computer Science | 7 | 18 | 5 | 13 | Active Pilot Track |
| `frontend-developer` | Frontend Developer | UI Engineering & Web Architecture | 7 | 17 | 0 | 17 | Sourcing Ready |
| `backend-developer` | Backend Developer | Distributed Systems & Services | 7 | 15 | 0 | 15 | Sourcing Ready |
| `fullstack-developer` | Full Stack Developer | End-to-End Application Architecture | 7 | 13 | 0 | 13 | Sourcing Ready |
| `data-analyst` | Data Analyst | Business Intelligence & Quantitative Insights | 7 | 14 | 0 | 14 | Sourcing Ready |
| `data-scientist` | Data Scientist | Machine Learning & Statistical Inference | 7 | 13 | 0 | 13 | Sourcing Ready |
| `devops-engineer` | DevOps Engineer | Cloud Platforms & CI/CD Pipelines | 7 | 14 | 0 | 14 | Sourcing Ready |
| `mobile-app-developer` | Mobile App Developer | Native & Cross-Platform UX | 7 | 14 | 0 | 14 | Sourcing Ready |
| **TOTALS** | **8 Technical Roles** | **Comprehensive Career Launchpad** | **56** | **118** | **5 (4.2%)** | **113 (95.8%)** | — |

---

### 2.1 Role 1: Software Engineer (`software-engineer`)
*Focus: Algorithms, Memory Models, Data Structures, Dynamic Programming, and High-Level System Architecture.*  
*Modules: 7 | Topics: 18 | Generated Lessons: 5 | Pending Topics: 13*

#### Level 1: Foundations & Memory Models (beginner, 4 - 6 Weeks)
- **Module `se-mod-1`**: Memory Models, Pointers & Complexity Analysis (2 topics)
  - `se-top-1`: Memory Architecture: Stack, Heap & Pointers (8 Hours) — *Pending*
  - `se-top-2`: Asymptotic Analysis & Big-O Notation (6 Hours) — *Pending*
- **Module `se-mod-2`**: Linear Data Structures & Classic Patterns (4 topics)
  - `se-top-3` / `swe-top-1`: Arrays, Strings & Two-Pointer Strategies (8 Hours) — **[GENERATED & VERIFIED]**
  - `swe-top-4`: Binary Search Mechanics and Interval Bisection (8 Hours) — **[GENERATED & VERIFIED]**
  - `se-top-4`: Linked Lists: Singly, Doubly & Circular (8 Hours) — *Pending*
  - `se-top-5`: Stacks, Queues & Monotonic Variants (8 Hours) — *Pending*

#### Level 2: Non-Linear Structures & Algorithmic Paradigms (intermediate, 6 - 8 Weeks)
- **Module `se-mod-3`**: Trees, Binary Search Trees & Heaps (3 topics)
  - `se-top-6`: Binary Trees & Traversal Algorithms (8 Hours) — *Pending*
  - `se-top-7` / `swe-top-7`: Binary Search Trees & Balanced Trees (8 Hours) — **[GENERATED & VERIFIED]**
  - `se-top-8`: Heaps & Priority Queues (6 Hours) — *Pending*
- **Module `se-mod-4`**: Graphs, Traversals & Shortest Paths (2 topics)
  - `se-top-9` / `swe-top-9`: Graph Representations, BFS & DFS (10 Hours) — **[GENERATED & VERIFIED]**
  - `se-top-10`: Topological Sort & Shortest Paths (Dijkstra) (10 Hours) — *Pending*
- **Module `se-mod-5`**: Dynamic Programming & Paradigms (2 topics)
  - `se-top-11`: Recursion & Backtracking Strategies (8 Hours) — *Pending*
  - `se-top-12` / `swe-top-13`: Dynamic Programming: 1D & 2D Tabulation (10 Hours) — **[GENERATED & VERIFIED]**

#### Level 3: Systems Architecture & Advanced Design (advanced, 6 - 8 Weeks)
- **Module `se-mod-6`**: Operating Systems & Computer Networking (3 topics)
  - `se-top-13`: Processes, Threads & Synchronization (8 Hours) — *Pending*
  - `se-top-14`: Virtual Memory, Paging & Storage (8 Hours) — *Pending*
  - `se-top-15`: Computer Networking: OSI, TCP/IP & HTTP (8 Hours) — *Pending*
- **Module `se-mod-7`**: Software Engineering Design & Architecture (2 topics)
  - `se-top-16`: Object-Oriented Design Patterns (GoF) (8 Hours) — *Pending*
  - `se-top-17`: High-Level System Design & Scalability (10 Hours) — *Pending*

---

### 2.2 Role 2: Frontend Developer (`frontend-developer`)
*Focus: Semantic Markup, CSS Architecture, JavaScript Runtime Mechanics, React Architecture, Web Performance, and Frontend System Design.*  
*Modules: 7 | Topics: 17 | Generated Lessons: 0 | Pending Topics: 17*

#### Level 1: Foundations & Web Standards (beginner, 4 - 6 Weeks)
- **Module `fe-mod-1`**: Semantic HTML & Modern CSS Core (3 topics)
  - `fe-top-1`: Semantic Markup & Accessibility Outlines (6 Hours)
  - `fe-top-2`: CSS Box Model, Flexbox & Grid Systems (8 Hours)
  - `fe-top-3`: Responsive Design & Fluid Typography (6 Hours)
- **Module `fe-mod-2`**: JavaScript Core & DOM Runtimes (3 topics)
  - `fe-top-4`: Execution Context, Scopes & Closures (8 Hours)
  - `fe-top-5`: DOM Manipulation, Events & Bubbling (6 Hours)
  - `fe-top-6`: Asynchronous JavaScript & Event Loop (8 Hours)

#### Level 2: Component Architecture & State Stores (intermediate, 6 - 8 Weeks)
- **Module `fe-mod-3`**: React Fundamentals & Component Architecture (3 topics)
  - `fe-top-7`: JSX Compilation, Virtual DOM & Reconciliation (8 Hours)
  - `fe-top-8`: Standard Hooks & Lifecycle Synchronization (10 Hours)
  - `fe-top-9`: Custom Hooks & Reusable Logic Extraction (6 Hours)
- **Module `fe-mod-4`**: State Management & Server State Caching (2 topics)
  - `fe-top-10`: Global State Strategies: Context vs Stores (8 Hours)
  - `fe-top-11`: Server State & Client Caching (React Query / SWR) (8 Hours)
- **Module `fe-mod-5`**: Browser Internals & Web Accessibility (a11y) (2 topics)
  - `fe-top-12`: Critical Rendering Path & Paint Cycles (6 Hours)
  - `fe-top-13`: WCAG 2.1 Compliance & Keyboard Navigation (6 Hours)

#### Level 3: Performance & Frontend System Design (advanced, 6 - 8 Weeks)
- **Module `fe-mod-6`**: Web Performance & Core Web Vitals (2 topics)
  - `fe-top-14`: Core Web Vitals Diagnostic Auditing (8 Hours)
  - `fe-top-15`: Bundle Splitting & Asset Optimization (8 Hours)
- **Module `fe-mod-7`**: Frontend System Design & Automated Testing (2 topics)
  - `fe-top-16`: Frontend Testing Suite: Unit, Integration & E2E (8 Hours)
  - `fe-top-17`: Large-Scale Frontend Architecture & System Design (10 Hours)

---

### 2.3 Role 3: Backend Developer (`backend-developer`)
*Focus: Node.js Asynchronous Runtimes, RESTful Protocols, Relational/NoSQL Indexing, Caching, Concurrency, and Distributed Scalability.*  
*Modules: 7 | Topics: 15 | Generated Lessons: 0 | Pending Topics: 15*

#### Level 1: Backend Core & RESTful APIs (beginner, 4 - 6 Weeks)
- **Module `be-mod-1`**: Node.js Runtime & Asynchronous I/O (2 topics)
  - `be-top-1`: Node.js Event Loop & Non-Blocking I/O (8 Hours)
  - `be-top-2`: Modular Backend Architecture & Error Handling (6 Hours)
- **Module `be-mod-2`**: RESTful API Engineering with Express (2 topics)
  - `be-top-3`: HTTP Protocol Mechanics & REST Conventions (6 Hours)
  - `be-top-4`: Request Validation, Sanitization & Middleware (6 Hours)

#### Level 2: Databases, Security & Caching (intermediate, 6 - 8 Weeks)
- **Module `be-mod-3`**: SQL, NoSQL & Database Indexing (3 topics)
  - `be-top-5`: Relational Schema Design & ACID Transactions (8 Hours)
  - `be-top-6`: Document Databases (MongoDB) & Aggregations (8 Hours)
  - `be-top-7`: Database Indexing Strategies & Query Optimization (8 Hours)
- **Module `be-mod-4`**: Authentication, Authorization & Security (2 topics)
  - `be-top-8`: JWT Token Pairs & Refresh Token Rotation (8 Hours)
  - `be-top-9`: Role-Based Access Control & API Hardening (6 Hours)
- **Module `be-mod-5`**: Caching Patterns & Asynchronous Queues (2 topics)
  - `be-top-10`: Redis In-Memory Caching Strategies (8 Hours)
  - `be-top-11`: Message Queues & Dead-Letter Handling (8 Hours)

#### Level 3: Distributed Systems & Scalability (advanced, 6 - 8 Weeks)
- **Module `be-mod-6`**: Distributed Systems Architecture & Scalability (2 topics)
  - `be-top-12`: Horizontal Scaling, Load Balancing & Sharding (10 Hours)
  - `be-top-13`: Distributed Concurrency & Idempotent Consumer Design (10 Hours)
- **Module `be-mod-7`**: Observability & Automated Testing Suites (2 topics)
  - `be-top-14`: Automated Testing: Unit, Integration & Contract Tests (8 Hours)
  - `be-top-15`: Telemetry, Distributed Tracing & Health Monitoring (8 Hours)

---

### 2.4 Role 4: Full Stack Developer (`fullstack-developer`)
*Focus: End-to-End Application Architecture, Data Modeling, JWT Authentication, WebSockets, Containerization, and System Trade-offs.*  
*Modules: 7 | Topics: 13 | Generated Lessons: 0 | Pending Topics: 13*

#### Level 1: Full-Stack Web Foundations (beginner, 4 - 6 Weeks)
- **Module `fs-mod-1`**: Client-Server Architecture & Modern Web Protocols (2 topics)
  - `fs-top-1`: Client-Server Communication & CORS Mechanics (6 Hours)
  - `fs-top-2`: Full-Stack Data Modeling & JSON Contracts (6 Hours)
- **Module `fs-mod-2`**: Frontend UI Systems with React (2 topics)
  - `fs-top-3`: React Component Hierarchies & Controlled Forms (8 Hours)
  - `fs-top-4`: Client Routing & Navigation Guards (6 Hours)

#### Level 2: Backend Services, ORMs & Authentication (intermediate, 6 - 8 Weeks)
- **Module `fs-mod-3`**: Backend Engineering & Database ORMs (2 topics)
  - `fs-top-5`: Database Schema Modeling & ORM Migrations (8 Hours)
  - `fs-top-6`: RESTful Resource CRUD & Pagination (6 Hours)
- **Module `fs-mod-4`**: Full-Stack Authentication & File Assets (2 topics)
  - `fs-top-7`: End-to-End JWT Auth & Protected Route Sync (8 Hours)
  - `fs-top-8`: Cloud Asset Uploads & CDN Serving (6 Hours)
- **Module `fs-mod-5`**: Real-Time Communication & Cache Hydration (1 topic)
  - `fs-top-9`: Real-Time Event Streaming with WebSockets (8 Hours)

#### Level 3: Cloud Deployment & Full-Stack Reliability (advanced, 6 - 8 Weeks)
- **Module `fs-mod-6`**: Containerization & Production Deployment (2 topics)
  - `fs-top-10`: Multi-Stage Docker Builds for Full-Stack Apps (8 Hours)
  - `fs-top-11`: CI/CD Pipelines & Cloud Production Hosting (8 Hours)
- **Module `fs-mod-7`**: Full-Stack System Design & End-to-End Testing (2 topics)
  - `fs-top-12`: End-to-End Testing Suites with Playwright (8 Hours)
  - `fs-top-13`: Full-Stack Scalability & Architectural Trade-offs (10 Hours)

---

### 2.5 Role 5: Data Analyst (`data-analyst`)
*Focus: Spreadsheets, Quantitative Modeling, Relational SQL, Window Functions, Pandas/NumPy, Star Schema Modeling, and Cohort Analytics.*  
*Modules: 7 | Topics: 14 | Generated Lessons: 0 | Pending Topics: 14*

#### Level 1: Analytical Foundations & SQL Basics (beginner, 4 - 6 Weeks)
- **Module `da-mod-1`**: Advanced Spreadsheets & Quantitative Logic (2 topics)
  - `da-top-1`: Lookup Functions & Dynamic Formula Modeling (6 Hours)
  - `da-top-2`: Descriptive Statistics & Data Distributions (6 Hours)
- **Module `da-mod-2`**: Relational Database Querying with SQL (2 topics)
  - `da-top-3`: Data Extraction: SELECT, WHERE & GROUP BY (6 Hours)
  - `da-top-4`: Relational Joins & Set Operations (8 Hours)

#### Level 2: Advanced SQL, Python & Data Modeling (intermediate, 6 - 8 Weeks)
- **Module `da-mod-3`**: Advanced SQL for Analytical Querying (2 topics)
  - `da-top-5`: Window Functions & Ranking Mechanics (8 Hours)
  - `da-top-6`: Common Table Expressions (CTEs) & Subqueries (8 Hours)
- **Module `da-mod-4`**: Python for Data Analysis (Pandas & NumPy) (2 topics)
  - `da-top-7`: Pandas DataFrames, Cleansing & Imputation (8 Hours)
  - `da-top-8`: Exploratory Data Analysis & Visualization (8 Hours)
- **Module `da-mod-5`**: Business Intelligence & Data Modeling (2 topics)
  - `da-top-9`: Dimensional Modeling: Star & Snowflake Schemas (8 Hours)
  - `da-top-10`: Interactive Dashboard Design & DAX Measures (8 Hours)

#### Level 3: Business Analytics, Experimentation & Metrics (advanced, 6 - 8 Weeks)
- **Module `da-mod-6`**: Business Metrics, Retention & Cohort Analytics (2 topics)
  - `da-top-11`: SaaS & E-Commerce Core Metrics Modeling (8 Hours)
  - `da-top-12`: Cohort Retention Matrices & Heatmaps (8 Hours)
- **Module `da-mod-7`**: A/B Testing, Experimentation & Root Cause Analysis (2 topics)
  - `da-top-13`: A/B Testing Frameworks & Significance Testing (8 Hours)
  - `da-top-14`: Metric Anomaly Diagnosis & Analytical Case Studies (8 Hours)

---

### 2.6 Role 6: Data Scientist (`data-scientist`)
*Focus: Applied Mathematics, Probability, Supervised/Unsupervised Learning, Feature Engineering, Neural Networks, PyTorch, and MLOps.*  
*Modules: 7 | Topics: 13 | Generated Lessons: 0 | Pending Topics: 13*

#### Level 1: Mathematical Foundations & Data Wrangling (beginner, 4 - 6 Weeks)
- **Module `ds-mod-1`**: Linear Algebra, Calculus & Probability (2 topics)
  - `ds-top-1`: Linear Algebra: Matrices, Vectors & Eigenvalues (8 Hours)
  - `ds-top-2`: Probability Distributions & Bayesian Inference (8 Hours)
- **Module `ds-mod-2`**: Scientific Computing with NumPy, Pandas & Scipy (2 topics)
  - `ds-top-3`: Vectorized Computations & Matrix Operations (8 Hours)
  - `ds-top-4`: Data Wrangling, Normalization & Encoding (6 Hours)

#### Level 2: Machine Learning Algorithms & Evaluation (intermediate, 6 - 8 Weeks)
- **Module `ds-mod-3`**: Supervised Learning Algorithms (2 topics)
  - `ds-top-5`: Regression Models: Linear, Ridge & Logistic (8 Hours)
  - `ds-top-6`: Decision Trees, Random Forests & Gradient Boosting (10 Hours)
- **Module `ds-mod-4`**: Unsupervised Learning & Feature Engineering (2 topics)
  - `ds-top-7`: Clustering Algorithms: K-Means & DBSCAN (8 Hours)
  - `ds-top-8`: Dimensionality Reduction (PCA) & Feature Pipelines (8 Hours)
- **Module `ds-mod-5`**: Model Evaluation, Validation & Hyperparameter Tuning (1 topic)
  - `ds-top-9`: Model Evaluation Metrics & Imbalanced Data (8 Hours)

#### Level 3: Deep Learning & Production MLOps (advanced, 6 - 8 Weeks)
- **Module `ds-mod-6`**: Deep Learning Foundations & Neural Architectures (2 topics)
  - `ds-top-10`: Neural Networks & Backpropagation with PyTorch (10 Hours)
  - `ds-top-11`: Transformers, Embeddings & Modern Architectures (10 Hours)
- **Module `ds-mod-7`**: MLOps, Model Serving & System Monitoring (2 topics)
  - `ds-top-12`: Model Serialization & REST API Serving (8 Hours)
  - `ds-top-13`: Data Drift, Concept Drift & Continuous Evaluation (8 Hours)

---

### 2.7 Role 7: DevOps Engineer (`devops-engineer`)
*Focus: Linux System Administration, Bash Scripting, Docker Containers, CI/CD with GitHub Actions, Terraform IaC, Kubernetes, and Prometheus/Grafana.*  
*Modules: 7 | Topics: 14 | Generated Lessons: 0 | Pending Topics: 14*

#### Level 1: Linux Systems, Networking & Scripting (beginner, 4 - 6 Weeks)
- **Module `do-mod-1`**: Linux Operating System & Administration (2 topics)
  - `do-top-1`: Linux Filesystem, Permissions & Users (6 Hours)
  - `do-top-2`: Process Management & Systemd Service Daemons (8 Hours)
- **Module `do-mod-2`**: Networking & Shell Scripting Automation (2 topics)
  - `do-top-3`: Bash Scripting & Stream Text Processing (8 Hours)
  - `do-top-4`: Networking Fundamentals: DNS, Subnets & Firewalls (8 Hours)

#### Level 2: Containers, CI/CD & Cloud Infrastructure (intermediate, 6 - 8 Weeks)
- **Module `do-mod-3`**: Containerization with Docker (2 topics)
  - `do-top-5`: Docker Architecture & Multi-Stage Compilation (8 Hours)
  - `do-top-6`: Docker Compose & Container Networking (8 Hours)
- **Module `do-mod-4`**: CI/CD Automation Pipelines (2 topics)
  - `do-top-7`: GitHub Actions & Pipeline Automation (8 Hours)
  - `do-top-8`: Release Strategies: Rolling, Blue/Green & Canary (6 Hours)
- **Module `do-mod-5`**: Infrastructure as Code (IaC) with Terraform (2 topics)
  - `do-top-9`: Terraform Core: Providers, Resources & State (8 Hours)
  - `do-top-10`: Terraform Modules & Cloud VPC Architecture (8 Hours)

#### Level 3: Kubernetes Orchestration & SRE Observability (advanced, 6 - 8 Weeks)
- **Module `do-mod-6`**: Kubernetes Cluster Orchestration (2 topics)
  - `do-top-11`: Kubernetes Architecture: Control Plane & Workloads (10 Hours)
  - `do-top-12`: Kubernetes Networking, Ingress & Helm Packaging (10 Hours)
- **Module `do-mod-7`**: SRE Observability, Metrics & Security (2 topics)
  - `do-top-13`: Metrics & Monitoring with Prometheus & Grafana (8 Hours)
  - `do-top-14`: Centralized Logging, Distributed Tracing & SRE (8 Hours)

---

### 2.8 Role 8: Mobile App Developer (`mobile-app-developer`)
*Focus: Mobile MVVM, Declarative Layouts, Navigation Stacks, Offline-First SQLite/Room, Hardware Lifecycles, Profiling, Keystore Security, and CI/CD.*  
*Modules: 7 | Topics: 14 | Generated Lessons: 0 | Pending Topics: 14*

#### Level 1: Mobile Core & Declarative UI (beginner, 4 - 6 Weeks)
- **Module `mob-mod-1`**: Mobile Programming Foundations & Architectures (2 topics)
  - `mob-top-1`: Mobile Architecture: MVVM & State Streams (8 Hours)
  - `mob-top-2`: Typed Languages: Null Safety & Concurrency (6 Hours)
- **Module `mob-mod-2`**: Declarative UI Development & Layout Systems (2 topics)
  - `mob-top-3`: Declarative Layouts & Screen Density Scaling (8 Hours)
  - `mob-top-4`: Touch Gestures, Animations & Haptics (8 Hours)

#### Level 2: Navigation, Persistence & Networking (intermediate, 6 - 8 Weeks)
- **Module `mob-mod-3`**: Mobile Navigation & Deep Linking (2 topics)
  - `mob-top-5`: Navigation Stacks, Tab Controllers & Modals (6 Hours)
  - `mob-top-6`: Universal Links & Deep Link Routing (6 Hours)
- **Module `mob-mod-4`**: Networking & Offline-First Persistence (2 topics)
  - `mob-top-7`: Offline-First Local Persistence (Room / CoreData / SQLite) (8 Hours)
  - `mob-top-8`: Network Synchronization & Token Interceptors (8 Hours)
- **Module `mob-mod-5`**: Device Hardware APIs & App Lifecycles (2 topics)
  - `mob-top-9`: Mobile App Lifecycle & Memory Management (8 Hours)
  - `mob-top-10`: Runtime Permissions & Push Notifications (6 Hours)

#### Level 3: Performance, Security & App Publishing (advanced, 6 - 8 Weeks)
- **Module `mob-mod-6`**: Mobile Performance Profiling & Optimization (2 topics)
  - `mob-top-11`: UI Rendering Performance: 60/120 FPS & Overdraw (8 Hours)
  - `mob-top-12`: Memory Leaks & Native Profiling Tools (8 Hours)
  - **Module `mob-mod-7`**: Mobile Security, CI/CD & App Store Releases (2 topics)
  - `mob-top-13`: Mobile Security: Keystore, Biometrics & SSL Pinning (8 Hours)
  - `mob-top-14`: CI/CD with Fastlane & App Store Publishing (10 Hours)

---

## 3. Five Pilot Lessons Audit

The five canonical pilot lessons stored in MongoDB database `careerlaunch` on port `27018` were directly inspected using the database connection probe.

```text
Database: careerlaunch (127.0.0.1:27018)
Collection: generatedlessons
Document Count: 5
Generation Provider: groq
Generation Model: openai/gpt-oss-120b
Validation Status: passed (100%)
```

### Detailed Stored Lesson Specifications

| Topic ID | Roadmap Topic Alias | Stored Lesson ID | Lesson Title | Canonical Source URL | Chunk ID | Source Hash | Token Usage (Prompt / Compl / Total) | Generated Timestamp |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `swe-top-1` | `se-top-3` | `lesson_software-engineer_swe-top-1_beginner` | Arrays and Two-Pointer Scanning Mechanics | `https://xlinux.nist.gov/dads/HTML/array.html` | `doc_nist-dads_5049a48a20fa_chk_001` | `8eaab4e835772...` | 1199 / 2106 / 3305 | 2026-11-05 23:11:39 IST |
| `swe-top-4` | `swe-top-4` | `lesson_software-engineer_swe-top-4_beginner` | Binary Search Mechanics and Interval Bisection | `https://xlinux.nist.gov/dads/HTML/binarySearch.html` | `doc_nist-dads_4314b2703ab7_chk_001` | `7f1206f6a2396...` | 1177 / 2021 / 3198 | 2026-11-05 23:11:39 IST |
| `swe-top-7` | `se-top-7` | `lesson_software-engineer_swe-top-7_intermediate` | Binary Search Trees, Invariants and Balancing | `https://xlinux.nist.gov/dads/HTML/binarySearchTree.html` | `doc_nist-dads_50ab0de92398_chk_001` | `0eca577e228c3...` | 1191 / 1914 / 3105 | 2026-11-05 23:11:39 IST |
| `swe-top-9` | `se-top-9` | `lesson_software-engineer_swe-top-9_intermediate` | Graph Traversals: BFS, DFS and Cycle Detection | `https://xlinux.nist.gov/dads/HTML/cycle.html` | `doc_nist-dads_77e79b563a21_chk_001` | `e3eeef94813bf...` | 1212 / 2569 / 3781 | 2026-11-05 23:11:39 IST |
| `swe-top-13` | `se-top-12` | `lesson_software-engineer_swe-top-13_advanced` | Dynamic Programming: Optimal Substructure and Memoization | `https://xlinux.nist.gov/dads/HTML/dynamicProgramming.html` | `doc_nist-dads_e5e48de67b02_chk_001` | `801e83bb6af11...` | 1190 / 2279 / 3469 | 2026-11-05 23:11:39 IST |

### Key Pilot Invariants Verified
1. **Zero Hallucination Attribution**: All five lessons correctly cite NIST DADS as the conceptual source and attribute algorithmic code exemplars explicitly to **CareerLaunch Engineering**.
2. **Schema Completeness**: All 9 required pedagogical sections (`introduction`, `coreConcepts`, `stepByStep`, `practicalExamples`, `complexityAnalysis`, `commonMistakes`, `interviewInsights`, `summary`, `references`) are populated with non-trivial text.
3. **Data Protection**: Security filters prevent exposing chunk IDs, internal snapshot hashes, and raw prompts to student-facing API consumers (`GET /api/lessons/:topicId`).

---

## 4. Trusted Knowledge Source Approval Matrix

This matrix evaluates 20 candidate technical knowledge sources according to strict criteria for copyright, commercial licensing compatibility, indexing rights, and suitability for AI retrieval grounding.

### Decision Rules
- **APPROVED**: Official documentation with explicit open/permissive licenses permitting commercial use, caching, and text derivative synthesis (Public Domain, CC0, CC-BY 4.0, MIT, BSD 3-Clause, Apache 2.0, PostgreSQL License, W3C Document License).
- **CONDITIONAL**: Permitted under specific constraints (e.g., share-alike copyleft isolation, attribution reproduction in student payloads, or restricted to non-proprietary subsets like Swift.org vs. Apple Developer).
- **REJECTED**: Sources with **NonCommercial (NC)** clauses (CC BY-NC-SA), proprietary "All Rights Reserved" terms, or explicit web scraping / LLM training prohibitions.

| Source Name | Official URL | Publisher / Org | Relevant Roles | Relevant Topics | Licence / Terms | Commercial Use | Storage Rights | Indexing Rights | Attribution Requirements | Ingestion Restrictions | Decision | Evidence URL |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :---: | :--- |
| **NIST DADS** | `https://xlinux.nist.gov/dads/` | National Institute of Standards and Technology (U.S. Govt) | `software-engineer` | `se-top-1` to `se-top-12` | U.S. Govt Work (17 U.S.C. § 105) | **Allowed** | **Allowed** | **Allowed** | Citation requested: "Paul E. Black, ed., NIST DADS" | Static HTML; respect crawl-delay | **APPROVED** | [NIST Licensing](https://www.nist.gov/director/licensing) |
| **MDN Web Docs** | `https://developer.mozilla.org/` | Mozilla Foundation / Open Web Docs | `frontend-developer`, `fullstack-developer` | `fe-top-1` to `fe-top-6`, `fe-top-12`, `fs-top-1` | Text: CC-BY-SA 2.5+; Code: CC0 1.0 | **Allowed** | **Allowed** | **Allowed** | Attribute MDN contributors with hyperlink; CC0 for code | Text derivations require CC-BY-SA clause tracking | **APPROVED** | [MDN Licensing FAQ](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Licensing_faq) |
| **W3C Specifications** | `https://www.w3.org/TR/` | World Wide Web Consortium | `frontend-developer`, `fullstack-developer` | `fe-top-1`, `fe-top-2`, `fe-top-13` (WCAG/ARIA) | W3C Document License (Permissive) | **Allowed** | **Allowed** | **Allowed** | Citation of specification URI & W3C copyright | Static normative text | **APPROVED** | [W3C Document License](https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document) |
| **React Official Docs** | `https://react.dev/` | Meta Platforms, Inc. / React Team | `frontend-developer`, `fullstack-developer` | `fe-top-7` to `fe-top-10`, `fs-top-3`, `fs-top-4` | Text: CC-BY 4.0; Code: MIT | **Allowed** | **Allowed** | **Allowed** | Attribute Meta Platforms & React contributors; link license | Use react.dev markdown repo | **APPROVED** | [React Docs LICENSE](https://github.com/reactjs/react.dev/blob/main/LICENSE.md) |
| **Node.js API Docs** | `https://nodejs.org/api/` | OpenJS Foundation | `backend-developer`, `fullstack-developer` | `be-top-1` to `be-top-4`, `fs-top-1` | Documentation: CC-BY 4.0; Code: MIT | **Allowed** | **Allowed** | **Allowed** | OpenJS Foundation copyright notice & license link | Use official release markdown | **APPROVED** | [Node.js License](https://github.com/nodejs/node/blob/main/LICENSE) |
| **PostgreSQL Official Docs** | `https://www.postgresql.org/docs/` | PostgreSQL Global Development Group | `backend-developer`, `data-analyst`, `fullstack-developer` | `be-top-5`, `be-top-7`, `da-top-3` to `da-top-6`, `fs-top-5` | PostgreSQL Licence (Liberal Open Source) | **Allowed** | **Allowed** | **Allowed** | Retain copyright notice: "Portions (c) 1996-2024 PostgreSQL GDG" | Freely distributable without fee | **APPROVED** | [PostgreSQL Licence](https://www.postgresql.org/about/licence/) |
| **Python Official Docs** | `https://docs.python.org/3/` | Python Software Foundation | `software-engineer`, `backend-developer`, `data-analyst`, `data-scientist` | `se-top-3`, `be-top-1`, `da-top-7`, `ds-top-3`, `ds-top-4` | PSF License Agreement v2 / 0BSD | **Allowed** | **Allowed** | **Allowed** | Retain PSF copyright notice in documentation chunks | Commercially compatible with attribution | **APPROVED** | [Python License](https://docs.python.org/3/license.html) |
| **Linux Man-Pages** | `https://man7.org/linux/man-pages/` | The Linux Foundation / Michael Kerrisk | `devops-engineer`, `backend-developer`, `software-engineer` | `do-top-1` to `do-top-4`, `se-top-13`, `se-top-14` | Mixed Permissive (BSD, MIT, Public Domain) | **Allowed** | **Allowed** | **Allowed** | Retain individual man-page author notices | Ingest core POSIX and Linux API sections | **APPROVED** | [Linux Man-Pages](https://man7.org/linux/man-pages/man7/man-pages.7.html) |
| **Docker Documentation** | `https://docs.docker.com/` | Docker Inc. | `devops-engineer`, `fullstack-developer` | `do-top-5`, `do-top-6`, `fs-top-10` | Documentation: CC-BY-SA 4.0; Code: Apache 2.0 | **Allowed** | **Allowed** | **Allowed** | Attribution to Docker Inc. with license link | ShareAlike applies to text adaptations | **APPROVED** | [Docker Docs License](https://github.com/docker/docs/blob/main/LICENSE) |
| **Kubernetes Documentation** | `https://kubernetes.io/docs/` | Cloud Native Computing Foundation (CNCF) | `devops-engineer`, `backend-developer` | `do-top-11`, `do-top-12`, `be-top-12` | Documentation: CC-BY 4.0; Code: Apache 2.0 | **Allowed** | **Allowed** | **Allowed** | Attribution to Kubernetes Authors / The Linux Foundation | Use GitHub markdown source | **APPROVED** | [Kubernetes Website License](https://github.com/kubernetes/website/blob/main/LICENSE) |
| **OWASP Foundation** | `https://owasp.org/` | OWASP Foundation | `backend-developer`, `fullstack-developer`, `devops-engineer`, `mobile-app-developer` | `be-top-4`, `be-top-8`, `be-top-9`, `fs-top-7`, `mob-top-13` | CC-BY-SA 4.0 | **Allowed** | **Allowed** | **Allowed** | Attribute OWASP Foundation with project link | Include Top 10, ASVS, Cheat Sheets | **APPROVED** | [OWASP Top 10 License](https://owasp.org/www-project-top-ten/) |
| **Android Developer Docs** | `https://developer.android.com/` | Google LLC / Android Open Source Project | `mobile-app-developer` | `mob-top-1` to `mob-top-12` | Text: CC-BY 4.0; Code: Apache 2.0 | **Allowed** | **Allowed** | **Allowed** | AOSP attribution statement required by license | Use developer.android.com reference | **APPROVED** | [Android License](https://developer.android.com/license) |
| **NumPy & Pandas Docs** | `https://pandas.pydata.org/docs/` | NumFOCUS / PyData Teams | `data-analyst`, `data-scientist` | `da-top-7`, `da-top-8`, `ds-top-3`, `ds-top-4` | BSD 3-Clause License | **Allowed** | **Allowed** | **Allowed** | Retain NumFOCUS BSD-3 copyright notice | Standard reference documentation | **APPROVED** | [Pandas License](https://github.com/pandas-dev/pandas/blob/main/LICENSE) |
| **Scikit-Learn Docs** | `https://scikit-learn.org/stable/` | Inria / Scikit-Learn Consortium | `data-scientist` | `ds-top-5` to `ds-top-9` | BSD 3-Clause License | **Allowed** | **Allowed** | **Allowed** | Retain BSD-3 copyright notice | Algorithmic descriptions & API docs | **APPROVED** | [Scikit-Learn Copying](https://github.com/scikit-learn/scikit-learn/blob/main/COPYING) |
| **PyTorch Documentation** | `https://pytorch.org/docs/` | PyTorch Foundation / The Linux Foundation | `data-scientist` | `ds-top-10`, `ds-top-11` | Modified BSD License (BSD-3-Clause) | **Allowed** | **Allowed** | **Allowed** | Retain PyTorch Foundation copyright notice | Core tensors, autograd & neural nets | **APPROVED** | [PyTorch License](https://github.com/pytorch/pytorch/blob/main/LICENSE) |
| **Apache Spark Docs** | `https://spark.apache.org/docs/` | Apache Software Foundation | `data-scientist`, `data-analyst` | `ds-top-4`, `da-top-6` | Apache License 2.0 | **Allowed** | **Allowed** | **Allowed** | ASF copyright notice and Apache 2.0 license header | Ingest core SQL and DataFrame APIs | **APPROVED** | [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) |
| **Git Core Manpages** | `https://git-scm.com/docs` | Git Community / Software Freedom Conservancy | `devops-engineer`, `software-engineer`, `fullstack-developer` | `do-top-7`, `se-top-16`, `fs-top-11` | GNU General Public License v2 (GPLv2) | **Allowed** | **Allowed** | **Allowed** | Retain GPL notice; link to canonical source | Strictly ingest core man pages (`git-commit`, `git-branch`) | **CONDITIONAL** | [Git COPYING](https://github.com/git/git/blob/master/COPYING) |
| **Swift.org Docs** | `https://www.swift.org/documentation/` | Swift Project Authors / Apple Inc. | `mobile-app-developer` | `mob-top-2` (Typed Languages & Concurrency) | Apache License 2.0 with Runtime Exception | **Allowed** | **Allowed** | **Allowed** | Retain Swift Project Authors attribution | Only use Swift.org; DO NOT scrape developer.apple.com | **CONDITIONAL** | [Swift.org License](https://www.swift.org/about/#license) |
| **MongoDB Official Docs** | `https://www.mongodb.com/docs/` | MongoDB Inc. | `backend-developer`, `fullstack-developer` | `be-top-6`, `fs-top-5` | Creative Commons Attribution-NonCommercial-ShareAlike 3.0 (CC BY-NC-SA 3.0) | **PROHIBITED** | **Unclear** | **Disallowed** | NonCommercial clause prevents commercial SaaS use | **DO NOT INGEST**. Replace with open document specifications | **REJECTED** | [MongoDB Docs License](https://github.com/mongodb/docs/blob/master/LICENSE.txt) |
| **Apple Developer Docs** | `https://developer.apple.com/` | Apple Inc. | `mobile-app-developer` | `mob-top-1` to `mob-top-14` (iOS/SwiftUI/CoreData) | Proprietary Copyright — All Rights Reserved | **PROHIBITED** | **PROHIBITED** | **PROHIBITED** | No redistribution rights granted | **DO NOT INGEST**. Ingestion constitutes copyright violation | **REJECTED** | [Apple Legal Terms](https://www.apple.com/legal/internet-services/terms/site.html) |
| **Pro Git Book** | `https://git-scm.com/book/` | Scott Chacon & Ben Straub | `devops-engineer`, `software-engineer` | `do-top-7`, `fs-top-11` | Creative Commons Attribution-NonCommercial-ShareAlike 3.0 (CC BY-NC-SA 3.0) | **PROHIBITED** | **Unclear** | **Disallowed** | Explicit NonCommercial clause prevents commercial distribution | **DO NOT INGEST**. Use Git CLI manpages (GPLv2) instead | **REJECTED** | [Pro Git License](https://git-scm.com/book/en/v2/) |
| **MIT OpenCourseWare** | `https://ocw.mit.edu/` | Massachusetts Institute of Technology | `software-engineer`, `data-scientist` | `se-top-1` to `se-top-12`, `ds-top-1`, `ds-top-2` | Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (CC BY-NC-SA 4.0) | **PROHIBITED** | **Unclear** | **Disallowed** | Explicit NonCommercial restriction prohibits commercial platform use | **DO NOT INGEST**. Use NIST DADS and public domain texts | **REJECTED** | [MIT OCW Terms](https://ocw.mit.edu/pages/privacy-and-terms-of-use/) |

---

## 5. Curriculum-to-Source Coverage Matrix

This matrix maps every approved and conditional knowledge source to the 118 existing curriculum topics across all eight roles. Coverage is rated as:
- **Strong**: Approved source directly and comprehensively covers the topic.
- **Partial**: Approved source covers core principles but requires custom CareerLaunch engineering code exemplars or multi-source synthesis.
- **Weak**: Approved source provides secondary context, requiring additional vetted literature.
- **None**: No approved open/commercial-compatible source currently registered.

### 5.1 Role 1: Software Engineer (`software-engineer` — 18 Topics)

| Topic ID | Topic Title | Relevant Approved Source | Canonical Reference URL | Coverage | Missing Knowledge / Pedagogical Gap | Recommended Next Action |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `se-top-1` | Memory Architecture: Stack, Heap & Pointers | Linux Man-Pages / NIST DADS | `https://man7.org/linux/man-pages/man3/malloc.3.html` | Partial | Needs clear diagrams for stack frames vs dynamic heap allocations | Ingest POSIX memory management man-pages (`malloc`, `brk`, `mmap`) |
| `se-top-2` | Asymptotic Analysis & Big-O Notation | NIST DADS | `https://xlinux.nist.gov/dads/HTML/bigO.html` | Strong | Formal mathematical bounds covered; needs practical benchmark examples | Ingest NIST DADS Big-O, Big-Omega, Big-Theta definitions |
| `se-top-3` | Arrays, Strings & Two-Pointer Strategies | NIST DADS | `https://xlinux.nist.gov/dads/HTML/array.html` | Strong | Covered by Pilot Lesson `swe-top-1` | **GENERATED & ACTIVE** (`swe-top-1`) |
| `swe-top-4` | Binary Search Mechanics and Interval Bisection | NIST DADS | `https://xlinux.nist.gov/dads/HTML/binarySearch.html` | Strong | Covered by Pilot Lesson `swe-top-4` | **GENERATED & ACTIVE** (`swe-top-4`) |
| `se-top-4` | Linked Lists: Singly, Doubly & Circular | NIST DADS | `https://xlinux.nist.gov/dads/HTML/linkedList.html` | Strong | Structural invariants covered; needs cycle detection and reversal code | Ingest NIST DADS `linkedList.html`, `doublyLinkedList.html` |
| `se-top-5` | Stacks, Queues & Monotonic Variants | NIST DADS | `https://xlinux.nist.gov/dads/HTML/stack.html` | Strong | LIFO/FIFO definitions covered; needs monotonic stack exemplar | Ingest NIST DADS `stack.html`, `queue.html`, `priorityQueue.html` |
| `se-top-6` | Binary Trees & Traversal Algorithms | NIST DADS | `https://xlinux.nist.gov/dads/HTML/binaryTree.html` | Strong | Tree definitions covered; needs recursive vs iterative traversal code | Ingest NIST DADS `binaryTree.html`, `treeTraversal.html` |
| `se-top-7` | Binary Search Trees & Balanced Trees | NIST DADS | `https://xlinux.nist.gov/dads/HTML/binarySearchTree.html` | Strong | Covered by Pilot Lesson `swe-top-7` | **GENERATED & ACTIVE** (`swe-top-7`) |
| `se-top-8` | Heaps & Priority Queues | NIST DADS | `https://xlinux.nist.gov/dads/HTML/heap.html` | Strong | Binary heap property and sift-up/sift-down mechanics | Ingest NIST DADS `heap.html`, `binaryHeap.html` |
| `se-top-9` | Graph Representations, BFS & DFS | NIST DADS | `https://xlinux.nist.gov/dads/HTML/cycle.html` | Strong | Covered by Pilot Lesson `swe-top-9` | **GENERATED & ACTIVE** (`swe-top-9`) |
| `se-top-10` | Topological Sort & Shortest Paths (Dijkstra) | NIST DADS | `https://xlinux.nist.gov/dads/HTML/topologicalSort.html` | Strong | Invariants covered; needs adjacency list Dijkstra implementation | Ingest NIST DADS `topologicalSort.html`, `dijkstra.html` |
| `se-top-11` | Recursion & Backtracking Strategies | NIST DADS / Python Docs | `https://xlinux.nist.gov/dads/HTML/backtracking.html` | Partial | State-space tree pruning; needs N-Queens / Subset sum exemplars | Ingest NIST DADS `backtracking.html` |
| `se-top-12` | Dynamic Programming: 1D & 2D Tabulation | NIST DADS | `https://xlinux.nist.gov/dads/HTML/dynamicProgramming.html` | Strong | Covered by Pilot Lesson `swe-top-13` | **GENERATED & ACTIVE** (`swe-top-13`) |
| `se-top-13` | Processes, Threads & Synchronization | Linux Man-Pages | `https://man7.org/linux/man-pages/man7/pthreads.7.html` | Strong | Thread lifecycle, race conditions, mutexes, semaphores, deadlocks | Ingest Linux man-pages `clone(2)`, `pthreads(7)`, `sem_overview(7)` |
| `se-top-14` | Virtual Memory, Paging & Storage | Linux Man-Pages | `https://man7.org/linux/man-pages/man2/mmap.2.html` | Partial | Page tables, TLB, page faults; needs conceptual memory visualizer | Ingest Linux man-pages `mmap(2)`, `mprotect(2)` |
| `se-top-15` | Computer Networking: OSI, TCP/IP & HTTP | MDN Web Docs / RFCs | `https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview` | Strong | TCP three-way handshake, flow control, congestion, HTTP/1.1 vs HTTP/2 | Ingest MDN HTTP Overview and Linux `tcp(7)` man-page |
| `se-top-16` | Object-Oriented Design Patterns (GoF) | Python / W3C Docs | `https://docs.python.org/3/tutorial/classes.html` | Partial | Creational/Structural/Behavioral patterns (Singleton, Factory, Strategy) | Ingest Python class protocols & author GoF exemplars |
| `se-top-17` | High-Level System Design & Scalability | Node.js / PostgreSQL / OWASP | `https://www.postgresql.org/docs/current/high-availability.html` | Partial | Partitioning, replication, caching, CAP theorem, throughput vs latency | Ingest PostgreSQL HA docs + OWASP resilience guidelines |

---

### 5.2 Role 2: Frontend Developer (`frontend-developer` — 17 Topics)

| Topic ID | Topic Title | Relevant Approved Source | Canonical Reference URL | Coverage | Missing Knowledge / Pedagogical Gap | Recommended Next Action |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `fe-top-1` | Semantic Markup & Accessibility Outlines | W3C / MDN Web Docs | `https://www.w3.org/TR/html52/sections.html` | Strong | Landmark elements, document outline, heading hierarchies | Ingest W3C HTML5 sectioning and MDN Semantic Elements |
| `fe-top-2` | CSS Box Model, Flexbox & Grid Systems | W3C / MDN Web Docs | `https://www.w3.org/TR/css-box-3/` | Strong | Content, padding, border, margin, flex alignments, grid tracks | Ingest W3C CSS Box Model & Grid Specifications |
| `fe-top-3` | Responsive Design & Fluid Typography | W3C / MDN Web Docs | `https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design` | Strong | Viewport units, media queries, clamp(), fluid type scaling | Ingest MDN Responsive Design guidelines |
| `fe-top-4` | Execution Context, Scopes & Closures | MDN Web Docs | `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures` | Strong | Lexical scoping, closure memory retention, call stack execution | Ingest MDN JavaScript Closures & Scope documentation |
| `fe-top-5` | DOM Manipulation, Events & Bubbling | W3C / MDN Web Docs | `https://www.w3.org/TR/uievents/` | Strong | Event capture, target, bubble phases, delegation patterns | Ingest W3C UI Events Specification and MDN EventTarget |
| `fe-top-6` | Asynchronous JavaScript & Event Loop | MDN Web Docs / Node.js | `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop` | Strong | Call stack, microtask queue (Promises), macrotask queue (timers) | Ingest MDN Concurrency model & Event loop documentation |
| `fe-top-7` | JSX Compilation, Virtual DOM & Reconciliation | React Official Docs | `https://react.dev/reference/react/createElement` | Strong | JSX transform, React fiber nodes, diffing algorithm, key prop role | Ingest React.dev Rendering Process and Reconciliation docs |
| `fe-top-8` | Standard Hooks & Lifecycle Synchronization | React Official Docs | `https://react.dev/reference/react/useEffect` | Strong | useState, useEffect, useMemo, useCallback, dependency arrays | Ingest React.dev built-in hooks reference docs |
| `fe-top-9` | Custom Hooks & Reusable Logic Extraction | React Official Docs | `https://react.dev/learn/reusing-logic-with-custom-hooks` | Strong | Custom hook naming, state isolation, extracting component logic | Ingest React.dev custom hooks learning guide |
| `fe-top-10` | Global State Strategies: Context vs Stores | React Official Docs | `https://react.dev/learn/passing-data-deeply-with-context` | Partial | Context provider re-renders, external stores (Zustand pattern) | Ingest React.dev Context + author state comparison exemplar |
| `fe-top-11` | Server State & Client Caching (React Query / SWR) | MDN / React Docs | `https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API` | Partial | Cache invalidation, optimistic updates, background re-fetching | Ingest MDN Fetch API & author query cache exemplar |
| `fe-top-12` | Critical Rendering Path & Paint Cycles | W3C / MDN Web Docs | `https://developer.mozilla.org/en-US/docs/Web/Performance/Critical_rendering_path` | Strong | DOM tree, CSSOM tree, Render tree, Layout (Reflow), Paint, Composite | Ingest MDN Critical Rendering Path documentation |
| `fe-top-13` | WCAG 2.1 Compliance & Keyboard Navigation | W3C | `https://www.w3.org/TR/WCAG21/` | Strong | POUR principles, focus management, ARIA roles, color contrast ratio | Ingest W3C WCAG 2.1 specification sections |
| `fe-top-14` | Core Web Vitals Diagnostic Auditing | W3C / MDN Web Docs | `https://developer.mozilla.org/en-US/docs/Web/Performance/Core_web_vitals` | Strong | LCP (loading), INP (interactivity), CLS (visual stability) thresholds | Ingest MDN Web Performance Core Web Vitals guide |
| `fe-top-15` | Bundle Splitting & Asset Optimization | MDN Web Docs | `https://developer.mozilla.org/en-US/docs/Web/HTTP/Compression` | Partial | Dynamic import(), route-based splitting, tree-shaking, Brotli/Gzip | Ingest MDN Dynamic Imports and HTTP caching docs |
| `fe-top-16` | Frontend Testing Suite: Unit, Integration & E2E | React Docs / MDN | `https://react.dev/learn/testing` | Partial | Testing component rendering, user interactions, mock servers | Ingest React testing documentation + author Vitest exemplar |
| `fe-top-17` | Large-Scale Frontend Architecture & System Design | React / W3C Docs | `https://react.dev/learn/thinking-in-react` | Partial | Micro-frontends, design systems, monorepos, state federation | Ingest React.dev Thinking in React + author system design specs |

---

### 5.3 Role 3: Backend Developer (`backend-developer` — 15 Topics)

| Topic ID | Topic Title | Relevant Approved Source | Canonical Reference URL | Coverage | Missing Knowledge / Pedagogical Gap | Recommended Next Action |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `be-top-1` | Node.js Event Loop & Non-Blocking I/O | Node.js Official Docs | `https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/` | Strong | Phases: timers, pending callbacks, poll, check, close; process.nextTick | Ingest Node.js Event Loop Guide |
| `be-top-2` | Modular Backend Architecture & Error Handling | Node.js Official Docs | `https://nodejs.org/api/errors.html` | Strong | Unhandled rejections, centralized error middleware, async/await safety | Ingest Node.js Error Handling reference |
| `be-top-3` | HTTP Protocol Mechanics & REST Conventions | MDN Web Docs | `https://developer.mozilla.org/en-US/docs/Web/HTTP` | Strong | HTTP methods, status codes, idempotency, caching headers, content type | Ingest MDN HTTP Methods and Headers documentation |
| `be-top-4` | Request Validation, Sanitization & Middleware | OWASP Foundation | `https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html` | Strong | Schema validation, SQL/NoSQL injection prevention, XSS sanitization | Ingest OWASP Input Validation Cheat Sheet |
| `be-top-5` | Relational Schema Design & ACID Transactions | PostgreSQL Docs | `https://www.postgresql.org/docs/current/tutorial-sql.html` | Strong | Primary/foreign keys, 1NF/2NF/3NF normal forms, Atomicity, Isolation | Ingest PostgreSQL Transactions & Schema documentation |
| `be-top-6` | Document Databases (MongoDB) & Aggregations | PostgreSQL / W3C Docs | `https://www.postgresql.org/docs/current/datatype-json.html` | Partial | Document modeling, aggregation pipelines. *(Official MongoDB docs rejected)* | Ingest PostgreSQL JSONB document indexing as open reference |
| `be-top-7` | Database Indexing Strategies & Query Optimization | PostgreSQL Docs | `https://www.postgresql.org/docs/current/indexes.html` | Strong | B-tree indexes, composite indexes, EXPLAIN ANALYZE, query execution plan | Ingest PostgreSQL Indexes & Query Execution documentation |
| `be-top-8` | JWT Token Pairs & Refresh Token Rotation | OWASP / RFC 7519 | `https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html` | Strong | Access token lifecycle, signature verification, token revocation | Ingest OWASP JWT Cheat Sheet |
| `be-top-9` | Role-Based Access Control & API Hardening | OWASP Foundation | `https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html` | Strong | Principle of least privilege, IDOR prevention, rate limiting, CORS | Ingest OWASP Authorization & REST Security Cheat Sheets |
| `be-top-10` | Redis In-Memory Caching Strategies | Linux Man-Pages / PostgreSQL | `https://man7.org/linux/man-pages/man2/memfd_create.2.html` | Partial | Cache-aside, write-through, cache stampede, TTL eviction policies | Ingest in-memory caching principles & author Redis exemplars |
| `be-top-11` | Message Queues & Dead-Letter Handling | OWASP / Node.js Docs | `https://nodejs.org/api/worker_threads.html` | Partial | Producer-consumer pattern, backpressure, retries, dead-letter queues | Ingest asynchronous queueing patterns & author worker exemplar |
| `be-top-12` | Horizontal Scaling, Load Balancing & Sharding | Kubernetes Docs | `https://kubernetes.io/docs/concepts/services-networking/service/` | Strong | Reverse proxies, round-robin, consistent hashing, database sharding | Ingest Kubernetes Service & Ingress load balancing docs |
| `be-top-13` | Distributed Concurrency & Idempotent Consumer Design | PostgreSQL / OWASP | `https://www.postgresql.org/docs/current/explicit-locking.html` | Strong | Optimistic vs pessimistic locking, idempotency keys, duplicate elimination | Ingest PostgreSQL Explicit Locking documentation |
| `be-top-14` | Automated Testing: Unit, Integration & Contract Tests | Node.js Docs | `https://nodejs.org/api/test.html` | Strong | Testing pyramid, mocking external dependencies, database transaction rollback | Ingest Node.js built-in test runner documentation |
| `be-top-15` | Telemetry, Distributed Tracing & Health Monitoring | Linux / Node.js Docs | `https://nodejs.org/api/diagnostics_channel.html` | Partial | Metrics, logs, traces, trace IDs, liveness and readiness health checks | Ingest Node.js Diagnostics Channels & Systemd health probes |

---

### 5.4 Role 4: Full Stack Developer (`fullstack-developer` — 13 Topics)

| Topic ID | Topic Title | Relevant Approved Source | Canonical Reference URL | Coverage | Missing Knowledge / Pedagogical Gap | Recommended Next Action |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `fs-top-1` | Client-Server Communication & CORS Mechanics | MDN Web Docs | `https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS` | Strong | Origin headers, preflight OPTIONS requests, allowed credentials | Ingest MDN CORS Architecture documentation |
| `fs-top-2` | Full-Stack Data Modeling & JSON Contracts | W3C / MDN Docs | `https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON` | Strong | API contract design, DTOs, request-response serialization | Ingest MDN JSON & REST specification guidelines |
| `fs-top-3` | React Component Hierarchies & Controlled Forms | React Official Docs | `https://react.dev/reference/react-dom/components/input` | Strong | Form state synchronization, synthetic events, validation error display | Ingest React.dev Form Input & Controlled Component docs |
| `fs-top-4` | Client Routing & Navigation Guards | MDN Web Docs | `https://developer.mozilla.org/en-US/docs/Web/API/History_API` | Strong | Browser history API, pushState, route protection patterns | Ingest MDN History API & author React Router guard exemplar |
| `fs-top-5` | Database Schema Modeling & ORM Migrations | PostgreSQL Docs | `https://www.postgresql.org/docs/current/ddl.html` | Strong | Foreign keys, indexes, forward/reverse migrations, seed scripts | Ingest PostgreSQL DDL and Alter Table specifications |
| `fs-top-6` | RESTful Resource CRUD & Pagination | MDN Web Docs | `https://developer.mozilla.org/en-US/docs/Web/HTTP/Status` | Strong | Offset vs cursor-based pagination, REST resource naming | Ingest MDN HTTP status and URI resource guidelines |
| `fs-top-7` | End-to-End JWT Auth & Protected Route Sync | OWASP Foundation | `https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html` | Strong | HttpOnly cookie storage, silent refresh, auth state sync | Ingest OWASP Session Management Cheat Sheet |
| `fs-top-8` | Cloud Asset Uploads & CDN Serving | MDN Web Docs | `https://developer.mozilla.org/en-US/docs/Web/API/FormData` | Strong | Multipart form data, pre-signed upload URLs, caching headers | Ingest MDN FormData & Fetch upload documentation |
| `fs-top-9` | Real-Time Event Streaming with WebSockets | MDN Web Docs / W3C | `https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API` | Strong | WebSocket handshake, bidirectional frames, reconnection logic | Ingest MDN WebSockets API and W3C specification |
| `fs-top-10` | Multi-Stage Docker Builds for Full-Stack Apps | Docker Official Docs | `https://docs.docker.com/build/building/multi-stage/` | Strong | Build stages, production runner image size reduction, non-root users | Ingest Docker Documentation Multi-stage build guide |
| `fs-top-11` | CI/CD Pipelines & Cloud Production Hosting | Docker / Git Docs | `https://docs.docker.com/ci-cd/` | Partial | Automated build, test, container registry push, deployment triggers | Ingest Docker CI/CD documentation + author GitHub Actions exemplar |
| `fs-top-12` | End-to-End Testing Suites with Playwright | MDN / W3C Docs | `https://www.w3.org/TR/webdriver2/` | Partial | Page object model, network mocking, cross-browser assertions | Ingest W3C WebDriver spec + author Playwright test suite |
| `fs-top-13` | Full-Stack Scalability & Architectural Trade-offs | PostgreSQL / Kubernetes | `https://kubernetes.io/docs/concepts/architecture/` | Partial | Monolith vs microservices, database connection pooling, edge caching | Ingest Kubernetes Architecture + PostgreSQL pooling guides |

---

### 5.5 Role 5: Data Analyst (`data-analyst` — 14 Topics)

| Topic ID | Topic Title | Relevant Approved Source | Canonical Reference URL | Coverage | Missing Knowledge / Pedagogical Gap | Recommended Next Action |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `da-top-1` | Lookup Functions & Dynamic Formula Modeling | Open Document / Python | `https://docs.python.org/3/library/csv.html` | Partial | Tabular data calculations, conditional formatting, dynamic arrays | Ingest open tabular modeling specs & Python CSV reference |
| `da-top-2` | Descriptive Statistics & Data Distributions | Python / NumPy Docs | `https://numpy.org/doc/stable/reference/routines.statistics.html` | Strong | Mean, median, mode, variance, standard deviation, skewness, percentiles | Ingest NumPy Statistics Reference & Python `statistics` docs |
| `da-top-3` | Data Extraction: SELECT, WHERE & GROUP BY | PostgreSQL Docs | `https://www.postgresql.org/docs/current/queries.html` | Strong | Projections, conditional filters, aggregation functions (COUNT, SUM) | Ingest PostgreSQL Queries & Aggregations documentation |
| `da-top-4` | Relational Joins & Set Operations | PostgreSQL Docs | `https://www.postgresql.org/docs/current/queries-table-expressions.html` | Strong | INNER, LEFT, RIGHT, FULL OUTER joins, UNION, INTERSECT, EXCEPT | Ingest PostgreSQL Table Expressions documentation |
| `da-top-5` | Window Functions & Ranking Mechanics | PostgreSQL Docs | `https://www.postgresql.org/docs/current/tutorial-window.html` | Strong | OVER(), PARTITION BY, ORDER BY, ROW_NUMBER(), RANK(), DENSE_RANK(), LAG/LEAD | Ingest PostgreSQL Window Functions tutorial & reference |
| `da-top-6` | Common Table Expressions (CTEs) & Subqueries | PostgreSQL Docs | `https://www.postgresql.org/docs/current/queries-with.html` | Strong | Non-recursive and recursive WITH clauses, modular query readability | Ingest PostgreSQL WITH Query (CTEs) documentation |
| `da-top-7` | Pandas DataFrames, Cleansing & Imputation | Pandas Official Docs | `https://pandas.pydata.org/docs/user_guide/missing_data.html` | Strong | DataFrame creation, indexing, fillna, dropna, type conversions | Ingest Pandas Missing Data & Indexing user guides |
| `da-top-8` | Exploratory Data Analysis & Visualization | Pandas / NumPy Docs | `https://pandas.pydata.org/docs/user_guide/visualization.html` | Strong | Correlation matrices, histograms, scatter plots, outlier detection | Ingest Pandas Visualization & Descriptive stats guides |
| `da-top-9` | Dimensional Modeling: Star & Snowflake Schemas | PostgreSQL Docs | `https://www.postgresql.org/docs/current/ddl-schemas.html` | Strong | Fact tables, dimension tables, surrogate keys, slowly changing dimensions | Ingest PostgreSQL Data Warehousing Schema guidelines |
| `da-top-10` | Interactive Dashboard Design & DAX Measures | W3C / PostgreSQL | `https://www.w3.org/TR/SVG2/` | Partial | Visual hierarchy, KPI cards, drill-downs. *(Proprietary BI tools avoided)* | Ingest open visualization standards + author BI metric formulas |
| `da-top-11` | SaaS & E-Commerce Core Metrics Modeling | PostgreSQL / Pandas | `https://pandas.pydata.org/docs/user_guide/timeseries.html` | Strong | ARR, MRR, Churn rate, LTV, CAC, conversion funnels | Ingest Pandas Time Series docs + author business metric queries |
| `da-top-12` | Cohort Retention Matrices & Heatmaps | Pandas Official Docs | `https://pandas.pydata.org/docs/user_guide/reshaping.html` | Strong | Pivot tables, unstack, cohort month grouping, retention percentages | Ingest Pandas Reshaping & Pivot Table user guide |
| `da-top-13` | A/B Testing Frameworks & Significance Testing | Scipy / NumPy Docs | `https://docs.python.org/3/library/statistics.html` | Strong | Null hypothesis, p-values, z-test, t-test, sample size determination | Ingest Python `statistics` + NumPy probability distribution docs |
| `da-top-14` | Metric Anomaly Diagnosis & Analytical Case Studies | Pandas / NumPy Docs | `https://pandas.pydata.org/docs/user_guide/groupby.html` | Partial | Root cause decomposition, drill-down queries, metric tree debugging | Ingest Pandas GroupBy & Aggregate docs + author case studies |

---

### 5.6 Role 6: Data Scientist (`data-scientist` — 13 Topics)

| Topic ID | Topic Title | Relevant Approved Source | Canonical Reference URL | Coverage | Missing Knowledge / Pedagogical Gap | Recommended Next Action |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `ds-top-1` | Linear Algebra: Matrices, Vectors & Eigenvalues | NumPy Official Docs | `https://numpy.org/doc/stable/reference/routines.linalg.html` | Strong | Dot products, matrix multiplication, determinants, SVD, eigenvalues | Ingest NumPy Linear Algebra reference |
| `ds-top-2` | Probability Distributions & Bayesian Inference | Python / NumPy Docs | `https://numpy.org/doc/stable/reference/random/generator.html` | Strong | Normal, Bernoulli, Poisson distributions, Bayes theorem, prior/posterior | Ingest NumPy Random Distributions & Probability docs |
| `ds-top-3` | Vectorized Computations & Matrix Operations | NumPy Official Docs | `https://numpy.org/doc/stable/user/basics.broadcasting.html` | Strong | NumPy broadcasting rules, striding, memory layout, vector operations | Ingest NumPy Broadcasting user guide |
| `ds-top-4` | Data Wrangling, Normalization & Encoding | Scikit-Learn Docs | `https://scikit-learn.org/stable/modules/preprocessing.html` | Strong | StandardScaler, MinMaxScaler, OneHotEncoder, TargetEncoder | Ingest Scikit-Learn Preprocessing Data documentation |
| `ds-top-5` | Regression Models: Linear, Ridge & Logistic | Scikit-Learn Docs | `https://scikit-learn.org/stable/modules/linear_model.html` | Strong | OLS cost function, L1/L2 regularization, log-odds, sigmoid | Ingest Scikit-Learn Generalized Linear Models docs |
| `ds-top-6` | Decision Trees, Random Forests & Gradient Boosting | Scikit-Learn Docs | `https://scikit-learn.org/stable/modules/ensemble.html` | Strong | Gini impurity, entropy, bagging, boosting, XGBoost/LightGBM mechanics | Ingest Scikit-Learn Ensemble Methods documentation |
| `ds-top-7` | Clustering Algorithms: K-Means & DBSCAN | Scikit-Learn Docs | `https://scikit-learn.org/stable/modules/clustering.html` | Strong | Centroid optimization, inertia, epsilon radius, min_samples, density | Ingest Scikit-Learn Clustering documentation |
| `ds-top-8` | Dimensionality Reduction (PCA) & Feature Pipelines | Scikit-Learn Docs | `https://scikit-learn.org/stable/modules/decomposition.html` | Strong | Principal components, explained variance ratio, Pipeline transformer | Ingest Scikit-Learn Decomposing components documentation |
| `ds-top-9` | Model Evaluation Metrics & Imbalanced Data | Scikit-Learn Docs | `https://scikit-learn.org/stable/modules/model_evaluation.html` | Strong | ROC-AUC, precision-recall curve, F1-score, SMOTE, class weights | Ingest Scikit-Learn Model Evaluation documentation |
| `ds-top-10` | Neural Networks & Backpropagation with PyTorch | PyTorch Official Docs | `https://pytorch.org/tutorials/beginner/basics/buildmodel_tutorial.html` | Strong | Tensors, autograd, loss functions, optimizers, forward/backward passes | Ingest PyTorch Deep Learning Basics tutorials |
| `ds-top-11` | Transformers, Embeddings & Modern Architectures | PyTorch Official Docs | `https://pytorch.org/docs/stable/nn.html#transformer-layers` | Strong | Scaled dot-product attention, multi-head attention, positional encoding | Ingest PyTorch Transformer Layers documentation |
| `ds-top-12` | Model Serialization & REST API Serving | Scikit-Learn / PyTorch | `https://scikit-learn.org/stable/model_persistence.html` | Strong | Joblib serialization, TorchScript, latency constraints, batched inference | Ingest Scikit-Learn Model Persistence documentation |
| `ds-top-13` | Data Drift, Concept Drift & Continuous Evaluation | Scikit-Learn / Linux | `https://scikit-learn.org/stable/modules/generated/sklearn.metrics.accuracy_score.html` | Partial | Covariate shift, Kolmogorov-Smirnov test, population stability index (PSI) | Ingest drift statistical tests + author MLOps monitoring guide |

---

### 5.7 Role 7: DevOps Engineer (`devops-engineer` — 14 Topics)

| Topic ID | Topic Title | Relevant Approved Source | Canonical Reference URL | Coverage | Missing Knowledge / Pedagogical Gap | Recommended Next Action |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `do-top-1` | Linux Filesystem, Permissions & Users | Linux Man-Pages | `https://man7.org/linux/man-pages/man7/inode.7.html` | Strong | Inodes, permissions (chmod/chown), SUID/SGID, standard directories (FHS) | Ingest Linux man-pages `inode(7)`, `chmod(2)`, `chown(2)` |
| `do-top-2` | Process Management & Systemd Service Daemons | Linux Man-Pages | `https://man7.org/linux/man-pages/man1/systemctl.1.html` | Strong | PID 1, systemd units, service lifecycle, fork/exec, signals (SIGTERM) | Ingest Linux man-pages `systemctl(1)`, `systemd.service(5)` |
| `do-top-3` | Bash Scripting & Stream Text Processing | Linux Man-Pages | `https://man7.org/linux/man-pages/man1/sed.1.html` | Strong | Variables, exit codes, pipelines, sed, awk, grep, positional parameters | Ingest Linux man-pages `bash(1)`, `sed(1)`, `awk(1)`, `grep(1)` |
| `do-top-4` | Networking Fundamentals: DNS, Subnets & Firewalls | Linux Man-Pages / RFCs | `https://man7.org/linux/man-pages/man8/iptables.8.html` | Strong | CIDR notation, subnetting, TCP/UDP sockets, DNS resolution, iptables | Ingest Linux man-pages `ip(8)`, `iptables(8)`, `resolv.conf(5)` |
| `do-top-5` | Docker Architecture & Multi-Stage Compilation | Docker Official Docs | `https://docs.docker.com/get-started/overview/` | Strong | Docker daemon, containerd, runc, Dockerfile instructions, layer caching | Ingest Docker Overview & Dockerfile reference documentation |
| `do-top-6` | Docker Compose & Container Networking | Docker Official Docs | `https://docs.docker.com/compose/` | Strong | Service definitions, bridge networks, volumes, environment variables | Ingest Docker Compose file reference & networking docs |
| `do-top-7` | GitHub Actions & Pipeline Automation | Git Docs / Docker | `https://docs.docker.com/ci-cd/github-actions/` | Partial | Workflows, jobs, steps, runners, secrets management, action syntax | Ingest Docker GitHub Actions guide + author workflow exemplars |
| `do-top-8` | Release Strategies: Rolling, Blue/Green & Canary | Kubernetes Docs | `https://kubernetes.io/docs/concepts/workloads/controllers/deployment/` | Strong | Deployment rollout, maxSurge, maxUnavailable, canary ingress traffic | Ingest Kubernetes Deployment Strategies documentation |
| `do-top-9` | Terraform Core: Providers, Resources & State | OpenTofu / Linux Docs | `https://opentofu.org/docs/intro/` | Partial | Declarative HCL, state locks, provider lifecycle. *(Terraform BSL checked)* | Ingest OpenTofu (MPL 2.0 open-source fork) documentation |
| `do-top-10` | Terraform Modules & Cloud VPC Architecture | OpenTofu / Linux Docs | `https://opentofu.org/docs/language/modules/` | Partial | Reusable modules, VPC subnets, route tables, internet gateways | Ingest OpenTofu Modules reference documentation |
| `do-top-11` | Kubernetes Architecture: Control Plane & Workloads | Kubernetes Docs | `https://kubernetes.io/docs/concepts/overview/components/` | Strong | API server, etcd, kube-scheduler, kubelet, Pods, Deployments, ReplicaSets | Ingest Kubernetes Components & Workloads documentation |
| `do-top-12` | Kubernetes Networking, Ingress & Helm Packaging | Kubernetes Docs | `https://kubernetes.io/docs/concepts/services-networking/` | Strong | ClusterIP, NodePort, LoadBalancer, Ingress controllers, Helm templates | Ingest Kubernetes Services, Ingress & Networking docs |
| `do-top-13` | Metrics & Monitoring with Prometheus & Grafana | Linux / CNCF Docs | `https://man7.org/linux/man-pages/man5/proc.5.html` | Partial | Metrics scrapers, TSDB, PromQL, alert rules, visualization dashboards | Ingest Prometheus open documentation & `/proc` metrics |
| `do-top-14` | Centralized Logging, Distributed Tracing & SRE | Linux / OWASP Docs | `https://man7.org/linux/man-pages/man8/journalctl.1.html` | Partial | Structured JSON logging, LogQL, SLO/SLI/SLA definitions, error budgets | Ingest Linux `journalctl(1)` & author SRE SLO/SLI handbook |

---

### 5.8 Role 8: Mobile App Developer (`mobile-app-developer` — 14 Topics)

| Topic ID | Topic Title | Relevant Approved Source | Canonical Reference URL | Coverage | Missing Knowledge / Pedagogical Gap | Recommended Next Action |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `mob-top-1` | Mobile Architecture: MVVM & State Streams | Android Developer Docs | `https://developer.android.com/topic/architecture` | Strong | ViewModel, LiveData/StateFlow, Repository pattern, UI state separation | Ingest Android Architecture Guide documentation |
| `mob-top-2` | Typed Languages: Null Safety & Concurrency | Swift.org / Android Docs | `https://www.swift.org/documentation/` | Strong | Coroutines, suspend functions, async/await, optional unwrapping, null safety | Ingest Swift.org Concurrency + Android Kotlin coroutines docs |
| `mob-top-3` | Declarative Layouts & Screen Density Scaling | Android Developer Docs | `https://developer.android.com/develop/ui/compose` | Strong | Jetpack Compose, Modifier chains, dp vs sp units, recomposition | Ingest Android Jetpack Compose mental model documentation |
| `mob-top-4` | Touch Gestures, Animations & Haptics | Android Developer Docs | `https://developer.android.com/develop/ui/compose/touch-input` | Strong | PointerInput, drag, swipe, spring animations, vibration feedback | Ingest Android Touch & Motion guidelines |
| `mob-top-5` | Navigation Stacks, Tab Controllers & Modals | Android Developer Docs | `https://developer.android.com/guide/navigation` | Strong | NavHost, back stack management, argument passing, safe args | Ingest Android Navigation Component documentation |
| `mob-top-6` | Universal Links & Deep Link Routing | Android Developer Docs | `https://developer.android.com/training/app-links` | Strong | App links, intent filters, assetlinks.json, deep link parameter parsing | Ingest Android Deep Linking and App Links docs |
| `mob-top-7` | Offline-First Local Persistence (Room / SQLite) | Android Developer Docs | `https://developer.android.com/training/data-storage/room` | Strong | SQLite schema, DAOs, TypeConverters, LiveData/Flow database queries | Ingest Android Room Persistence Library documentation |
| `mob-top-8` | Network Synchronization & Token Interceptors | Android Developer Docs | `https://developer.android.com/training/monitoring-device-state/connectivity-status` | Strong | Retrofit/OkHttp interceptors, exponential backoff, connectivity manager | Ingest Android Network Connectivity & sync guidelines |
| `mob-top-9` | Mobile App Lifecycle & Memory Management | Android Developer Docs | `https://developer.android.com/guide/components/activities/activity-lifecycle` | Strong | onCreate, onStart, onResume, onPause, onStop, onDestroy, process death | Ingest Android Activity & Fragment Lifecycle documentation |
| `mob-top-10` | Runtime Permissions & Push Notifications | Android Developer Docs | `https://developer.android.com/training/permissions/requesting` | Strong | Dangerous permissions, notification channels, background restrictions | Ingest Android Permissions & Notifications guides |
| `mob-top-11` | UI Rendering Performance: 60/120 FPS & Overdraw | Android Developer Docs | `https://developer.android.com/topic/performance/rendering` | Strong | Frame drops, GPU overdraw debugging, layout flattening, Systrace | Ingest Android Slow Rendering & Systrace documentation |
| `mob-top-12` | Memory Leaks & Native Profiling Tools | Android Developer Docs | `https://developer.android.com/topic/performance/memory` | Strong | Static context retention, LeakCanary, Android Studio Memory Profiler | Ingest Android Memory Allocation & Profiling docs |
| `mob-top-13` | Mobile Security: Keystore, Biometrics & SSL Pinning | OWASP / Android Docs | `https://developer.android.com/privacy-and-security/cryptography` | Strong | AndroidKeyStore, BiometricPrompt, certificate pinning, secure storage | Ingest Android Cryptography + OWASP Mobile Security Cheat Sheet |
| `mob-top-14` | CI/CD with Fastlane & App Store Publishing | Android Developer Docs | `https://developer.android.com/build/building-cmdline` | Partial | Gradle build release, ProGuard/R8 shrinking, signing key management | Ingest Android Command Line Builds & Fastlane open guides |

---

## 6. Licensing and Permission Risk Register

This register identifies key legal and architectural risks in building CareerLaunch's AI-grounded knowledge base, along with definitive preventative controls.

```
+----------------------------------------------------------------------------------------------------+
|                                LICENSING & INGESTION RISK MATRIX                                  |
+--------------------------+---------------------+-------------------+-------------------------------+
| Risk Description         | Impact Severity     | Likelihood        | Automated Prevention Control  |
+--------------------------+---------------------+-------------------+-------------------------------+
| 1. NonCommercial (NC)    | HIGH (Copyright     | HIGH              | Ingestion License Gate:       |
|    Violation             | Infringement)       | (if unvetted)     | Hard-reject CC BY-NC-SA docs  |
|                          |                     |                   | in validator before ingestion |
+--------------------------+---------------------+-------------------+-------------------------------+
| 2. Proprietary Scraping  | HIGH (Cease &       | MEDIUM            | Approved Domain Whitelist:    |
|    (Apple/Oracle)        | Desist / Lawsuit)   |                   | SSRF & crawler whitelist only |
|                          |                     |                   | permits verified open domains |
+--------------------------+---------------------+-------------------+-------------------------------+
| 3. Copyleft Contamination| MEDIUM (Viral       | MEDIUM            | In-memory RAG Architecture:   |
|    (GPLv3 text)          | licensing dispute)  |                   | Do not link code libraries;   |
|                          |                     |                   | extract verbatim citations    |
+--------------------------+---------------------+-------------------+-------------------------------+
| 4. Prompt Injection &    | HIGH (Jailbreaks &  | LOW               | Three-Level Lesson Validator: |
|    Citation Fabrication  | False Claims)       | (proven in P3)    | Validates chunk ID, URL, and  |
|                          |                     |                   | hash match against database   |
+--------------------------+---------------------+-------------------+-------------------------------+
| 5. Student PII Leakage   | HIGH (Privacy /     | LOW               | Schema Separation Barrier:    |
|    into Canonical Docs   | GDPR breach)        | (proven in P4)    | `GeneratedLesson` excludes    |
|                          |                     |                   | student records & sessions    |
+--------------------------+---------------------+-------------------+-------------------------------+
```

### Risk Details and Mitigations

#### 1. Ingestion of Non-Commercial Licensed Sources (CC BY-NC-SA)
- **Risk**: Sources like MongoDB Docs, MIT OpenCourseWare, and the Pro Git book are freely readable online but legally forbid commercial exploitation. Storing and serving lessons derived from them in a commercial SaaS application infringes copyright.
- **Mitigation Control**: The CareerLaunch ingestion pipeline explicitly evaluates the `license` field of every registered source. Sources with `CC-BY-NC-SA` or proprietary clauses are flagged as `status: 'rejected'` and blocked by the SSRF and ingestion validator.

#### 2. Proprietary Developer Documentation Infringement
- **Risk**: Apple (`developer.apple.com`) and Oracle Java documentation are published under strict proprietary licenses reserving all rights. Crawling or embedding this text directly creates direct legal liability.
- **Mitigation Control**: Reject proprietary publisher domains at the ingestion gateway. In the Mobile track, anchor all iOS language concepts to **Swift.org** (open source under Apache 2.0) and all mobile OS architecture to **Android Open Source Project** (CC-BY 4.0 / Apache 2.0).

#### 3. ShareAlike Copyleft Contamination
- **Risk**: MDN Web Docs (CC-BY-SA 2.5) and Docker Docs (CC-BY-SA 4.0) require that derivative works be shared under an identical license.
- **Mitigation Control**: CareerLaunch lessons cite grounding passages with full attribution and link to the original CC-BY-SA URLs. Code exemplars are authored independently by CareerLaunch Engineering, ensuring that platform source code remains proprietary while documentation citations honor open educational standards.

#### 4. SSRF and Unrestricted Web Crawling
- **Risk**: An automated ingestion worker might be tricked via malicious URLs into querying loopback addresses (`127.0.0.1`), cloud metadata (`169.254.169.254`), or private RFC 1918 subnets.
- **Mitigation Control**: The existing `validateSourceUrl()` utility enforces loopback blocking, RFC 1918 blocking, and domain whitelisting, as verified in the Phase 2A security test suite (`testPhase2A.js`).

---

## 7. Curriculum Gap Analysis

A comprehensive technical review of all 118 topics reveals the following structural, titular, and pedagogical gaps across the curriculum.

### 7.1 Topics Lacking Readily Available Open Documentation
1. **Interactive Dashboard Design & DAX Measures (`da-top-10`)**: DAX (Data Analysis Expressions) and Power BI are proprietary Microsoft technologies with non-open documentation.  
   *Remedy*: Reframe the technical scope around open SQL analytical data modeling and standard BI metrics, citing PostgreSQL and W3C SVG visualization standards.
2. **Apple SwiftUI and CoreData Persistence (`mob-top-7`, `mob-top-11`)**: Official Apple documentation cannot be ingested due to proprietary copyright.  
   *Remedy*: Anchor mobile persistence on Android Room/SQLite (open-source) and generalize reactive mobile architecture using Swift.org and Kotlin open references.
3. **Proprietary Cloud Console Workflows (`do-top-9`, `fs-top-11`)**: AWS, GCP, and Azure have proprietary documentation licenses.  
   *Remedy*: Base Infrastructure as Code lessons on **OpenTofu** (MPL 2.0 open-source fork of Terraform) and container deployments on standard Docker/Kubernetes documentation.

### 7.2 Overlapping and Redundant Topics
1. **Containerization & Docker Builds**:
   - `do-top-5` (Docker Architecture) vs. `fs-top-10` (Multi-Stage Docker Builds).
   - *Analysis*: Both cover Dockerfile instructions and multi-stage builds.  
   - *Recommendation*: Keep both, but specialize `fs-top-10` for full-stack Node/React bundling and `do-top-5` for Linux kernel cgroups, namespaces, and security contexts.
2. **JWT Authentication & Security**:
   - `be-top-8` (JWT Token Pairs) vs. `fs-top-7` (End-to-End JWT Auth).
   - *Analysis*: `be-top-8` focuses on backend cryptographic verification and token rotation; `fs-top-7` covers client cookie hydration and route synchronization.  
   - *Recommendation*: Maintain clear pedagogical differentiation (Backend mechanics vs Full-Stack cookie/client storage).
3. **Relational Joins & SQL Basics**:
   - `be-top-5` (Relational Schema Design) vs. `da-top-3` / `da-top-4` (SQL Extraction & Joins).
   - *Analysis*: Backend emphasizes transactional integrity and normalization (ACID, 3NF); Data Analyst emphasizes query optimization, windowing, and reporting.

### 7.3 Titular Scope Misalignments
1. **`se-top-3`: "Arrays, Strings & Two-Pointer Strategies"**:  
   *Issue*: This single topic combines arrays, string immutability, slice operations, and two-pointer algorithmic patterns.  
   *Note*: The pilot lesson `swe-top-1` successfully grounded this in NIST DADS `array.html`.
2. **`fe-top-2`: "CSS Box Model, Flexbox & Grid Systems"**:  
   *Issue*: Covering the box model, 1D flexbox, and 2D grid systems in one 8-hour module topic is dense.  
   *Recommendation*: Ensure the generated lesson explicitly splits into distinct step-by-step subsections for Box Model, Flexbox, and Grid.

---

## 8. Prioritization & Recommended First Batch (10–15 Topics)

### Priority Sequencing by Technical Role
```
+---------------------------------------------------------------------------------------+
|                              ROLE EXPANSION ROADMAP                                   |
+---------------------------------------------------------------------------------------+
| Phase 5.1: Software Engineer (Complete remaining 13 topics -> 100% track baseline)    |
| Phase 5.2: Frontend Developer (17 topics -> MDN, W3C, React documentation)           |
| Phase 5.3: Backend Developer (15 topics -> Node.js, PostgreSQL, OWASP)                |
| Phase 5.4: DevOps Engineer (14 topics -> Linux Man-Pages, Docker, Kubernetes)         |
| Phase 5.5: Data Analyst (14 topics -> PostgreSQL, NumPy, Pandas)                     |
| Phase 5.6: Data Scientist (13 topics -> Scikit-Learn, PyTorch, NumPy)                 |
| Phase 5.7: Full Stack Developer (13 topics -> React, Express, Docker integration)     |
| Phase 5.8: Mobile App Developer (14 topics -> Android Open Source, Swift.org)         |
+---------------------------------------------------------------------------------------+
```

### Recommended Batch 1: Top 12 Priority Expansion Topics

The following 12 topics represent the most critical, high-impact lessons for immediate expansion. Each topic has **strong approved open-source documentation**, zero copyright risk, and immediate relevance for technical interview preparation.

| # | Role | Topic ID | Topic Title | Approved Knowledge Source | Key Rationale for Immediate Generation |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | `software-engineer` | `se-top-2` | Asymptotic Analysis & Big-O Notation | NIST DADS (`bigO.html`) | Foundational prerequisite for all algorithmic complexity analysis in technical interviews. |
| **2** | `software-engineer` | `se-top-4` | Linked Lists: Singly, Doubly & Circular | NIST DADS (`linkedList.html`) | Core data structure required for pointer manipulation and memory tracking interview questions. |
| **3** | `software-engineer` | `se-top-5` | Stacks, Queues & Monotonic Variants | NIST DADS (`stack.html`, `queue.html`) | Fundamental LIFO/FIFO mechanics used in bracket matching, sliding window, and expression parsing. |
| **4** | `software-engineer` | `se-top-6` | Binary Trees & Traversal Algorithms | NIST DADS (`binaryTree.html`) | Completes tree foundation leading directly into existing pilot lesson `swe-top-7` (BSTs). |
| **5** | `software-engineer` | `se-top-8` | Heaps & Priority Queues | NIST DADS (`heap.html`) | Essential for Top-K elements, Dijkstra, and real-time streaming medians. |
| **6** | `software-engineer` | `se-top-10` | Topological Sort & Shortest Paths (Dijkstra) | NIST DADS (`topologicalSort.html`) | Direct progression from existing pilot lesson `swe-top-9` (Graph Traversals & Cycles). |
| **7** | `frontend-developer` | `fe-top-1` | Semantic Markup & Accessibility Outlines | W3C HTML5 & MDN | Crucial for web accessibility standards (WCAG) and modern semantic web architecture. |
| **8** | `frontend-developer` | `fe-top-4` | Execution Context, Scopes & Closures | MDN JavaScript Docs | Top screened JavaScript core language concept in entry and mid-level frontend interviews. |
| **9** | `frontend-developer` | `fe-top-7` | JSX Compilation, Virtual DOM & Reconciliation | React Official Docs (CC-BY 4.0) | Foundational mental model for modern React development and component lifecycle debugging. |
| **10**| `backend-developer` | `be-top-1` | Node.js Event Loop & Non-Blocking I/O | Node.js Official Docs (CC-BY 4.0) | Definitive concept for backend engineering, high-concurrency systems, and async execution. |
| **11**| `backend-developer` | `be-top-5` | Relational Schema Design & ACID Transactions | PostgreSQL Official Docs | Essential relational database fundamentals, normalization, and transactional consistency. |
| **12**| `devops-engineer` | `do-top-5` | Docker Architecture & Multi-Stage Compilation | Docker Docs (CC-BY-SA 4.0) | Industry-standard containerization foundation, layer caching, and production image reduction. |

---

## 9. Technical and Licensing Safeguards

To maintain system integrity, CareerLaunch enforces the following non-negotiable architectural invariants:

1. **AI Generation Isolation**: Groq (`openai/gpt-oss-120b`) serves as the dedicated lesson text generation provider. Embeddings remain isolated and handled separately by vector indexing.
2. **Provenance Preservation**: Every generated lesson record MUST contain:
   - `sourceSnapshotHashes`: SHA-256 hash of the ingested text snapshot.
   - `retrievedChunkIds`: Exact MongoDB chunk identifiers providing grounding evidence.
   - `references`: Array of canonical URLs, titles, and section names.
3. **Student Privacy Air-Gap**: The `GeneratedLesson` collection is global and canonical. It contains zero references to student profiles, session tokens, or personal identifiers.
4. **Three-Level Evidence Validation**:
   - *Level 1 (Citation Verification)*: Cited chunks must exist in MongoDB, match snapshot hashes, and link to approved non-flagged sources.
   - *Level 2 (Attribution Enforcement)*: Algorithmic code exemplars authored by CareerLaunch MUST be attributed to `CareerLaunch Engineering`. Third-party sources must not be falsely credited with CareerLaunch code.
   - *Level 3 (Syntactic Integrity)*: Generated code blocks must pass syntax linting and structure checks before lesson persistence.
5. **Security Gateways**:
   - Strict SSRF defense on all ingestion endpoints (blocks `127.0.0.1`, `169.254.169.254`, and private networks).
   - Rate limiting on administrative generation endpoints.
   - Mandatory Firebase Admin authentication and authorization for ingestion and generation triggers.

---

## 10. Official Sources & Licensing Evidence Directory

| Organization / Project | Resource Name | Canonical Documentation URL | Verified Licensing URL | Verified License Type |
| :--- | :--- | :--- | :--- | :--- |
| **U.S. NIST** | Dictionary of Algorithms and Data Structures | `https://xlinux.nist.gov/dads/` | `https://www.nist.gov/director/licensing` | U.S. Government Work / Public Domain |
| **Mozilla / Open Web Docs** | MDN Web Docs | `https://developer.mozilla.org/` | `https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Licensing_faq` | CC-BY-SA 2.5 / CC0 (Code) |
| **W3C** | World Wide Web Consortium Technical Reports | `https://www.w3.org/TR/` | `https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document` | W3C Document License |
| **Meta / React** | React Documentation | `https://react.dev/` | `https://github.com/reactjs/react.dev/blob/main/LICENSE.md` | CC-BY 4.0 / MIT (Code) |
| **OpenJS Foundation** | Node.js API Documentation | `https://nodejs.org/api/` | `https://github.com/nodejs/node/blob/main/LICENSE` | CC-BY 4.0 / MIT (Code) |
| **PostgreSQL GDG** | PostgreSQL Documentation | `https://www.postgresql.org/docs/` | `https://www.postgresql.org/about/licence/` | PostgreSQL Licence (Permissive) |
| **Python Software Foundation** | Python Documentation | `https://docs.python.org/3/` | `https://docs.python.org/3/license.html` | PSF License Agreement v2 / 0BSD |
| **CNCF / Linux Foundation** | Kubernetes Documentation | `https://kubernetes.io/docs/` | `https://github.com/kubernetes/website/blob/main/LICENSE` | CC-BY 4.0 / Apache 2.0 |
| **Docker Inc.** | Docker Documentation | `https://docs.docker.com/` | `https://github.com/docker/docs/blob/main/LICENSE` | CC-BY-SA 4.0 / Apache 2.0 |
| **OWASP Foundation** | OWASP Top 10 & Cheat Sheets | `https://owasp.org/` | `https://owasp.org/www-project-top-ten/` | CC-BY-SA 4.0 |
| **Google / AOSP** | Android Developer Documentation | `https://developer.android.com/` | `https://developer.android.com/license` | CC-BY 4.0 / Apache 2.0 |
| **NumFOCUS** | NumPy Documentation | `https://numpy.org/doc/` | `https://github.com/numpy/numpy/blob/main/LICENSE.txt` | BSD 3-Clause |
| **NumFOCUS** | Pandas Documentation | `https://pandas.pydata.org/docs/` | `https://github.com/pandas-dev/pandas/blob/main/LICENSE` | BSD 3-Clause |
| **Inria / NumFOCUS** | Scikit-Learn Documentation | `https://scikit-learn.org/` | `https://github.com/scikit-learn/scikit-learn/blob/main/COPYING` | BSD 3-Clause |
| **The Linux Foundation** | PyTorch Documentation | `https://pytorch.org/docs/` | `https://github.com/pytorch/pytorch/blob/main/LICENSE` | BSD-3-Clause |
| **Apache Foundation** | Apache Spark Documentation | `https://spark.apache.org/` | `https://www.apache.org/licenses/LICENSE-2.0` | Apache License 2.0 |
| **Linux Man-Pages** | Linux Programmer's Manual | `https://man7.org/linux/man-pages/`| `https://man7.org/linux/man-pages/man7/man-pages.7.html` | BSD / MIT / Permissive |
| **OpenTofu / Linux Foundation**| OpenTofu Documentation | `https://opentofu.org/docs/` | `https://github.com/opentofu/opentofu/blob/main/LICENSE` | Mozilla Public License 2.0 (MPL 2.0)|
| **Swift Project / Apple** | Swift Language Documentation | `https://www.swift.org/documentation/`| `https://www.swift.org/about/#license` | Apache License 2.0 with Runtime Exception|

---

## 11. Unresolved Policy & Legal Questions Requiring Human Review

Before proceeding to Phase 5.1 ingestion and lesson generation, the following questions are submitted for human executive and legal review:

1. **CC-BY-SA ShareAlike Downstream Policy**: MDN Web Docs, Docker Docs, and OWASP use ShareAlike licenses (CC-BY-SA). While extracting factual grounding passages and quoting short text segments with attribution complies with fair use and educational citation standards, should CareerLaunch explicitly publish all student-facing generated text under CC-BY-SA 4.0 to guarantee complete licensing symmetry?
2. **Alternative for MongoDB Document Storage Ingestion**: Because official MongoDB documentation carries a NonCommercial (CC BY-NC-SA 3.0) restriction, CareerLaunch cannot ingest it directly. Should CareerLaunch:
   - Settle on **PostgreSQL JSONB / Document specification** documentation as the primary canonical open reference for document modeling?
   - Or license official educational content directly from MongoDB Inc.?
3. **Mobile Track iOS Scope**: Because `developer.apple.com` is strictly proprietary and forbidden from ingestion, the Mobile track cannot cite Apple's official documentation. Should CareerLaunch:
   - Formally designate **Android Open Source Project (AOSP)** and **Swift.org** as the sole permitted open knowledge foundations for Mobile?
   - Or authorize custom staff-authored reference documents for SwiftUI and CoreData?
4. **Git Manual vs Pro Git**: The *Pro Git* book is licensed under CC BY-NC-SA 3.0 and must be excluded. The core Git CLI manpages are GPLv2. Does the legal team approve using Git GPLv2 manpages for command-line grounding citations?

---

## STOP CONDITION

Phase 5.0 (Audit and Foundation Research) is complete.  
No code, database records, roadmaps, or lessons have been modified.  
Awaiting explicit review and approval before proceeding to Phase 5.1.
