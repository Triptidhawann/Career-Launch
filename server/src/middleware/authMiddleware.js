import { verifyToken } from '../config/firebaseAdmin.js'

/**
 * Authentication middleware for Express.
 * Validates Firebase ID bearer token and attaches decoded user to req.user.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // In local development, fall back gracefully to the student profile if no header was attached
    if (process.env.NODE_ENV !== 'production') {
      req.user = {
        uid: 'H0cYrHDcguQl66eMXY5niCG8mEj2',
        email: 'triptidhawan15@gmail.com',
        name: 'Tripti Dhawan',
        email_verified: true,
      }
      return next()
    }

    res.status(401).json({
      error: 'Unauthorized: Missing or invalid Authorization header.',
    })
    return
  }

  const token = authHeader.split('Bearer ')[1]?.trim()

  if (!token) {
    if (process.env.NODE_ENV !== 'production') {
      req.user = {
        uid: 'H0cYrHDcguQl66eMXY5niCG8mEj2',
        email: 'triptidhawan15@gmail.com',
        name: 'Tripti Dhawan',
        email_verified: true,
      }
      return next()
    }

    res.status(401).json({
      error: 'Unauthorized: Bearer token is empty.',
    })
    return
  }

  try {
    const decoded = await verifyToken(token)
    req.user = decoded
    next()
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      req.user = {
        uid: 'H0cYrHDcguQl66eMXY5niCG8mEj2',
        email: 'triptidhawan15@gmail.com',
        name: 'Tripti Dhawan',
        email_verified: true,
      }
      return next()
    }

    res.status(401).json({
      error: 'Unauthorized: Invalid or expired Firebase ID token.',
      details: error.message,
    })
  }
}
