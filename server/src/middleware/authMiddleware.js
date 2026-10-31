import { verifyToken } from '../config/firebaseAdmin.js'

/**
 * Authentication middleware for Express.
 * Validates Firebase ID bearer token and attaches decoded user to req.user.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized: Missing or invalid Authorization header.',
    })
    return
  }

  const token = authHeader.split('Bearer ')[1]?.trim()

  if (!token) {
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
    res.status(401).json({
      error: 'Unauthorized: Invalid or expired Firebase ID token.',
      details: error.message,
    })
  }
}
