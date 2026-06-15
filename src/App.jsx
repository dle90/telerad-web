import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import ApiErrorToast from './components/ApiErrorToast'
import Login from './pages/Login'
import StaffPage from './features/staff/StaffPage'
import PartnerPage from './features/partner/PartnerPage'
import ReadingPage from './features/reading/ReadingPage'

function AuthenticatedRoutes() {
  const { auth } = useAuth()

  if (!auth) return <Login />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/reading" replace />} />
        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/partners" element={<PartnerPage />} />
        <Route path="*" element={<Navigate to="/reading" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedRoutes />
      {/* Global toast for API errors dispatched by apiFetch. */}
      <ApiErrorToast />
    </AuthProvider>
  )
}
