import mongoose from 'mongoose'

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/careerlaunch'

  try {
    mongoose.set('strictQuery', true)

    await mongoose.connect(uri)
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
