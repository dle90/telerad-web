import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import ApiErrorToast from './components/ApiErrorToast'
import SuccessToast from './components/SuccessToast'
import ConfirmDialog from './components/ConfirmDialog'
import Login from './pages/Login'
import StaffPage from './features/staff/StaffPage'
import PartnerPage from './features/partner/PartnerPage'
import ReadingPage from './features/reading/ReadingPage'
import ResultTemplatePage from './features/resultTemplate/ResultTemplatePage'
import ResultSheetTemplatePage from './features/resultSheetTemplate/ResultSheetTemplatePage'
import PublicResultSheetPage from './features/reading/PublicResultSheetPage'

// Layout route bảo vệ: chưa đăng nhập -> Login; đã đăng nhập -> Layout + route con (<Outlet/>).
function ProtectedLayout() {
  const { auth } = useAuth()
  if (!auth) return <Login />
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* CÔNG KHAI — không cần đăng nhập, không Layout (HIS / bệnh nhân xem phiếu qua link) */}
        <Route path="/reading/public-result-sheet" element={<PublicResultSheetPage />} />

        {/* Cần đăng nhập + Layout quản trị */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/reading" replace />} />
          <Route path="/reading" element={<ReadingPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/partners" element={<PartnerPage />} />
          <Route path="/result-templates" element={<ResultTemplatePage />} />
          <Route path="/result-sheet-templates" element={<ResultSheetTemplatePage />} />
          <Route path="*" element={<Navigate to="/reading" replace />} />
        </Route>
      </Routes>

      {/* Global toast for API errors dispatched by apiFetch. */}
      <ApiErrorToast />
      {/* Global toast cho thông báo thành công (notifySuccess). */}
      <SuccessToast />
      {/* Modal xác nhận dùng chung (confirmDialog). */}
      <ConfirmDialog />
    </AuthProvider>
  )
}
