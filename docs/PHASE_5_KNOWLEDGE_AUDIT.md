# CAREERLAUNCH — PHASE 5.0.1: TRUSTED KNOWLEDGE FOUNDATION & SOFTWARE ENGINEER EXPANSION PLAN

**Audit Date**: `2026-11-08`  
**Revision**: `Phase 5.0.1 (Refined Audit & Phased SWE Expansion Specification)`  
**Status**: `RESEARCH & AUDIT ONLY — STRICTLY ZERO IMPLEMENTATION / ZERO INGESTION`  
**Governing Standard**: Production Knowledge Ingestion, Verification, and Commercial Licensing Compliance Standard  

---

## 1. Executive Summary

This refined audit establishes the formal knowledge foundation, commercial licensing governance, and Software Engineer expansion roadmap for CareerLaunch. CareerLaunch currently maintains eight technical role roadmaps comprising 56 modules and 118 learning topics. 

To date, exactly five pilot topics in the **Software Engineer** roadmap have been generated using the Groq API (`openai/gpt-oss-120b`), verified through a three-level evidence-grounding validator, and rendered on student-facing pages. All five pilot lessons are strictly grounded in public domain U.S. Government works from the **National Institute of Standards and Technology (NIST) Dictionary of Algorithms and Data Structures (DADS)**.

### Key Refinements in Phase 5.0.1
1. **Curriculum Reconciliation**: The Software Engineer curriculum contains exactly **18 topics** across 7 modules. Exactly 5 topics are active pilot lessons (`se-top-3`/`swe-top-1`, `swe-top-4`, `se-top-7`/`swe-top-7`, `se-top-9`/`swe-top-9`, `se-top-12`/`swe-top-13`), and exactly **13 topics** are pending generation. Historical alias mappings between `se-top-*` and `swe-top-*` are fully verified and documented.
2. **Phase 5.1 Sole Focus on Software Engineer**: The first expansion will focus **exclusively on the 13 remaining Software Engineer topics**. Frontend, Backend, DevOps, Data Analyst, Data Scientist, Full Stack, and Mobile roles are excluded from Phase 5.1 and scheduled for subsequent phases.
3. **Phased Batch Structure (3–5 Topics/Batch)**: The 13 remaining SWE topics are partitioned into three logically sequenced batches based on placement interview frequency, technical dependencies, and approved public domain NIST / Linux man-page availability:
   - **Batch 1 (Core Data Structures & Complexity)**: 4 topics (`se-top-2`, `se-top-4`, `se-top-5`, `se-top-6`)
   - **Batch 2 (Advanced Algorithms, Graphs & Memory)**: 4 topics (`se-top-8`, `se-top-10`, `se-top-11`, `se-top-1`)
   - **Batch 3 (Operating Systems, Networking & Systems Design)**: 5 topics (`se-top-13`, `se-top-14`, `se-top-15`, `se-top-16`, `se-top-17`)
4. **Conditional Classification for CC BY-SA Sources**: **MDN Web Docs**, **Docker Documentation**, and **OWASP Projects** are classified as **CONDITIONAL** and kept out of the default approved production registry. Because CC BY-SA contains a ShareAlike copyleft provision, formal legal review is required to determine whether AI-synthesized lesson summaries constitute "Adapted Material" that would mandate open-licensing of the entire generated lesson.
5. **MongoDB Knowledge Sourcing Strategy**: Clarified that **PostgreSQL JSONB is NOT a replacement for MongoDB**. The strategy separates general document database theory, JSON standards, PostgreSQL JSONB implementations, and MongoDB-specific operational mechanics. MongoDB official documentation remains **REJECTED** due to its CC BY-NC-SA 3.0 (NonCommercial) license; vendor-specific topics will be supported via open Apache 2.0 driver specifications and CareerLaunch-authored exemplars.
6. **Mobile Knowledge Sourcing Strategy**: The mobile curriculum is partitioned into **Swift Language Fundamentals** (Swift.org under Apache 2.0 — Approved), **iOS Platform Development** (Apple Developer Docs — Rejected/Excluded as Proprietary), **Android Development** (AOSP under CC-BY 4.0 / Apache 2.0 — Approved), and **Cross-Platform Development** (React Native / Flutter — Approved).

---

## 2. Verified Software Engineer Curriculum Inventory

