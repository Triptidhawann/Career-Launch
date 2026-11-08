import mongoose from 'mongoose'
import { executeIngestionJob } from '../services/ingestion/ingestionService.js'
import { KnowledgeSource } from '../models/KnowledgeSource.js'
import { IngestedDocument } from '../models/IngestedDocument.js'
import { ContentChunk } from '../models/ContentChunk.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { GeneratedLesson } from '../models/GeneratedLesson.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/careerlaunch'

const batch1WhatwgDocuments = [
  {
    title: 'Semantic Markup & Accessibility Outlines',
    url: 'https://html.spec.whatwg.org/multipage/sections.html',
    contentOrigin: 'hybrid_pedagogical',
    canonicalSource: {
      name: 'HTML Living Standard: Sections & Forms',
      url: 'https://html.spec.whatwg.org/multipage/sections.html',
      passage:
        'The main element represents the dominant contents of the document. The nav element represents a section with navigation links. The aside element represents content tangentially related to the content around it. The header element represents introductory content. The footer element represents a footer for its nearest ancestor section. Form controls must have associated labels via the label element or aria-labelledby for accessibility.',
    },
    groundingPassage:
      'The main element represents the dominant contents of the document. The nav element represents a section with navigation links. The aside element represents content tangentially related to the content around it. The header element represents introductory content. The footer element represents a footer for its nearest ancestor section. Form controls must have associated labels via the label element or aria-labelledby for accessibility.',
    crossReferences: [
      {
        name: 'W3C WAI-ARIA 1.2 Specification',
        url: 'https://www.w3.org/TR/wai-aria-1.2/',
      },
      {
        name: 'HTML Living Standard: Forms',
        url: 'https://html.spec.whatwg.org/multipage/forms.html',
      },
    ],
    codeExemplar: {
      author: 'CareerLaunch Engineering',
      language: 'javascript',
      code: `// Accessible Form Validation & ARIA Live Announcements
// Authored by CareerLaunch Engineering

function setupAccessibleForm(formElement) {
  formElement.setAttribute('novalidate', 'true');

  formElement.addEventListener('submit', (event) => {
    event.preventDefault();
    const emailInput = formElement.querySelector('#user-email');
    const errorContainer = formElement.querySelector('#email-error');

    if (!emailInput.value.includes('@')) {
      emailInput.setAttribute('aria-invalid', 'true');
      emailInput.setAttribute('aria-describedby', 'email-error');
      errorContainer.textContent = 'Please enter a valid email address with an @ symbol.';
      errorContainer.style.display = 'block';
      emailInput.focus();
    } else {
      emailInput.removeAttribute('aria-invalid');
      errorContainer.textContent = '';
      errorContainer.style.display = 'none';
      alert('Form submitted successfully!');
    }
  });
}`,
      notes: 'CareerLaunch-authored accessible form validation with ARIA live error container.',
    },
    rawContent: `# Semantic Markup & Accessibility Outlines

### Canonical Web Standards (WHATWG HTML Living Standard & W3C WAI-ARIA 1.2)
The HTML Living Standard defines semantic structure and document outlining algorithms to convey document hierarchy to user agents and assistive technologies. Landmark elements include:
- <main>: Identifies the primary content of the body. Exactly one visible <main> should exist per document.
- <nav>: Designates major navigation blocks (primary site menus, table of contents).
- <aside>: Denotes secondary or complementary content (sidebars, callout boxes).
- <header> and <footer>: Provide introductory banners and navigational metadata for their parent section.
- Form controls (<input>, <select>, <textarea>) require programmatic labeling through <label for="..."> or aria-labelledby to populate the browser Accessibility Tree.

### The Browser Accessibility Tree & ARIA Semantics
Browsers transform the DOM and CSSOM into an internal Accessibility Tree containing roles, states, and accessible names consumed by screen readers. 
- WAI-ARIA Landmarks: role="main", role="navigation", role="complementary", and role="banner" map directly to native HTML5 tags.
- State Communication: aria-invalid="true" signals validation failures, aria-describedby links input controls to descriptive error text, and aria-live="polite" notifies assistive devices of asynchronous UI updates without interrupting ongoing speech.

### CareerLaunch Pedagogical Guide: Eliminating "Div Soup"
Replacing non-semantic <div> trees with semantic landmarks improves SEO indexing, provides direct keyboard jump targets for screen reader users, and dramatically reduces codebase maintenance overhead.`,
    roleTags: ['frontend-developer'],
    topicTags: ['fe-top-1'],
    difficultyTier: 'beginner',
    sectionHierarchy: ['Semantic Markup & Accessibility Outlines', 'Canonical Web Standards', 'Accessibility Tree', 'Eliminating Div Soup'],
  },
]

