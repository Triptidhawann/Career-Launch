import mongoose from 'mongoose'
import { executeIngestionJob } from '../services/ingestion/ingestionService.js'
import { KnowledgeSource } from '../models/KnowledgeSource.js'
import { IngestedDocument } from '../models/IngestedDocument.js'
import { ContentChunk } from '../models/ContentChunk.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { GeneratedLesson } from '../models/GeneratedLesson.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/careerlaunch'

const batch3PythonDocuments = [
  {
    title: 'Processes, Threads & Synchronization',
    url: 'https://docs.python.org/3/library/threading.html',
    contentOrigin: 'hybrid_pedagogical',
    canonicalSource: {
      name: 'Python Standard Library: threading',
      url: 'https://docs.python.org/3/library/threading.html',
      passage:
        'The threading module constructs higher-level threading interfaces on top of the lower level _thread module. It provides Thread, Lock, RLock, Condition, Semaphore, BoundedSemaphore, Event, and Barrier objects. A lock is in one of two states: locked or unlocked. acquire() changes state to locked and blocks if another thread holds the lock. release() changes it to unlocked. Condition variables allow one or more threads to wait until notified by another thread.',
    },
    groundingPassage:
      'The threading module constructs higher-level threading interfaces on top of the lower level _thread module. It provides Thread, Lock, RLock, Condition, Semaphore, BoundedSemaphore, Event, and Barrier objects. A lock is in one of two states: locked or unlocked. acquire() changes state to locked and blocks if another thread holds the lock. release() changes it to unlocked. Condition variables allow one or more threads to wait until notified by another thread.',
    crossReferences: [
      {
        name: 'Python Standard Library: multiprocessing',
        url: 'https://docs.python.org/3/library/multiprocessing.html',
      },
      {
        name: 'Python Standard Library: queue',
        url: 'https://docs.python.org/3/library/queue.html',
      },
    ],
    codeExemplar: {
      author: 'CareerLaunch Engineering',
      language: 'python',
      code: `import threading
import time

class BoundedBlockingQueue:
    """Thread-safe bounded blocking queue implementing the Producer-Consumer pattern.
    Authored by CareerLaunch Engineering.
    """
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.queue = []
        self.lock = threading.Lock()
        self.not_full = threading.Condition(self.lock)
        self.not_empty = threading.Condition(self.lock)

    def enqueue(self, element: int) -> None:
        with self.not_full:
            while len(self.queue) >= self.capacity:
                self.not_full.wait()
            self.queue.append(element)
            self.not_empty.notify()

    def dequeue(self) -> int:
        with self.not_empty:
            while len(self.queue) == 0:
                self.not_empty.wait()
            element = self.queue.pop(0)
            self.not_full.notify()
            return element

    def size(self) -> int:
        with self.lock:
            return len(self.queue)`,
      notes: 'CareerLaunch-authored Bounded Blocking Queue using Condition variables. Not from external docs.',
    },
    rawContent: `# Processes, Threads & Synchronization

### Canonical Synchronization Primitives (Python Standard Library: threading)
The threading module constructs higher-level threading interfaces on top of the operating system thread primitives. It provides Thread, Lock, RLock, Condition, Semaphore, BoundedSemaphore, Event, and Barrier objects. A primitive lock is in one of two states: locked or unlocked. acquire() changes state to locked and blocks if another thread already holds the lock. release() resets the state to unlocked. Condition variables associate with an underlying lock and allow threads to wait() until awakened by notify() or notify_all().

### Concurrency Mechanics & Critical Sections
- Process vs Thread: A process possesses its own dedicated virtual address space, file descriptor table, and memory regions. Threads within a process share heap memory, global variables, and code segment, while maintaining private execution stacks and program counters.
- Race Conditions: Occur when concurrent threads perform non-atomic read-modify-write operations on shared mutable memory without synchronization, yielding non-deterministic execution outcomes.
- Deadlock & The Four Coffman Conditions: Deadlock arises when four conditions hold simultaneously:
  1. Mutual Exclusion: At least one unshareable resource held by a thread.
  2. Hold and Wait: A thread holding resources requests additional resources.
  3. No Preemption: Resources cannot be forcibly seized; only released voluntarily.
  4. Circular Wait: A closed chain of threads where each thread waits for a resource held by the next.
- Deadlock Prevention: Eliminating circular wait by enforcing a strict global total ordering on resource acquisition locks.

### CareerLaunch Pedagogical Guide: Producer-Consumer Pattern
The Producer-Consumer pattern decouples data production from consumption using a bounded thread-safe buffer. Using Condition variables with loop-predicated wait() calls prevents spurious wakeups and ensures neither buffer overflow nor buffer underflow can corrupt data state.`,
    roleTags: ['software-engineer'],
    topicTags: ['se-top-13'],
    difficultyTier: 'advanced',
    sectionHierarchy: ['Processes, Threads & Synchronization', 'Canonical Synchronization Primitives', 'Concurrency Mechanics', 'Producer-Consumer Pattern'],
  },
  {
    title: 'Computer Networking: OSI, TCP/IP & HTTP',
    url: 'https://docs.python.org/3/library/socket.html',
    contentOrigin: 'hybrid_pedagogical',
    canonicalSource: {
      name: 'Python Standard Library: socket',
      url: 'https://docs.python.org/3/library/socket.html',
      passage:
        'This module provides socket operations and classes for network communication. Socket addresses are represented as (host, port) tuples for the AF_INET address family. Socket types include SOCK_STREAM for sequenced, reliable, two-way, connection-based byte streams (TCP), and SOCK_DGRAM for connectionless, unreliable datagrams of fixed maximum length (UDP). Functions include socket(), bind(), listen(), accept(), connect(), send(), and recv().',
    },
    groundingPassage:
      'This module provides socket operations and classes for network communication. Socket addresses are represented as (host, port) tuples for the AF_INET address family. Socket types include SOCK_STREAM for sequenced, reliable, two-way, connection-based byte streams (TCP), and SOCK_DGRAM for connectionless, unreliable datagrams of fixed maximum length (UDP). Functions include socket(), bind(), listen(), accept(), connect(), send(), and recv().',
    crossReferences: [
      {
        name: 'Python Standard Library: http.client',
        url: 'https://docs.python.org/3/library/http.client.html',
      },
    ],
    codeExemplar: {
      author: 'CareerLaunch Engineering',
      language: 'python',
      code: `import socket

def create_tcp_echo_server(host: str = '127.0.0.1', port: int = 8080) -> None:
    """Demonstrates Berkeley sockets TCP server lifecycle with framed message handling.
    Authored by CareerLaunch Engineering.
    """
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    try:
        server_socket.bind((host, port))
        server_socket.listen(5)
        print(f"Server listening on {host}:{port}")

        client_socket, client_address = server_socket.accept()
        with client_socket:
            print(f"Connection established from {client_address}")
            data = client_socket.recv(1024)
            if data:
                response = b"HTTP/1.1 200 OK\\r\\nContent-Length: 13\\r\\n\\r\\nHello, World!"
                client_socket.sendall(response)
    finally:
        server_socket.close()`,
      notes: 'CareerLaunch-authored TCP echo server socket implementation. Not from external docs.',
    },
    rawContent: `# Computer Networking: OSI, TCP/IP & HTTP

### Canonical Socket Networking (Python Standard Library: socket)
The socket module provides low-level network communication interfaces adhering to the Berkeley sockets API standard. Socket addresses are specified as (host, port) tuples for the AF_INET (IPv4) and AF_INET6 (IPv6) address families. Socket types include SOCK_STREAM for sequenced, reliable, two-way, connection-based byte streams (TCP), and SOCK_DGRAM for connectionless datagrams (UDP). Fundamental operations include socket() creation, bind() local address assignment, listen() queue configuration, accept() incoming connection synchronization, connect() remote endpoint initiation, send()/recv() stream transmission, and close() teardown.

### Layered Networking Models & Protocol Architecture
- OSI 7-Layer Model: Theoretical framework consisting of Physical (Layer 1), Data Link (Layer 2), Network (Layer 3: IP), Transport (Layer 4: TCP/UDP), Session (Layer 5), Presentation (Layer 6: TLS/SSL encryption), and Application (Layer 7: HTTP, DNS, SMTP).
- Practical TCP/IP 4-Layer Model: Maps into Network Interface (Link), Internet (IP routing, ICMP), Transport (TCP reliability, UDP speed), and Application (HTTP semantics, DNS).
- TCP 3-Way Handshake:
  1. Client sends SYN (Synchronize sequence number X).
  2. Server responds with SYN-ACK (Synchronize sequence number Y, Acknowledge X + 1).
  3. Client sends ACK (Acknowledge Y + 1). Connection is established (ESTABLISHED state).
- TCP Teardown & Flow Control: 4-way termination with FIN and ACK packets, leading to TIME_WAIT state to guarantee delayed in-flight segment absorption. Sliding window protocol and congestion control algorithms (Slow Start, Congestion Avoidance, Fast Retransmit).
- HTTP Semantics: Safe and idempotent methods (GET, HEAD, OPTIONS), non-safe idempotent methods (PUT, DELETE), non-idempotent methods (POST, PATCH), status code classifications (2xx Success, 3xx Redirection, 4xx Client Error, 5xx Server Error).

### CareerLaunch Pedagogical Guide: Socket Programming & URL Navigation Lifecycle
From typing a URL into the browser to rendering content:
1. DNS Resolution: Local cache -> Recursive resolver -> Root nameserver -> TLD nameserver -> Authoritative nameserver.
2. TCP Connection Establishment: 3-way handshake over port 80/443.
3. TLS Cryptographic Handshake: Key exchange, certificate verification, symmetric session encryption.
4. HTTP Request & Response: Transmission of method, headers, payload, and response streaming.`,
    roleTags: ['software-engineer'],
    topicTags: ['se-top-15'],
    difficultyTier: 'advanced',
    sectionHierarchy: ['Computer Networking: OSI, TCP/IP & HTTP', 'Canonical Socket Networking', 'Layered Networking Models', 'Lifecycle of a Web Request'],
  },
  {
    title: 'Object-Oriented Design Patterns (GoF)',
    url: 'https://docs.python.org/3/library/abc.html',
    contentOrigin: 'hybrid_pedagogical',
    canonicalSource: {
      name: 'Python Standard Library: abc',
      url: 'https://docs.python.org/3/library/abc.html',
      passage:
        'This module provides the infrastructure for defining abstract base classes (ABCs) in Python. The abc module defines the ABC class and the @abstractmethod decorator for declaring abstract methods. Abstract base classes complement duck typing by defining formal interfaces when other techniques, like isinstance(), are necessary. A class that has an abstract method cannot be instantiated until all abstract methods are overridden.',
    },
    groundingPassage:
      'This module provides the infrastructure for defining abstract base classes (ABCs) in Python. The abc module defines the ABC class and the @abstractmethod decorator for declaring abstract methods. Abstract base classes complement duck typing by defining formal interfaces when other techniques, like isinstance(), are necessary. A class that has an abstract method cannot be instantiated until all abstract methods are overridden.',
    crossReferences: [
      {
        name: 'Python Standard Library: datamodel',
        url: 'https://docs.python.org/3/reference/datamodel.html',
      },
    ],
    codeExemplar: {
      author: 'CareerLaunch Engineering',
      language: 'python',
      code: `from abc import ABC, abstractmethod

class PaymentStrategy(ABC):
    """Abstract Strategy interface enforcing contract.
    Authored by CareerLaunch Engineering.
    """
    @abstractmethod
    def pay(self, amount: float) -> str:
        pass

class CreditCardPayment(PaymentStrategy):
    def __init__(self, card_number: str):
        self.card_number = card_number

    def pay(self, amount: float) -> str:
        return f"Paid \${amount:.2f} using Card ending in {self.card_number[-4:]}"

class CryptoPayment(PaymentStrategy):
    def __init__(self, wallet_address: str):
        self.wallet_address = wallet_address

    def pay(self, amount: float) -> str:
        return f"Paid \${amount:.2f} via Crypto Wallet {self.wallet_address[:6]}..."

class OrderProcessor:
    """Context executing strategy adhering to Open/Closed Principle."""
    def __init__(self, strategy: PaymentStrategy):
        self.strategy = strategy

    def set_strategy(self, strategy: PaymentStrategy) -> None:
        self.strategy = strategy

    def checkout(self, amount: float) -> str:
        return self.strategy.pay(amount)`,
      notes: 'CareerLaunch-authored Strategy Pattern with Abstract Base Classes. Not from external docs.',
    },
    rawContent: `# Object-Oriented Design Patterns (GoF)

### Canonical Interface Abstraction (Python Standard Library: abc)
The abc module provides the formal infrastructure for defining abstract base classes (ABCs). An abstract base class establishes a blueprint or interface contract for subclasses by marking methods with the @abstractmethod decorator. Subclasses must provide concrete implementations for every abstract method before instantiation is permitted. Python's Data Model specifies method resolution order (C3 Linearization) for multiple inheritance and object lifecycle management (__new__ for instance creation, __init__ for initialization).

### Gang of Four (GoF) Catalog & Categorization
The 23 Gang of Four patterns are organized into three primary categories:
1. Creational Patterns:
   - Factory Method: Defines an interface for creating objects, letting subclasses decide which class to instantiate.
   - Abstract Factory: Produces families of related or dependent objects without specifying concrete classes.
   - Builder: Separates construction of a complex object from its representation.
   - Singleton: Ensures a class has only one instance and provides global access (implemented using thread-safe locks or module-level caching).
2. Structural Patterns:
   - Adapter: Converts the interface of a class into another interface clients expect.
   - Decorator: Attaches additional responsibilities to an object dynamically without subclass explosion.
   - Facade: Provides a simplified, unified interface to a complex subsystem.
3. Behavioral Patterns:
   - Strategy: Defines a family of algorithms, encapsulates each one, and makes them interchangeable at runtime.
   - Observer: Defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified automatically.

### SOLID Architectural Principles
- S - Single Responsibility Principle (SRP): A class should have one, and only one, reason to change.
- O - Open/Closed Principle (OCP): Software entities should be open for extension, but closed for modification.
- L - Liskov Substitution Principle (LSP): Subtypes must be substitutable for their base types without altering program correctness.
- I - Interface Segregation Principle (ISP): Clients should not be forced to depend on methods they do not use.
- D - Dependency Inversion Principle (DIP): High-level modules should not depend on low-level modules; both should depend on abstractions.

### CareerLaunch Pedagogical Guide: Strategy Pattern Refactoring
Refactoring tightly coupled conditional chains (if/elif/else on payment types) into polymorphism using the Strategy Pattern removes conditional logic, allows dynamic addition of new payment mechanisms without touching existing order processing code, and rigorously upholds the Open/Closed Principle.`,
    roleTags: ['software-engineer'],
    topicTags: ['se-top-16'],
    difficultyTier: 'advanced',
    sectionHierarchy: ['Object-Oriented Design Patterns (GoF)', 'Canonical Interface Abstraction', 'Gang of Four Catalog', 'SOLID Principles'],
  },
]