The Software Engineer curriculum defined in [`src/data/interviewRoadmaps.js`](file:///c:/Users/Tripti%20Dhawan/OneDrive/Desktop/CareerLaunch/src/data/interviewRoadmaps.js) consists of **18 topics across 7 modules** organized into three difficulty levels.

### 2.1 Complete 18-Topic Software Engineer Inventory

| # | Module ID | Topic ID | Exact Topic Title | Canonical Pilot Mapping | Availability Status | Pilot Status | Primary Approved Source |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **1** | `se-mod-1` | `se-top-1` | Memory Architecture: Stack, Heap & Pointers | *None* | `Unavailable` | Remaining (Batch 2) | Linux Man-Pages (`malloc.3`, `mmap.2`) |
| **2** | `se-mod-1` | `se-top-2` | Asymptotic Analysis & Big-O Notation | *None* | `Unavailable` | Remaining (Batch 1) | NIST DADS (`bigO.html`) |
| **3** | `se-mod-2` | `se-top-3` | Arrays, Strings & Two-Pointer Strategies | `swe-top-1` | **`Available`** | **Pilot Lesson 1** | NIST DADS (`array.html`) |
| **4** | `se-mod-2` | `swe-top-4` | Binary Search Mechanics and Interval Bisection | `swe-top-4` | **`Available`** | **Pilot Lesson 2** | NIST DADS (`binarySearch.html`) |
| **5** | `se-mod-2` | `se-top-4` | Linked Lists: Singly, Doubly & Circular | *None* | `Unavailable` | Remaining (Batch 1) | NIST DADS (`linkedList.html`) |
| **6** | `se-mod-2` | `se-top-5` | Stacks, Queues & Monotonic Variants | *None* | `Unavailable` | Remaining (Batch 1) | NIST DADS (`stack.html`, `queue.html`) |
| **7** | `se-mod-3` | `se-top-6` | Binary Trees & Traversal Algorithms | *None* | `Unavailable` | Remaining (Batch 1) | NIST DADS (`binaryTree.html`) |
| **8** | `se-mod-3` | `se-top-7` | Binary Search Trees & Balanced Trees | `swe-top-7` | **`Available`** | **Pilot Lesson 3** | NIST DADS (`binarySearchTree.html`) |
| **9** | `se-mod-3` | `se-top-8` | Heaps & Priority Queues | *None* | `Unavailable` | Remaining (Batch 2) | NIST DADS (`heap.html`) |
| **10**| `se-mod-4` | `se-top-9` | Graph Representations, BFS & DFS | `swe-top-9` | **`Available`** | **Pilot Lesson 4** | NIST DADS (`cycle.html`) |
| **11**| `se-mod-4` | `se-top-10`| Topological Sort & Shortest Paths | *None* | `Unavailable` | Remaining (Batch 2) | NIST DADS (`topologicalSort.html`) |
| **12**| `se-mod-5` | `se-top-11`| Recursion & Backtracking Strategies | *None* | `Unavailable` | Remaining (Batch 2) | NIST DADS (`backtracking.html`) |
| **13**| `se-mod-5` | `se-top-12`| Dynamic Programming: 1D & 2D Tabulation | `swe-top-13` | **`Available`** | **Pilot Lesson 5** | NIST DADS (`dynamicProgramming.html`) |
| **14**| `se-mod-6` | `se-top-13`| Processes, Threads & Synchronization | *None* | `Unavailable` | Remaining (Batch 3) | Linux Man-Pages (`pthreads.7`, `clone.2`) |
| **15**| `se-mod-6` | `se-top-14`| Virtual Memory, Paging & Storage | *None* | `Unavailable` | Remaining (Batch 3) | Linux Man-Pages (`mmap.2`, `mprotect.2`) |
| **16**| `se-mod-6` | `se-top-15`| Computer Networking: OSI, TCP/IP & HTTP | *None* | `Unavailable` | Remaining (Batch 3) | Linux Man-Pages (`tcp.7`, `socket.2`) |
| **17**| `se-mod-7` | `se-top-16`| Object-Oriented Design Patterns (GoF) | *None* | `Unavailable` | Remaining (Batch 3) | Python Docs / W3C Standards |
| **18**| `se-mod-7` | `se-top-17`| High-Level System Design & Scalability | *None* | `Unavailable` | Remaining (Batch 3) | PostgreSQL HA / Linux Docs |

---

### 2.2 Reconciliation of Historical Topic ID Discrepancies

During Phases 2A through 4.1, a historical divergence arose between the pilot ingestion script identifiers and the frontend roadmap taxonomy. This audit verifies the exact reconciliation implemented in `server/src/controllers/lessonController.js`:

```javascript
const ROADMAP_TO_CANONICAL_PILOT_MAP = {
  'se-top-3': 'swe-top-1',    // Roadmap Arrays topic -> Pilot Lesson 1
  'swe-top-1': 'swe-top-1',
  'swe-top-4': 'swe-top-4',    // Identical across roadmap and pilot
  'se-top-7': 'swe-top-7',    // Roadmap BST topic -> Pilot Lesson 3
  'swe-top-7': 'swe-top-7',
  'se-top-9': 'swe-top-9',    // Roadmap Graphs topic -> Pilot Lesson 4
  'swe-top-9': 'swe-top-9',
  'se-top-12': 'swe-top-13',  // Roadmap Dynamic Programming topic -> Pilot Lesson 5
  'swe-top-13': 'swe-top-13',
}
```

1. **`swe-top-4`** was inserted directly into the roadmap with its canonical pilot ID.
2. The remaining four pilot lessons (`swe-top-1`, `swe-top-7`, `swe-top-9`, `swe-top-13`) correspond to roadmap IDs `se-top-3`, `se-top-7`, `se-top-9`, and `se-top-12`.
3. In Phase 5.1, all 13 remaining topics will be authored using their canonical roadmap IDs (`se-top-1`, `se-top-2`, `se-top-4`, `se-top-5`, `se-top-6`, `se-top-8`, `se-top-10`, `se-top-11`, `se-top-13`, `se-top-14`, `se-top-15`, `se-top-16`, `se-top-17`) to eliminate aliasing overhead.

---

## 3. Five Pilot Lessons Audit

The five canonical lessons stored in MongoDB (`mongodb://127.0.0.1:27018/careerlaunch`) remain intact, valid, and unmodified:

```text
Database: careerlaunch (Port 27018)
Collection: generatedlessons
Document Count: 5
AI Generation Provider: groq
AI Generation Model: openai/gpt-oss-120b
Validation Status: passed (100%)
```

| Canonical Topic ID | Stored Lesson ID | Exact Title | Source Canonical URL | Chunk Identifier | Token Usage (Prompt / Compl / Total) | Generated Date |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `swe-top-1` | `lesson_software-engineer_swe-top-1_beginner` | Arrays and Two-Pointer Scanning Mechanics | `https://xlinux.nist.gov/dads/HTML/array.html` | `doc_nist-dads_5049a48a20fa_chk_001` | 1,199 / 2,106 / 3,305 | 2026-11-05 23:11 IST |
| `swe-top-4` | `lesson_software-engineer_swe-top-4_beginner` | Binary Search Mechanics and Interval Bisection | `https://xlinux.nist.gov/dads/HTML/binarySearch.html` | `doc_nist-dads_4314b2703ab7_chk_001` | 1,177 / 2,021 / 3,198 | 2026-11-05 23:11 IST |
| `swe-top-7` | `lesson_software-engineer_swe-top-7_intermediate` | Binary Search Trees, Invariants and Balancing | `https://xlinux.nist.gov/dads/HTML/binarySearchTree.html` | `doc_nist-dads_50ab0de92398_chk_001` | 1,191 / 1,914 / 3,105 | 2026-11-05 23:11 IST |
| `swe-top-9` | `lesson_software-engineer_swe-top-9_intermediate` | Graph Traversals: BFS, DFS and Cycle Detection | `https://xlinux.nist.gov/dads/HTML/cycle.html` | `doc_nist-dads_77e79b563a21_chk_001` | 1,212 / 2,569 / 3,781 | 2026-11-05 23:11 IST |
| `swe-top-13`| `lesson_software-engineer_swe-top-13_advanced` | Dynamic Programming: Optimal Substructure and Memoization | `https://xlinux.nist.gov/dads/HTML/dynamicProgramming.html` | `doc_nist-dads_e5e48de67b02_chk_001` | 1,190 / 2,279 / 3,469 | 2026-11-05 23:11 IST |

---

## 4. Software Engineer Expansion Plan (Phase 5.1 Exclusive Focus)

In accordance with user directives, **Phase 5.1 focuses exclusively on completing the 13 remaining Software Engineer topics**. This achieves a 100% complete Software Engineer curriculum track before expanding to other disciplines.

### 4.1 Prioritization Methodology
The 13 topics were prioritized using a weighted index across five criteria:
1. **Placement Interview Relevance (30%)**: Frequency of testing in campus, entry-level, and SDE-1 screening rounds.
2. **Technical Importance (25%)**: Foundational dependency for subsequent advanced computer science topics.
3. **Availability of Approved Open Sources (20%)**: Availability of public domain NIST DADS or Linux man-pages requiring zero licensing negotiation.
4. **Source Quality & Depth (15%)**: Rigor and canonical clarity of algorithmic definitions and invariants.
5. **Estimated Ingestion Effort (10%)**: Simplicity of chunk extraction, sanitization, and exemplar authoring.

---

### 4.2 Proposed Phased Batch Structure (3–5 Topics per Batch)

```
+--------------------------------------------------------------------------------------------------+
|                           PHASE 5.1 SOFTWARE ENGINEER BATCH ROADMAP                              |
+--------------------------------------------------------------------------------------------------+
| BATCH 1 (Core Data Structures & Complexity)   -> se-top-2, se-top-4, se-top-5, se-top-6 (4 topics)|
| BATCH 2 (Advanced Algorithms, Graphs & Memory)-> se-top-8, se-top-10, se-top-11, se-top-1 (4 topics)|
| BATCH 3 (Operating Systems, Net & System Des) -> se-top-13, se-top-14, se-top-15,                |
|                                                  se-top-16, se-top-17                    (5 topics)|
+--------------------------------------------------------------------------------------------------+
```

#### Batch 1: Core Data Structures & Complexity (Immediate Priority — 4 Topics)
*Goal: Complete essential linear data structures and complexity foundations required for entry-level screening.*

1. **`se-top-2`: Asymptotic Analysis & Big-O Notation** (`se-mod-1`)
   - *Interview Relevance*: Universal. Asked in every technical interview to evaluate time/space trade-offs.
   - *Source*: NIST DADS (`bigO.html`, `bigOmega.html`, `bigTheta.html`) — Public Domain.
   - *Ingestion Effort*: Low. Formal mathematical definitions and complexity classifications.
2. **`se-top-4`: Linked Lists: Singly, Doubly & Circular** (`se-mod-2`)
   - *Interview Relevance*: Extremely high. Pointer manipulation, cycle detection (Floyd's algorithm), and list reversals.
   - *Source*: NIST DADS (`linkedList.html`, `doublyLinkedList.html`, `circularList.html`) — Public Domain.
   - *Ingestion Effort*: Low. Structural invariants and operations.
3. **`se-top-5`: Stacks, Queues & Monotonic Variants** (`se-mod-2`)
   - *Interview Relevance*: High. Parentheses validation, monotonic stack for next greater element, queue breadth tracking.
   - *Source*: NIST DADS (`stack.html`, `queue.html`, `priorityQueue.html`) — Public Domain.
   - *Ingestion Effort*: Low. LIFO/FIFO definitions and invariant checks.
4. **`se-top-6`: Binary Trees & Traversal Algorithms** (`se-mod-3`)
   - *Interview Relevance*: Extremely high. Pre-order, in-order, post-order, and level-order traversals. Directly leads into existing pilot lesson `swe-top-7` (BSTs).
   - *Source*: NIST DADS (`binaryTree.html`, `treeTraversal.html`) — Public Domain.
   - *Ingestion Effort*: Low. Standard tree hierarchy and traversal definitions.

#### Batch 2: Advanced Algorithms, Graphs & Memory (Intermediate Priority — 4 Topics)
*Goal: Expand non-linear data structures, backtracking, graph paths, and low-level memory allocation.*

5. **`se-top-8`: Heaps & Priority Queues** (`se-mod-3`)
   - *Interview Relevance*: High. Top-K elements, k-way stream merging, median tracking.
   - *Source*: NIST DADS (`heap.html`, `binaryHeap.html`) — Public Domain.
   - *Ingestion Effort*: Low. Sift-up/sift-down and complete binary tree invariants.
6. **`se-top-10`: Topological Sort & Shortest Paths** (`se-mod-4`)
   - *Interview Relevance*: High. Dependency resolution (Kahn's algorithm, Course Schedule) and Dijkstra's algorithm. Follows pilot lesson `swe-top-9` (Cycles).
   - *Source*: NIST DADS (`topologicalSort.html`, `dijkstra.html`) — Public Domain.
   - *Ingestion Effort*: Medium. Invariants and edge relaxation rules.
7. **`se-top-11`: Recursion & Backtracking Strategies** (`se-mod-5`)
   - *Interview Relevance*: High. Combinatorial search, N-Queens, subset generation, and state-space tree pruning. Followed by pilot lesson `swe-top-13` (DP).
   - *Source*: NIST DADS (`backtracking.html`, `recursion.html`) + Python Docs — Public Domain / PSF.
   - *Ingestion Effort*: Medium. Recursion depth limits and state rollback patterns.
8. **`se-top-1`: Memory Architecture: Stack, Heap & Pointers** (`se-mod-1`)
   - *Interview Relevance*: Medium-High. Critical for systems engineering, C/C++/Rust roles, understanding memory leaks, and stack vs heap allocation.
   - *Source*: Linux Man-Pages (`malloc.3`, `brk.2`, `mmap.2`) — Permissive.
   - *Ingestion Effort*: Medium. Memory segment layouts and pointer semantics.

#### Batch 3: Operating Systems, Networking & Systems Design (Advanced Priority — 5 Topics)
*Goal: Complete Level 3 advanced systems architecture, concurrency, networking, and design patterns.*

9. **`se-top-13`: Processes, Threads & Synchronization** (`se-mod-6`)
   - *Interview Relevance*: Standard for systems and backend SWE roles. Mutex, semaphores, race conditions, deadlock conditions.
   - *Source*: Linux Man-Pages (`pthreads.7`, `clone.2`, `sem_overview.7`) — Permissive.
   - *Ingestion Effort*: Medium. POSIX thread lifecycle and synchronization primitives.
10. **`se-top-14`: Virtual Memory, Paging & Storage** (`se-mod-6`)
    - *Interview Relevance*: Core OS questions: page tables, TLB, page faults, swapping, thrashing.
    - *Source*: Linux Man-Pages (`mmap.2`, `mprotect.2`, `getpagesize.2`) — Permissive.
    - *Ingestion Effort*: Medium. Virtual address translation and protection flags.
11. **`se-top-15`: Computer Networking: OSI, TCP/IP & HTTP** (`se-mod-6`)
    - *Interview Relevance*: High screening frequency. TCP three-way handshake, TCP vs UDP, DNS lifecycle, HTTP/1.1 vs HTTP/2 vs HTTP/3.
    - *Source*: Linux Man-Pages (`tcp.7`, `socket.2`, `ip.7`) + IETF RFC standards — Public Domain.
    - *Ingestion Effort*: Medium. Protocol headers and state transitions.
12. **`se-top-16`: Object-Oriented Design Patterns (GoF)** (`se-mod-7`)
    - *Interview Relevance*: Low-Level Design (LLD) interviews. Creational (Factory, Singleton), Structural (Adapter, Decorator), Behavioral (Strategy, Observer).
    - *Source*: Python Object Model Documentation (`docs.python.org`) + NIST specifications — PSF / Public Domain.
    - *Ingestion Effort*: Medium. Interface abstraction and compositional patterns.
13. **`se-top-17`: High-Level System Design & Scalability** (`se-mod-7`)
    - *Interview Relevance*: Mid-to-senior SWE interview requirement. Load balancing, database sharding, caching strategies, CAP theorem.
    - *Source*: PostgreSQL High-Availability Documentation + Linux Man-Pages — PostgreSQL License / Permissive.
    - *Ingestion Effort*: High. Distributed architecture trade-offs.

---

## 5. Refined Licensing Decisions & CC BY-SA Analysis

### 5.1 Updated Source Approval Registry

| Source Name | Official URL | Publisher | Relevant Roles | Exact Licence | Commercial Use | Storage & Indexing | Decision | Evidence URL |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **NIST DADS** | `https://xlinux.nist.gov/dads/` | NIST (U.S. Govt) | `software-engineer` | U.S. Govt Work (17 U.S.C. § 105) | **Allowed** | **Allowed** | **APPROVED** | [NIST Licensing](https://www.nist.gov/director/licensing) |
| **Linux Man-Pages** | `https://man7.org/linux/man-pages/` | Linux Foundation | `software-engineer`, `devops`, `backend` | Permissive (BSD / MIT / Public Domain) | **Allowed** | **Allowed** | **APPROVED** | [Linux Man-Pages](https://man7.org/linux/man-pages/man7/man-pages.7.html) |
| **Python Official Docs** | `https://docs.python.org/3/` | PSF | `software-engineer`, `backend`, `data-analyst`, `data-scientist` | PSF License Agreement v2 / 0BSD | **Allowed** | **Allowed** | **APPROVED** | [Python License](https://docs.python.org/3/license.html) |
| **PostgreSQL Docs** | `https://www.postgresql.org/docs/` | PostgreSQL GDG | `backend`, `data-analyst`, `fullstack`, `software-engineer` | PostgreSQL Licence (Liberal MIT/BSD style) | **Allowed** | **Allowed** | **APPROVED** | [PostgreSQL Licence](https://www.postgresql.org/about/licence/) |
| **W3C Specifications** | `https://www.w3.org/TR/` | W3C | `frontend`, `fullstack` | W3C Document License (Permissive) | **Allowed** | **Allowed** | **APPROVED** | [W3C Document License](https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document) |
| **React Official Docs** | `https://react.dev/` | Meta Platforms | `frontend`, `fullstack` | Text: CC-BY 4.0; Code: MIT | **Allowed** | **Allowed** | **APPROVED** | [React License](https://github.com/reactjs/react.dev/blob/main/LICENSE.md) |
| **Node.js API Docs** | `https://nodejs.org/api/` | OpenJS Foundation | `backend`, `fullstack` | Text: CC-BY 4.0; Code: MIT | **Allowed** | **Allowed** | **APPROVED** | [Node.js License](https://github.com/nodejs/node/blob/main/LICENSE) |
| **Kubernetes Docs** | `https://kubernetes.io/docs/` | CNCF / Linux Fdn | `devops`, `backend` | Text: CC-BY 4.0; Code: Apache 2.0 | **Allowed** | **Allowed** | **APPROVED** | [Kubernetes License](https://github.com/kubernetes/website/blob/main/LICENSE) |
| **Android Developer Docs**| `https://developer.android.com/` | Google / AOSP | `mobile-app-developer` | Text: CC-BY 4.0; Code: Apache 2.0 | **Allowed** | **Allowed** | **APPROVED** | [Android License](https://developer.android.com/license) |
| **NumPy & Pandas Docs** | `https://pandas.pydata.org/docs/` | NumFOCUS | `data-analyst`, `data-scientist` | BSD 3-Clause License | **Allowed** | **Allowed** | **APPROVED** | [Pandas License](https://github.com/pandas-dev/pandas/blob/main/LICENSE) |
| **Scikit-Learn Docs** | `https://scikit-learn.org/` | Inria / NumFOCUS | `data-scientist` | BSD 3-Clause License | **Allowed** | **Allowed** | **APPROVED** | [Scikit-Learn License](https://github.com/scikit-learn/scikit-learn/blob/main/COPYING) |
| **PyTorch Documentation** | `https://pytorch.org/docs/` | PyTorch Fdn | `data-scientist` | Modified BSD 3-Clause | **Allowed** | **Allowed** | **APPROVED** | [PyTorch License](https://github.com/pytorch/pytorch/blob/main/LICENSE) |
| **Swift.org Docs** | `https://www.swift.org/documentation/` | Swift Project | `mobile-app-developer` | Apache 2.0 with Runtime Exception | **Allowed** | **Allowed** | **APPROVED** | [Swift.org License](https://www.swift.org/about/#license) |
| **MDN Web Docs** | `https://developer.mozilla.org/` | Mozilla / OWD | `frontend`, `fullstack` | Text: CC-BY-SA 2.5/4.0; Code: CC0 | **Allowed** | **Allowed** | **CONDITIONAL** | [MDN Licensing](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Licensing_faq) |
| **Docker Documentation** | `https://docs.docker.com/` | Docker Inc. | `devops`, `fullstack` | Text: CC-BY-SA 4.0; Code: Apache 2.0 | **Allowed** | **Allowed** | **CONDITIONAL** | [Docker Docs License](https://github.com/docker/docs/blob/main/LICENSE) |
| **OWASP Foundation** | `https://owasp.org/` | OWASP Fdn | `backend`, `fullstack`, `devops`, `mobile` | CC-BY-SA 4.0 | **Allowed** | **Allowed** | **CONDITIONAL** | [OWASP License](https://owasp.org/www-project-top-ten/) |
| **Git Core Manpages** | `https://git-scm.com/docs` | Git Community | `devops`, `software-engineer` | GNU General Public License v2 (GPLv2) | **Allowed** | **Allowed** | **CONDITIONAL** | [Git COPYING](https://github.com/git/git/blob/master/COPYING) |
| **MongoDB Official Docs** | `https://www.mongodb.com/docs/` | MongoDB Inc. | `backend`, `fullstack` | CC BY-NC-SA 3.0 (NonCommercial) | **PROHIBITED**| **Disallowed** | **REJECTED** | [MongoDB License](https://github.com/mongodb/docs/blob/master/LICENSE.txt) |
| **Apple Developer Docs** | `https://developer.apple.com/` | Apple Inc. | `mobile-app-developer` | Proprietary Copyright (All Rights Reserved) | **PROHIBITED**| **PROHIBITED** | **REJECTED** | [Apple Terms](https://www.apple.com/legal/internet-services/terms/site.html) |
| **Pro Git Book** | `https://git-scm.com/book/` | S. Chacon / B. Straub | `devops`, `software-engineer` | CC BY-NC-SA 3.0 (NonCommercial) | **PROHIBITED**| **Disallowed** | **REJECTED** | [Pro Git License](https://git-scm.com/book/en/v2/) |
| **MIT OpenCourseWare** | `https://ocw.mit.edu/` | MIT | `software-engineer`, `data-scientist` | CC BY-NC-SA 4.0 (NonCommercial) | **PROHIBITED**| **Disallowed** | **REJECTED** | [MIT OCW Terms](https://ocw.mit.edu/pages/privacy-and-terms-of-use/) |

---

### 5.2 Legal Evaluation of CC BY-SA Sources (MDN, Docker, OWASP)

In compliance with Phase 5.0.1 requirements, sources carrying **Creative Commons Attribution-ShareAlike (CC BY-SA)** are maintained as **CONDITIONAL** and excluded from automatic ingestion pending formal legal review.

#### Detailed Licensing Obligations for CC BY-SA Materials

| Evaluation Dimension | MDN Web Docs | Docker Documentation | OWASP Foundation |
| :--- | :--- | :--- | :--- |
| **Exact License Version** | CC-BY-SA 2.5 Generic (historical) / CC-BY-SA 4.0 (current); Code is CC0 1.0 Universal | CC-BY-SA 4.0 International; Code/CLI is Apache 2.0 | CC-BY-SA 4.0 International |
| **Attribution Obligations** | Attribute "MDN Web Docs contributors"; link to original article; indicate modifications. | Attribute "Docker Inc."; link to license; state modifications. | Attribute "OWASP Foundation" and project leads; provide canonical URL. |
| **ShareAlike Requirements** | Section 4(b) (v2.5) / Section 3(b) (v4.0): Derived works MUST be distributed under the exact same or compatible CC-BY-SA license. | Section 3(b): "If You Share Adapted Material You Produce, the Adapter's License You apply must be a Creative Commons license with the same License Elements." | Section 3(b): Any adaptation must be distributed under CC-BY-SA 4.0 or compatible license. |
| **Commercial Use Permitted** | **Yes**. CC-BY-SA does not prohibit commercial charging, provided ShareAlike and attribution are honored. | **Yes**. Commercial exploitation is permitted subject to ShareAlike. | **Yes**. Commercial exploitation is permitted subject to ShareAlike. |
| **Storage & Indexing Rights** | **Yes**. Caching, tokenization, and vector indexing for internal search are permitted. | **Yes**. Internal storage and embedding indexing are permitted. | **Yes**. Internal storage and embedding indexing are permitted. |

#### AI Processing and Derivative Content Legal Risk Analysis
1. **The "Adapted Material" Question**: Under CC-BY-SA 4.0 Section 1(a), "Adapted Material" means material that is derived from or based upon the licensed material and in which the licensed material is translated, altered, arranged, transformed, or otherwise modified.
   - *Legal Issue*: When Groq retrieves an MDN or Docker text chunk as grounding evidence and synthesizes a 9-section lesson, does the resulting lesson constitute an "Adapted Material" (Derivative Work)?
   - If affirmative, CareerLaunch **would be legally compelled to license the entire generated lesson to students under CC-BY-SA**, preventing CareerLaunch from claiming proprietary rights over its synthesized educational text.
2. **Severability of Code Exemplars**: While MDN code snippets are CC0 (Public Domain, exempt from ShareAlike), textual explanations are CC-BY-SA. If text and code are combined into one monolithic lesson document, the ShareAlike clause may attach to the entire composite lesson.
3. **Verdict**: **Strict Legal Review Required**. Until legal counsel formally confirms that CareerLaunch's retrieval-grounding synthesis constitutes fair educational citation rather than an "Adapted Material", **MDN, Docker, and OWASP remain CONDITIONAL and cannot be ingested into the production knowledge base.**

---

## 6. Refined MongoDB Knowledge Sourcing Strategy

The audit explicitly corrects the previous conflation of document databases. **PostgreSQL JSONB is NOT a direct replacement for MongoDB.** The two systems possess fundamentally divergent storage engines, indexing semantics, and developer ecosystems.

### 6.1 Four-Tier Architecture for Document Database Knowledge

```
+----------------------------------------------------------------------------------------------------+
|                           FOUR-TIER DOCUMENT DATABASE SOURCING STRATEGY                            |
+----------------------------------------------------------------------------------------------------+
| Tier 1: General Document DB Theory    -> Academic & Open Literature (Technology-Neutral)           |
| Tier 2: JSON & BSON Data Standards    -> ECMA-404, RFC 8259, bsonspec.org (Open Formal Specs)      |
| Tier 3: PostgreSQL JSONB Hybrid       -> PostgreSQL Official Docs (PostgreSQL License — APPROVED)  |
| Tier 4: MongoDB-Specific Mechanics    -> Mongoose / Driver Docs (Apache 2.0) + Staff Exemplars     |
+----------------------------------------------------------------------------------------------------+
```

#### Tier 1: General Document Database Concepts (Technology-Neutral)
- **Concepts**: Denormalization vs normalization, embedding vs referencing documents, polymorphic schemas, schema evolution, document-level atomicity, horizontal sharding by shard key.
- **Permitted Sources**: Open database textbooks, academic computer science publications, and standard database architecture literature.
- **Coverage**: Ground theoretical interview questions in `be-top-6` and `fs-top-5` without citing proprietary vendor documentation.

#### Tier 2: JSON, JSON Schema & BSON Formal Standards
- **Concepts**: JSON data exchange syntax, structural validation schemas, binary JSON (BSON) serialization, data type mappings (ObjectId, ISODate, Int32, Decimal128).
- **Permitted Sources**: 
  - **ECMA-404**: The JSON Data Interchange Standard (Free open public standard).
  - **IETF RFC 8259**: The JavaScript Object Notation Data Interchange Format.
  - **BSON Specification** (`bsonspec.org`): Open format specification licensed under Apache 2.0.
- **Coverage**: Ground data serialization, schema validation, and transport format topics.

#### Tier 3: PostgreSQL JSONB Implementation (Relational-Document Hybrid)
- **Concepts**: `jsonb` binary storage, GIN (Generalized Inverted Index) indexes, path extraction operators (`->`, `->>`, `@>`), `jsonb_path_query()`.
- **Permitted Sources**: PostgreSQL Official Documentation (PostgreSQL License — **APPROVED**).
- **Strict Boundary**: This source covers relational-document hybrid workflows (`be-top-5`, `be-top-7`). **It MUST NEVER be used or claimed to ground MongoDB driver syntax, Mongoose schemas, or MongoDB aggregation pipelines.**

#### Tier 4: MongoDB-Specific Operational Mechanics
- **Concepts**: Mongoose ODM schema definitions, MongoDB Aggregation Framework pipelines (`$match`, `$project`, `$group`, `$lookup`, `$unwind`), replica set oplog elections, WiredTiger storage engine.
- **Status of Official Docs (`mongodb.com/docs`)**: Licensed under **CC BY-NC-SA 3.0 (NonCommercial)**. **REJECTED FOR INGESTION**. Ingesting official MongoDB documentation into a commercial SaaS knowledge base violates copyright.
- **Authorized Sourcing Strategy for MongoDB Topics (`be-top-6`)**:
  1. **MongoDB Node.js Driver Documentation**: The official Node.js driver repository is open-source under **Apache License 2.0** (`https://github.com/mongodb/node-mongodb-native/blob/main/LICENSE.md`). Permitted for driver connection, indexing, and query syntax.
  2. **CareerLaunch-Authored Exemplars**: All Mongoose ODM schema definitions and aggregation pipeline code examples must be authored directly by CareerLaunch Engineering under internal platform copyright (`[Author: CareerLaunch Engineering]`).
  3. **Enterprise Ingestion Agreement**: If full vendor documentation is desired in future phases, execute a formal commercial licensing contract with MongoDB Inc.

---

## 7. Refined Mobile Curriculum Knowledge Sourcing Strategy

The mobile curriculum (`mobile-app-developer`, 14 topics) is partitioned into four distinct technological sectors, each with verified licensing boundaries.

### 7.1 Four-Sector Mobile Knowledge Framework

```
+----------------------------------------------------------------------------------------------------+
|                               MOBILE CURRICULUM SOURCING FRAMEWORK                                 |
+----------------------------------+----------------------------------+------------------------------+
| Mobile Sector                    | Canonical Sources & Licensing    | Ingestion Ruling             |
+----------------------------------+----------------------------------+------------------------------+
| 1. Swift Language Fundamentals   | Swift.org (Apache 2.0 w/ Runtime)| APPROVED                     |
| 2. iOS Platform Development      | Apple Developer Docs (Proprietary| REJECTED / EXCLUDED          |
| 3. Android Native Development    | Android / AOSP (CC-BY 4.0 / Apach| APPROVED                     |
| 4. Cross-Platform Frameworks     | React Native & Flutter (CC-BY 4.0| APPROVED                     |
+----------------------------------+----------------------------------+------------------------------+
```

#### Sector 1: Swift Language Fundamentals (Language Core)
- **Technical Scope**: Type safety, optional unwrapping, structs vs classes, protocols, generics, async/await, actors, Swift structured concurrency.
- **Approved Source**: **Swift.org Documentation** (`https://www.swift.org/documentation/`).
- **License**: Apache License 2.0 with Runtime Library Exception.
- **Ruling**: **APPROVED**. Swift.org is an open-source project separate from Apple Developer. Permitted to ground `mob-top-2` (Typed Languages: Null Safety & Concurrency).

#### Sector 2: iOS Platform Development (Proprietary Apple Ecosystem)
- **Technical Scope**: UIKit view controllers, SwiftUI declarative views, CoreData persistence, iOS App Lifecycle, Keychain Services, APNs.
- **Source Reality**: `developer.apple.com` is strictly **Proprietary Copyright — All Rights Reserved**. Apple's Terms of Use prohibit scraping, reproduction, and commercial redistribution.
- **Ruling**: **REJECTED AND STRICTLY EXCLUDED FROM INGESTION**.
- **Compliant Pedagogical Solution**:
  - Generalize mobile architecture topics (MVVM, navigation stacks, memory profiling) using open Android/AOSP documentation.
  - Platform-specific iOS code exemplars must be written directly by CareerLaunch Engineering staff under internal copyright without ingesting Apple's proprietary prose.

#### Sector 3: Android Native Development (Open Mobile Platform)
- **Technical Scope**: Activity and Fragment lifecycles, Jetpack Compose, Room SQLite persistence, ViewModel, StateFlow, Coroutines, AndroidKeyStore cryptography, ProGuard/R8 shrinking.
- **Approved Source**: **Android Open Source Project / Android Developer Docs** (`https://developer.android.com/`).
- **License**: Documentation text is licensed under Creative Commons Attribution 4.0 (**CC-BY 4.0**); sample code is licensed under **Apache 2.0**.
- **Ruling**: **APPROVED**. Android documentation provides comprehensive, commercially compatible coverage for 12 of the 14 mobile curriculum topics.
- **Attribution Condition**: Lessons citing Android documentation must include the required AOSP notice: *"Portions of this page are modifications based on work created and shared by the Android Open Source Project and used according to terms described in the Creative Commons 4.0 Attribution License."*

#### Sector 4: Cross-Platform Frameworks (Multi-Platform Mobile)
- **Technical Scope**: Declarative UI trees, bridge vs engine architectures, reactive state management, offline local storage.
- **Approved Sources**:
  - **React Native Documentation** (`https://reactnative.dev/`): Text under **CC-BY 4.0**, code under **MIT**.
  - **Flutter Documentation** (`https://docs.flutter.dev/`): Text under **CC-BY 4.0**, code under **BSD 3-Clause**.
- **Ruling**: **APPROVED**. Provides commercially compatible open references for cross-platform topics (`mob-top-1`, `mob-top-3`, `mob-top-7`).

---

## 8. Technical and Licensing Safeguards

To protect CareerLaunch's intellectual property, prevent legal liability, and maintain system stability:

1. **AI Generation Provider Isolation**: Groq (`openai/gpt-oss-120b`) is the designated text generation provider. Embeddings remain separate and managed through vector indexing.
2. **Provenance & Snapshot Verification**:
   - Every lesson document must link to verified MongoDB chunk IDs (`retrievedChunkIds`).
   - Every chunk must carry the SHA-256 hash of its source document (`sourceSnapshotHashes`).
3. **Student Privacy Protection**: Canonical lessons in `generatedlessons` are global and shared. They contain zero references to student profiles, session tokens, or personal identifiers.
4. **Three-Level Evidence Validation**:
   - *Level 1 (Citation Verification)*: Cited chunks must exist in MongoDB, match snapshot hashes, and link to approved non-flagged sources.
   - *Level 2 (Attribution Enforcement)*: CareerLaunch-authored code must cite `CareerLaunch Engineering`. Third-party sources must not be falsely credited with CareerLaunch code.
   - *Level 3 (Syntactic Integrity)*: Generated code blocks must pass syntax linting and structure checks before lesson persistence.
5. **SSRF & Network Security**: Strict SSRF defense on all ingestion endpoints (blocking `127.0.0.1`, `169.254.169.254`, and private networks).

---

## 9. Official Sources & Licensing Evidence Directory

| Organization / Project | Resource Name | Canonical Documentation URL | Verified Licensing URL | Verified License Type |
| :--- | :--- | :--- | :--- | :--- |
| **U.S. NIST** | Dictionary of Algorithms and Data Structures | `https://xlinux.nist.gov/dads/` | `https://www.nist.gov/director/licensing` | U.S. Government Work / Public Domain |
| **Linux Foundation** | Linux Programmer's Manual (Man-Pages) | `https://man7.org/linux/man-pages/` | `https://man7.org/linux/man-pages/man7/man-pages.7.html` | BSD / MIT / Permissive |
| **Python Software Fdn** | Python Documentation | `https://docs.python.org/3/` | `https://docs.python.org/3/license.html` | PSF License Agreement v2 / 0BSD |
| **PostgreSQL GDG** | PostgreSQL Documentation | `https://www.postgresql.org/docs/` | `https://www.postgresql.org/about/licence/` | PostgreSQL Licence (Liberal Open Source) |
| **W3C** | World Wide Web Consortium Technical Reports | `https://www.w3.org/TR/` | `https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document` | W3C Document License |
| **Meta / React** | React Documentation | `https://react.dev/` | `https://github.com/reactjs/react.dev/blob/main/LICENSE.md` | CC-BY 4.0 / MIT (Code) |
| **OpenJS Foundation** | Node.js API Documentation | `https://nodejs.org/api/` | `https://github.com/nodejs/node/blob/main/LICENSE` | CC-BY 4.0 / MIT (Code) |
| **Google / AOSP** | Android Developer Documentation | `https://developer.android.com/` | `https://developer.android.com/license` | CC-BY 4.0 / Apache 2.0 |
| **Swift Project / Apple** | Swift Language Documentation | `https://www.swift.org/documentation/` | `https://www.swift.org/about/#license` | Apache License 2.0 with Runtime Exception |
| **CNCF / Linux Fdn** | Kubernetes Documentation | `https://kubernetes.io/docs/` | `https://github.com/kubernetes/website/blob/main/LICENSE` | CC-BY 4.0 / Apache 2.0 |
| **NumFOCUS** | NumPy Documentation | `https://numpy.org/doc/` | `https://github.com/numpy/numpy/blob/main/LICENSE.txt` | BSD 3-Clause |
| **NumFOCUS** | Pandas Documentation | `https://pandas.pydata.org/docs/` | `https://github.com/pandas-dev/pandas/blob/main/LICENSE` | BSD 3-Clause |
| **Inria / NumFOCUS** | Scikit-Learn Documentation | `https://scikit-learn.org/` | `https://github.com/scikit-learn/scikit-learn/blob/main/COPYING` | BSD 3-Clause |
| **Linux Foundation** | PyTorch Documentation | `https://pytorch.org/docs/` | `https://github.com/pytorch/pytorch/blob/main/LICENSE` | BSD-3-Clause |
| **MongoDB Driver** | MongoDB Node.js Driver | `https://github.com/mongodb/node-mongodb-native` | `https://github.com/mongodb/node-mongodb-native/blob/main/LICENSE.md` | Apache License 2.0 |
| **BSON Project** | BSON Specification | `https://bsonspec.org/` | `https://bsonspec.org/` | Apache License 2.0 |
| **Mozilla / OWD** | MDN Web Docs | `https://developer.mozilla.org/` | `https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Licensing_faq` | CC-BY-SA 2.5/4.0; CC0 (Code) |
| **Docker Inc.** | Docker Documentation | `https://docs.docker.com/` | `https://github.com/docker/docs/blob/main/LICENSE` | CC-BY-SA 4.0 / Apache 2.0 |
| **OWASP Foundation** | OWASP Top 10 & Cheat Sheets | `https://owasp.org/` | `https://owasp.org/www-project-top-ten/` | CC-BY-SA 4.0 |
| **Git Project** | Git Core Manpages | `https://git-scm.com/docs` | `https://github.com/git/git/blob/master/COPYING` | GNU General Public License v2 (GPLv2) |

---

## 10. Unresolved Policy & Legal Questions Requiring Human Review

The following questions are submitted for legal counsel and product leadership review prior to initiating Phase 5.1 generation:

1. **CC BY-SA Copyleft on AI-Generated Text**: When Groq retrieves an MDN or Docker text chunk as grounding evidence and synthesizes a structured lesson, does the resulting output constitute an "Adapted Material" under Section 1(a) of CC BY-SA 4.0? If yes, is CareerLaunch willing to publish the resulting lessons under CC BY-SA 4.0, or should CareerLaunch restrict all production grounding strictly to permissive CC-BY, BSD, MIT, and Public Domain sources?
2. **Batch 1 SWE Generation Approval**: Does product leadership approve the proposed 4-topic Batch 1 (`se-top-2` Big-O, `se-top-4` Linked Lists, `se-top-5` Stacks/Queues, `se-top-6` Binary Trees) for Phase 5.1 execution using NIST DADS as the sole canonical source?
3. **MongoDB Pedagogical Strategy**: Confirm approval to ground MongoDB topics (`be-top-6`) using the Apache 2.0 licensed Node.js MongoDB driver specification and CareerLaunch-authored exemplars rather than seeking an enterprise licensing contract with MongoDB Inc.
4. **Mobile iOS Boundary**: Confirm that the Mobile track will use Swift.org (Apache 2.0) and AOSP (CC-BY 4.0) as its open grounding foundations, with iOS-specific UIKit/SwiftUI syntax provided exclusively through internal CareerLaunch-authored code exemplars.

---

## STOP CONDITION

Phase 5.0.1 (Knowledge Audit Refinement & SWE Expansion Plan) is complete.  
No application code, database records, roadmaps, or pilot lessons have been modified.  
Awaiting explicit review and approval before proceeding to Phase 5.1.
