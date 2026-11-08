/**
 * CareerLaunch - Role-Specific Preparation Roadmaps (Stage 2)
 * Comprehensive curricula for all 8 technical career tracks.
 */

export const INTERVIEW_ROADMAPS = {
  'frontend-developer': {
    roleId: 'frontend-developer',
    roleTitle: 'Frontend Developer',
    subtitle: 'UI Engineering & Web Architecture',
    overview:
      'Master responsive user interfaces, modern component patterns, CSS architecture, browser runtime mechanics, web performance budgets, and frontend system design.',
    learningObjectives: [
      'Build responsive, accessible, and performant web interfaces with modern CSS and HTML semantics.',
      'Master JavaScript asynchronous runtimes, closures, event loops, and ES2024 features.',
      'Architect robust React applications utilizing custom hooks, state stores, and client cache management.',
      'Analyze and optimize Core Web Vitals (LCP, INP, CLS) using browser performance profilers.',
      'Design modular component architectures and implement comprehensive unit and integration test suites.',
    ],
    levels: [
      {
        id: 'beginner',
        title: 'Foundations & Web Standards',
        description: 'Semantic markup, modern layout mechanics, and core JavaScript language fundamentals.',
        estimatedTime: '4 - 6 Weeks',
        modules: [
          {
            id: 'fe-mod-1',
            title: 'Semantic HTML & Modern CSS Core',
            description: 'Document outlining, accessibility-first markup, and responsive styling mechanics.',
            estimatedTime: '2 Weeks',
            prerequisites: 'Basic computing and text editor setup',
            topics: [
              {
                id: 'fe-top-1',
                title: 'Semantic Markup & Accessibility Outlines',
                description: 'Structuring document outlines using landmark tags, semantic elements, and accessibility tree considerations.',
                keyConcepts: ['Semantic Landmarks', 'Accessibility Tree', 'Form Controls', 'ARIA Attributes'],
                objectives: [
                  'Replace generic <div> trees with semantic landmarks (<main>, <article>, <nav>, <aside>).',
                  'Construct accessible HTML forms with proper label bindings, fieldsets, and validation states.',
                  'Inspect the browser accessibility tree using developer tools.',
                ],
                estimatedHours: '6 Hours',
              },
              {
                id: 'fe-top-2',
                title: 'CSS Box Model, Flexbox & Grid Systems',
                description: 'Mastering box sizing, flex container alignments, and multi-dimensional grid templates.',
                keyConcepts: ['Box Sizing', 'Flexbox Alignment', 'CSS Grid Templates', 'Minmax & Auto-Fit'],
                objectives: [
                  'Resolve margin collapsing, border-box sizing, and overflow behavior.',
                  'Build complex responsive component layouts using Flexbox axes and alignments.',
                  'Construct 2D responsive magazine and dashboard grids without rigid media queries.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'fe-top-3',
                title: 'Responsive Design & Fluid Typography',
                description: 'Designing viewport-agnostic layouts with relative units, clamp functions, and container queries.',
                keyConcepts: ['Viewport Units', 'clamp() & calc()', 'Container Queries', 'Mobile-First Breakpoints'],
                objectives: [
                  'Implement fluid typography and spacing scales using clamp() and rem units.',
                  'Apply mobile-first responsive breakpoints for phone, tablet, and desktop viewports.',
                  'Leverage container queries (@container) for component-driven modular responsiveness.',
                ],
                estimatedHours: '6 Hours',
              },
            ],
          },
          {
            id: 'fe-mod-2',
            title: 'JavaScript Core & DOM Runtimes',
            description: 'Execution context, asynchronous event loop, and browser DOM manipulation.',
            estimatedTime: '3 Weeks',
            prerequisites: 'HTML & CSS Foundations',
            topics: [
              {
                id: 'fe-top-4',
                title: 'Execution Context, Scopes & Closures',
                description: 'Lexical scoping, memory allocation, closure mechanics, and variable shadowing in modern V8.',
                keyConcepts: ['Call Stack', 'Lexical Scope', 'Closures', 'Hoisting & TDZ', 'Garbage Collection'],
                objectives: [
                  'Trace JavaScript call stack execution and lexical environment bindings.',
                  'Implement memoization, function factories, and private state using closures.',
                  'Prevent unintended memory leaks caused by retained closure references.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'fe-top-5',
                title: 'DOM Manipulation, Events & Bubbling',
                description: 'Event propagation phases, synthetic listeners, and efficient DOM patch strategies.',
                keyConcepts: ['Event Bubbling & Capturing', 'Event Delegation', 'DocumentFragments', 'MutationObserver'],
                objectives: [
                  'Implement high-performance event delegation on dynamic list containers.',
                  'Control event propagation using stopPropagation() and preventDefault().',
                  'Minimize layout thrashing and DOM reflows with batch DOM modifications.',
                ],
                estimatedHours: '6 Hours',
              },
              {
                id: 'fe-top-6',
                title: 'Asynchronous JavaScript & Event Loop',
                description: 'Microtasks vs macrotasks, Promise chaining, and resilient async/await error boundaries.',
                keyConcepts: ['Event Loop', 'Microtask Queue', 'Promises & Combinators', 'Async/Await & Error Handling'],
                objectives: [
                  'Differentiate microtask (Promise) and macrotask (setTimeout, I/O) scheduling queues.',
                  'Coordinate concurrent network requests using Promise.all, Promise.allSettled, and Promise.race.',
                  'Handle network interruptions gracefully with async/await and try/catch patterns.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
        ],
      },
      {
        id: 'intermediate',
        title: 'Component Architecture & State Stores',
        description: 'Declarative component lifecycle, global state coordination, client caching, and web accessibility.',
        estimatedTime: '6 - 8 Weeks',
        modules: [
          {
            id: 'fe-mod-3',
            title: 'React Fundamentals & Component Architecture',
            description: 'Declarative virtual DOM reconciliation, standard hooks, and component composition.',
            estimatedTime: '3 Weeks',
            prerequisites: 'JavaScript Core & DOM Runtimes',
            topics: [
              {
                id: 'fe-top-7',
                title: 'JSX Compilation, Virtual DOM & Reconciliation',
                description: 'React fiber tree architecture, render vs commit phases, and diffing algorithms.',
                keyConcepts: ['Fiber Nodes', 'Render vs Commit', 'Keys & Identity', 'Pure Components'],
                objectives: [
                  'Understand how JSX compiles into React element trees and fiber structures.',
                  'Avoid common key antipatterns that cause state corruption in list reconciliation.',
                  'Structure component hierarchies using compound components and render props.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'fe-top-8',
                title: 'Standard Hooks & Lifecycle Synchronization',
                description: 'Effective use of useState, useEffect, useCallback, useMemo, and useRef.',
                keyConcepts: ['Dependency Arrays', 'Effect Cleanup', 'Memoization Tradeoffs', 'Mutable Refs'],
                objectives: [
                  'Manage complex effect lifecycles and cancel in-flight subscriptions on unmount.',
                  'Profile when useCallback and useMemo provide tangible rendering optimization.',
                  'Interact safely with imperative DOM APIs using mutable ref pointers.',
                ],
                estimatedHours: '10 Hours',
              },
              {
                id: 'fe-top-9',
                title: 'Custom Hooks & Reusable Logic Extraction',
                description: 'Abstracting stateful logic, network polling, and browser event listeners into reusable hooks.',
                keyConcepts: ['Custom Hook Rules', 'Composition', 'Debounce & Throttle Hooks', 'Storage Hooks'],
                objectives: [
                  'Extract business logic away from presentation components into pure custom hooks.',
                  'Create custom hooks for debounced search, local storage synchronization, and window metrics.',
                ],
                estimatedHours: '6 Hours',
              },
            ],
          },
          {
            id: 'fe-mod-4',
            title: 'State Management & Server State Caching',
            description: 'Global store management, optimistic updates, client-side caching, and API resilience.',
            estimatedTime: '3 Weeks',
            prerequisites: 'React Component Architecture',
            topics: [
              {
                id: 'fe-top-10',
                title: 'Global State Strategies: Context vs Stores',
                description: 'Evaluating Context API, Redux Toolkit, and lightweight Zustand stores.',
                keyConcepts: ['Context Re-renders', 'Zustand Slices', 'Redux Toolkit (RTK)', 'Immutable Updates'],
                objectives: [
                  'Architect state partitions to prevent catastrophic whole-tree re-renders with Context.',
                  'Implement atomic state slices and asynchronous actions using Zustand.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'fe-top-11',
                title: 'Server State & Client Caching (React Query / SWR)',
                description: 'Query invalidation, cache rehydration, background polling, and optimistic mutations.',
                keyConcepts: ['Stale-While-Revalidate', 'Query Keys', 'Optimistic Updates', 'Pagination & Infinite Scroll'],
                objectives: [
                  'Coordinate asynchronous server state with automatic cache invalidation.',
                  'Implement optimistic UI mutations with rollback strategies on network failure.',
                  'Design cursor-based infinite scroll queries with windowing optimizations.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
          {
            id: 'fe-mod-5',
            title: 'Browser Internals & Web Accessibility (a11y)',
            description: 'Critical rendering path, keyboard navigation, and WCAG 2.1 compliance.',
            estimatedTime: '2 Weeks',
            prerequisites: 'Semantic HTML & React Core',
            topics: [
              {
                id: 'fe-top-12',
                title: 'Critical Rendering Path & Paint Cycles',
                description: 'DOM/CSSOM construction, layout, paint, composite layers, and GPU acceleration.',
                keyConcepts: ['DOM/CSSOM', 'Layout & Reflow', 'Composite Layers', 'will-change Property'],
                objectives: [
                  'Analyze browser rendering pipelines to eliminate costly reflow and repaint bottlenecks.',
                  'Promote animated elements to GPU composite layers safely without excessive memory consumption.',
                ],
                estimatedHours: '6 Hours',
              },
              {
                id: 'fe-top-13',
                title: 'WCAG 2.1 Compliance & Keyboard Navigation',
                description: 'Building focus traps, screen-reader compatible modals, and accessible interactive widgets.',
                keyConcepts: ['Focus Traps', 'WAI-ARIA Patterns', 'Contrast Ratios', 'Screen Readers'],
                objectives: [
                  'Build accessible modal dialogs with focus trapping and ESC key handlers.',
                  'Verify color contrast and screen reader accessibility using automated audit tools.',
                ],
                estimatedHours: '6 Hours',
              },
            ],
          },
        ],
      },
      {
        id: 'advanced',
        title: 'Performance & Frontend System Design',
        description: 'Core Web Vitals profiling, micro-frontends, bundle budgets, and test-driven reliability.',
        estimatedTime: '6 - 8 Weeks',
        modules: [
          {
            id: 'fe-mod-6',
            title: 'Web Performance & Core Web Vitals',
            description: 'LCP, INP, and CLS diagnostic measurement, asset caching, and dynamic code splitting.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Browser Internals & React Architecture',
            topics: [
              {
                id: 'fe-top-14',
                title: 'Core Web Vitals Diagnostic Auditing',
                description: 'Measuring Largest Contentful Paint, Interaction to Next Paint, and Cumulative Layout Shift.',
                keyConcepts: ['LCP Optimization', 'INP Latency', 'CLS Stabilization', 'Chrome DevTools Profiler'],
                objectives: [
                  'Diagnose long tasks on the main thread and break them up using requestIdleCallback and scheduler APIs.',
                  'Prevent layout shifts by providing explicit aspect ratio boxes for images and embedded components.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'fe-top-15',
                title: 'Bundle Splitting & Asset Optimization',
                description: 'Rollup/Vite code chunking, tree-shaking, font subsetting, and responsive image CDNs.',
                keyConcepts: ['Dynamic Imports', 'Tree Shaking', 'Font Preloading', 'Modern Formats (AVIF/WebP)'],
                objectives: [
                  'Configure route-level and component-level dynamic imports to reduce initial bundle size.',
                  'Eliminate dead code dependencies through bundle visualizer auditing.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
          {
            id: 'fe-mod-7',
            title: 'Frontend System Design & Automated Testing',
            description: 'Component libraries, monorepos, integration testing with Playwright, and large-scale architecture.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Full Intermediate Stack',
            topics: [
              {
                id: 'fe-top-16',
                title: 'Frontend Testing Suite: Unit, Integration & E2E',
                description: 'Test-driven development with Vitest, React Testing Library, and headless Playwright.',
                keyConcepts: ['User-Event Testing', 'Mock Service Worker (MSW)', 'E2E Regressions', 'Visual Diffing'],
                objectives: [
                  'Write resilient user-centric component tests without brittle implementation-detail coupling.',
                  'Intercept and mock network boundaries in tests using Mock Service Worker.',
                  'Configure automated end-to-end regression suites running against headless browsers.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'fe-top-17',
                title: 'Large-Scale Frontend Architecture & System Design',
                description: 'Evaluating micro-frontends, design token systems, SSR vs SSG trade-offs, and CDN caching.',
                keyConcepts: ['Micro-frontends', 'Design System Tokens', 'SSR / SSG / ISR', 'Edge Rendering'],
                objectives: [
                  'Design resilient enterprise frontend architectures capable of scaling across multiple teams.',
                  'Articulate trade-offs between Client-Side Rendering, Server-Side Rendering, and Static Site Generation.',
                ],
                estimatedHours: '10 Hours',
              },
            ],
          },
        ],
      },
    ],
  },

  'backend-developer': {
    roleId: 'backend-developer',
    roleTitle: 'Backend Developer',
    subtitle: 'Distributed Systems & Services',
    overview:
      'Scale reliable APIs, relational and document database indexing, distributed concurrency locks, idempotent queue workers, microservices, and system design.',
    learningObjectives: [
      'Architect robust RESTful and RPC backend services with modular controller/service layers.',
      'Optimize relational (SQL) and document (MongoDB) databases with indexing and transaction guarantees.',
      'Implement defensive security controls: JWT token rotation, RBAC, rate limiting, and OWASP protections.',
      'Deploy caching layers (Redis) and asynchronous message queues (RabbitMQ/BullMQ) with dead-letter routing.',
      'Design distributed systems with high availability, horizontal scalability, and fault tolerance.',
    ],
    levels: [
      {
        id: 'beginner',
        title: 'Backend Core & RESTful APIs',
        description: 'Runtime asynchronous architecture, HTTP protocol specifications, and RESTful routing.',
        estimatedTime: '4 - 6 Weeks',
        modules: [
          {
            id: 'be-mod-1',
            title: 'Node.js Runtime & Asynchronous I/O',
            description: 'Event loop phases, libuv threadpool, buffer streams, and modular architectures.',
            estimatedTime: '2 Weeks',
            prerequisites: 'Basic JavaScript/programming knowledge',
            topics: [
              {
                id: 'be-top-1',
                title: 'Node.js Event Loop & Non-Blocking I/O',
                description: 'Deep dive into timers, I/O polling, check phase, setImmediate, and process.nextTick.',
                keyConcepts: ['Event Loop Phases', 'Libuv Threadpool', 'process.nextTick()', 'Stream Pipelines'],
                objectives: [
                  'Trace asynchronous I/O execution across the six phases of the Node.js event loop.',
                  'Stream gigabyte-sized files without exhausting server heap memory using Node streams.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'be-top-2',
                title: 'Modular Backend Architecture & Error Handling',
                description: 'Structuring clean separation of concerns across controllers, service layers, and data access objects.',
                keyConcepts: ['Controller-Service-DAO', 'Custom Error Classes', 'Global Error Middleware'],
                objectives: [
                  'Structure maintainable backend projects avoiding controller bloat and spaghetti callbacks.',
                  'Implement centralized error-handling middleware with standardized JSON error envelopes.',
                ],
                estimatedHours: '6 Hours',
              },
            ],
          },
          {
            id: 'be-mod-2',
            title: 'RESTful API Engineering with Express',
            description: 'HTTP protocol standards, middleware chains, input sanitization, and route parameters.',
            estimatedTime: '2 Weeks',
            prerequisites: 'Node.js Runtime Core',
            topics: [
              {
                id: 'be-top-3',
                title: 'HTTP Protocol Mechanics & REST Conventions',
                description: 'Idempotency of HTTP verbs, status code contracts, content negotiation, and headers.',
                keyConcepts: ['HTTP Verbs & Idempotency', 'Status Codes (2xx, 4xx, 5xx)', 'Headers & Content Negotiation'],
                objectives: [
                  'Design consistent RESTful resource endpoints complying with standard HTTP specifications.',
                  'Enforce proper HTTP status codes for validation errors, unauthorized requests, and resource conflicts.',
                ],
                estimatedHours: '6 Hours',
              },
              {
                id: 'be-top-4',
                title: 'Request Validation, Sanitization & Middleware',
                description: 'Schema validation with Zod/Joi, request sanitization, and defense-in-depth validation pipelines.',
                keyConcepts: ['Schema Validation (Zod)', 'Input Sanitization', 'Middleware Pipelines'],
                objectives: [
                  'Build schema validation middleware that automatically rejects malformed request bodies.',
                  'Sanitize query parameters and inputs to prevent parameter pollution and injection vectors.',
                ],
                estimatedHours: '6 Hours',
              },
            ],
          },
        ],
      },
      {
        id: 'intermediate',
        title: 'Databases, Security & Caching',
        description: 'ACID transactions, indexing strategies, authentication rotation, and Redis caching layers.',
        estimatedTime: '6 - 8 Weeks',
        modules: [
          {
            id: 'be-mod-3',
            title: 'SQL, NoSQL & Database Indexing',
            description: 'Relational schema modeling, document databases, B-tree indexes, and execution plans.',
            estimatedTime: '3 Weeks',
            prerequisites: 'RESTful API Engineering',
            topics: [
              {
                id: 'be-top-5',
                title: 'Relational Schema Design & ACID Transactions',
                description: 'Database normalization (1NF-3NF), foreign key constraints, and multi-statement transactions.',
                keyConcepts: ['1NF to 3NF Normalization', 'ACID Guarantees', 'Foreign Keys', 'Transaction Isolation'],
                objectives: [
                  'Model normalized relational schemas that eliminate redundant write anomalies.',
                  'Execute atomic transactions in PostgreSQL/MySQL using BEGIN, COMMIT, and ROLLBACK.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'be-top-6',
                title: 'Document Databases (MongoDB) & Aggregations',
                description: 'Document embedding vs referencing, schema design for high-write workloads, and aggregation stages.',
                keyConcepts: ['Embedding vs Referencing', 'Aggregation Pipeline ($match, $group, $lookup)', 'Mongoose Models'],
                objectives: [
                  'Determine when to embed documents versus reference foreign ObjectIds in MongoDB.',
                  'Construct complex data aggregation pipelines for reporting and analytic queries.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'be-top-7',
                title: 'Database Indexing Strategies & Query Optimization',
                description: 'B-Trees, compound indexes, covering indexes, and analyzing EXPLAIN ANALYZE query plans.',
                keyConcepts: ['B-Tree Indexing', 'Compound Indexes', 'EXPLAIN ANALYZE', 'Table Scans vs Index Scans'],
                objectives: [
                  'Eliminate full table scans by creating optimal compound indexes based on query selectivity.',
                  'Diagnose slow database queries using EXPLAIN execution plans and optimize join performance.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
          {
            id: 'be-mod-4',
            title: 'Authentication, Authorization & Security',
            description: 'JWT token pairs, refresh token rotation, RBAC, and OWASP API security top 10.',
            estimatedTime: '2 Weeks',
            prerequisites: 'Database Foundations',
            topics: [
              {
                id: 'be-top-8',
                title: 'JWT Token Pairs & Refresh Token Rotation',
                description: 'Stateless access tokens, cryptographic signatures, blacklists, and secure refresh cookie rotation.',
                keyConcepts: ['JWT Signatures & Claims', 'Refresh Token Rotation', 'HttpOnly Cookies', 'Revocation Lists'],
                objectives: [
                  'Implement secure authentication issuing short-lived access tokens and rotated refresh tokens.',
                  'Store session tokens in secure, HttpOnly, SameSite cookies to protect against XSS extraction.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'be-top-9',
                title: 'Role-Based Access Control & API Hardening',
                description: 'Enforcing granular permission matrices, rate limiting, and CORS configuration.',
                keyConcepts: ['RBAC Matrices', 'Rate Limiting (Token Bucket)', 'Helmet & CORS', 'SQL/NoSQL Injection Defense'],
                objectives: [
                  'Build reusable authorization middleware supporting hierarchical role-based permissions.',
                  'Protect API endpoints against brute force attacks using sliding-window rate limiters.',
                ],
                estimatedHours: '6 Hours',
              },
            ],
          },
          {
            id: 'be-mod-5',
            title: 'Caching Patterns & Asynchronous Queues',
            description: 'Redis in-memory data structures, caching strategies, and asynchronous job workers.',
            estimatedTime: '2 Weeks',
            prerequisites: 'Database & Security Foundations',
            topics: [
              {
                id: 'be-top-10',
                title: 'Redis In-Memory Caching Strategies',
                description: 'Cache-aside, write-through, TTL expiration, cache penetration, and cache stampede defense.',
                keyConcepts: ['Cache-Aside Pattern', 'TTL & Eviction (LRU)', 'Cache Stampede & Mutex Locks'],
                objectives: [
                  'Implement high-performance cache-aside caching on high-frequency read endpoints.',
                  'Defend against cache stampede and dog-piling using distributed mutex locks and jittered TTLs.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'be-top-11',
                title: 'Message Queues & Dead-Letter Handling',
                description: 'Asynchronous task offloading, producer-consumer queues (BullMQ/RabbitMQ), and dead-letter routing.',
                keyConcepts: ['Producer-Consumer Model', 'At-Least-Once Delivery', 'Dead-Letter Queues (DLQ)', 'Exponential Backoff'],
                objectives: [
                  'Offload long-running background tasks (emails, report generation) to dedicated queue workers.',
                  'Implement retry policies with exponential backoff and route unrecoverable poison messages to DLQs.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
        ],
      },
      {
        id: 'advanced',
        title: 'Distributed Systems & Scalability',
        description: 'Microservice communication, distributed locks, database sharding, and high-availability architecture.',
        estimatedTime: '6 - 8 Weeks',
        modules: [
          {
            id: 'be-mod-6',
            title: 'Distributed Systems Architecture & Scalability',
            description: 'Horizontal partitioning, consistent hashing, distributed transactions, and CAP theorem trade-offs.',
            estimatedTime: '4 Weeks',
            prerequisites: 'Full Intermediate Backend Stack',
            topics: [
              {
                id: 'be-top-12',
                title: 'Horizontal Scaling, Load Balancing & Sharding',
                description: 'Stateless server scaling, round-robin vs least-connection load balancing, and database horizontal sharding.',
                keyConcepts: ['Consistent Hashing', 'Database Sharding Keys', 'Read Replicas & Replication Lag', 'Load Balancers (HAProxy/Nginx)'],
                objectives: [
                  'Design stateless backend clusters behind load balancers with session-less architectural guarantees.',
                  'Partition high-volume databases using consistent hashing and shard keys without hot-spotting.',
                ],
                estimatedHours: '10 Hours',
              },
              {
                id: 'be-top-13',
                title: 'Distributed Concurrency & Idempotent Consumer Design',
                description: 'Distributed locking (Redlock), optimistic concurrency control, and deduplication keys.',
                keyConcepts: ['Distributed Locks (Redis SETNX)', 'Optimistic Concurrency Control', 'Idempotency Keys', 'Saga Pattern'],
                objectives: [
                  'Implement distributed locking across multiple server instances using Redis atomic primitives.',
                  'Design idempotent webhook and payment receivers that safely handle duplicate message delivery.',
                ],
                estimatedHours: '10 Hours',
              },
            ],
          },
          {
            id: 'be-mod-7',
            title: 'Observability & Automated Testing Suites',
            description: 'Distributed tracing, structured telemetry, metric collection, and integration test suites.',
            estimatedTime: '2 Weeks',
            prerequisites: 'Distributed Systems Architecture',
            topics: [
              {
                id: 'be-top-14',
                title: 'Automated Testing: Unit, Integration & Contract Tests',
                description: 'Testing backend APIs using Jest, Supertest, Testcontainers, and database transaction rollbacks.',
                keyConcepts: ['Supertest Integration', 'Testcontainers', 'Database Fixtures & Rollbacks', 'Contract Testing'],
                objectives: [
                  'Write automated integration tests running against ephemeral Docker database containers.',
                  'Verify API contract stability across releases using schema-based contract testing.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'be-top-15',
                title: 'Telemetry, Distributed Tracing & Health Monitoring',
                description: 'Structured JSON logging, OpenTelemetry distributed traces, Prometheus metrics, and health probes.',
                keyConcepts: ['Structured Logging (Winston/Pino)', 'Correlation IDs', 'OpenTelemetry Tracing', 'Prometheus & Grafana'],
                objectives: [
                  'Propagate correlation IDs across distributed service requests for end-to-end trace auditing.',
                  'Expose Prometheus application metrics and configure Kubernetes liveness/readiness probes.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
        ],
      },
    ],
  },

  'fullstack-developer': {
    roleId: 'fullstack-developer',
    roleTitle: 'Full Stack Developer',
    subtitle: 'End-to-End Application Architecture',
    overview:
      'Bridge performant client applications with robust backend APIs, secure authentication pipelines, schema migrations, and cloud hosting.',
    learningObjectives: [
      'Build cohesive end-to-end web applications with React on the client and Node/Express on the server.',
      'Design RESTful and GraphQL API contracts with strict schema validation across the full stack.',
      'Implement unified authentication and role-based permissions with JWT and secure cookies.',
      'Manage database schemas, relationships, and automated migration pipelines with ORMs.',
      'Deploy full-stack monorepos with Docker containers and CI/CD automation pipelines.',
    ],
    levels: [
      {
        id: 'beginner',
        title: 'Full-Stack Web Foundations',
        description: 'Client-server mechanics, modern component interfaces, and server-side request handling.',
        estimatedTime: '4 - 6 Weeks',
        modules: [
          {
            id: 'fs-mod-1',
            title: 'Client-Server Architecture & Modern Web Protocols',
            description: 'Network communication, HTTP headers, CORS policies, and REST conventions.',
            estimatedTime: '2 Weeks',
            prerequisites: 'Basic web browsing and programming fundamentals',
            topics: [
              {
                id: 'fs-top-1',
                title: 'Client-Server Communication & CORS Mechanics',
                description: 'Understanding the request-response lifecycle, cross-origin resource sharing, and preflight OPTIONS requests.',
                keyConcepts: ['Request-Response Cycle', 'CORS Headers', 'Preflight Requests', 'Payload Formatting'],
                objectives: [
                  'Configure production CORS policies on Express servers to allow authorized client domains.',
                  'Debug cross-origin network errors and preflight request failures in browser DevTools.',
                ],
                estimatedHours: '6 Hours',
              },
              {
                id: 'fs-top-2',
                title: 'Full-Stack Data Modeling & JSON Contracts',
                description: 'Designing shared TypeScript/JSON schema contracts that govern both frontend forms and backend models.',
                keyConcepts: ['DTO Patterns', 'Schema Serialization', 'Shared Validation', 'Type Safety'],
                objectives: [
                  'Formulate Data Transfer Objects (DTOs) that standardize payloads between client and server.',
                  'Share validation rules across frontend forms and backend controllers.',
                ],
                estimatedHours: '6 Hours',
              },
            ],
          },
          {
            id: 'fs-mod-2',
            title: 'Frontend UI Systems with React',
            description: 'Building interactive component trees, handling form states, and client routing.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Client-Server Architecture',
            topics: [
              {
                id: 'fs-top-3',
                title: 'React Component Hierarchies & Controlled Forms',
                description: 'Managing controlled form state, validation feedback, and reusable design token styling.',
                keyConcepts: ['Controlled Inputs', 'Form Validation State', 'Component Composition', 'Props Drilling vs Context'],
                objectives: [
                  'Build robust, accessible multi-step forms with immediate visual validation feedback.',
                  'Decompose complex UI pages into reusable, single-responsibility React components.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'fs-top-4',
                title: 'Client Routing & Navigation Guards',
                description: 'Client-side routing with React Router, protected route guards, and redirect states.',
                keyConcepts: ['Client Routing', 'Navigation Guards', 'Route Parameters', 'URL Query Sync'],
                objectives: [
                  'Implement authentication guards that protect private student workspaces and redirect guests.',
                  'Synchronize UI filter states with URL search parameters for shareable application views.',
                ],
                estimatedHours: '6 Hours',
              },
            ],
          },
        ],
      },
      {
        id: 'intermediate',
        title: 'Full-Stack Integration, Auth & Databases',
        description: 'End-to-end authentication, database migrations with ORMs, file uploads, and state synchronization.',
        estimatedTime: '6 - 8 Weeks',
        modules: [
          {
            id: 'fs-mod-3',
            title: 'Backend Engineering & Database ORMs',
            description: 'Express controller architecture, database relational modeling, and ORM migrations.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Frontend UI Systems with React',
            topics: [
              {
                id: 'fs-top-5',
                title: 'Database Schema Modeling & ORM Migrations',
                description: 'Modeling entities, relationships, foreign keys, and migration scripts with Prisma or Mongoose.',
                keyConcepts: ['Entity Relationships (1:1, 1:N, N:M)', 'ORM Query Builders', 'Database Migrations', 'Seed Data'],
                objectives: [
                  'Design relational or document schemas with automated versioned migration scripts.',
                  'Query complex entity relations with eager and lazy loading strategies to prevent N+1 queries.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'fs-top-6',
                title: 'RESTful Resource CRUD & Pagination',
                description: 'Building complete CRUD controller pipelines with cursor and offset pagination.',
                keyConcepts: ['CRUD Controller Pattern', 'Offset vs Cursor Pagination', 'Sort & Filter Middleware'],
                objectives: [
                  'Construct robust CRUD endpoints with consistent metadata, pagination, and error handling.',
                  'Implement cursor-based pagination for high-volume feed and list endpoints.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
          {
            id: 'fs-mod-4',
            title: 'Full-Stack Authentication & File Assets',
            description: 'JWT session tokens, secure cookies, avatar/file uploads, and cloud bucket integrations.',
            estimatedTime: '2 Weeks',
            prerequisites: 'Backend Engineering & Database ORMs',
            topics: [
              {
                id: 'fs-top-7',
                title: 'End-to-End JWT Auth & Protected Route Sync',
                description: 'Connecting client auth contexts with backend token verification and automatic refresh rotation.',
                keyConcepts: ['Auth Context Provider', 'HttpOnly Cookie Storage', 'Token Interceptors', 'Auto-Refresh Loop'],
                objectives: [
                  'Build an Axios/Fetch request interceptor that seamlessly handles token expiration and rotation.',
                  'Synchronize login, verification, and logout states across the entire application tree.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'fs-top-8',
                title: 'Cloud Asset Uploads & CDN Serving',
                description: 'Handling multipart form data, client image compression, presigned S3 URLs, and CDN delivery.',
                keyConcepts: ['Presigned URLs', 'Multipart Uploads (Multer)', 'S3 Storage Buckets', 'Image Optimization'],
                objectives: [
                  'Generate secure presigned URLs on the backend allowing direct client-to-cloud uploads.',
                  'Process and compress uploaded assets before persisting metadata in the database.',
                ],
                estimatedHours: '6 Hours',
              },
            ],
          },
          {
            id: 'fs-mod-5',
            title: 'Real-Time Communication & Cache Hydration',
            description: 'WebSocket bidirectional channels, full-stack state cache, and live status updates.',
            estimatedTime: '2 Weeks',
            prerequisites: 'Full-Stack Authentication',
            topics: [
              {
                id: 'fs-top-9',
                title: 'Real-Time Event Streaming with WebSockets',
                description: 'Bi-directional client-server communication using Socket.io or native WebSockets.',
                keyConcepts: ['WebSocket Handshake', 'Room Subscriptions', 'Event Broadcasting', 'Connection Reconnects'],
                objectives: [
                  'Implement real-time notification feeds and live status indicators across connected clients.',
                  'Handle network disconnections and heartbeats gracefully with exponential reconnection backoffs.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
        ],
      },
      {
        id: 'advanced',
        title: 'Deployment, CI/CD & System Architecture',
        description: 'Docker multi-stage builds, continuous deployment, end-to-end testing, and production monitoring.',
        estimatedTime: '6 - 8 Weeks',
        modules: [
          {
            id: 'fs-mod-6',
            title: 'Containerization & Production Deployment',
            description: 'Dockerizing full-stack monorepos, multi-stage compilation, and cloud infrastructure.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Intermediate Full-Stack Stack',
            topics: [
              {
                id: 'fs-top-10',
                title: 'Multi-Stage Docker Builds for Full-Stack Apps',
                description: 'Authoring lightweight, production-ready container images separating build and runtime steps.',
                keyConcepts: ['Multi-Stage Dockerfiles', 'Layer Caching', 'Environment Secrets', 'Docker Compose'],
                objectives: [
                  'Containerize both React frontend and Express backend into minimal Alpine/Debian slim images.',
                  'Orchestrate local full-stack development environments with MongoDB and Redis using Docker Compose.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'fs-top-11',
                title: 'CI/CD Pipelines & Cloud Production Hosting',
                description: 'Automating build, test, and zero-downtime deployment workflows using GitHub Actions.',
                keyConcepts: ['GitHub Actions Workflows', 'Zero-Downtime Deployments', 'Health Probes', 'Environment Variables'],
                objectives: [
                  'Construct an automated CI/CD pipeline that runs linter, test suites, and deploys upon git push.',
                  'Configure cloud deployment targets (Render, Railway, AWS ECS) with zero-downtime rolling updates.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
          {
            id: 'fs-mod-7',
            title: 'Full-Stack System Design & End-to-End Testing',
            description: 'E2E browser testing with Playwright, database rollback isolation, and architectural trade-offs.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Containerization & Production Deployment',
            topics: [
              {
                id: 'fs-top-12',
                title: 'End-to-End Testing Suites with Playwright',
                description: 'Automating full user workflows across browser, backend API, and real test databases.',
                keyConcepts: ['Playwright Test Suites', 'Database Seed & Cleanup', 'Network Interception', 'Visual Regression'],
                objectives: [
                  'Author comprehensive end-to-end tests validating onboarding, authentication, and CRUD workflows.',
                  'Isolate test execution with fresh ephemeral databases to eliminate flaky cross-test pollution.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'fs-top-13',
                title: 'Full-Stack Scalability & Architectural Trade-offs',
                description: 'Designing high-traffic full-stack applications with caching, database read replicas, and microservices.',
                keyConcepts: ['Monolith vs Microservices', 'Read Replicas & Connection Pools', 'Edge Caching', 'SSR Tradeoffs'],
                objectives: [
                  'Articulate the trade-offs between monolithic architectures and distributed microservices.',
                  'Design scalable full-stack architectures supporting tens of thousands of concurrent active users.',
                ],
                estimatedHours: '10 Hours',
              },
            ],
          },
        ],
      },
    ],
  },

  'software-engineer': {
    roleId: 'software-engineer',
    roleTitle: 'Software Engineer',
    subtitle: 'Algorithms & Core Computer Science',
    overview:
      'Excel in algorithmic problem solving, time-space complexity optimization, data structure selection, and clean modular object-oriented design.',
    learningObjectives: [
      'Master fundamental and advanced data structures: trees, graphs, heaps, and monotonic queues.',
      'Develop algorithmic fluency across dynamic programming, greedy strategies, and backtracking.',
      'Analyze exact Big-O time and space complexity bounds across best, average, and worst cases.',
      'Understand core computer science foundations: operating system processes, memory paging, and computer networking.',
      'Design modular, testable software applying classical object-oriented design patterns and SOLID principles.',
    ],
    levels: [
      {
        id: 'beginner',
        title: 'Core Programming & Linear Data Structures',
        description: 'Memory models, pointers, Big-O fundamentals, and linear data structures.',
        estimatedTime: '4 - 6 Weeks',
        modules: [
          {
            id: 'se-mod-1',
            title: 'Memory Models, Pointers & Complexity Analysis',
            description: 'Stack vs heap allocation, pointer mechanics, and asymptotic Big-O notations.',
            estimatedTime: '2 Weeks',
            prerequisites: 'Foundational programming in any language (Java, C++, Python, TS)',
            topics: [
              {
                id: 'se-top-1',
                title: 'Memory Architecture: Stack, Heap & Pointers',
                description: 'Understanding memory addresses, pointer dereferencing, stack frame allocation, and dynamic heap allocation.',
                keyConcepts: ['Stack vs Heap', 'Pointers & References', 'Memory Allocation', 'Garbage Collection vs Manual Free'],
                objectives: [
                  'Trace memory allocation for primitive values, objects, and nested arrays in runtime memory.',
                  'Differentiate pass-by-value and pass-by-reference semantics across function calls.',
                ],
                estimatedHours: '6 Hours',
              },
              {
                id: 'se-top-2',
                title: 'Asymptotic Analysis & Big-O Notation',
                description: 'Analyzing worst-case Big-O, best-case Big-Omega, average-case Big-Theta, and auxiliary space bounds.',
                keyConcepts: ['Big-O, Omega, Theta', 'Time vs Space Trade-offs', 'Amortized Complexity', 'Recurrence Relations'],
                objectives: [
                  'Calculate exact time and space complexity for recursive and nested-loop algorithms.',
                  'Analyze amortized insertion complexity in dynamic array doubling strategies.',
                ],
                estimatedHours: '6 Hours',
              },
            ],
          },
          {
            id: 'se-mod-2',
            title: 'Linear Data Structures & Classic Patterns',
            description: 'Arrays, strings, linked lists, stacks, queues, and two-pointer algorithms.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Memory Models & Complexity Analysis',
            topics: [
              {
                id: 'se-top-3',
                title: 'Arrays, Strings & Two-Pointer Strategies',
                description: 'In-place array manipulations, sliding window patterns, and two-pointer collision strategies.',
                keyConcepts: ['Two Pointers', 'Sliding Window', 'Prefix Sums', 'In-Place Inversion'],
                objectives: [
                  'Implement sliding window algorithms to solve maximum subarray and substring challenges in O(N).',
                  'Apply two-pointer convergent algorithms on sorted arrays to achieve optimal O(1) space.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'swe-top-4',
                title: 'Binary Search Mechanics and Interval Bisection',
                description: 'Logarithmic search mechanics, midpoint calculation invariants, search range bisection, and boundary conditions.',
                keyConcepts: ['Interval Bisection', 'Midpoint Calculation', 'Sorted Array Invariants', 'Logarithmic Complexity'],
                objectives: [
                  'Implement binary search over monotonic sequences without integer overflow.',
                  'Analyze discrete interval bisection across continuous and integer spaces.',
                ],
                estimatedHours: '6 Hours',
              },
              {
                id: 'se-top-4',
                title: 'Linked Lists: Singly, Doubly & Circular',
                description: 'Pointer manipulation, reversal algorithms, cycle detection (Floyd\'s algorithm), and dummy heads.',
                keyConcepts: ['Pointer Reversal', 'Floyd\'s Cycle Finding (Tortoise & Hare)', 'Dummy Head Nodes', 'Merge Sort on Lists'],
                objectives: [
                  'Reverse singly linked lists iteratively and recursively without auxiliary memory.',
                  'Detect and locate cycles in linked lists using two-pointer fast/slow traversal.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'se-top-5',
                title: 'Stacks, Queues & Monotonic Variants',
                description: 'LIFO and FIFO mechanics, parenthetical parsing, and monotonic stack/queue patterns.',
                keyConcepts: ['LIFO / FIFO Mechanics', 'Monotonic Stack', 'Next Greater Element', 'Sliding Window Maximum'],
                objectives: [
                  'Solve parsing and expression evaluation challenges using stack data structures.',
                  'Utilize monotonic stacks to find the next greater element in optimal O(N) linear time.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
        ],
      },
      {
        id: 'intermediate',
        title: 'Non-Linear Structures, Graphs & DP',
        description: 'Trees, heaps, graph traversals, greedy strategies, and dynamic programming.',
        estimatedTime: '6 - 8 Weeks',
        modules: [
          {
            id: 'se-mod-3',
            title: 'Trees, Binary Search Trees & Heaps',
            description: 'Hierarchical tree traversals, BST balancing mechanics, and binary heap priority queues.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Linear Data Structures',
            topics: [
              {
                id: 'se-top-6',
                title: 'Binary Trees & Traversal Algorithms',
                description: 'Inorder, preorder, postorder, and level-order BFS tree traversals with recursion and stacks.',
                keyConcepts: ['DFS Traversals (In/Pre/Post)', 'BFS Level Order', 'Lowest Common Ancestor (LCA)', 'Tree Height & Diameter'],
                objectives: [
                  'Implement iterative and recursive tree traversals with precise O(N) time and O(H) space bounds.',
                  'Find the lowest common ancestor of two nodes in binary trees and binary search trees.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'se-top-7',
                title: 'Binary Search Trees & Balanced Trees',
                description: 'BST search, insertion, deletion properties, and balanced trees (AVL / Red-Black concepts).',
                keyConcepts: ['BST Invariants', 'Inorder Successor Deletion', 'Self-Balancing Concepts', 'Tree Validation'],
                objectives: [
                  'Perform node deletion in binary search trees handling 0, 1, and 2 children scenarios.',
                  'Validate whether an arbitrary binary tree fulfills binary search tree invariants.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'se-top-8',
                title: 'Heaps & Priority Queues',
                description: 'Min-heaps, max-heaps, array representations, heapify operations, and top-K elements.',
                keyConcepts: ['Binary Heap Properties', 'Heapify Algorithm (O(N))', 'Top-K Elements Pattern', 'K-Way Merge'],
                objectives: [
                  'Implement binary heap insertion and extraction with O(log N) runtime guarantees.',
                  'Solve Top-K frequent elements and median finder challenges using dual priority queues.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
          {
            id: 'se-mod-4',
            title: 'Graphs, Traversals & Shortest Paths',
            description: 'Graph representations, BFS, DFS, topological sorting, and shortest path algorithms.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Trees & Heaps',
            topics: [
              {
                id: 'se-top-9',
                title: 'Graph Representations, BFS & DFS',
                description: 'Adjacency lists, adjacency matrices, connected components, and cycle detection in directed/undirected graphs.',
                keyConcepts: ['Adjacency Lists/Matrices', 'BFS Traversal', 'DFS Traversal', 'Cycle Detection (Coloring)'],
                objectives: [
                  'Model real-world networks using memory-efficient adjacency list representations.',
                  'Detect cycles in directed graphs using three-color depth-first search states.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'se-top-10',
                title: 'Topological Sort & Shortest Paths',
                description: 'Kahn\'s algorithm for DAGs, Dijkstra\'s algorithm with priority queues, and Bellman-Ford.',
                keyConcepts: ['Kahn\'s Algorithm (In-degree)', 'Dijkstra\'s Algorithm', 'Shortest Paths in DAGs', 'Disjoint Set Union (DSU)'],
                objectives: [
                  'Resolve task dependency orders using topological sorting with Kahn\'s algorithm.',
                  'Compute single-source shortest paths on weighted non-negative graphs using Dijkstra\'s algorithm.',
                ],
                estimatedHours: '10 Hours',
              },
            ],
          },
          {
            id: 'se-mod-5',
            title: 'Dynamic Programming & Paradigms',
            description: 'Overlapping subproblems, optimal substructure, memoization, tabulation, and backtracking.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Recursion & Trees',
            topics: [
              {
                id: 'se-top-11',
                title: 'Recursion & Backtracking Strategies',
                description: 'State space tree exploration, pruning conditions, permutations, combinations, and N-Queens.',
                keyConcepts: ['State Space Tree', 'Pruning', 'Subsets & Permutations', 'Constraint Satisfaction'],
                objectives: [
                  'Generate all valid combinations and permutations using state-space backtracking.',
                  'Prune unviable branches early to reduce exponential search spaces drastically.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'se-top-12',
                title: 'Dynamic Programming: 1D & 2D Tabulation',
                description: 'Top-down memoization vs bottom-up tabulation, 0/1 Knapsack, and Longest Common Subsequence.',
                keyConcepts: ['Overlapping Subproblems', 'Memoization vs Tabulation', '0/1 Knapsack Pattern', 'LCS & LIS Patterns'],
                objectives: [
                  'Formulate recurrence state transitions for 1D and 2D dynamic programming problems.',
                  'Optimize 2D dynamic programming matrices down to 1D sliding rows for space optimization.',
                ],
                estimatedHours: '10 Hours',
              },
            ],
          },
        ],
      },
      {
        id: 'advanced',
        title: 'Computer Science Core & System Design',
        description: 'Operating systems, memory management, networking protocols, design patterns, and system design.',
        estimatedTime: '6 - 8 Weeks',
        modules: [
          {
            id: 'se-mod-6',
            title: 'Operating Systems & Computer Networking',
            description: 'Processes, concurrency, virtual memory, TCP/IP handshakes, and socket communication.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Data Structures & Algorithms Foundations',
            topics: [
              {
                id: 'se-top-13',
                title: 'Processes, Threads & Synchronization',
                description: 'Process control blocks, context switching, multithreading, mutexes, semaphores, and deadlocks.',
                keyConcepts: ['Process vs Thread', 'Mutex & Semaphores', 'Deadlock Conditions (Coffman)', 'Race Conditions'],
                objectives: [
                  'Identify and resolve race conditions in multithreaded applications using atomic synchronization locks.',
                  'Analyze Coffman conditions to design deadlock-free multi-resource allocation systems.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'se-top-14',
                title: 'Virtual Memory, Paging & Storage',
                description: 'Page tables, translation lookaside buffers (TLB), page faults, cache locality, and disk I/O.',
                keyConcepts: ['Virtual Memory', 'Paging & TLB', 'Page Replacement (LRU)', 'Cache Spatial/Temporal Locality'],
                objectives: [
                  'Understand how modern operating systems map virtual memory to physical RAM frames.',
                  'Write cache-friendly code that exploits spatial and temporal memory locality.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'se-top-15',
                title: 'Computer Networking: OSI, TCP/IP & HTTP',
                description: 'Layered networking models, three-way TCP handshake, flow control, UDP, and DNS resolution.',
                keyConcepts: ['OSI 7-Layer Model', 'TCP Three-Way Handshake', 'Flow & Congestion Control', 'DNS Resolution & Sockets'],
                objectives: [
                  'Trace the full network packet lifecycle from client browser to remote server socket.',
                  'Evaluate TCP vs UDP protocol trade-offs for streaming, gaming, and transactional applications.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
          {
            id: 'se-mod-7',
            title: 'Software Engineering Design & Architecture',
            description: 'GoF design patterns, SOLID principles, modular clean architecture, and system scalability.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Full Algorithmic & CS Core',
            topics: [
              {
                id: 'se-top-16',
                title: 'Object-Oriented Design Patterns (GoF)',
                description: 'Creational (Factory, Singleton), Structural (Adapter, Decorator), and Behavioral (Observer, Strategy).',
                keyConcepts: ['Factory & Builder Patterns', 'Observer Pattern', 'Strategy Pattern', 'SOLID Principles'],
                objectives: [
                  'Refactor coupled procedural code into extensible patterns adhering to Open/Closed principle.',
                  'Implement behavioral strategy and observer patterns for modular event-driven applications.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'se-top-17',
                title: 'High-Level System Design & Scalability',
                description: 'Designing URL shorteners, key-value stores, rate limiters, and distributed file storage.',
                keyConcepts: ['Horizontal Scaling', 'Consistent Hashing', 'Load Balancers & Caching', 'Availability vs Consistency'],
                objectives: [
                  'Design end-to-end distributed systems meeting explicit scale, availability, and latency targets.',
                  'Present architectural system design trade-offs confidently in campus and senior technical interviews.',
                ],
                estimatedHours: '10 Hours',
              },
            ],
          },
        ],
      },
    ],
  },

  'data-analyst': {
    roleId: 'data-analyst',
    roleTitle: 'Data Analyst',
    subtitle: 'Business Intelligence & Quantitative Insights',
    overview:
      'Extract actionable signals from messy datasets with advanced SQL, exploratory data analysis, metric modeling, and executive dashboards.',
    learningObjectives: [
      'Master advanced SQL querying: complex joins, window functions, and Common Table Expressions.',
      'Perform data wrangling, cleaning, and exploratory data analysis using Python (Pandas/NumPy).',
      'Build interactive business intelligence dashboards in Power BI and Tableau with star schemas.',
      'Formulate and track core business metrics: CAC, LTV, churn cohorts, and conversion funnels.',
      'Design and evaluate A/B testing experiments using statistical hypothesis testing and significance bounds.',
    ],
    levels: [
      {
        id: 'beginner',
        title: 'Spreadsheets, SQL Core & Statistics',
        description: 'Data manipulation in spreadsheets, foundational SQL queries, and descriptive statistics.',
        estimatedTime: '4 - 6 Weeks',
        modules: [
          {
            id: 'da-mod-1',
            title: 'Advanced Spreadsheets & Quantitative Logic',
            description: 'Advanced formulas, pivot table modeling, data cleaning, and statistical distributions.',
            estimatedTime: '2 Weeks',
            prerequisites: 'Basic computer literacy and spreadsheet familiarity',
            topics: [
              {
                id: 'da-top-1',
                title: 'Lookup Functions & Dynamic Formula Modeling',
                description: 'Mastering XLOOKUP, INDEX/MATCH, dynamic array formulas, and nested conditional logic.',
                keyConcepts: ['XLOOKUP & INDEX/MATCH', 'Dynamic Arrays', 'Conditional Sums (SUMIFS)', 'Data Validation'],
                objectives: [
                  'Build financial and operational models utilizing dynamic XLOOKUP and multi-criteria SUMIFS.',
                  'Audit complex spreadsheet models to eliminate broken formula references and circular loops.',
                ],
                estimatedHours: '6 Hours',
              },
              {
                id: 'da-top-2',
                title: 'Descriptive Statistics & Data Distributions',
                description: 'Measures of central tendency, spread, standard deviation, variance, percentiles, and skewness.',
                keyConcepts: ['Mean, Median, Mode', 'Standard Deviation & Variance', 'Interquartile Range (IQR)', 'Normal Distribution'],
                objectives: [
                  'Calculate summary metrics to describe the central tendency and dispersion of business datasets.',
                  'Identify and evaluate data distribution skewness and potential outlier contamination.',
                ],
                estimatedHours: '6 Hours',
              },
            ],
          },
          {
            id: 'da-mod-2',
            title: 'Relational Database Querying with SQL',
            description: 'SQL syntax, table filtering, multi-table joins, and aggregate summary groupings.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Spreadsheets Core',
            topics: [
              {
                id: 'da-top-3',
                title: 'Data Extraction: SELECT, WHERE & GROUP BY',
                description: 'Querying tables with conditional filtering, sorting, logical operators, and group aggregations.',
                keyConcepts: ['SELECT & Filtering', 'GROUP BY & HAVING', 'Aggregate Functions (SUM, COUNT, AVG)', 'Date Functions'],
                objectives: [
                  'Write multi-table aggregate queries calculating department revenue and transaction counts.',
                  'Differentiate between WHERE pre-filtering and HAVING post-aggregation filter clauses.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'da-top-4',
                title: 'Relational Joins & Set Operations',
                description: 'INNER, LEFT, RIGHT, FULL OUTER joins, self-joins, and UNION/UNION ALL set queries.',
                keyConcepts: ['Join Types (Inner, Outer, Cross)', 'Self Joins', 'UNION vs UNION ALL', 'Handling NULLs'],
                objectives: [
                  'Combine data from normalized relational tables using appropriate join cardinalities.',
                  'Detect and resolve unintended cartesian explosion in multi-table queries.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
        ],
      },
      {
        id: 'intermediate',
        title: 'Advanced SQL, Python & BI Dashboards',
        description: 'Window functions, CTEs, Python data cleaning with Pandas, and Power BI/Tableau modeling.',
        estimatedTime: '6 - 8 Weeks',
        modules: [
          {
            id: 'da-mod-3',
            title: 'Advanced SQL for Analytical Querying',
            description: 'Analytical window functions, recursive CTEs, and query performance tuning.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Relational Database Querying',
            topics: [
              {
                id: 'da-top-5',
                title: 'Window Functions & Ranking Mechanics',
                description: 'ROW_NUMBER, RANK, DENSE_RANK, NTILE, running totals, and period-over-period LEAD/LAG.',
                keyConcepts: ['OVER (PARTITION BY ... ORDER BY)', 'Ranking Functions', 'LEAD & LAG', 'Running Sums'],
                objectives: [
                  'Calculate Month-over-Month growth rates using windowed LEAD and LAG offsets.',
                  'Compute cumulative running revenue totals and top-N ranking per category.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'da-top-6',
                title: 'Common Table Expressions (CTEs) & Subqueries',
                description: 'Modularizing complex business logic with readable WITH clauses and temporary views.',
                keyConcepts: ['Common Table Expressions (WITH)', 'Recursive CTEs', 'Correlated Subqueries', 'Query Optimization'],
                objectives: [
                  'Refactor complex nested subqueries into structured, readable sequential CTE pipelines.',
                  'Traverse organizational hierarchies and parent-child categories using recursive CTEs.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
          {
            id: 'da-mod-4',
            title: 'Python for Data Analysis (Pandas & NumPy)',
            description: 'Data wrangling, missing value treatment, exploratory analysis, and visualization libraries.',
            estimatedTime: '3 Weeks',
            prerequisites: 'SQL Core',
            topics: [
              {
                id: 'da-top-7',
                title: 'Pandas DataFrames, Cleansing & Imputation',
                description: 'Data ingestion, handling missing data, type casting, merging DataFrames, and string transformations.',
                keyConcepts: ['DataFrames & Series', 'Missing Data (dropna, fillna)', 'Merging & Concat', 'Vectorized Operations'],
                objectives: [
                  'Clean raw, noisy datasets by handling missing values, duplicates, and malformed strings.',
                  'Perform multi-table relational merges and reshapes using merge, melt, and pivot_table.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'da-top-8',
                title: 'Exploratory Data Analysis & Visualization',
                description: 'Uncovering trends, correlations, and anomalies using Matplotlib and Seaborn visualization suites.',
                keyConcepts: ['Histograms & Boxplots', 'Correlation Heatmaps', 'Pair Plots', 'Outlier Identification'],
                objectives: [
                  'Conduct thorough exploratory data analyses identifying key drivers and behavioral clusters.',
                  'Create executive-ready visualizations communicating underlying business trends.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
          {
            id: 'da-mod-5',
            title: 'Business Intelligence & Data Modeling',
            description: 'Star schema architecture, dimensional modeling, and interactive dashboards in Power BI/Tableau.',
            estimatedTime: '2 Weeks',
            prerequisites: 'Advanced SQL & Python Core',
            topics: [
              {
                id: 'da-top-9',
                title: 'Dimensional Modeling: Star & Snowflake Schemas',
                description: 'Fact tables, dimension tables, primary/foreign key mappings, and granularity definitions.',
                keyConcepts: ['Fact vs Dimension Tables', 'Star Schema Design', 'Surrogate Keys', 'SCD (Slowly Changing Dimensions)'],
                objectives: [
                  'Design analytical dimensional models optimized for BI engine query performance.',
                  'Implement Slowly Changing Dimensions to track historical customer attribute updates.',
                ],
                estimatedHours: '6 Hours',
              },
              {
                id: 'da-top-10',
                title: 'Interactive Dashboard Design & DAX Measures',
                description: 'Building interactive executive reports with dynamic slicers, DAX calculated measures, and drill-downs.',
                keyConcepts: ['DAX Calculated Columns vs Measures', 'Filter Context', 'Visual Drill-Throughs', 'User Experience'],
                objectives: [
                  'Construct calculated metrics (YTD, Prior Year Comparison) utilizing DAX filter context modifiers.',
                  'Design self-service interactive dashboards tailored for operational and executive stakeholders.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
        ],
      },
      {
        id: 'advanced',
        title: 'Business Metrics, A/B Testing & Decision Science',
        description: 'Unit economics, cohort retention, statistical A/B testing, and executive case studies.',
        estimatedTime: '6 - 8 Weeks',
        modules: [
          {
            id: 'da-mod-6',
            title: 'Business Metrics, Retention & Cohort Analytics',
            description: 'SaaS and e-commerce KPIs: CAC, LTV, churn rates, conversion funnels, and cohort retention matrices.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Full Intermediate Stack',
            topics: [
              {
                id: 'da-top-11',
                title: 'SaaS & E-Commerce Core Metrics Modeling',
                description: 'Formulating Customer Acquisition Cost, Lifetime Value, payback periods, and revenue expansion rates.',
                keyConcepts: ['CAC & LTV Modeling', 'MRR / ARR Churn', 'Payback Periods', 'Funnel Drop-Offs'],
                objectives: [
                  'Calculate blended and paid CAC across acquisition channels and relate to customer LTV.',
                  'Diagnose friction points along multi-step conversion funnels to recommend conversion optimizations.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'da-top-12',
                title: 'Cohort Retention Matrices & Heatmaps',
                description: 'Tracking customer behavioral retention over time across signup cohorts.',
                keyConcepts: ['Cohort Analysis', 'Retention Triangles', 'Churn Curves', 'Product Stickiness (DAU/MAU)'],
                objectives: [
                  'Build cohort retention matrices tracking 30/60/90-day retention decay across acquisition cohorts.',
                  'Identify product stickiness and user engagement inflection points.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
          {
            id: 'da-mod-7',
            title: 'A/B Testing, Experimentation & Root Cause Analysis',
            description: 'Hypothesis testing, statistical significance, p-values, sample size sizing, and anomaly investigation.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Business Metrics & Advanced SQL',
            topics: [
              {
                id: 'da-top-13',
                title: 'A/B Testing Frameworks & Significance Testing',
                description: 'Null hypothesis, Type I and Type II errors, confidence intervals, p-values, and sample size calculations.',
                keyConcepts: ['Null Hypothesis (H0)', 'Type I & Type II Errors', 'P-Values & Statistical Significance', 'Sample Size Power'],
                objectives: [
                  'Formulate testable hypotheses and calculate required sample sizes for statistical power.',
                  'Evaluate A/B test results to deliver decisive product launch/revert recommendations.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'da-top-14',
                title: 'Metric Anomaly Diagnosis & Analytical Case Studies',
                description: 'Investigating unexpected metric drops, isolating confounders, and presenting findings to leadership.',
                keyConcepts: ['Root Cause Analysis', 'Simpson\'s Paradox', 'Confounding Variables', 'Executive Communication'],
                objectives: [
                  'Dissect metric drop-offs systematically using segmented breakdown techniques.',
                  'Present analytical findings with clear commercial impact statements and risk mitigations.',
                ],
                estimatedHours: '10 Hours',
              },
            ],
          },
        ],
      },
    ],
  },

  'data-scientist': {
    roleId: 'data-scientist',
    roleTitle: 'Data Scientist',
    subtitle: 'Machine Learning & Statistical Inference',
    overview:
      'Formulate probabilistic models, feature engineering pipelines, supervised and unsupervised machine learning, and rigorous hypothesis tests.',
    learningObjectives: [
      'Master the mathematical and statistical foundations: linear algebra, calculus, and probability distributions.',
      'Build end-to-end supervised machine learning pipelines for classification and regression problems.',
      'Implement unsupervised learning for customer segmentation, clustering, and dimensionality reduction.',
      'Apply rigorous model validation: cross-validation, hyperparameter optimization, and loss function tuning.',
      'Understand deep learning architectures and production MLOps pipeline concepts.',
    ],
    levels: [
      {
        id: 'beginner',
        title: 'Math, Probability & Scientific Python',
        description: 'Linear algebra, multivariable calculus, probability distributions, and NumPy/Pandas vectorization.',
        estimatedTime: '4 - 6 Weeks',
        modules: [
          {
            id: 'ds-mod-1',
            title: 'Linear Algebra & Calculus for ML',
            description: 'Matrix vectorization, dot products, eigenvalues, gradients, and gradient descent optimization.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Basic Python programming and high-school algebra',
            topics: [
              {
                id: 'ds-top-1',
                title: 'Linear Algebra: Vectors, Matrices & Transformations',
                description: 'Matrix multiplication, vector projections, matrix inverses, eigenvalues, and Singular Value Decomposition (SVD).',
                keyConcepts: ['Vector Spaces & Projections', 'Matrix Rank & Inversion', 'Eigenvalues & Eigenvectors', 'SVD Foundations'],
                objectives: [
                  'Implement vectorized mathematical operations using NumPy without slow procedural loops.',
                  'Understand geometric transformations and their role in dimensionality reduction algorithms.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'ds-top-2',
                title: 'Calculus & Gradient Descent Optimization',
                description: 'Partial derivatives, chain rule, gradients, cost surfaces, and batch/stochastic gradient descent.',
                keyConcepts: ['Partial Derivatives & Gradients', 'Cost Functions (MSE, Cross-Entropy)', 'Stochastic Gradient Descent (SGD)', 'Learning Rates'],
                objectives: [
                  'Compute gradients of composite cost functions using the multivariable chain rule.',
                  'Implement gradient descent optimization updating model weights iteratively.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
          {
            id: 'ds-mod-2',
            title: 'Probability, Distributions & Exploratory Analysis',
            description: 'Bayes\' theorem, probability distributions, hypothesis testing, and statistical diagnostics.',
            estimatedTime: '2 Weeks',
            prerequisites: 'Linear Algebra & Calculus',
            topics: [
              {
                id: 'ds-top-3',
                title: 'Probability Theory, Bayes\' Theorem & Distributions',
                description: 'Conditional probability, independence, Bayes\' rule, Normal, Binomial, and Poisson distributions.',
                keyConcepts: ['Conditional Probability', 'Bayes\' Theorem', 'Normal & Poisson Distributions', 'Central Limit Theorem'],
                objectives: [
                  'Apply Bayes\' theorem to solve probabilistic classification and medical diagnosis scenarios.',
                  'Evaluate sample distributions against the Central Limit Theorem to assess normality.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'ds-top-4',
                title: 'Hypothesis Testing & Statistical Inference',
                description: 'Null hypothesis, p-values, Student\'s t-tests, Chi-square tests, and confidence intervals.',
                keyConcepts: ['Null Hypothesis (H0)', 'T-Tests & Z-Tests', 'Chi-Square Test of Independence', 'P-Value Interpretation'],
                objectives: [
                  'Execute two-sample t-tests to determine statistically significant differences between cohorts.',
                  'Apply Chi-square tests of independence on categorical demographic distributions.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
        ],
      },
      {
        id: 'intermediate',
        title: 'Machine Learning Pipelines & Modeling',
        description: 'Supervised regression/classification, tree ensembles, unsupervised clustering, and feature engineering.',
        estimatedTime: '6 - 8 Weeks',
        modules: [
          {
            id: 'ds-mod-3',
            title: 'Supervised Learning: Regression & Classification',
            description: 'Linear/logistic regression, regularization (Lasso/Ridge), decision trees, and ensemble boosting.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Math, Probability & Python Stack',
            topics: [
              {
                id: 'ds-top-5',
                title: 'Linear & Logistic Regression with Regularization',
                description: 'Ordinary least squares, sigmoid decision boundaries, L1 (Lasso) and L2 (Ridge) regularization.',
                keyConcepts: ['OLS Regression', 'Log-Odds & Sigmoid', 'L1 Lasso (Feature Selection)', 'L2 Ridge (Weight Shrinkage)'],
                objectives: [
                  'Train and interpret linear models with regularization penalties to prevent overfitting.',
                  'Interpret logistic regression log-odds coefficients to explain feature importances.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'ds-top-6',
                title: 'Decision Trees, Random Forests & Gradient Boosting',
                description: 'Gini impurity, information gain, bagging in Random Forests, and sequential boosting with XGBoost.',
                keyConcepts: ['Gini Impurity & Entropy', 'Bagging & Random Forests', 'Gradient Boosting (XGBoost/LightGBM)', 'Tree Pruning'],
                objectives: [
                  'Construct non-linear tree ensembles optimizing depth, min-samples-split, and learning rate.',
                  'Train and evaluate state-of-the-art XGBoost models on tabular classification benchmarks.',
                ],
                estimatedHours: '10 Hours',
              },
            ],
          },
          {
            id: 'ds-mod-4',
            title: 'Unsupervised Learning & Feature Engineering',
            description: 'K-Means, hierarchical clustering, PCA dimensionality reduction, and advanced feature transforms.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Supervised Learning',
            topics: [
              {
                id: 'ds-top-7',
                title: 'Clustering Algorithms: K-Means & DBSCAN',
                description: 'Centroid-based clustering, elbow method, silhouette scores, and density-based spatial clustering.',
                keyConcepts: ['K-Means Clustering', 'Elbow Method & Silhouette Score', 'DBSCAN Density Clustering'],
                objectives: [
                  'Segment customer populations using K-Means and determine optimal K using silhouette scores.',
                  'Apply DBSCAN to discover clusters of arbitrary geometric shape and isolate noise points.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'ds-top-8',
                title: 'Dimensionality Reduction (PCA) & Feature Pipelines',
                description: 'Principal Component Analysis, variance explained, one-hot vs target encoding, and feature scaling.',
                keyConcepts: ['PCA & Eigen-Decomposition', 'StandardScaler vs MinMaxScaler', 'Target Encoding', 'Scikit-Learn Pipelines'],
                objectives: [
                  'Project high-dimensional datasets onto principal components while preserving 95%+ variance.',
                  'Construct reproducible Scikit-Learn data pipelines preventing data leakage across train/test splits.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
          {
            id: 'ds-mod-5',
            title: 'Model Evaluation, Validation & Hyperparameter Tuning',
            description: 'Cross-validation, ROC-AUC, precision-recall curves, and hyperparameter optimization.',
            estimatedTime: '2 Weeks',
            prerequisites: 'Supervised & Unsupervised Learning',
            topics: [
              {
                id: 'ds-top-9',
                title: 'Model Evaluation Metrics & Imbalanced Data',
                description: 'Precision, Recall, F1-Score, ROC-AUC, PR-AUC curves, and handling severe class imbalance (SMOTE).',
                keyConcepts: ['Confusion Matrix', 'ROC-AUC vs PR-AUC', 'F1-Score Harmonic Mean', 'Class Imbalance & SMOTE'],
                objectives: [
                  'Select appropriate performance metrics for highly imbalanced fraud or anomaly detection tasks.',
                  'Apply undersampling and SMOTE synthetic oversampling techniques to balance training distributions.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
        ],
      },
      {
        id: 'advanced',
        title: 'Deep Learning & Production MLOps',
        description: 'Neural networks, PyTorch, Transformers, model serialization, and ML serving pipelines.',
        estimatedTime: '6 - 8 Weeks',
        modules: [
          {
            id: 'ds-mod-6',
            title: 'Deep Learning Foundations & Neural Architectures',
            description: 'Multi-layer perceptrons, backpropagation, activation functions, and deep learning with PyTorch.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Intermediate Machine Learning Pipeline',
            topics: [
              {
                id: 'ds-top-10',
                title: 'Neural Networks & Backpropagation with PyTorch',
                description: 'Forward pass, autograd computational graphs, loss backpropagation, and optimizer updates.',
                keyConcepts: ['Multi-Layer Perceptrons (MLP)', 'Autograd & Computational Graphs', 'Activations (ReLU, GELU)', 'PyTorch Tensors'],
                objectives: [
                  'Implement custom neural network architectures in PyTorch inheriting from nn.Module.',
                  'Train deep models with mini-batch data loaders, learning rate schedulers, and early stopping.',
                ],
                estimatedHours: '10 Hours',
              },
              {
                id: 'ds-top-11',
                title: 'Transformers, Embeddings & Modern Architectures',
                description: 'Attention mechanisms, self-attention, token embeddings, and fine-tuning pretrained models.',
                keyConcepts: ['Self-Attention Mechanism', 'Transformer Architecture', 'Vector Embeddings', 'Transfer Learning'],
                objectives: [
                  'Understand query, key, value matrix computations within multi-head self-attention layers.',
                  'Leverage pretrained HuggingFace transformer models for domain-specific classification tasks.',
                ],
                estimatedHours: '10 Hours',
              },
            ],
          },
          {
            id: 'ds-mod-7',
            title: 'MLOps, Model Serving & System Monitoring',
            description: 'Model serialization (ONNX), containerized inference APIs, and data drift monitoring.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Deep Learning Foundations',
            topics: [
              {
                id: 'ds-top-12',
                title: 'Model Serialization & REST API Serving',
                description: 'Exporting trained models to ONNX/Joblib and serving low-latency predictions via FastAPI.',
                keyConcepts: ['Model Export (ONNX / Joblib)', 'FastAPI Inference Endpoints', 'Batch Prediction vs Real-Time'],
                objectives: [
                  'Package trained Scikit-Learn and PyTorch models into containerized, low-latency prediction APIs.',
                  'Optimize inference latency using model quantization and batch prediction pipelines.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'ds-top-13',
                title: 'Data Drift, Concept Drift & Continuous Evaluation',
                description: 'Detecting covariate shift, concept drift, feature distribution divergence, and automated retraining.',
                keyConcepts: ['Data Drift vs Concept Drift', 'Kolmogorov-Smirnov Test', 'Evidently AI / Monitoring', 'Automated Retraining'],
                objectives: [
                  'Implement statistical tests monitoring incoming production features against training baselines.',
                  'Design automated alerts and retraining workflows when concept drift degrades prediction quality.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
        ],
      },
    ],
  },

  'devops-engineer': {
    roleId: 'devops-engineer',
    roleTitle: 'DevOps Engineer',
    subtitle: 'Cloud Platforms & CI/CD Pipelines',
    overview:
      'Automate infrastructure as code, container orchestration, zero-downtime deployment pipelines, and observability monitoring stacks.',
    learningObjectives: [
      'Master Linux system administration, shell automation scripting, and networking fundamentals.',
      'Containerize applications with multi-stage Docker builds and minimal attack surfaces.',
      'Construct automated CI/CD pipelines deploying zero-downtime rolling and canary releases.',
      'Provision reproducible cloud infrastructure using Terraform Infrastructure as Code (IaC).',
      'Orchestrate microservices with Kubernetes clusters, Ingress, and monitor with Prometheus & Grafana.',
    ],
    levels: [
      {
        id: 'beginner',
        title: 'Linux Systems, Networking & Scripting',
        description: 'Command line operations, file permissions, shell automation, and core networking.',
        estimatedTime: '4 - 6 Weeks',
        modules: [
          {
            id: 'do-mod-1',
            title: 'Linux Operating System & Administration',
            description: 'Linux filesystem, permissions, process monitoring, systemd services, and SSH.',
            estimatedTime: '2 Weeks',
            prerequisites: 'Basic terminal command literacy',
            topics: [
              {
                id: 'do-top-1',
                title: 'Linux Filesystem, Permissions & Users',
                description: 'FHS directory structure, octal permissions (chmod/chown), SUID, and user/group management.',
                keyConcepts: ['FHS Hierarchy', 'Permissions (rwx / octal)', 'chown & chmod', 'Sudo & User Privileges'],
                objectives: [
                  'Navigate and manage Linux directory structures adhering to the Filesystem Hierarchy Standard.',
                  'Enforce least-privilege file and directory permissions using numeric and symbolic notation.',
                ],
                estimatedHours: '6 Hours',
              },
              {
                id: 'do-top-2',
                title: 'Process Management & Systemd Service Daemons',
                description: 'Monitoring processes (ps, top, htop), signals (SIGTERM, SIGKILL), and authoring systemd service units.',
                keyConcepts: ['Process States & PID', 'Signals (SIGTERM / SIGKILL)', 'Systemd Service Units', 'systemctl & journalctl'],
                objectives: [
                  'Author and manage custom systemd daemon service files with automated restart policies.',
                  'Inspect system logs and debug failing service units using journalctl.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
          {
            id: 'do-mod-2',
            title: 'Networking & Shell Scripting Automation',
            description: 'Bash automation, pipes, text processing (awk/sed), and TCP/IP networking protocols.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Linux Administration',
            topics: [
              {
                id: 'do-top-3',
                title: 'Bash Scripting & Stream Text Processing',
                description: 'Shell variables, loops, conditionals, exit codes, and stream editing with awk, sed, and jq.',
                keyConcepts: ['Bash Control Flow', 'Exit Codes & Error Traps', 'Pipes & Redirections', 'awk, sed & jq Processing'],
                objectives: [
                  'Write robust, fault-tolerant shell automation scripts with set -euo pipefail safety flags.',
                  'Parse and transform structured log files and JSON payloads using awk and jq.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'do-top-4',
                title: 'Networking Fundamentals: DNS, Subnets & Firewalls',
                description: 'IPv4 subnetting, CIDR blocks, TCP vs UDP, DNS resolution, and packet filtering with iptables/UFW.',
                keyConcepts: ['CIDR & Subnetting', 'DNS Record Types (A, CNAME, MX)', 'Ports & Sockets', 'Firewalls (UFW / iptables)'],
                objectives: [
                  'Calculate IP network subnets and assign CIDR ranges for isolated cloud environments.',
                  'Diagnose networking and DNS resolution issues using dig, netstat, and curl.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
        ],
      },
      {
        id: 'intermediate',
        title: 'Containers, CI/CD & Cloud Infrastructure',
        description: 'Docker containerization, GitHub Actions pipelines, cloud VPCs, and Terraform IaC.',
        estimatedTime: '6 - 8 Weeks',
        modules: [
          {
            id: 'do-mod-3',
            title: 'Containerization with Docker',
            description: 'Image layers, multi-stage builds, rootless containers, and multi-container Compose stacks.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Linux & Scripting Foundations',
            topics: [
              {
                id: 'do-top-5',
                title: 'Docker Architecture & Multi-Stage Compilation',
                description: 'Namespaces, cgroups, writing production Dockerfiles, layer caching, and multi-stage builds.',
                keyConcepts: ['Linux Namespaces & cgroups', 'Image Layer Caching', 'Multi-Stage Dockerfiles', 'Non-Root Users'],
                objectives: [
                  'Construct minimal, secure container images eliminating unnecessary build toolchains from final artifacts.',
                  'Run containers under dedicated non-root users to mitigate container breakout vulnerabilities.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'do-top-6',
                title: 'Docker Compose & Container Networking',
                description: 'Multi-service local orchestration, bridge networks, volume mounts, and secret management.',
                keyConcepts: ['Docker Compose', 'Bridge & Host Networking', 'Named Volumes', 'Health Checks'],
                objectives: [
                  'Orchestrate multi-tier local development stacks combining application, database, and cache services.',
                  'Configure named volume mounts and health checks for database persistence.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
          {
            id: 'do-mod-4',
            title: 'CI/CD Automation Pipelines',
            description: 'GitHub Actions, automated test workflows, artifact registries, and zero-downtime releases.',
            estimatedTime: '2 Weeks',
            prerequisites: 'Docker Containerization',
            topics: [
              {
                id: 'do-top-7',
                title: 'GitHub Actions & Pipeline Automation',
                description: 'Events, jobs, step matrices, caching dependencies, and publishing images to registries (GHCR/DockerHub).',
                keyConcepts: ['Workflow Triggers', 'Matrix Builds', 'Action Cache', 'Registry Authentication (GHCR)'],
                objectives: [
                  'Author reusable CI pipelines that run linters, tests, and publish version-tagged Docker images.',
                  'Accelerate pipeline execution using build caching and parallelized matrix jobs.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'do-top-8',
                title: 'Release Strategies: Rolling, Blue/Green & Canary',
                description: 'Zero-downtime deployment patterns, canary traffic splitting, and automated health verification.',
                keyConcepts: ['Rolling Updates', 'Blue/Green Deployments', 'Canary Releases', 'Automated Rollback'],
                objectives: [
                  'Evaluate deployment risk profiles and implement automated blue/green release switches.',
                  'Configure canary deployments with automated traffic rollback upon elevated HTTP error thresholds.',
                ],
                estimatedHours: '6 Hours',
              },
            ],
          },
          {
            id: 'do-mod-5',
            title: 'Infrastructure as Code (IaC) with Terraform',
            description: 'Declarative cloud provisioning, state file management, modular architecture, and cloud VPCs.',
            estimatedTime: '3 Weeks',
            prerequisites: 'CI/CD & Cloud Basics',
            topics: [
              {
                id: 'do-top-9',
                title: 'Terraform Core: Providers, Resources & State',
                description: 'HCL syntax, provider configuration, remote state locking with S3/DynamoDB, and plan/apply workflows.',
                keyConcepts: ['HCL Syntax', 'Terraform State Management', 'Remote State Locking', 'Plan & Apply Cycles'],
                objectives: [
                  'Provision cloud virtual networks, compute instances, and storage buckets using declarative HCL.',
                  'Configure remote state storage with distributed locking to prevent concurrent state corruption.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'do-top-10',
                title: 'Terraform Modules & Cloud VPC Architecture',
                description: 'Reusable infrastructure modules, public/private subnets, NAT gateways, and security groups.',
                keyConcepts: ['Reusable Terraform Modules', 'Public/Private Subnets', 'NAT Gateways', 'Security Group Rules'],
                objectives: [
                  'Architect production cloud VPCs isolating database instances in private subnets behind NAT gateways.',
                  'Package infrastructure components into reusable, parameter-driven Terraform modules.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
        ],
      },
      {
        id: 'advanced',
        title: 'Kubernetes Orchestration & SRE Observability',
        description: 'Kubernetes architecture, Helm charts, Prometheus/Grafana monitoring, and site reliability.',
        estimatedTime: '6 - 8 Weeks',
        modules: [
          {
            id: 'do-mod-6',
            title: 'Kubernetes Cluster Orchestration',
            description: 'Pods, Deployments, Services, Ingress controllers, ConfigMaps, and cluster autoscaling.',
            estimatedTime: '4 Weeks',
            prerequisites: 'Docker & Cloud Infrastructure',
            topics: [
              {
                id: 'do-top-11',
                title: 'Kubernetes Architecture: Control Plane & Workloads',
                description: 'API Server, etcd, scheduler, kubelet, Pod lifecycle, Deployments, and ReplicaSets.',
                keyConcepts: ['Control Plane & Kubelet', 'Pod Lifecycle', 'Deployments & ReplicaSets', 'Resource Requests & Limits'],
                objectives: [
                  'Deploy highly available microservice workloads with explicit memory and CPU resource boundaries.',
                  'Execute rolling updates and zero-downtime version rollbacks using native Kubernetes controllers.',
                ],
                estimatedHours: '10 Hours',
              },
              {
                id: 'do-top-12',
                title: 'Kubernetes Networking, Ingress & Helm Packaging',
                description: 'ClusterIP vs NodePort vs LoadBalancer, Ingress routing, TLS termination, and Helm charts.',
                keyConcepts: ['Kubernetes Services', 'Ingress Controllers (Nginx)', 'TLS Secret Termination', 'Helm Chart Templating'],
                objectives: [
                  'Route external HTTP traffic to internal cluster services with Ingress path rules and TLS certificates.',
                  'Package and version multi-service Kubernetes applications using Helm chart templates.',
                ],
                estimatedHours: '10 Hours',
              },
            ],
          },
          {
            id: 'do-mod-7',
            title: 'SRE Observability, Metrics & Security',
            description: 'Prometheus metrics scraping, Grafana dashboards, centralized logging, and error budgets.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Kubernetes Orchestration',
            topics: [
              {
                id: 'do-top-13',
                title: 'Metrics & Monitoring with Prometheus & Grafana',
                description: 'Time-series scraping, PromQL queries, alerting rules, and executive Grafana dashboards.',
                keyConcepts: ['Prometheus Scrapes & Exporters', 'PromQL Queries', 'Alertmanager Routing', 'Grafana Visualizations'],
                objectives: [
                  'Deploy Prometheus exporters and instrument services to monitor request throughput and error rates.',
                  'Construct Grafana dashboards displaying golden signals: latency, traffic, errors, and saturation.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'do-top-14',
                title: 'Centralized Logging, Distributed Tracing & SRE',
                description: 'Log aggregation (Loki/Fluentd), OpenTelemetry tracing, and defining SLA/SLO/SLI error budgets.',
                keyConcepts: ['Log Aggregation (Loki)', 'OpenTelemetry Traces', 'SLI / SLO / SLA Definitions', 'Error Budgets'],
                objectives: [
                  'Aggregate structured application logs into searchable centralized dashboards.',
                  'Establish service level objectives (SLOs) and calculate allowable error budgets for deployments.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
        ],
      },
    ],
  },

  'mobile-app-developer': {
    roleId: 'mobile-app-developer',
    roleTitle: 'Mobile App Developer',
    subtitle: 'Native & Cross-Platform UX',
    overview:
      'Build responsive, offline-resilient mobile applications with lifecycle awareness, local persistence, smooth touch interactions, and native APIs.',
    learningObjectives: [
      'Master typed mobile programming languages (Kotlin, Swift, TypeScript) and reactive paradigms.',
      'Construct declarative mobile user interfaces with Jetpack Compose, SwiftUI, or React Native.',
      'Implement robust navigation hierarchies, deep linking, and mobile application state management.',
      'Design offline-first mobile persistence with SQLite, Room, or CoreData alongside REST API synchronization.',
      'Optimize mobile rendering performance, battery life, memory consumption, and publish to app stores.',
    ],
    levels: [
      {
        id: 'beginner',
        title: 'Mobile Core & Declarative UI',
        description: 'Mobile architectural paradigms, typed languages, and declarative component layouts.',
        estimatedTime: '4 - 6 Weeks',
        modules: [
          {
            id: 'mob-mod-1',
            title: 'Mobile Programming Foundations & Architectures',
            description: 'Typed languages for mobile, reactive state streams, and MVC vs MVP vs MVVM architectures.',
            estimatedTime: '2 Weeks',
            prerequisites: 'Basic programming fundamentals',
            topics: [
              {
                id: 'mob-top-1',
                title: 'Mobile Architecture: MVVM & State Streams',
                description: 'Separating UI presentation from reactive ViewModels, observable data streams, and business logic.',
                keyConcepts: ['MVVM Architecture', 'Observable State Streams', 'Data Binding', 'Clean Architecture'],
                objectives: [
                  'Structure mobile projects using the Model-View-ViewModel (MVVM) pattern with unidirectional data flow.',
                  'Decouple business logic into testable ViewModel layers isolated from platform UI references.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'mob-top-2',
                title: 'Typed Languages: Null Safety & Concurrency',
                description: 'Modern mobile language features: null safety, coroutines/async tasks, and data classes.',
                keyConcepts: ['Null Safety Operators', 'Coroutines / Async Tasks', 'Data Classes & Structs', 'Lambdas'],
                objectives: [
                  'Eliminate null pointer exceptions at compile time using strict language null-safety operators.',
                  'Dispatch background asynchronous operations without blocking the main mobile UI thread.',
                ],
                estimatedHours: '6 Hours',
              },
            ],
          },
          {
            id: 'mob-mod-2',
            title: 'Declarative UI Development & Layout Systems',
            description: 'Declarative composable layouts, screen densities, touch gestures, and responsive adaptation.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Mobile Architecture Foundations',
            topics: [
              {
                id: 'mob-top-3',
                title: 'Declarative Layouts & Screen Density Scaling',
                description: 'Building flexible responsive views with Compose, SwiftUI, or React Native across diverse screen ratios.',
                keyConcepts: ['Declarative UI Trees', 'Density-Independent Pixels (dp/pt)', 'Modifiers & Modifiers Chaining', 'Responsive Ratios'],
                objectives: [
                  'Build adaptive mobile screens that scale gracefully from compact phones to large tablets and foldables.',
                  'Compose complex UI screens using column, row, and constraint-based declarative primitives.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'mob-top-4',
                title: 'Touch Gestures, Animations & Haptics',
                description: 'Drag gestures, swipe-to-dismiss, spring physics animations, and tactile haptic feedback.',
                keyConcepts: ['Physics-Based Springs', 'Gesture Detectors', 'Haptic Feedback Engines', 'Shared Element Transitions'],
                objectives: [
                  'Implement smooth, 60 FPS gesture-driven animations and swipe interactions.',
                  'Integrate subtle tactile haptic responses for user confirmation and state updates.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
        ],
      },
      {
        id: 'intermediate',
        title: 'Navigation, Persistence & Networking',
        description: 'Stack navigation, deep linking, offline-first SQLite databases, and background tasks.',
        estimatedTime: '6 - 8 Weeks',
        modules: [
          {
            id: 'mob-mod-3',
            title: 'Mobile Navigation & Deep Linking',
            description: 'Stack navigators, bottom tab bars, modal presentations, and handling incoming universal deep links.',
            estimatedTime: '2 Weeks',
            prerequisites: 'Declarative UI Development',
            topics: [
              {
                id: 'mob-top-5',
                title: 'Navigation Stacks, Tab Controllers & Modals',
                description: 'Constructing robust multi-stack application navigation with persistent state and back-button behavior.',
                keyConcepts: ['Stack Navigation', 'Bottom Tab Controllers', 'Back Stack Management', 'Parameter Passing'],
                objectives: [
                  'Implement multi-level navigation hierarchies supporting tab bars, nested stacks, and modal dialogs.',
                  'Manage platform-specific hardware back button navigation safely without crashing.',
                ],
                estimatedHours: '6 Hours',
              },
              {
                id: 'mob-top-6',
                title: 'Universal Links & Deep Link Routing',
                description: 'Parsing custom URL schemes, universal web links, and routing directly to deeply nested mobile screens.',
                keyConcepts: ['Universal Links (iOS)', 'App Links (Android)', 'URL Scheme Parsing', 'Deferred Deep Linking'],
                objectives: [
                  'Configure operating system link associations allowing browser URLs to launch native app screens.',
                  'Route incoming link parameters directly into appropriate nested screen ViewModels.',
                ],
                estimatedHours: '6 Hours',
              },
            ],
          },
          {
            id: 'mob-mod-4',
            title: 'Networking & Offline-First Persistence',
            description: 'HTTP client interceptors, JWT refresh loops, Room/CoreData SQLite databases, and cache synchronization.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Mobile Navigation',
            topics: [
              {
                id: 'mob-top-7',
                title: 'Offline-First Local Persistence (Room / CoreData / SQLite)',
                description: 'Relational local database storage, entity migrations, DAO queries, and reactive observable table queries.',
                keyConcepts: ['Room / CoreData DAOs', 'Entity Relationships', 'Schema Version Migrations', 'Reactive Table Queries'],
                objectives: [
                  'Persist application state locally in SQLite relational databases for immediate offline availability.',
                  'Execute database schema version migrations without erasing existing customer records.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'mob-top-8',
                title: 'Network Synchronization & Token Interceptors',
                description: 'HTTP client setup, automatic token refresh, error retry policies, and background queue sync.',
                keyConcepts: ['HTTP Interceptors', 'Refresh Token Dance', 'Offline Queue Sync', 'Network Reachability'],
                objectives: [
                  'Construct HTTP client interceptors that automatically renew expired JWT tokens transparently.',
                  'Queue write operations locally when offline and synchronize with backend APIs upon reconnect.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
          {
            id: 'mob-mod-5',
            title: 'Device Hardware APIs & App Lifecycles',
            description: 'Application lifecycle states, background execution policies, push notifications, and permissions.',
            estimatedTime: '2 Weeks',
            prerequisites: 'Networking & Persistence',
            topics: [
              {
                id: 'mob-top-9',
                title: 'Mobile App Lifecycle & Memory Management',
                description: 'Handling foreground, background, inactive, and suspended states, and low-memory warnings.',
                keyConcepts: ['Lifecycle States (Active/Background/Suspended)', 'onSaveInstanceState', 'Memory Warnings', 'Background Workers'],
                objectives: [
                  'Save and restore volatile UI state when the operating system terminates background processes.',
                  'Schedule battery-efficient background sync tasks using native background worker APIs.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'mob-top-10',
                title: 'Runtime Permissions & Push Notifications',
                description: 'Requesting camera, storage, and location runtime permissions, and integrating FCM/APNs push notifications.',
                keyConcepts: ['Runtime Permission Rationale', 'FCM & APNs Integration', 'Notification Channels', 'Payload Handling'],
                objectives: [
                  'Implement graceful runtime permission request flows with user-friendly explanations.',
                  'Handle remote push notification payloads across both background and active application states.',
                ],
                estimatedHours: '6 Hours',
              },
            ],
          },
        ],
      },
      {
        id: 'advanced',
        title: 'Performance, Security & App Publishing',
        description: 'Memory profiling, 60/120 FPS rendering, biometric security, and App Store / Google Play publishing.',
        estimatedTime: '6 - 8 Weeks',
        modules: [
          {
            id: 'mob-mod-6',
            title: 'Mobile Performance Profiling & Optimization',
            description: 'Eliminating frame drops, measuring memory leaks, reducing app bundle size, and battery optimization.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Intermediate Mobile Stack',
            topics: [
              {
                id: 'mob-top-11',
                title: 'UI Rendering Performance: 60/120 FPS & Overdraw',
                description: 'Diagnosing frame drops, measuring GPU overdraw, optimizing heavy list rendering, and image memory caches.',
                keyConcepts: ['GPU Overdraw Profiling', 'Frame Drops (Jank)', 'Lazy List Recycling', 'Image Memory Caches (Glide/Coil)'],
                objectives: [
                  'Audit and eliminate GPU overdraw on deeply nested layout trees to sustain smooth 60/120 FPS.',
                  'Optimize image memory consumption through proactive downsampling and disk cache policies.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'mob-top-12',
                title: 'Memory Leaks & Native Profiling Tools',
                description: 'Tracking static context leaks, circular closures, profiling with Android Studio Profiler and Xcode Instruments.',
                keyConcepts: ['Memory Leaks (LeakCanary)', 'Heap Dumps', 'Xcode Instruments (Leaks)', 'CPU Profiling'],
                objectives: [
                  'Inspect heap dump snapshots to identify and fix retaining memory leak references.',
                  'Profile CPU spikes and thread contention using native platform profiling tools.',
                ],
                estimatedHours: '8 Hours',
              },
            ],
          },
          {
            id: 'mob-mod-7',
            title: 'Mobile Security, CI/CD & App Store Releases',
            description: 'Keychain/Keystore encryption, biometric authentication, Fastlane automation, and store compliance.',
            estimatedTime: '3 Weeks',
            prerequisites: 'Mobile Performance Profiling',
            topics: [
              {
                id: 'mob-top-13',
                title: 'Mobile Security: Keystore, Biometrics & SSL Pinning',
                description: 'Hardware-backed encryption (KeyStore/Keychain), biometric authentication, and certificate pinning.',
                keyConcepts: ['Secure Hardware Enclave (Keystore/Keychain)', 'Biometric Auth (FaceID/Fingerprint)', 'SSL Certificate Pinning', 'Code Obfuscation (R8/ProGuard)'],
                objectives: [
                  'Encrypt sensitive tokens and user credentials using hardware-backed cryptographic keys.',
                  'Prevent man-in-the-middle network interception by enforcing SSL certificate pinning.',
                ],
                estimatedHours: '8 Hours',
              },
              {
                id: 'mob-top-14',
                title: 'CI/CD with Fastlane & App Store Publishing',
                description: 'Automating code signing, beta distributions (TestFlight), and store deployment pipelines with Fastlane.',
                keyConcepts: ['Fastlane Automation', 'Code Signing Certificates', 'TestFlight / Internal Testing', 'Store Release Compliance'],
                objectives: [
                  'Automate code signing and build artifact uploads to TestFlight and Google Play Internal Sharing.',
                  'Navigate app store privacy, permission declarations, and store review guidelines.',
                ],
                estimatedHours: '10 Hours',
              },
            ],
          },
        ],
      },
    ],
  },
}

/**
 * Retrieves the full preparation roadmap for a given role ID.
 *
 * @param {string} roleId
 * @returns {object|null}
 */
export function getRoadmapByRoleId(roleId) {
  if (!roleId) return null
  return INTERVIEW_ROADMAPS[roleId] || null
}

/**
 * Retrieves a specific topic by role ID and topic ID.
 *
 * @param {string} roleId
 * @param {string} topicId
 * @returns {{ role: object, level: object, module: object, topic: object } | null}
 */
// Canonical Pilot Topic Definitions & Mappings for Software Engineer track
export const CANONICAL_PILOT_TOPIC_SPECS = {
  'swe-top-1': {
    id: 'swe-top-1',
    title: 'Arrays and Two-Pointer Scanning Mechanics',
    description: 'In-place array manipulations, two-pointer scanning, convergent pointers, and sliding window mechanics.',
    keyConcepts: ['Two-Pointer Traversal', 'In-Place Partitioning', 'Sliding Window', 'Prefix Sums'],
    objectives: [
      'Master two-pointer convergent scanning on linear contiguous arrays.',
      'Implement in-place array partitioning with optimal O(1) auxiliary space.',
    ],
    estimatedHours: '6 Hours',
    levelId: 'beginner',
    moduleId: 'se-mod-2',
  },
  'swe-top-4': {
    id: 'swe-top-4',
    title: 'Binary Search Mechanics and Interval Bisection',
    description: 'Logarithmic search mechanics, midpoint calculation invariants, search range bisection, and boundary conditions.',
    keyConcepts: ['Interval Bisection', 'Midpoint Calculation', 'Sorted Array Invariants', 'Logarithmic Complexity'],
    objectives: [
      'Implement binary search over monotonic sequences without integer overflow.',
      'Analyze discrete interval bisection across continuous and integer spaces.',
    ],
    estimatedHours: '6 Hours',
    levelId: 'beginner',
    moduleId: 'se-mod-2',
  },
  'swe-top-7': {
    id: 'swe-top-7',
    title: 'Binary Search Trees, Invariants and Balancing',
    description: 'Binary search tree ordering invariants, search, insertion, node deletion, and tree balancing fundamentals.',
    keyConcepts: ['BST Invariants', 'Inorder Successor Deletion', 'Tree Balancing', 'Traversal Mechanics'],
    objectives: [
      'Verify binary search tree invariants across arbitrary node structures.',
      'Perform three-case node deletion while preserving invariant subtree ordering.',
    ],
    estimatedHours: '8 Hours',
    levelId: 'intermediate',
    moduleId: 'se-mod-3',
  },
  'swe-top-9': {
    id: 'swe-top-9',
    title: 'Graph Traversals: BFS, DFS and Cycle Detection',
    description: 'Breadth-first search, depth-first search, graph representations, and cycle detection in directed/undirected graphs.',
    keyConcepts: ['Adjacency Lists', 'BFS Queue Mechanics', 'DFS Recursion/Stack', 'Three-Color Cycle Detection'],
    objectives: [
      'Execute BFS and DFS traversals across connected and disconnected graphs.',
      'Detect cycles in directed and undirected graphs with optimal time complexity.',
    ],
    estimatedHours: '8 Hours',
    levelId: 'intermediate',
    moduleId: 'se-mod-4',
  },
  'swe-top-13': {
    id: 'swe-top-13',
    title: 'Dynamic Programming: Optimal Substructure and Memoization',
    description: 'Optimal substructure, overlapping subproblems, memoization vs tabulation, and state transition formulation.',
    keyConcepts: ['Optimal Substructure', 'Overlapping Subproblems', 'Memoization (Top-Down)', 'Tabulation (Bottom-Up)'],
    objectives: [
      'Formulate recurrence relations and identify state dimensions for dynamic programs.',
      'Transform exponential brute-force recursions into polynomial time solutions.',
    ],
    estimatedHours: '8 Hours',
    levelId: 'intermediate',
    moduleId: 'se-mod-5',
  },
}

export const ROADMAP_TO_CANONICAL_PILOT_MAP = {
  'se-top-3': 'swe-top-1',
  'swe-top-1': 'swe-top-1',
  'swe-top-4': 'swe-top-4',
  'se-top-7': 'swe-top-7',
  'swe-top-7': 'swe-top-7',
  'se-top-9': 'swe-top-9',
  'swe-top-9': 'swe-top-9',
  'se-top-12': 'swe-top-13',
  'swe-top-13': 'swe-top-13',
  // Phase 5.1 Batch 1 direct mappings
  'se-top-2': 'se-top-2',
  'se-top-4': 'se-top-4',
  'se-top-5': 'se-top-5',
  'se-top-6': 'se-top-6',
  // Phase 5.1 Batch 2A direct mappings
  'se-top-8': 'se-top-8',
  'se-top-10': 'se-top-10',
  'se-top-11': 'se-top-11',
}

/**
 * Retrieves a specific topic by role ID and topic ID.
 * Supports canonical pilot topic IDs (swe-top-*) as well as roadmap topic IDs (se-top-*).
 *
 * @param {string} roleId
 * @param {string} topicId
 * @returns {{ role: object, level: object, module: object, topic: object } | null}
 */
export function getTopicById(roleId, topicId) {
  const roadmap = getRoadmapByRoleId(roleId)
  if (!roadmap || !topicId) return null

  // 1. Direct match in canonical pilot topics specification
  if (roleId === 'software-engineer' && CANONICAL_PILOT_TOPIC_SPECS[topicId]) {
    const spec = CANONICAL_PILOT_TOPIC_SPECS[topicId]
    const level = roadmap.levels.find((l) => l.id === spec.levelId) || roadmap.levels[0]
    const module = level.modules.find((m) => m.id === spec.moduleId) || level.modules[0]
    return {
      role: roadmap,
      level,
      module,
      topic: {
        id: spec.id,
        title: spec.title,
        description: spec.description,
        keyConcepts: spec.keyConcepts,
        objectives: spec.objectives,
        estimatedHours: spec.estimatedHours,
      },
    }
  }

  // 2. Direct match across roadmap structure
  for (const level of roadmap.levels) {
    for (const mod of level.modules) {
      const topic = mod.topics.find((t) => t.id === topicId)
      if (topic) {
        return {
          role: roadmap,
          level,
          module: mod,
          topic,
        }
      }
    }
  }

  return null
}

export default INTERVIEW_ROADMAPS