const batch1W3cDocuments = [
  {
    title: 'CSS Box Model, Flexbox & Grid Systems',
    url: 'https://www.w3.org/TR/css-box-3/',
    contentOrigin: 'hybrid_pedagogical',
    canonicalSource: {
      name: 'W3C CSS Box Model 3, Flexbox 1 & Grid 1',
      url: 'https://www.w3.org/TR/css-box-3/',
      passage:
        'The CSS Box Model describes the rectangular boxes generated for elements in the document tree. Each box has a content area, padding, border, and margin. box-sizing: border-box causes width and height to include content, padding, and border. Margin collapsing occurs when adjoining vertical margins combine into a single margin. Flexbox coordinates 1-dimensional distribution along main and cross axes. CSS Grid specifies 2-dimensional layouts using explicit tracks, fr fractional units, and minmax().',
    },
    groundingPassage:
      'The CSS Box Model describes the rectangular boxes generated for elements in the document tree. Each box has a content area, padding, border, and margin. box-sizing: border-box causes width and height to include content, padding, and border. Margin collapsing occurs when adjoining vertical margins combine into a single margin. Flexbox coordinates 1-dimensional distribution along main and cross axes. CSS Grid specifies 2-dimensional layouts using explicit tracks, fr fractional units, and minmax().',
    crossReferences: [
      {
        name: 'W3C CSS Flexible Box Layout Module Level 1',
        url: 'https://www.w3.org/TR/css-flexbox-1/',
      },
      {
        name: 'W3C CSS Grid Layout Module Level 1',
        url: 'https://www.w3.org/TR/css-grid-1/',
      },
    ],
    codeExemplar: {
      author: 'CareerLaunch Engineering',
      language: 'javascript',
      code: `// Responsive Dashboard Grid & Flexbox Toolbar
// Authored by CareerLaunch Engineering

const dashboardStyles = {
  container: \`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    box-sizing: border-box;
    padding: 1.5rem;
    width: 100%;
  \`,
  headerToolbar: \`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;
  \`,
  card: \`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1.25rem;
    border-radius: 8px;
    background: #ffffff;
    box-sizing: border-box;
  \`
};`,
      notes: 'CareerLaunch-authored CSS-in-JS style object demonstrating Grid and Flexbox alignment.',
    },
    rawContent: `# CSS Box Model, Flexbox & Grid Systems

### Canonical Box Geometry (W3C CSS Box Model 3)
Every rendered element generates a rectangular box composed of:
1. Content: The area where text, images, or child elements render.
2. Padding: Transparent space between content and border.
3. Border: Structural boundary encircling padding.
4. Margin: Transparent buffer separating the element from adjoining siblings.
- box-sizing Mechanics: Under content-box (default), width/height apply solely to content; padding and border add to the total rendered dimensions. Under border-box, padding and border are absorbed into the declared width/height.
- Margin Collapsing: Adjoining vertical margins collapse to the maximum of the margins rather than summing. Occurs between adjacent siblings, empty blocks, and parent-child without intervening padding/border.

### Modern Layout: 1D Flexbox vs 2D Grid
- CSS Flexbox (1D): Distributes space along a single axis. Main axis orientation is set via flex-direction (row/column). Alignment along the main axis is controlled by justify-content; cross axis alignment is controlled by align-items. Flex item sizing is governed by flex-grow, flex-shrink, and flex-basis.
- CSS Grid (2D): Simultaneously aligns items across horizontal rows and vertical columns. Utilizes flexible fractional units (fr), dynamic track bounds (minmax(min, max)), and automatic wrapping algorithms (repeat(auto-fit, minmax(250px, 1fr))) that adapt gracefully without rigid media queries.`,
    roleTags: ['frontend-developer'],
    topicTags: ['fe-top-2'],
    difficultyTier: 'beginner',
    sectionHierarchy: ['CSS Box Model, Flexbox & Grid Systems', 'Canonical Box Geometry', '1D Flexbox vs 2D Grid'],
  },
  {
    title: 'Responsive Design & Fluid Typography',
    url: 'https://www.w3.org/TR/css-values-4/',
    contentOrigin: 'hybrid_pedagogical',
    canonicalSource: {
      name: 'W3C CSS Values 4 & Containment 3',
      url: 'https://www.w3.org/TR/css-values-4/',
      passage:
        'CSS Values and Units Module Level 4 introduces mathematical functions including clamp(), min(), and max(), along with viewport units vw, vh, vi, and vb. clamp(MIN, VAL, MAX) clamps a value between lower and upper bounds. CSS Containment Level 3 specifies Container Queries allowing elements to query the dimensions of their ancestor container using @container rather than the global viewport.',
    },
    groundingPassage:
      'CSS Values and Units Module Level 4 introduces mathematical functions including clamp(), min(), and max(), along with viewport units vw, vh, vi, and vb. clamp(MIN, VAL, MAX) clamps a value between lower and upper bounds. CSS Containment Level 3 specifies Container Queries allowing elements to query the dimensions of their ancestor container using @container rather than the global viewport.',
    crossReferences: [
      {
        name: 'W3C CSS Containment Module Level 3',
        url: 'https://www.w3.org/TR/css-contain-3/',
      },
    ],
    codeExemplar: {
      author: 'CareerLaunch Engineering',
      language: 'javascript',
      code: `// Fluid Typography & Container Query Component Architecture
// Authored by CareerLaunch Engineering

const responsiveComponentStyles = \`
  :root {
    /* Fluid typography: scales from 1rem (16px) at 320px to 1.75rem (28px) at 1280px */
    --font-heading: clamp(1rem, 0.75rem + 1.25vw, 1.75rem);
    --font-body: clamp(0.875rem, 0.8rem + 0.35vw, 1.125rem);
  }

  .feed-item-wrapper {
    container-type: inline-size;
    container-name: card;
  }

  .feed-card {
    display: flex;
    flex-direction: column;
    font-size: var(--font-body);
  }

  /* When container exceeds 480px, switch card from column to horizontal row */
  @container card (min-width: 480px) {
    .feed-card {
      flex-direction: row;
      gap: 1.5rem;
    }
  }
\`;`,
      notes: 'CareerLaunch-authored CSS demonstrating fluid clamp() scales and @container queries.',
    },
    rawContent: `# Responsive Design & Fluid Typography

### Mathematical Fluid Scales (W3C CSS Values 4)
Modern responsive typography replaces stepped media queries with continuous mathematical functions:
- clamp(MIN, PREFERRED, MAX): Computes a responsive value that scales dynamically with viewport or container dimensions while never dropping below MIN or exceeding MAX.
- Mathematical Derivation: clamp(1rem, 0.75rem + 1.25vw, 1.75rem) guarantees comfortable legibility on mobile screens (16px at 320px) while expanding smoothly on desktop viewports (28px at 1280px).
- Viewport Units: vw (viewport width), vh (viewport height), vi (inline axis length), and vb (block axis length).

### Component-Driven Responsiveness via Container Queries (W3C CSS Containment 3)
Traditional @media queries tie component styling to the global browser viewport. Container queries (@container) decouple components from the viewport by allowing child elements to respond to the dimensions of their parent container:
- Establishing a Container Context: container-type: inline-size creates a containment boundary allowing children to query container width.
- Container Query Units: cqw (1% of container width) and cqh (1% of container height) provide truly modular styling when building reusable component libraries.`,
    roleTags: ['frontend-developer'],
    topicTags: ['fe-top-3'],
    difficultyTier: 'beginner',
    sectionHierarchy: ['Responsive Design & Fluid Typography', 'Mathematical Fluid Scales', 'Container Queries'],
  },
]

