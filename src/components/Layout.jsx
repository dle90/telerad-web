import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api'
import ChangeOwnPasswordModal from './ChangeOwnPasswordModal'

// Navigation entries for the admin console. Keep labels in Vietnamese, no
// abbreviations (global rule).
const NAV_ITEMS = [
  { to: '/reading', label: 'Ca đọc', icon: '🩻' },
  { to: '/staff', label: 'Quản lý nhân sự', icon: '👤' },
  { to: '/partners', label: 'Đối tác tích hợp', icon: '🤝' },
]

export default function Layout({ children }) {
  const { auth, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showChangePassword, setShowChangePassword] = useState(false)

  // Pull the current user's profile once after mount so the topbar can show a
  // real name instead of the login username. Tolerate failure (topbar just
  // falls back to whatever auth already holds).
  useEffect(() => {
    if (auth?.user?.fullName) return
    getMe()
      .then((me) => me && updateUser(me))
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const displayName = auth?.user?.fullName || auth?.user?.username || 'Tài khoản'

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar — collapses to width 0 via the header's "Ẩn menu" toggle. */}
      <aside
        className={`${
          sidebarOpen ? 'w-60' : 'w-0'
        } shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden transition-all duration-200`}
      >
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="text-xl font-bold text-blue-900 tracking-wide">Medisync Telerad</div>
          <div className="text-xs text-gray-400 mt-0.5">Trang quản trị</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          {/* Left: collapse toggle + app title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              title={sidebarOpen ? 'Ẩn menu' : 'Hiện menu'}
              aria-label={sidebarOpen ? 'Ẩn menu' : 'Hiện menu'}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Medisync Telerad</h1>
          </div>

          {/* Right: user menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg px-3 py-1.5"
            >
              <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </span>
              <span className="font-medium">{displayName}</span>
              <span className="text-gray-400 text-xs">▾</span>
            </button>
            {menuOpen && (
              <>
                {/* Click-away backdrop */}
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 text-sm">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      setShowChangePassword(true)
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Đổi mật khẩu
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

      {showChangePassword && (
        <ChangeOwnPasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  )
}
