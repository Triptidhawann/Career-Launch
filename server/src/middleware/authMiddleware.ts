import { Request, Response, NextFunction } from 'express'
import { verifyToken, DecodedAuthToken } from '../config/firebaseAdmin.js'

export interface AuthenticatedRequest extends Request {
  user?: DecodedAuthToken
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
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
  } catch (error: any) {
    res.status(401).json({
      error: 'Unauthorized: Invalid or expired Firebase ID token.',
      details: error.message,
    })
  }
}
