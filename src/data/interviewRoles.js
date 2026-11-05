import {
  BarChart3,
  Binary,
  BrainCircuit,
  Layers,
  Layout,
  Server,
  Smartphone,
  Workflow,
} from 'lucide-react'

export const INTERVIEW_ROLES = [
  {
    id: 'frontend-developer',
    title: 'Frontend Developer',
    subtitle: 'UI Engineering & Web Architecture',
    description:
      'Master responsive user interfaces, modern React and component architecture, CSS layout systems, browser runtimes, and web performance budgets.',
    icon: Layout,
    keywords: ['frontend', 'react', 'ui', 'web developer'],
    coreDomains: [
      'React Architecture & Modern Hooks',
      'Core Web Vitals & Runtime Performance',
      'State Machines & Complex Client Stores',
      'CSS Architecture & Layout Mechanics',
    ],
    stage1Focus: 'Campus & Entry-Level Frontend Screening Baseline',
  },
  {
    id: 'backend-developer',
    title: 'Backend Developer',
    subtitle: 'Distributed Systems & Services',
    description:
      'Scale reliable APIs, relational and document database indexing, distributed concurrency locks, idempotent queue workers, and microservices.',
    icon: Server,
    keywords: ['backend', 'systems', 'api', 'server', 'node', 'express'],
    coreDomains: [
      'REST & RPC Contract Design',
      'SQL & NoSQL Query Optimization',
      'Concurrency, Distributed Locks & Queues',
      'Distributed Caching & In-Memory Stores',
    ],
    stage1Focus: 'Backend Systems & API Reliability Screening Baseline',
  },
  {
    id: 'fullstack-developer',
    title: 'Full Stack Developer',
    subtitle: 'End-to-End Application Architecture',
    description:
      'Bridge performant client applications with robust backend APIs, secure authentication pipelines, schema migrations, and cloud hosting.',
    icon: Layers,
    keywords: ['full stack', 'fullstack', 'full-stack', 'mern'],
    coreDomains: [
      'Client-Server Data Contracts',
      'JWT, Sessions & Auth Security',
      'Database Schema Migration & Modeling',
      'Production Deployment & CI/CD Pipelines',
    ],
    stage1Focus: 'Full-Stack Integration & Product Engineering Baseline',
  },
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    subtitle: 'Algorithms & Core Computer Science',
    description:
      'Excel in algorithmic problem solving, time-space complexity optimization, data structure selection, and clean modular object-oriented design.',
    icon: Binary,
    keywords: ['software engineer', 'software development', 'sde', 'swe'],
    coreDomains: [
      'Arrays, Pointers, Trees & Graph Traversals',
      'Dynamic Programming & Greedy Strategies',
      'Big-O Time & Space Complexity Analysis',
      'Modular Object-Oriented Design Patterns',
    ],
    stage1Focus: 'Core CS Foundations & Technical Problem Solving',
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    subtitle: 'Business Intelligence & Quantitative Insights',
    description:
      'Extract actionable signals from complex datasets using advanced SQL, exploratory data analysis, metric modeling, and executive storytelling.',
    icon: BarChart3,
    keywords: ['data analyst', 'analyst', 'bi', 'analytics', 'sql'],
    coreDomains: [
      'Advanced SQL & Window Functions',
      'Exploratory Data Analysis (EDA)',
      'Cohort Retention & Funnel Metrics',
      'Data Visualization & Executive Dashboards',
    ],
    stage1Focus: 'Analytical Querying & Business Logic Screening Baseline',
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    subtitle: 'Machine Learning & Statistical Inference',
    description:
      'Formulate probabilistic models, feature engineering pipelines, supervised and unsupervised machine learning, and rigorous hypothesis tests.',
    icon: BrainCircuit,
    keywords: ['data scientist', 'machine learning', 'ml', 'ai'],
    coreDomains: [
      'Mathematical Statistics & Probability',
      'Supervised & Unsupervised Modeling',
      'Feature Engineering & Data Cleansing',
      'Model Evaluation, Precision & Loss Metrics',
    ],
    stage1Focus: 'Applied Machine Learning & Statistical Inference Baseline',
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    subtitle: 'Cloud Platforms & CI/CD Pipelines',
    description:
      'Automate infrastructure as code, container orchestration, zero-downtime deployment pipelines, and observability monitoring stacks.',
    icon: Workflow,
    keywords: ['devops', 'cloud', 'sre', 'docker', 'infrastructure'],
    coreDomains: [
      'CI/CD Pipeline Automation (GitHub Actions)',
      'Docker Containerization & Compose',
      'Cloud Infrastructure & Networking',
      'Linux Internals, Shell & Observability',
    ],
    stage1Focus: 'Deployment Automation & Infrastructure Reliability Baseline',
  },
  {
    id: 'mobile-app-developer',
    title: 'Mobile App Developer',
    subtitle: 'Native & Cross-Platform UX',
    description:
      'Build responsive, offline-resilient mobile applications with lifecycle awareness, local persistence, smooth touch interactions, and native APIs.',
    icon: Smartphone,
    keywords: ['mobile', 'android', 'ios', 'flutter', 'react native'],
    coreDomains: [
      'Mobile Lifecycle & Navigation State',
      'Offline Storage & Local Persistence',
      'Adaptive Layouts & Touch Gestures',
      'Mobile API Synchronization & Battery Economy',
    ],
    stage1Focus: 'Mobile Architecture & Client Performance Baseline',
  },
]
