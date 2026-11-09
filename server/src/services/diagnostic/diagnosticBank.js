/**
 * Diagnostic Question Bank for Frontend Developer Specialization
 *
 * Covers 8 core frontend domains across Beginner, Intermediate, and Advanced tiers.
 * Each question has:
 * - Deterministic objective grading for MCQs.
 * - Structured rubric definitions with required keywords/concepts for written questions.
 * - Alignment with official curriculum topic IDs (fe-top-1 to fe-top-17).
 */

export const FRONTEND_DIAGNOSTIC_BANK = [
  // ---------------------------------------------------------------------------
  // 1. HTML & Accessibility (fe-top-1)
  // ---------------------------------------------------------------------------
  {
    questionId: 'diag-fe-html-01',
    domain: 'html_accessibility',
    topicId: 'fe-top-1',
    topicTitle: 'Semantic Markup & Accessibility Outlines',
    difficulty: 'beginner',
    type: 'objective',
    prompt: 'Which HTML element should you use for an interactive element that triggers an action on the current page without navigating to a new URL?',
    options: [
      '<div onclick="doAction()">',
      '<a href="#">',
      '<button type="button">',
      '<span role="action">',
    ],
    correctOptionIndex: 2,
    explanation: 'The native <button type="button"> element is semantic, natively keyboard-focusable via Tab, and responds to Enter and Space keys without requiring custom ARIA roles or JavaScript keyboard handlers.',
    rubric: null,
  },
  {
    questionId: 'diag-fe-html-02',
    domain: 'html_accessibility',
    topicId: 'fe-top-1',
    topicTitle: 'Semantic Markup & Accessibility Outlines',
    difficulty: 'intermediate',
    type: 'objective',
    prompt: 'When creating an accessible input field with helpful instructions, which attribute on the <input> correctly associates the helper text container (<p id="pw-hint">) with the input for screen readers?',
    options: [
      'aria-controls="pw-hint"',
      'aria-describedby="pw-hint"',
      'aria-labelledby="pw-hint"',
      'aria-details="pw-hint"',
    ],
    correctOptionIndex: 1,
    explanation: 'aria-describedby establishes an accessible description relationship between an interactive widget and its supplementary instructions or error messages.',
    rubric: null,
  },
  {
    questionId: 'diag-fe-html-03',
    domain: 'html_accessibility',
    topicId: 'fe-top-1',
    topicTitle: 'Semantic Markup & Accessibility Outlines',
    difficulty: 'advanced',
    type: 'written',
    prompt: 'Explain what focus trapping is in the context of an accessible modal dialog, and describe two critical behaviors required when a modal opens and closes.',
    options: [],
    correctOptionIndex: null,
    explanation: 'Focus trapping ensures keyboard focus stays inside the active modal overlay while it remains open.',
    rubric: {
      criteria: [
        'Explains that focus trapping restricts Tab and Shift+Tab navigation to elements inside the modal',
        'Mentions moving initial focus into the modal or first interactive element upon opening',
        'Mentions restoring focus to the trigger button that launched the modal upon closing',
      ],
      requiredKeywords: ['focus', 'tab', 'modal', 'restore', 'trigger'],
    },
  },

  // ---------------------------------------------------------------------------
  // 2. CSS & Responsive Design (fe-top-2, fe-top-3)
  // ---------------------------------------------------------------------------
  {
    questionId: 'diag-fe-css-01',
    domain: 'css_responsive',
    topicId: 'fe-top-2',
    topicTitle: 'CSS Box Model, Flexbox & Grid Systems',
    difficulty: 'beginner',
    type: 'objective',
    prompt: 'When an element has width: 200px, padding: 20px, border: 2px solid black, and box-sizing: border-box, what is the element\'s total rendered outer width?',
    options: ['200px', '244px', '222px', '160px'],
    correctOptionIndex: 0,
    explanation: 'With box-sizing: border-box, padding and border are included within the specified width, meaning the total rendered width remains exactly 200px.',
    rubric: null,
  },
  {
    questionId: 'diag-fe-css-02',
    domain: 'css_responsive',
    topicId: 'fe-top-2',
    topicTitle: 'CSS Box Model, Flexbox & Grid Systems',
    difficulty: 'intermediate',
    type: 'objective',
    prompt: 'In a standard CSS Flexbox container with flex-direction: row, which property aligns flex items along the cross axis (vertical direction)?',
    options: [
      'justify-content',
      'align-items',
      'align-content',
      'place-content',
    ],
    correctOptionIndex: 1,
    explanation: 'In flex-direction: row, the main axis is horizontal (controlled by justify-content) and the cross axis is vertical (controlled by align-items).',
    rubric: null,
  },
  {
    questionId: 'diag-fe-css-03',
    domain: 'css_responsive',
    topicId: 'fe-top-3',
    topicTitle: 'Responsive Design, Fluid Typography & Media Queries',
    difficulty: 'advanced',
    type: 'objective',
    prompt: 'Which CSS Grid declaration creates an auto-wrapping, responsive grid where columns automatically adapt without needing fixed media query breakpoints?',
    options: [
      'grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))',
      'grid-template-columns: repeat(3, 1fr)',
      'grid-template-columns: auto auto auto',
      'grid-template-columns: minmax(auto, 100%)',
    ],
    correctOptionIndex: 0,
    explanation: 'repeat(auto-fill, minmax(280px, 1fr)) dynamically packs as many columns of at least 280px as fit the viewport, expanding equally up to 1fr.',
    rubric: null,
  },

  // ---------------------------------------------------------------------------
  // 3. JavaScript Core Fundamentals (fe-top-4)
  // ---------------------------------------------------------------------------
  {
    questionId: 'diag-fe-js-01',
    domain: 'javascript_core',
    topicId: 'fe-top-4',
    topicTitle: 'Modern JavaScript Fundamentals & Memory Model',
    difficulty: 'beginner',
    type: 'objective',
    prompt: 'What is the key scoping difference between variables declared with let/const versus variables declared with var?',
    options: [
      'let/const are block-scoped, while var is function-scoped',
      'let/const are global-scoped, while var is module-scoped',
      'let/const are hoisted and initialized to undefined, while var is not hoisted',
      'var is immutable, while let/const can always be reassigned',
    ],
    correctOptionIndex: 0,
    explanation: 'let and const are block-scoped (scoped to the nearest enclosing curly braces { }), whereas var is hoisted to the enclosing function or global execution context.',
    rubric: null,
  },
  {
    questionId: 'diag-fe-js-02',
    domain: 'javascript_core',
    topicId: 'fe-top-4',
    topicTitle: 'Modern JavaScript Fundamentals & Memory Model',
    difficulty: 'intermediate',
    type: 'objective',
    prompt: 'What is a JavaScript closure?',
    options: [
      'A method used to safely close database connections and open streams',
      'A function bundled together with references to its lexical environment',
      'An immediately invoked function expression used strictly to avoid variable leaks',
      'An object prototype method that freezes an object from future mutations',
    ],
    correctOptionIndex: 1,
    explanation: 'A closure is the combination of a function bundled together with references to its surrounding lexical state (lexical environment), allowing it to access outer variables even after the outer function has finished executing.',
    rubric: null,
  },
  {
    questionId: 'diag-fe-js-03',
    domain: 'javascript_core',
    topicId: 'fe-top-4',
    topicTitle: 'Modern JavaScript Fundamentals & Memory Model',
    difficulty: 'advanced',
    type: 'written',
    prompt: 'Explain what the Temporal Dead Zone (TDZ) is in modern JavaScript, when it occurs, and what happens if a variable in the TDZ is accessed.',
    options: [],
    correctOptionIndex: null,
    explanation: 'The TDZ is the period between entering a block scope and the variable declaration where accessing let/const throws a ReferenceError.',
    rubric: {
      criteria: [
        'States that TDZ applies to let and const declarations',
        'Explains that TDZ is the duration between entering scope and actual variable evaluation/initialization',
        'Notes that accessing the variable during TDZ throws a ReferenceError',
      ],
      requiredKeywords: ['temporal', 'scope', 'let', 'const', 'referenceerror', 'initialization'],
    },
  },

  // ---------------------------------------------------------------------------
  // 4. DOM & Asynchronous JavaScript (fe-top-5, fe-top-6)
  // ---------------------------------------------------------------------------
  {
    questionId: 'diag-fe-async-01',
    domain: 'dom_async',
    topicId: 'fe-top-5',
    topicTitle: 'DOM Tree Architecture, Event Bubbling & Delegation',
    difficulty: 'beginner',
    type: 'objective',
    prompt: 'What pattern attaches a single event listener to a common parent element rather than attaching separate listeners to dozens of child list items?',
    options: [
      'Event Throttling',
      'Event Delegation',
      'Event Debouncing',
      'Event Binding',
    ],
    correctOptionIndex: 1,
    explanation: 'Event Delegation leverages event bubbling to handle events at a common ancestor element using event.target, minimizing memory overhead and supporting dynamically added children.',
    rubric: null,
  },
  {
    questionId: 'diag-fe-async-02',
    domain: 'dom_async',
    topicId: 'fe-top-6',
    topicTitle: 'Asynchronous JavaScript & the Browser Event Loop',
    difficulty: 'intermediate',
    type: 'objective',
    prompt: 'In the JavaScript event loop, what is the execution priority between microtasks (e.g., Promise.then callbacks, queueMicrotask) and macrotasks (e.g., setTimeout, setInterval)?',
    options: [
      'Macrotasks always execute before any queued microtasks',
      'All queued microtasks drain completely after each synchronous script or macrotask finishes',
      'Microtasks and macrotasks execute strictly in round-robin sequence',
      'Macrotasks only execute when the microtask queue has more than 10 items',
    ],
    correctOptionIndex: 1,
    explanation: 'The microtask queue has higher priority; the runtime completely drains all pending microtasks before executing the next macrotask from the task queue.',
    rubric: null,
  },
  {
    questionId: 'diag-fe-async-03',
    domain: 'dom_async',
    topicId: 'fe-top-6',
    topicTitle: 'Asynchronous JavaScript & the Browser Event Loop',
    difficulty: 'advanced',
    type: 'written',
    prompt: 'What is the output order of the following console logs and why?\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);',
    options: [],
    correctOptionIndex: null,
    explanation: 'The order is 1, 4, 3, 2 due to synchronous execution followed by the microtask queue, then macrotask queue.',
    rubric: {
      criteria: [
        'States the correct output order: 1, 4, 3, 2',
        'Explains that 1 and 4 execute synchronously on the call stack',
        'Explains that Promise callback (3) executes next from the microtask queue',
        'Explains that setTimeout (2) executes last from the macrotask/task queue',
      ],
      requiredKeywords: ['1', '4', '3', '2', 'microtask', 'macrotask', 'stack', 'promise', 'settimeout'],
    },
  },

  // ---------------------------------------------------------------------------
  // 5. React Fundamentals (fe-top-7, fe-top-8)
  // ---------------------------------------------------------------------------
  {
    questionId: 'diag-fe-react-01',
    domain: 'react_fundamentals',
    topicId: 'fe-top-7',
    topicTitle: 'React Component Architecture & Virtual DOM',
    difficulty: 'beginner',
    type: 'objective',
    prompt: 'Why is it critical to pass a stable, unique key prop when rendering a dynamic list in React?',
    options: [
      'To enable direct CSS styling on individual list item elements',
      'To help React identify which items have changed, been added, or been removed during reconciliation',
      'To prevent the browser from reloading the entire HTML document',
      'To automatically convert the list items into JSON objects',
    ],
    correctOptionIndex: 1,
    explanation: 'Keys give elements a stable identity across renders so React\'s diffing algorithm can preserve component state and avoid re-mounting unchanged DOM nodes.',
    rubric: null,
  },
  {
    questionId: 'diag-fe-react-02',
    domain: 'react_fundamentals',
    topicId: 'fe-top-8',
    topicTitle: 'Component Lifecycle & Side Effects in React',
    difficulty: 'intermediate',
    type: 'objective',
    prompt: 'What happens if you mutate state directly in React (e.g., state.count = state.count + 1) instead of using the state setter function?',
    options: [
      'React immediately throws a compile-time syntax error',
      'React does not detect the change because object reference did not change, so no re-render is scheduled',
      'The browser crashes with a stack overflow error',
      'React automatically schedules a re-render after a 5-second debounce',
    ],
    correctOptionIndex: 1,
    explanation: 'React relies on shallow object equality (Object.is) between previous and next state references. Mutating state directly retains the same memory address, preventing re-renders.',
    rubric: null,
  },

  // ---------------------------------------------------------------------------
  // 6. React Hooks (fe-top-9)
  // ---------------------------------------------------------------------------
  {
    questionId: 'diag-fe-hooks-01',
    domain: 'react_hooks',
    topicId: 'fe-top-9',
    topicTitle: 'Modern React Hooks: useState, useEffect, useRef & Custom Hooks',
    difficulty: 'beginner',
    type: 'objective',
    prompt: 'When updating state based on the previous state value in useState, which approach avoids stale state bugs caused by queued state updates?',
    options: [
      'setCount(count + 1)',
      'setCount((prev) => prev + 1)',
      'setCount(window.count + 1)',
      'setCount(React.usePrevious(count) + 1)',
    ],
    correctOptionIndex: 1,
    explanation: 'The functional updater pattern setCount((prev) => prev + 1) guarantees access to the latest committed state in the update queue.',
    rubric: null,
  },
  {
    questionId: 'diag-fe-hooks-02',
    domain: 'react_hooks',
    topicId: 'fe-top-9',
    topicTitle: 'Modern React Hooks: useState, useEffect, useRef & Custom Hooks',
    difficulty: 'intermediate',
    type: 'objective',
    prompt: 'What is the purpose of returning a function from inside a useEffect hook?',
    options: [
      'To return a JSX element that replaces the component',
      'To define a cleanup function that runs before the component unmounts or before the effect re-runs',
      'To trigger an automatic retry if an asynchronous network call fails',
      'To expose internal variables to child components',
    ],
    correctOptionIndex: 1,
    explanation: 'The cleanup function is invoked before re-running the effect on dependency change and when unmounting, used to cancel subscriptions, abort fetch requests, or clear timers.',
    rubric: null,
  },
  {
    questionId: 'diag-fe-hooks-03',
    domain: 'react_hooks',
    topicId: 'fe-top-9',
    topicTitle: 'Modern React Hooks: useState, useEffect, useRef & Custom Hooks',
    difficulty: 'advanced',
    type: 'written',
    prompt: 'Explain the fundamental difference between useCallback and useMemo in React, and give one valid scenario where you should use each.',
    options: [],
    correctOptionIndex: null,
    explanation: 'useCallback memoizes a function definition across renders; useMemo memoizes the computed return value of a calculation.',
    rubric: {
      criteria: [
        'Explains that useCallback memoizes the function instance itself',
        'Explains that useMemo memoizes the cached result/value of an expensive calculation',
        'Gives a valid scenario for useCallback (e.g. passing a stable callback to an optimized React.memo child)',
        'Gives a valid scenario for useMemo (e.g. filtering a massive dataset or complex mathematical transformation)',
      ],
      requiredKeywords: ['usecallback', 'usememo', 'function', 'value', 'memoize', 'referential', 'expensive'],
    },
  },

  // ---------------------------------------------------------------------------
  // 7. State Management (fe-top-10, fe-top-11)
  // ---------------------------------------------------------------------------
  {
    questionId: 'diag-fe-state-01',
    domain: 'state_management',
    topicId: 'fe-top-10',
    topicTitle: 'State Management: Context API & Unidirectional Data Flow',
    difficulty: 'intermediate',
    type: 'objective',
    prompt: 'Why can using React Context API for frequently updated global state (e.g., high-frequency mouse coordinates or audio playback timers) cause performance bottlenecks?',
    options: [
      'Context API stores all values in localStorage synchronously',
      'All consuming components re-render whenever the context value changes, regardless of whether their specific slice changed',
      'Context API only supports primitive strings and numbers',
      'Context API disables the browser\'s garbage collection',
    ],
    correctOptionIndex: 1,
    explanation: 'React Context triggers re-renders on all subscribing consumer components whenever the context Provider\'s value reference changes, without built-in selector subscriptions.',
    rubric: null,
  },
  {
    questionId: 'diag-fe-state-02',
    domain: 'state_management',
    topicId: 'fe-top-11',
    topicTitle: 'Predictable State Containers: Redux Architecture & Middleware',
    difficulty: 'advanced',
    type: 'objective',
    prompt: 'In Redux architecture, why must reducers be pure functions without side effects?',
    options: [
      'To allow asynchronous network calls directly inside the reducer body',
      'To ensure deterministic state transitions, time-travel debugging, and reliable change detection via shallow equality',
      'Because JavaScript engines cannot compile functions with side effects',
      'To enforce that all action payloads are numbers',
    ],
    correctOptionIndex: 1,
    explanation: 'Pure reducers take (state, action) and return a new state object immutably, ensuring predictable state transitions and enabling time-travel debugging.',
    rubric: null,
  },

  // ---------------------------------------------------------------------------
  // 8. Frontend Performance & Debugging (fe-top-14, fe-top-15)
  // ---------------------------------------------------------------------------
  {
    questionId: 'diag-fe-perf-01',
    domain: 'performance_debugging',
    topicId: 'fe-top-14',
    topicTitle: 'Core Web Vitals & Web Performance Optimization',
    difficulty: 'intermediate',
    type: 'objective',
    prompt: 'Which Core Web Vital measures visual stability by tracking unexpected layout shifts during page load?',
    options: [
      'LCP (Largest Contentful Paint)',
      'FID (First Input Delay)',
      'CLS (Cumulative Layout Shift)',
      'INP (Interaction to Next Paint)',
    ],
    correctOptionIndex: 2,
    explanation: 'Cumulative Layout Shift (CLS) measures visual stability and unexpected layout shifts of visible elements as resources load asynchronously.',
    rubric: null,
  },
  {
    questionId: 'diag-fe-perf-02',
    domain: 'performance_debugging',
    topicId: 'fe-top-15',
    topicTitle: 'Browser Rendering Pipeline, Reflow, Repaint & Profiling',
    difficulty: 'advanced',
    type: 'written',
    prompt: 'Explain the difference between a browser Reflow (Layout) and Repaint, and explain why changing the CSS transform property is more performant than changing top or left.',
    options: [],
    correctOptionIndex: null,
    explanation: 'Reflow recalculates geometry and layout; repaint recolors pixels. CSS transforms skip layout and repaint by running directly on the GPU compositor thread.',
    rubric: {
      criteria: [
        'Defines Reflow/Layout as recalculating element dimensions, geometry and positioning in document flow',
        'Defines Repaint as updating pixel visual attributes (color, background, visibility) without changing geometry',
        'Explains that top/left triggers full reflows and repaints across the render pipeline',
        'Explains that transform is offloaded to the compositor / GPU thread, bypassing layout and repaint cycles',
      ],
      requiredKeywords: ['reflow', 'layout', 'repaint', 'transform', 'gpu', 'compositor', 'geometry'],
    },
  },
]
