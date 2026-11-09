/**
 * Role-Specific Skill Taxonomies for CareerLaunch
 *
 * Grounded in the approved Architecture Blueprint (docs/CAREERLAUNCH_NEW_PRODUCT_ARCHITECTURE_BLUEPRINT.md).
 * Frontend Developer is the primary pilot role across 12 approved technical domains.
 */

export const FRONTEND_DEVELOPER_SKILL_TAXONOMY = {
  roleId: 'frontend-developer',
  roleTitle: 'Frontend Developer',
  subtitle: 'UI Engineering & Web Architecture',
  categories: [
    {
      categoryId: 'html-accessibility',
      categoryName: '1. HTML & Accessibility',
      description: 'Semantic document structure, landmark elements, accessible form controls, and screen-reader outlines.',
      skills: [
        {
          skillId: 'fe-skill-html-semantics',
          name: 'Semantic HTML5 & Landmark Outlines',
          officialTopicId: 'fe-top-1',
          description: 'Document outlining, semantic elements (<main>, <nav>, <article>), accessibility tree basics, and semantic forms.',
          tiers: ['beginner', 'intermediate', 'advanced'],
          interviewWeight: 'high',
          knowledgeSupportStatus: 'verified',
        },
        {
          skillId: 'fe-skill-wcag-a11y',
          name: 'WCAG 2.1 Compliance & Keyboard Navigation',
          officialTopicId: 'fe-top-13',
          description: 'ARIA roles, focus trapping in modal dialogs, accessible names, contrast ratios, and screen-reader audit techniques.',
          tiers: ['intermediate', 'advanced'],
          interviewWeight: 'high',
          knowledgeSupportStatus: 'roadmap_topic',
        },
      ],
    },
    {
      categoryId: 'css-responsive',
      categoryName: '2. CSS & Responsive Design',
      description: 'CSS box model, flexbox alignment, grid layouts, fluid typography, and responsive media query systems.',
      skills: [
        {
          skillId: 'fe-skill-css-layout',
          name: 'Box Model, Flexbox & CSS Grid Systems',
          officialTopicId: 'fe-top-2',
          description: 'Content-box vs border-box, flex container axis alignments, CSS Grid repeat(auto-fill, minmax()), and centering mechanics.',
          tiers: ['beginner', 'intermediate', 'advanced'],
          interviewWeight: 'critical',
          knowledgeSupportStatus: 'verified',
        },
        {
          skillId: 'fe-skill-responsive-design',
          name: 'Responsive Design & Media Queries',
          officialTopicId: 'fe-top-3',
          description: 'Fluid clamp() scaling, viewport units (vw, vh, dvh), container queries, and mobile-first breakpoint hierarchies.',
          tiers: ['beginner', 'intermediate'],
          interviewWeight: 'high',
          knowledgeSupportStatus: 'verified',
        },
        {
          skillId: 'fe-skill-modern-css',
          name: 'Modern CSS: Variables, Subgrid & Modules',
          officialTopicId: null,
          description: 'CSS custom properties (theming tokens), CSS subgrid, CSS Modules scoping, and nesting syntax.',
          tiers: ['intermediate', 'advanced'],
          interviewWeight: 'medium',
          knowledgeSupportStatus: 'roadmap_topic',
        },
      ],
    },
    {
      categoryId: 'javascript',
      categoryName: '3. JavaScript',
      description: 'Core ECMAScript runtime, execution context, closures, prototypal inheritance, and the browser event loop.',
      skills: [
        {
          skillId: 'fe-skill-js-execution-scope',
          name: 'Execution Context, Scopes & Closures',
          officialTopicId: 'fe-top-4',
          description: 'Call stack, hoisting, let/const temporal dead zone (TDZ), lexical environments, closures, and memory retention.',
          tiers: ['beginner', 'intermediate', 'advanced'],
          interviewWeight: 'critical',
          knowledgeSupportStatus: 'verified',
        },
        {
          skillId: 'fe-skill-js-async-eventloop',
          name: 'Asynchronous JS & Browser Event Loop',
          officialTopicId: 'fe-top-6',
          description: 'Microtask queue vs macrotask queue, Promises chaining, async/await error handling, and event loop starvation.',
          tiers: ['intermediate', 'advanced'],
          interviewWeight: 'critical',
          knowledgeSupportStatus: 'roadmap_topic',
        },
        {
          skillId: 'fe-skill-dom-events',
          name: 'DOM Architecture, Events & Delegation',
          officialTopicId: 'fe-top-5',
          description: 'DOM tree mutation, event bubbling, capturing phase, event delegation pattern, and passive event listeners.',
          tiers: ['beginner', 'intermediate'],
          interviewWeight: 'high',
          knowledgeSupportStatus: 'roadmap_topic',
        },
      ],
    },
    {
      categoryId: 'typescript',
      categoryName: '4. TypeScript',
      description: 'Static type checking, interfaces, type aliases, advanced generics, and TypeScript component patterns.',
      skills: [
        {
          skillId: 'fe-skill-ts-static-types',
          name: 'Static Typing & Core Annotations',
          officialTopicId: null,
          description: 'Primitive types, union and intersection types, interfaces vs type aliases, optional chaining, and type narrowing.',
          tiers: ['beginner', 'intermediate'],
          interviewWeight: 'high',
          knowledgeSupportStatus: 'source_review_required',
        },
        {
          skillId: 'fe-skill-ts-generics',
          name: 'Advanced Generics & Utility Types',
          officialTopicId: null,
          description: 'Generic functions and interfaces, keyof, Record, Partial, Pick, Omit, and conditional type inference.',
          tiers: ['intermediate', 'advanced'],
          interviewWeight: 'high',
          knowledgeSupportStatus: 'source_review_required',
        },
      ],
    },
    {
      categoryId: 'react',
      categoryName: '5. React',
      description: 'Component architecture, Virtual DOM diffing, reconciliation, JSX compilation, and React Hooks lifecycle.',
      skills: [
        {
          skillId: 'fe-skill-react-jsx-vdom',
          name: 'JSX Compilation, Virtual DOM & Reconciliation',
          officialTopicId: 'fe-top-7',
          description: 'Babel/SWC JSX transformation, React Fiber reconciliation, element key stability in lists, and purity rules.',
          tiers: ['beginner', 'intermediate'],
          interviewWeight: 'critical',
          knowledgeSupportStatus: 'roadmap_topic',
        },
        {
          skillId: 'fe-skill-react-components',
          name: 'Component Architecture, Props & Lifecycle',
          officialTopicId: 'fe-top-7',
          description: 'Unidirectional data flow, container vs presentational patterns, composition over inheritance, and props immutability.',
          tiers: ['beginner', 'intermediate'],
          interviewWeight: 'critical',
          knowledgeSupportStatus: 'roadmap_topic',
        },
        {
          skillId: 'fe-skill-react-hooks-core',
          name: 'Modern Hooks: useState, useEffect & useRef',
          officialTopicId: 'fe-top-8',
          description: 'Functional state updaters, effect dependency arrays, effect cleanup functions, and mutable refs for DOM access.',
          tiers: ['beginner', 'intermediate'],
          interviewWeight: 'critical',
          knowledgeSupportStatus: 'roadmap_topic',
        },
        {
          skillId: 'fe-skill-react-hooks-advanced',
          name: 'Advanced Hooks: useMemo, useCallback & Custom Hooks',
          officialTopicId: 'fe-top-9',
          description: 'Referential equality, memoizing expensive computations, stabilizing callback references, and extracting custom reusable hooks.',
          tiers: ['intermediate', 'advanced'],
          interviewWeight: 'critical',
          knowledgeSupportStatus: 'roadmap_topic',
        },
      ],
    },
    {
      categoryId: 'nextjs',
      categoryName: '6. Next.js',
      description: 'Modern full-stack React framework: App Router, Server Components, Server Actions, and hybrid rendering.',
      skills: [
        {
          skillId: 'fe-skill-nextjs-app-router',
          name: 'Next.js App Router & Server Components (RSC)',
          officialTopicId: null,
          description: 'React Server Components vs Client Components ("use client"), nested layouts, loading/error boundaries, and streaming SSR.',
          tiers: ['intermediate', 'advanced'],
          interviewWeight: 'high',
          knowledgeSupportStatus: 'source_review_required',
        },
        {
          skillId: 'fe-skill-nextjs-data-actions',
          name: 'Server Actions, Route Handlers & Data Fetching',
          officialTopicId: null,
          description: 'Server Actions form mutations, revalidatePath/revalidateTag caching, dynamic route handlers, and SEO metadata API.',
          tiers: ['intermediate', 'advanced'],
          interviewWeight: 'high',
          knowledgeSupportStatus: 'source_review_required',
        },
      ],
    },
    {
      categoryId: 'state-management',
      categoryName: '7. State Management',
      description: 'Local component state, Context API, Redux Toolkit, and asynchronous server cache management.',
      skills: [
        {
          skillId: 'fe-skill-state-context',
          name: 'React Context API & Unidirectional Flow',
          officialTopicId: 'fe-top-10',
          description: 'Prop drilling mitigation, Context Provider value memoization, and avoiding re-render bottlenecks across subtrees.',
          tiers: ['beginner', 'intermediate'],
          interviewWeight: 'high',
          knowledgeSupportStatus: 'roadmap_topic',
        },
        {
          skillId: 'fe-skill-state-redux',
          name: 'Global Stores: Redux Toolkit (RTK) & Slices',
          officialTopicId: 'fe-top-11',
          description: 'Predictable state containers, Immer-powered reducers, createSlice, useSelector selector optimization, and middleware.',
          tiers: ['intermediate', 'advanced'],
          interviewWeight: 'high',
          knowledgeSupportStatus: 'source_review_required',
        },
        {
          skillId: 'fe-skill-state-server-cache',
          name: 'Server State & Client Caching (TanStack Query)',
          officialTopicId: 'fe-top-12',
          description: 'Query key invalidation, stale-while-revalidate lifecycle, optimistic UI updates, and mutation side effects.',
          tiers: ['intermediate', 'advanced'],
          interviewWeight: 'high',
          knowledgeSupportStatus: 'source_review_required',
        },
      ],
    },
    {
      categoryId: 'api-integration',
      categoryName: '8. API Integration',
      description: 'Consuming HTTP services, REST contracts, Fetch API abstraction, handling network errors, and real-time sockets.',
      skills: [
        {
          skillId: 'fe-skill-api-rest-fetch',
          name: 'Fetch API, Axios & REST Client Contracts',
          officialTopicId: 'fe-top-12',
          description: 'HTTP status codes, AbortController request cancellation, interceptors, request timeout handling, and typed responses.',
          tiers: ['beginner', 'intermediate'],
          interviewWeight: 'high',
          knowledgeSupportStatus: 'roadmap_topic',
        },
        {
          skillId: 'fe-skill-api-websockets',
          name: 'WebSockets & Real-Time Client Streams',
          officialTopicId: null,
          description: 'Full-duplex WebSocket connections, heartbeat pings, reconnect algorithms, and Server-Sent Events (SSE).',
          tiers: ['intermediate', 'advanced'],
          interviewWeight: 'medium',
          knowledgeSupportStatus: 'roadmap_topic',
        },
      ],
    },
    {
      categoryId: 'browser-fundamentals',
      categoryName: '9. Browser Fundamentals',
      description: 'Browser client storage mechanisms, cookies security, CORS headers, and web application security foundations.',
      skills: [
        {
          skillId: 'fe-skill-browser-storage',
          name: 'Client Storage: localStorage, sessionStorage & Cookies',
          officialTopicId: null,
          description: 'Storage quotas, synchronous I/O trade-offs, cookie attributes (HttpOnly, Secure, SameSite=Lax/Strict), and IndexedDB.',
          tiers: ['beginner', 'intermediate'],
          interviewWeight: 'high',
          knowledgeSupportStatus: 'roadmap_topic',
        },
        {
          skillId: 'fe-skill-browser-security',
          name: 'Web Security: CORS, XSS & CSRF Defense',
          officialTopicId: null,
          description: 'Same-Origin Policy, Cross-Origin Resource Sharing preflight requests, DOM sanitization against XSS, and anti-CSRF tokens.',
          tiers: ['intermediate', 'advanced'],
          interviewWeight: 'critical',
          knowledgeSupportStatus: 'roadmap_topic',
        },
      ],
    },
    {
      categoryId: 'web-performance',
      categoryName: '10. Web Performance',
      description: 'Core Web Vitals measurement, rendering pipeline profiling, layout reflows, and asset bundle splitting.',
      skills: [
        {
          skillId: 'fe-skill-perf-web-vitals',
          name: 'Core Web Vitals & Diagnostic Auditing',
          officialTopicId: 'fe-top-14',
          description: 'Largest Contentful Paint (LCP), Interaction to Next Paint (INP), Cumulative Layout Shift (CLS), and Lighthouse profiling.',
          tiers: ['intermediate', 'advanced'],
          interviewWeight: 'high',
          knowledgeSupportStatus: 'roadmap_topic',
        },
        {
          skillId: 'fe-skill-perf-rendering-pipeline',
          name: 'Rendering Pipeline, Reflow, Repaint & Compositing',
          officialTopicId: 'fe-top-15',
          description: 'Critical rendering path, forced synchronous layouts, GPU compositor layers, and animating transform/opacity.',
          tiers: ['intermediate', 'advanced'],
          interviewWeight: 'high',
          knowledgeSupportStatus: 'roadmap_topic',
        },
        {
          skillId: 'fe-skill-perf-bundle-splitting',
          name: 'Code Splitting, Dynamic Imports & Asset Optimization',
          officialTopicId: 'fe-top-17',
          description: 'React.lazy & Suspense, dynamic import(), tree shaking, modern image formats (AVIF/WebP), and bundle analysis.',
          tiers: ['intermediate', 'advanced'],
          interviewWeight: 'high',
          knowledgeSupportStatus: 'roadmap_topic',
        },
      ],
    },
    {
      categoryId: 'testing-tooling',
      categoryName: '11. Testing & Tooling',
      description: 'Writing resilient component tests, mocking network responses, and testing user interactions.',
      skills: [
        {
          skillId: 'fe-skill-testing-unit-rtl',
          name: 'Unit & Component Testing (Vitest / RTL / Jest)',
          officialTopicId: 'fe-top-16',
          description: 'User-centric queries (getByRole, getByLabelText), testing user interactions, Mock Service Worker (MSW), and test coverage.',
          tiers: ['intermediate', 'advanced'],
          interviewWeight: 'high',
          knowledgeSupportStatus: 'roadmap_topic',
        },
      ],
    },
    {
      categoryId: 'git-github',
      categoryName: '12. Git & GitHub',
      description: 'Professional version control, branching models, pull request hygiene, and resolving merge conflicts.',
      skills: [
        {
          skillId: 'fe-skill-git-workflow',
          name: 'Git Branching, Pull Requests & Version Control',
          officialTopicId: null,
          description: 'Feature branching, git rebase vs merge, writing clean conventional commits, resolving conflicts, and PR reviews.',
          tiers: ['beginner', 'intermediate'],
          interviewWeight: 'critical',
          knowledgeSupportStatus: 'roadmap_topic',
        },
      ],
    },
  ],
}