const batch1EcmaDocuments = [
  {
    title: 'Execution Context, Scopes & Closures',
    url: 'https://tc39.es/ecma262/',
    contentOrigin: 'hybrid_pedagogical',
    canonicalSource: {
      name: 'ECMA-262 ECMAScript Language Specification',
      url: 'https://tc39.es/ecma262/',
      passage:
        'An execution context is a specification device used to track the runtime evaluation of code. The execution context stack is used to track execution contexts. A Lexical Environment is a specification type used to define the association of Identifiers to specific variables and functions based upon the lexical nesting structure. A closure is a function that retains access to its lexical environment even when invoked outside its immediate lexical scope.',
    },
    groundingPassage:
      'An execution context is a specification device used to track the runtime evaluation of code. The execution context stack is used to track execution contexts. A Lexical Environment is a specification type used to define the association of Identifiers to specific variables and functions based upon the lexical nesting structure. A closure is a function that retains access to its lexical environment even when invoked outside its immediate lexical scope.',
    crossReferences: [
      {
        name: 'ECMA-262: Section 9.4 Execution Contexts',
        url: 'https://tc39.es/ecma262/#sec-execution-contexts',
      },
      {
        name: 'ECMA-262: Section 9.1 Environment Records',
        url: 'https://tc39.es/ecma262/#sec-lexical-environments',
      },
    ],
    codeExemplar: {
      author: 'CareerLaunch Engineering',
      language: 'javascript',
      code: `// Memoization & Encapsulated State Using Closures
// Authored by CareerLaunch Engineering

function createMemoizedCalculator() {
  // Private state encapsulated in outer lexical scope
  const cache = new Map();

  return function computeFactorial(n) {
    if (n < 0) throw new Error('Negative numbers unsupported');
    if (n <= 1) return 1;

    if (cache.has(n)) {
      return cache.get(n);
    }

    const result = n * computeFactorial(n - 1);
    cache.set(n, result);
    return result;
  };
}

const factorial = createMemoizedCalculator();
console.log(factorial(5)); // 120 (computed)
console.log(factorial(5)); // 120 (cached)`,
      notes: 'CareerLaunch-authored closure memoization factory demonstrating private scope retention.',
    },
    rawContent: `# Execution Context, Scopes & Closures

### ECMAScript Runtime Execution Model (ECMA-262)
JavaScript engines manage program execution through distinct architectural layers:
1. Call Stack & Execution Contexts: An Execution Context tracks code evaluation. When a function is called, a new execution context is pushed onto the Call Stack. When execution finishes, it is popped off.
2. Lexical Environments: Each execution context possesses an Environment Record that maps identifier names to their memory values. Lexical scoping dictates that inner functions resolve variables from their author-time physical nesting position.
3. Variable Hoisting & Temporal Dead Zone (TDZ):
   - var declarations are hoisted to function scope and initialized to undefined.
   - let and const declarations are hoisted to the block scope, but remain uninitialized in the Temporal Dead Zone (TDZ) from the beginning of the block until evaluation of the declaration statement; accessing them early throws a ReferenceError.

### Lexical Closures & Memory Management
- Closure Definition: A closure is the combination of a function bundled together with references to its surrounding lexical state. Closures allow functions to maintain persistent access to variables in their parent scope even after the parent function has finished executing and exited the call stack.
- V8 Garbage Collection & Leaks: The garbage collector frees memory using Mark-and-Sweep. If a long-lived callback or global listener holds a reference to an outer closure scope, all variables enclosed within that scope remain rooted and cannot be collected, leading to subtle memory leaks.`,
    roleTags: ['frontend-developer'],
    topicTags: ['fe-top-4'],
    difficultyTier: 'beginner',
    sectionHierarchy: ['Execution Context, Scopes & Closures', 'ECMAScript Runtime Execution Model', 'Lexical Closures'],
  },
]

