import { StudentProfile } from '../models/StudentProfile.js'

/**
 * Middleware to enforce verified administrator privileges.
 * Relies strictly on server-side database records or verified environment configuration.
 * Never trusts role claims sent directly in client payloads.
 */
export async function requireAdmin(req, res, next) {
  const user = req.user

  if (!user || !user.uid) {
    res.status(401).json({
      error: 'Unauthorized: Authentication required before checking administrative privileges.',
    })
    return
  }

  try {
    // 1. Verify against server-side database profile
    const profile = await StudentProfile.findOne({ firebaseUid: user.uid })

    if (profile && profile.role === 'admin') {
      req.isAdmin = true
      next()
      return
    }

    // 2. Check server environment admin whitelist (bootstrap safety mechanism)
    const adminEmailsEnv = process.env.ADMIN_EMAILS || ''
    const adminUidsEnv = process.env.ADMIN_UIDS || ''

    const allowedEmails = adminEmailsEnv
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
    const allowedUids = adminUidsEnv
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean)

    const isEmailAdmin = user.email && allowedEmails.includes(user.email.toLowerCase())
    const isUidAdmin = allowedUids.includes(user.uid)

    if (isEmailAdmin || isUidAdmin) {
      req.isAdmin = true
      next()
      return
    }

    // 3. User is authenticated, but lacks administrator privileges
    res.status(403).json({
      error: 'Forbidden: Verified administrator permissions are required to access knowledge ingestion APIs.',
    })
  } catch (error) {
    console.error('[AdminMiddleware] Internal authorization error:', error)
    res.status(500).json({
      error: 'Internal server error verifying administrator privileges.',
    })
  }
}