const batch3PostgresDocuments = [
  {
    title: 'High-Level System Design & Scalability',
    url: 'https://www.postgresql.org/docs/current/high-availability.html',
    contentOrigin: 'hybrid_pedagogical',
    canonicalSource: {
      name: 'PostgreSQL Documentation: High Availability, Load Balancing, and Replication',
      url: 'https://www.postgresql.org/docs/current/high-availability.html',
      passage:
        'High availability and scalability can be achieved through replication and load balancing. Several architectural approaches exist: primary-standby streaming replication where Write-Ahead Logging (WAL) records are streamed to one or more standbys for read scaling and failover; synchronous replication where transactions wait for acknowledgment from standbys before committing; and asynchronous replication where transactions commit locally before standby reception. Standby servers can process read-only queries.',
    },
    groundingPassage:
      'High availability and scalability can be achieved through replication and load balancing. Several architectural approaches exist: primary-standby streaming replication where Write-Ahead Logging (WAL) records are streamed to one or more standbys for read scaling and failover; synchronous replication where transactions wait for acknowledgment from standbys before committing; and asynchronous replication where transactions commit locally before standby reception. Standby servers can process read-only queries.',
    crossReferences: [
      {
        name: 'PostgreSQL Documentation: Streaming Replication',
        url: 'https://www.postgresql.org/docs/current/warm-standby.html',
      },
    ],
    codeExemplar: {
      author: 'CareerLaunch Engineering',
      language: 'python',
      code: `import time
import threading

class TokenBucketRateLimiter:
    """Thread-safe Token Bucket rate limiter for distributed API gateways.
    Authored by CareerLaunch Engineering.
    """
    def __init__(self, capacity: int, refill_rate_per_sec: float):
        self.capacity = float(capacity)
        self.tokens = float(capacity)
        self.refill_rate = refill_rate_per_sec
        self.last_refill_timestamp = time.time()
        self.lock = threading.Lock()

    def allow_request(self, tokens_needed: int = 1) -> bool:
        with self.lock:
            now = time.time()
            elapsed = now - self.last_refill_timestamp
            self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
            self.last_refill_timestamp = now

            if self.tokens >= tokens_needed:
                self.tokens -= tokens_needed
                return True
            return False`,
      notes: 'CareerLaunch-authored Token Bucket Rate Limiter. Not from external docs.',
    },
    rawContent: `# High-Level System Design & Scalability

### Canonical High Availability & Replication (PostgreSQL Documentation)
High availability and horizontal scalability are achieved through data replication and load balancing. Primary-standby streaming replication streams Write-Ahead Logging (WAL) records from the primary server to one or more standby replicas. Synchronous replication guarantees zero data loss (RPO = 0) by requiring standby acknowledgment prior to transaction commit, trading latency for strict durability. Asynchronous replication delivers lower write latency while accepting bounded replication lag. Standby replicas operate in read-only mode to distribute query load away from the primary.

### Distributed Systems Foundations & Trade-offs
- Horizontal vs Vertical Scaling: Adding commodity instances (scale out) versus upgrading CPU/RAM/IOPS on a single machine (scale up). Horizontal scaling requires stateless application tiers and distributed data storage.
- Load Balancing: Layer 4 (Transport layer, TCP/UDP port mapping) vs Layer 7 (Application layer, HTTP path/header routing, SSL termination). Algorithms: Round Robin, Least Connections, Consistent Hashing.
- Caching Architectures: Cache-Aside (Lazy Loading), Write-Through, Write-Behind. Strategies for mitigating Cache Stampede (Thundering Herd) and Cache Penetration.
- Consistent Hashing: Distributes keys across a ring with virtual nodes (replicas), bounding key remaps to K/N on node additions or failures.
- CAP Theorem & PACELC: Under network partition (P), choose between Consistency (C) and Availability (A). If no partition (Else), trade Latency (L) versus Consistency (C).
- Database Sharding & Partitioning: Horizontal range-based, hash-based, or directory-based partitioning. Managing cross-shard joins and distributed transactions (Sagas vs Two-Phase Commit).

### CareerLaunch Pedagogical Guide: System Design Interview Case Study (TinyURL)
1. Requirements & Scale: 100M daily active users generating 500 writes/sec and 5,000 reads/sec (10:1 read-to-write ratio).
2. Capacity Planning: 5-year storage projection, memory cache sizing (80/20 Pareto principle requires caching 20% of daily active URLs in RAM).
3. URL Encoding: Base62 encoding (a-z, A-Z, 0-9) yielding 62^7 = ~3.5 trillion unique 7-character hashes, avoiding collision via distributed Key Generation Service (KGS).
4. Rate Limiting: Token Bucket algorithm deployed at the API Gateway layer to protect downstream microservices from burst traffic.`,
    roleTags: ['software-engineer'],
    topicTags: ['se-top-17'],
    difficultyTier: 'advanced',
    sectionHierarchy: ['High-Level System Design & Scalability', 'Canonical High Availability & Replication', 'Distributed Systems Foundations', 'TinyURL Case Study'],
  },
]