async function runBatch1FEIngestion() {
  console.log('\n=================================================================')
  console.log('   CAREERLAUNCH PHASE 6.1: FRONTEND BATCH 1 SOURCE INGESTION     ')
  console.log('=================================================================\n')

  await mongoose.connect(MONGODB_URI)
  console.log(`Connected to MongoDB at: ${MONGODB_URI}\n`)

  // 1. Baseline verification
  const initialStudentCount = await StudentProfile.countDocuments()
  const initialLessonCount = await GeneratedLesson.countDocuments()
  const initialDocCount = await IngestedDocument.countDocuments()
  const initialChunkCount = await ContentChunk.countDocuments()
  const initialSourceCount = await KnowledgeSource.countDocuments()

  console.log(`Baseline Verification:`)
  console.log(`  - Student Profiles  : ${initialStudentCount} (expected: 2)`)
  console.log(`  - Generated Lessons : ${initialLessonCount} (expected: 16)`)
  console.log(`  - Ingested Documents: ${initialDocCount} (expected: 16)`)
  console.log(`  - Content Chunks    : ${initialChunkCount} (expected: 24)`)
  console.log(`  - Knowledge Sources : ${initialSourceCount} (expected: 4)\n`)

  if (initialStudentCount !== 2 || initialLessonCount !== 16) {
    throw new Error('Baseline integrity check failed! Aborting ingestion.')
  }

  // 2. Ensure KnowledgeSource 'whatwg-standards' is registered
  let whatwgSource = await KnowledgeSource.findOne({ sourceId: 'whatwg-standards' })
  if (!whatwgSource) {
    console.log('Registering KnowledgeSource "whatwg-standards"...')
    whatwgSource = await KnowledgeSource.create({
      sourceId: 'whatwg-standards',
      name: 'WHATWG Living Standards (HTML & DOM)',
      owner: 'Web Hypertext Application Technology Working Group',
      baseUrl: 'https://spec.whatwg.org/',
      category: 'spec_standard',
      authorityTier: 1,
      licence: {
        spdxId: 'CC-BY-4.0',
        name: 'Creative Commons Attribution 4.0 International',
        version: '4.0',
        commercialUsePermitted: true,
        attributionRequired: true,
        attributionText: 'Copyright © WHATWG (Apple, Google, Microsoft, Mozilla). Licensed under CC BY 4.0.',
        storagePermitted: true,
        indexingPermitted: true,
        quotingPermitted: true,
        maxQuoteLengthCharacters: 2000,
      },
      ingestionMethod: 'static_dump',
      allowedDomains: ['spec.whatwg.org', 'html.spec.whatwg.org', 'dom.spec.whatwg.org'],
      status: 'active',
    })
    console.log('  ✓ KnowledgeSource "whatwg-standards" registered successfully.')
  } else {
    whatwgSource.status = 'active'
    await whatwgSource.save()
    console.log('  ✓ KnowledgeSource "whatwg-standards" verified active.')
  }

  // 3. Ensure KnowledgeSource 'w3c-standards' is registered
  let w3cSource = await KnowledgeSource.findOne({ sourceId: 'w3c-standards' })
  if (!w3cSource) {
    console.log('Registering KnowledgeSource "w3c-standards"...')
    w3cSource = await KnowledgeSource.create({
      sourceId: 'w3c-standards',
      name: 'W3C Technical Architecture & CSS Specifications',
      owner: 'World Wide Web Consortium',
      baseUrl: 'https://www.w3.org/TR/',
      category: 'spec_standard',
      authorityTier: 1,
      licence: {
        spdxId: 'W3C-20150513',
        name: 'W3C Software and Document Notice and License',
        version: '20150513',
        commercialUsePermitted: true,
        attributionRequired: true,
        attributionText: 'Copyright © W3C (MIT, ERCIM, Keio, Beihang). Licensed under W3C Software and Document License.',
        storagePermitted: true,
        indexingPermitted: true,
        quotingPermitted: true,
        maxQuoteLengthCharacters: 2000,
      },
      ingestionMethod: 'static_dump',
      allowedDomains: ['w3.org', 'www.w3.org'],
      status: 'active',
    })
    console.log('  ✓ KnowledgeSource "w3c-standards" registered successfully.')
  } else {
    w3cSource.status = 'active'
    await w3cSource.save()
    console.log('  ✓ KnowledgeSource "w3c-standards" verified active.')
  }

  // 4. Ensure KnowledgeSource 'ecma-standards' is registered
  let ecmaSource = await KnowledgeSource.findOne({ sourceId: 'ecma-standards' })
  if (!ecmaSource) {
    console.log('Registering KnowledgeSource "ecma-standards"...')
    ecmaSource = await KnowledgeSource.create({
      sourceId: 'ecma-standards',
      name: 'ECMA-262 ECMAScript Language Specification',
      owner: 'Ecma International / TC39',
      baseUrl: 'https://tc39.es/ecma262/',
      category: 'spec_standard',
      authorityTier: 1,
      licence: {
        spdxId: 'BSD-3-Clause',
        name: 'Ecma Software Grant and Document License',
        version: 'Statutory',
        commercialUsePermitted: true,
        attributionRequired: true,
        attributionText: 'Copyright © Ecma International. Specification licensed under Ecma Software Grant and Document License.',
        storagePermitted: true,
        indexingPermitted: true,
        quotingPermitted: true,
        maxQuoteLengthCharacters: 2000,
      },
      ingestionMethod: 'static_dump',
      allowedDomains: ['tc39.es'],
      status: 'active',
    })
    console.log('  ✓ KnowledgeSource "ecma-standards" registered successfully.')
  } else {
    ecmaSource.status = 'active'
    await ecmaSource.save()
    console.log('  ✓ KnowledgeSource "ecma-standards" verified active.')
  }

  // 5. Ingest WHATWG Document (fe-top-1)
  console.log('\nExecuting ingestion job for WHATWG HTML (fe-top-1)...')
  const whatwgResult = await executeIngestionJob({
    sourceId: 'whatwg-standards',
    initiatedBy: 'phase_6_1_batch_1_admin',
    documents: batch1WhatwgDocuments,
  })
  console.log(`  - Job ID              : ${whatwgResult.jobId}`)
  console.log(`  - Status              : ${whatwgResult.status}`)
  console.log(`  - Documents Processed : ${whatwgResult.documentsProcessed}`)
  console.log(`  - Chunks Created      : ${whatwgResult.chunksCreated}`)

  // 6. Ingest W3C Documents (fe-top-2, fe-top-3)
  console.log('\nExecuting ingestion job for W3C CSS (fe-top-2, fe-top-3)...')
  const w3cResult = await executeIngestionJob({
    sourceId: 'w3c-standards',
    initiatedBy: 'phase_6_1_batch_1_admin',
    documents: batch1W3cDocuments,
  })
  console.log(`  - Job ID              : ${w3cResult.jobId}`)
  console.log(`  - Status              : ${w3cResult.status}`)
  console.log(`  - Documents Processed : ${w3cResult.documentsProcessed}`)
  console.log(`  - Chunks Created      : ${w3cResult.chunksCreated}`)

  // 7. Ingest ECMA Document (fe-top-4)
  console.log('\nExecuting ingestion job for ECMA-262 (fe-top-4)...')
  const ecmaResult = await executeIngestionJob({
    sourceId: 'ecma-standards',
    initiatedBy: 'phase_6_1_batch_1_admin',
    documents: batch1EcmaDocuments,
  })
  console.log(`  - Job ID              : ${ecmaResult.jobId}`)
  console.log(`  - Status              : ${ecmaResult.status}`)
  console.log(`  - Documents Processed : ${ecmaResult.documentsProcessed}`)
  console.log(`  - Chunks Created      : ${ecmaResult.chunksCreated}`)

  // 8. Post-ingestion verification
  const finalDocCount = await IngestedDocument.countDocuments()
  const finalChunkCount = await ContentChunk.countDocuments()
  const finalLessonCount = await GeneratedLesson.countDocuments()
  const finalStudentCount = await StudentProfile.countDocuments()
  const finalSourceCount = await KnowledgeSource.countDocuments()

  console.log('\nPost-Ingestion Verification:')
  console.log(`  - Total Sources       : ${finalSourceCount} (before: ${initialSourceCount}, delta: +${finalSourceCount - initialSourceCount})`)
  console.log(`  - Total Ingested Docs : ${finalDocCount} (before: ${initialDocCount}, delta: +${finalDocCount - initialDocCount})`)
  console.log(`  - Total Content Chunks: ${finalChunkCount} (before: ${initialChunkCount}, delta: +${finalChunkCount - initialChunkCount})`)
  console.log(`  - Generated Lessons   : ${finalLessonCount} (unchanged: ${finalLessonCount === initialLessonCount})`)
  console.log(`  - Student Profiles    : ${finalStudentCount} (unchanged: ${finalStudentCount === initialStudentCount})`)

  // Check chunks for each Batch 1 topic
  const batch1Topics = ['fe-top-1', 'fe-top-2', 'fe-top-3', 'fe-top-4']
  for (const tid of batch1Topics) {
    const chunk = await ContentChunk.findOne({ topicTags: tid })
    if (!chunk) {
      throw new Error(`Failed to verify chunk for topic: ${tid}`)
    }
    console.log(`  ✓ Topic ${tid}: Chunk ${chunk.chunkId} verified (origin: ${chunk.contentOrigin}, exemplar author: ${chunk.codeExemplar.author})`)
  }

  // Verify non-batch-1 topics were NOT ingested
  const feTop5Chunk = await ContentChunk.findOne({ topicTags: 'fe-top-5' })
  if (feTop5Chunk) {
    throw new Error('FATAL: fe-top-5 chunk was ingested! Batch 1 boundary violated.')
  }
  console.log('  ✓ Verified fe-top-5 was NOT ingested (batch boundary honored).')

  console.log('\n=================================================================')
  console.log('   FRONTEND BATCH 1 SOURCE INGESTION COMPLETED!                  ')
  console.log('=================================================================\n')

  await mongoose.disconnect()
}

runBatch1FEIngestion().catch((err) => {
  console.error('\n✗ Ingestion error:', err)
  process.exit(1)
})
