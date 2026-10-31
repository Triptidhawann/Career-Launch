import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import profileRoutes from './routes/profileRoutes.js'

const app = express()
const PORT = process.env.PORT || 5000

// Allow requests from the Vite frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]

if (process.env.CLIENT_ORIGIN) {
  allowedOrigins.push(process.env.CLIENT_ORIGIN)
}

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(null, true) // During development, be permissive
    },
    credentials: true,
  }),
)

app.use(express.json())

// Basic request logging
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`)
  })
  next()
})

// Health check endpoint
app.get('/api/health', (_req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1
  res.status(200).json({
    status: 'ok',
    service: 'CareerLaunch Backend API',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  })
})

// Mount API routes
app.use('/api/profile', profileRoutes)

// Fallback for unmatched API routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Start server after connecting to database
async function startServer() {
  try {
    await connectDB()
    const server = app.listen(PORT, () => {
      console.log(`[CareerLaunch Server] Running on http://localhost:${PORT}`)
      console.log(`[CareerLaunch Server] API ready at http://localhost:${PORT}/api`)
    })

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(
          `[CareerLaunch Server] Error: Port ${PORT} is already in use by another process.`,
        )
        console.error(
          `[CareerLaunch Server] Terminate the process using port ${PORT} or run 'Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force'.`,
        )
      } else {
        console.error('[CareerLaunch Server] Server error:', error)
      }
      process.exit(1)
    })

    const handleShutdown = (signal) => {
      console.log(`\n[CareerLaunch Server] Received ${signal}. Closing server...`)
      server.close(() => {
        console.log('[CareerLaunch Server] HTTP server closed.')
        process.exit(0)
      })
    }

    process.on('SIGINT', () => handleShutdown('SIGINT'))
    process.on('SIGTERM', () => handleShutdown('SIGTERM'))
  } catch (error) {
    console.error('[CareerLaunch Server] Failed to start:', error)
    process.exit(1)
  }
}

startServer()
