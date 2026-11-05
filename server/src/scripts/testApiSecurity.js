import http from 'node:http'
import mongoose from 'mongoose'
import express from 'express'
import adminIngestRoutes from '../routes/adminIngestRoutes.js'
import profileRoutes from '../routes/profileRoutes.js'
import { StudentProfile } from '../models/StudentProfile.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/careerlaunch'

async function runSecurityTests() {
  console.log('\n=================================================================')
  console.log('   CAREERLAUNCH PHASE 2A: API & AUTH SECURITY CONTROLS TEST      ')
  console.log('=================================================================\n')

  await mongoose.connect(MONGODB_URI)

  const app = express()
  app.use(express.json())

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1
    res.status(200).json({
      status: 'ok',
      service: 'CareerLaunch Backend API',
      database: isDbConnected ? 'connected' : 'disconnected',
    })
  })

  // Mount routes
  app.use('/api/profile', profileRoutes)
  app.use('/api/admin/ingest', adminIngestRoutes)

  const server = http.createServer(app)
  await new Promise((resolve) => server.listen(5099, '127.0.0.1', resolve))
  const baseUrl = 'http://127.0.0.1:5099'

  try {
    // 1. Test Health Endpoint
    const healthRes = await fetch(`${baseUrl}/api/health`)
    const healthData = await healthRes.json()
    console.log('Test A: Health check status:', healthRes.status, healthData)
    if (healthRes.status !== 200 || healthData.database !== 'connected') {
      throw new Error('Health check failed.')
    }
    console.log('  ✓ [PASS] Backend health check: ok and database connected')

    // 2. Test Unauthenticated Access to Admin Ingestion API (Criteria 13)
    const unauthRes = await fetch(`${baseUrl}/api/admin/ingest/sources`)
    console.log('Test B: Unauthenticated request status:', unauthRes.status)
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated request, got ${unauthRes.status}`)
    }
    console.log('  ✓ [PASS] Test 13: Unauthenticated request rejected with 401 Unauthorized')

    // 3. Test Non-Admin Access to Admin Ingestion API (Criteria 14)
    // Create a mock non-admin student token header (base64 JSON payload with student role in DB)
    const mockStudentUid = 'student_test_uid_99'
    await StudentProfile.findOneAndUpdate(
      { firebaseUid: mockStudentUid },
      {
        firebaseUid: mockStudentUid,
        email: 'regular_student@careerlaunch.com',
        fullName: 'Regular Student',
        role: 'student', // Non-admin role
      },
      { upsert: true },
    )

    // Simulate token payload with student UID
    const studentHeader = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url')
    const studentPayload = Buffer.from(
      JSON.stringify({ user_id: mockStudentUid, email: 'regular_student@careerlaunch.com' }),
    ).toString('base64url')
    const mockStudentToken = `${studentHeader}.${studentPayload}.signature`

    const nonAdminRes = await fetch(`${baseUrl}/api/admin/ingest/sources`, {
      headers: {
        Authorization: `Bearer ${mockStudentToken}`,
      },
    })
    console.log('Test C: Non-admin request status:', nonAdminRes.status)
    const nonAdminData = await nonAdminRes.json()
    if (nonAdminRes.status !== 403) {
      throw new Error(`Expected 403 for non-admin request, got ${nonAdminRes.status}`)
    }
    console.log('  ✓ [PASS] Test 14: Non-admin student request rejected with 403 Forbidden:', nonAdminData.error)

    // 4. Test Verified Admin Access (Admin in database)
    const mockAdminUid = 'admin_test_uid_01'
    await StudentProfile.findOneAndUpdate(
      { firebaseUid: mockAdminUid },
      {
        firebaseUid: mockAdminUid,
        email: 'admin_officer@careerlaunch.com',
        fullName: 'Admin Officer',
        role: 'admin', // Verified admin role
      },
      { upsert: true },
    )

    const adminHeader = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url')
    const adminPayload = Buffer.from(
      JSON.stringify({ user_id: mockAdminUid, email: 'admin_officer@careerlaunch.com' }),
    ).toString('base64url')
    const mockAdminToken = `${adminHeader}.${adminPayload}.signature`

    const adminRes = await fetch(`${baseUrl}/api/admin/ingest/sources`, {
      headers: {
        Authorization: `Bearer ${mockAdminToken}`,
      },
    })
    console.log('Test D: Verified admin request status:', adminRes.status)
    const adminData = await adminRes.json()
    if (adminRes.status !== 200 || !adminData.success) {
      throw new Error(`Expected 200 for verified admin request, got ${adminRes.status}`)
    }
    console.log(`  ✓ [PASS] Test D: Verified admin granted access; found ${adminData.count} registered sources`)

    // Clean up mock student profile created for test
    await StudentProfile.deleteOne({ firebaseUid: mockStudentUid })
    await StudentProfile.deleteOne({ firebaseUid: mockAdminUid })

    // Verify student count restored to exactly 2
    const finalStudentCount = await StudentProfile.countDocuments()
    if (finalStudentCount !== 2) {
      throw new Error(`Student count was not restored to 2; actual: ${finalStudentCount}`)
    }
    console.log('  ✓ [PASS] Test 17c: Student count verified at exactly 2')

    console.log('\n=================================================================')
    console.log('   ALL API & AUTH SECURITY TESTS PASSED SUCCESSFULLY!            ')
    console.log('=================================================================\n')
  } finally {
    server.close()
    await mongoose.disconnect()
  }
}

runSecurityTests().catch((err) => {
  console.error('API security test error:', err)
  process.exit(1)
})
