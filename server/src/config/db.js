import mongoose from 'mongoose'

/**
 * Connect to MongoDB database instance.
 * Preserves default connection URI: mongodb://127.0.0.1:27018/careerlaunch
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerlaunch'

  try {
    mongoose.set('strictQuery', true)

    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 })
    } catch {
      const fallbackPort = uri.includes('27018') ? '27017' : '27018'
      const fallbackUri = uri.includes('27018') ? uri.replace('27018', '27017') : uri.replace('27017', '27018')
      console.warn(`[MongoDB] Primary port failed, attempting fallback to ${fallbackPort}...`)
      await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 3000 })
    }
    console.log(`[MongoDB] Connected successfully to database: ${mongoose.connection.name}`)

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Runtime connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Database disconnected. Reconnecting...')
      setTimeout(() => {
        mongoose.connect(uri).catch((err) => {
          console.error('[MongoDB] Auto-reconnect error:', err)
        })
      }, 2000)
    })
  } catch (error) {
    console.error('[MongoDB] Connection failure:', error)
    throw error
  }
}