/**
 * Returns skill taxonomy for a role.
 * Currently Frontend Developer is the implementation pilot.
 */
export function getSkillsTaxonomyByRoleId(roleId) {
  if (roleId === 'frontend-developer') {
    return FRONTEND_DEVELOPER_SKILL_TAXONOMY
  }
  return null
}

/**
 * Finds a specific skill by skillId within a role's taxonomy.
 */
export function findSkillById(roleId, skillId) {
  const taxonomy = getSkillsTaxonomyByRoleId(roleId)
  if (!taxonomy) return null

  for (const cat of taxonomy.categories) {
    const found = cat.skills.find((s) => s.skillId === skillId)
    if (found) {
      return {
        ...found,
        categoryId: cat.categoryId,
        categoryName: cat.categoryName,
      }
    }
  }
  return null
}

/**
 * Validates an array of skill IDs against the taxonomy.
 */
export function validateSkillIds(roleId, skillIds) {
  const taxonomy = getSkillsTaxonomyByRoleId(roleId)
  if (!taxonomy || !Array.isArray(skillIds)) return { validSkills: [], invalidIds: [] }

  const validSkills = []
  const invalidIds = []

  for (const id of skillIds) {
    const skill = findSkillById(roleId, id)
    if (skill) {
      validSkills.push(skill)
    } else {
      invalidIds.push(id)
    }
  }

  return { validSkills, invalidIds }
}
