import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { SignupPage } from '@/pages/SignupPage'
import { StudentDashboardPage } from '@/pages/StudentDashboardPage'
import { InterviewPreparationPage } from '@/pages/InterviewPreparationPage'
import { RoleSkillSelectionPage } from '@/pages/RoleSkillSelectionPage'
import { PreparationSetupPage } from '@/pages/PreparationSetupPage'
import { DiagnosticPage } from '@/pages/DiagnosticPage'
import { PreparationPlanPage } from '@/pages/PreparationPlanPage'
import { LearningAssistantPage } from '@/pages/LearningAssistantPage'
import { VerifyEmailPage } from '@/pages/VerifyEmailPage'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication & Verification Routes */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Protected Student Onboarding & Dashboard */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireVerifiedEmail={true}>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireVerifiedEmail={true} requireOnboarding={false}>
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-preparation"
            element={
              <ProtectedRoute requireVerifiedEmail={true} requireOnboarding={false}>
                <InterviewPreparationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-preparation/frontend-developer/skills"
            element={
              <ProtectedRoute requireVerifiedEmail={true} requireOnboarding={false}>
                <RoleSkillSelectionPage />
              </ProtectedRoute>
            }
          />
          {/* Phase 3: Dedicated AI Learning Assistant Routes */}
          <Route
            path="/interview-preparation/:roleId/assistant"
            element={
              <ProtectedRoute requireVerifiedEmail={true} requireOnboarding={false}>
                <LearningAssistantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-preparation/:roleId/assistant/:sessionId"
            element={
              <ProtectedRoute requireVerifiedEmail={true} requireOnboarding={false}>
                <LearningAssistantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-preparation/frontend-developer/setup"
            element={
              <ProtectedRoute requireVerifiedEmail={true} requireOnboarding={false}>
                <PreparationSetupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-preparation/frontend-developer/diagnostic"
            element={
              <ProtectedRoute requireVerifiedEmail={true} requireOnboarding={false}>
                <DiagnosticPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-preparation/frontend-developer/plan/:planId"
            element={
              <ProtectedRoute requireVerifiedEmail={true} requireOnboarding={false}>
                <PreparationPlanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-preparation/:roleId"
            element={
              <ProtectedRoute requireVerifiedEmail={true} requireOnboarding={false}>
                <InterviewPreparationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-preparation/:roleId/topic/:topicId"
            element={
              <ProtectedRoute requireVerifiedEmail={true} requireOnboarding={false}>
                <InterviewPreparationPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback to Home */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
