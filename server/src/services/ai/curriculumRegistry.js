/**
 * Curriculum Registry for CareerLaunch Interview Roadmaps
 *
 * Provides authoritative topic IDs, titles, default difficulty levels,
 * and knowledge source support status for Frontend Developer specialization.
 */

export const OFFICIAL_FRONTEND_TOPICS = {
  'fe-top-1': {
    topicId: 'fe-top-1',
    title: 'Semantic Markup & Accessibility Outlines',
    moduleTitle: 'HTML5 Semantic Architecture',
    difficulty: 'beginner',
    hasIngestedSource: true, // whatwg-standards
    verifiedSourceId: 'whatwg-standards',
  },
  'fe-top-2': {
    topicId: 'fe-top-2',
    title: 'CSS Box Model, Flexbox & Grid Systems',
    moduleTitle: 'CSS Layout Engines & Modern Styling',
    difficulty: 'beginner',
    hasIngestedSource: true, // w3c-standards
    verifiedSourceId: 'w3c-standards',
  },
  'fe-top-3': {
    topicId: 'fe-top-3',
    title: 'Responsive Design, Fluid Typography & Media Queries',
    moduleTitle: 'CSS Layout Engines & Modern Styling',
    difficulty: 'beginner',
    hasIngestedSource: true, // w3c-standards
    verifiedSourceId: 'w3c-standards',
  },
  'fe-top-4': {
    topicId: 'fe-top-4',
    title: 'Modern JavaScript Fundamentals & Memory Model',
    moduleTitle: 'JavaScript Deep Dive & Web APIs',
    difficulty: 'beginner',
    hasIngestedSource: true, // ecma-standards
    verifiedSourceId: 'ecma-standards',
  },
  'fe-top-5': {
    topicId: 'fe-top-5',
    title: 'DOM Tree Architecture, Event Bubbling & Delegation',
    moduleTitle: 'JavaScript Deep Dive & Web APIs',
    difficulty: 'intermediate',
    hasIngestedSource: false,
  },
  'fe-top-6': {
    topicId: 'fe-top-6',
    title: 'Asynchronous JavaScript & the Browser Event Loop',
    moduleTitle: 'JavaScript Deep Dive & Web APIs',
    difficulty: 'intermediate',
    hasIngestedSource: false,
  },
  'fe-top-7': {
    topicId: 'fe-top-7',
    title: 'React Component Architecture & Virtual DOM',
    moduleTitle: 'React & Modern Frontend Frameworks',
    difficulty: 'intermediate',
    hasIngestedSource: false,
  },
  'fe-top-8': {
    topicId: 'fe-top-8',
    title: 'Component Lifecycle & Side Effects in React',
    moduleTitle: 'React & Modern Frontend Frameworks',
    difficulty: 'intermediate',
    hasIngestedSource: false,
  },
  'fe-top-9': {
    topicId: 'fe-top-9',
    title: 'Modern React Hooks: useState, useEffect, useRef & Custom Hooks',
    moduleTitle: 'React & Modern Frontend Frameworks',
    difficulty: 'intermediate',
    hasIngestedSource: false,
  },
  'fe-top-10': {
    topicId: 'fe-top-10',
    title: 'State Management: Context API & Unidirectional Data Flow',
    moduleTitle: 'State Management & Client Architecture',
    difficulty: 'intermediate',
    hasIngestedSource: false,
  },
  'fe-top-11': {
    topicId: 'fe-top-11',
    title: 'Predictable State Containers: Redux Architecture & Middleware',
    moduleTitle: 'State Management & Client Architecture',
    difficulty: 'advanced',
    hasIngestedSource: false,
  },
  'fe-top-12': {
    topicId: 'fe-top-12',
    title: 'Server State, Caching & Data Synchronization',
    moduleTitle: 'State Management & Client Architecture',
    difficulty: 'advanced',
    hasIngestedSource: false,
  },
  'fe-top-13': {
    topicId: 'fe-top-13',
    title: 'Web Accessibility (a11y) Standards & WCAG 2.1 Compliance',
    moduleTitle: 'Web Performance, Security & Tooling',
    difficulty: 'intermediate',
    hasIngestedSource: false,
  },
  'fe-top-14': {
    topicId: 'fe-top-14',
    title: 'Core Web Vitals & Web Performance Optimization',
    moduleTitle: 'Web Performance, Security & Tooling',
    difficulty: 'advanced',
    hasIngestedSource: false,
  },
  'fe-top-15': {
    topicId: 'fe-top-15',
    title: 'Browser Rendering Pipeline, Reflow, Repaint & Profiling',
    moduleTitle: 'Web Performance, Security & Tooling',
    difficulty: 'advanced',
    hasIngestedSource: false,
  },
  'fe-top-16': {
    topicId: 'fe-top-16',
    title: 'Frontend Testing: Unit, Integration & End-to-End Methodologies',
    moduleTitle: 'Web Performance, Security & Tooling',
    difficulty: 'intermediate',
    hasIngestedSource: false,
  },
  'fe-top-17': {
    topicId: 'fe-top-17',
    title: 'Production Build Tooling, Bundlers & Deployment Architecture',
    moduleTitle: 'Web Performance, Security & Tooling',
    difficulty: 'advanced',
    hasIngestedSource: false,
  },
}

/**
 * Validates if an ID is an authorized official curriculum topic ID.
 */
export function isOfficialFrontendTopicId(id) {
  return typeof id === 'string' && Object.prototype.hasOwnProperty.call(OFFICIAL_FRONTEND_TOPICS, id.trim())
}

/**
 * Checks knowledge source support status for a given topic.
 */
export function checkTopicKnowledgeSupport(topicId, topicSource) {
  if (topicSource === 'student_custom' || !topicId) {
    return 'source_review_required'
  }
  const cleanId = String(topicId).trim()
  const match = OFFICIAL_FRONTEND_TOPICS[cleanId]
  if (match && match.hasIngestedSource) {
    return 'verified'
  }
  return 'roadmap_topic'
}