async function runBatch3Ingestion() {
  console.log('\n=================================================================')
  console.log('   CAREERLAUNCH PHASE 5.1: BATCH 3 SOURCE INGESTION PIPELINE    ')
  console.log('=================================================================\n')

  await mongoose.connect(MONGODB_URI)
  console.log(`Connected to MongoDB at: ${MONGODB_URI}\n`)

  // Baseline verification
  const initialStudentCount = await StudentProfile.countDocuments()
  const initialLessonCount = await GeneratedLesson.countDocuments()
  const initialDocCount = await IngestedDocument.countDocuments()
  const initialChunkCount = await ContentChunk.countDocuments()
  const initialSourceCount = await KnowledgeSource.countDocuments()

  console.log(`Baseline Verification:`)
  console.log(`  - Student Profiles  : ${initialStudentCount} (expected: 2)`)
  console.log(`  - Generated Lessons : ${initialLessonCount} (expected: 12)`)
  console.log(`  - Ingested Documents: ${initialDocCount} (expected: 12)`)
  console.log(`  - Content Chunks    : ${initialChunkCount} (expected: 17)`)
  console.log(`  - Knowledge Sources : ${initialSourceCount} (expected: 2)\n`)

  if (initialStudentCount !== 2 || initialLessonCount !== 12) {
    throw new Error('Baseline integrity check failed! Aborting ingestion.')
  }

  // 1. Ensure KnowledgeSource 'python-docs' is registered and active
  let pythonSource = await KnowledgeSource.findOne({ sourceId: 'python-docs' })
  if (!pythonSource) {
    console.log('Registering KnowledgeSource "python-docs"...')
    pythonSource = await KnowledgeSource.create({
      sourceId: 'python-docs',
      name: 'Python Official Documentation - Standard Library & Language Reference',
      owner: 'Python Software Foundation',
      baseUrl: 'https://docs.python.org/3/',
      category: 'official_docs',
      authorityTier: 1,
      licence: {
        spdxId: 'PSF-2.0',
        name: 'Python Software Foundation License Version 2',
        version: '2.0',
        commercialUsePermitted: true,
        attributionRequired: true,
        attributionText: 'Copyright © 2001-2026 Python Software Foundation. All rights reserved.',
        storagePermitted: true,
        indexingPermitted: true,
        quotingPermitted: true,
        maxQuoteLengthCharacters: 2000,
      },
      ingestionMethod: 'static_dump',
      allowedDomains: ['docs.python.org'],
      status: 'active',
    })
    console.log('  ✓ KnowledgeSource "python-docs" created successfully.')
  } else {
    pythonSource.status = 'active'
    await pythonSource.save()
    console.log('  ✓ KnowledgeSource "python-docs" verified active.')
  }

  // 2. Ensure KnowledgeSource 'postgresql-docs' is registered and active
  let pgSource = await KnowledgeSource.findOne({ sourceId: 'postgresql-docs' })
  if (!pgSource) {
    console.log('Registering KnowledgeSource "postgresql-docs"...')
    pgSource = await KnowledgeSource.create({
      sourceId: 'postgresql-docs',
      name: 'PostgreSQL Official Documentation - High Availability & Architecture',
      owner: 'The PostgreSQL Global Development Group',
      baseUrl: 'https://www.postgresql.org/docs/',
      category: 'official_docs',
      authorityTier: 1,
      licence: {
        spdxId: 'PostgreSQL',
        name: 'The PostgreSQL Licence',
        version: '1.0',
        commercialUsePermitted: true,
        attributionRequired: true,
        attributionText: 'Portions Copyright © 1996-2026, The PostgreSQL Global Development Group. Portions Copyright © 1994, The Regents of the University of California.',
        storagePermitted: true,
        indexingPermitted: true,
        quotingPermitted: true,
        maxQuoteLengthCharacters: 2000,
      },
      ingestionMethod: 'static_dump',
      allowedDomains: ['www.postgresql.org', 'postgresql.org'],
      status: 'active',
    })
    console.log('  ✓ KnowledgeSource "postgresql-docs" created successfully.')
  } else {
    pgSource.status = 'active'
    await pgSource.save()
    console.log('  ✓ KnowledgeSource "postgresql-docs" verified active.')
  }

  // 3. Ingest Python Documents (se-top-13, se-top-15, se-top-16)
  console.log('\nExecuting ingestion job for Python documentation...')
  const pyResult = await executeIngestionJob({
    sourceId: 'python-docs',
    initiatedBy: 'phase_5_1_batch_3_admin',
    documents: batch3PythonDocuments,
  })
  console.log(`  - Job ID              : ${pyResult.jobId}`)
  console.log(`  - Status              : ${pyResult.status}`)
  console.log(`  - Documents Processed : ${pyResult.documentsProcessed}`)
  console.log(`  - Chunks Created      : ${pyResult.chunksCreated}`)

  // 4. Ingest PostgreSQL Document (se-top-17)
  console.log('\nExecuting ingestion job for PostgreSQL documentation...')
  const pgResult = await executeIngestionJob({
    sourceId: 'postgresql-docs',
    initiatedBy: 'phase_5_1_batch_3_admin',
    documents: batch3PostgresDocuments,
  })
  console.log(`  - Job ID              : ${pgResult.jobId}`)
  console.log(`  - Status              : ${pgResult.status}`)
  console.log(`  - Documents Processed : ${pgResult.documentsProcessed}`)
  console.log(`  - Chunks Created      : ${pgResult.chunksCreated}`)

  // Post-ingestion verification
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

  // Check chunks for each Batch 3 approved topic
  const batch3ApprovedTopics = ['se-top-13', 'se-top-15', 'se-top-16', 'se-top-17']
  for (const tid of batch3ApprovedTopics) {
    const chunk = await ContentChunk.findOne({ topicTags: tid })
    if (!chunk) {
      throw new Error(`Failed to verify chunk for topic: ${tid}`)
    }
    console.log(`  ✓ Topic ${tid}: Chunk ${chunk.chunkId} verified (origin: ${chunk.contentOrigin}, exemplar author: ${chunk.codeExemplar.author})`)
  }

  // Verify se-top-14 and se-top-1 were NOT ingested
  const seTop14Chunk = await ContentChunk.findOne({ topicTags: 'se-top-14' })
  if (seTop14Chunk) {
    throw new Error('FATAL: se-top-14 chunk was ingested! Virtual memory topic restriction violated.')
  }
  console.log('  ✓ Verified se-top-14 was NOT ingested (stop condition honored).')

  const seTop1Chunk = await ContentChunk.findOne({ topicTags: 'se-top-1' })
  if (seTop1Chunk) {
    throw new Error('FATAL: se-top-1 chunk was ingested! Memory topic restriction violated.')
  }
  console.log('  ✓ Verified se-top-1 was NOT ingested (memory topic restriction honored).')

  console.log('\n=================================================================')
  console.log('   BATCH 3 SOURCE INGESTION COMPLETED SUCCESSFULLY!              ')
  console.log('=================================================================\n')

  await mongoose.disconnect()
}

runBatch3Ingestion().catch((err) => {
  console.error('\n✗ Ingestion error:', err)
  process.exit(1)
})
