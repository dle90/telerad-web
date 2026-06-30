import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api'
import { PageHeaderProvider, usePageHeaderCtx } from '../context/PageHeaderContext'
import { Icon } from '../design-system/icons'
import ChangeOwnPasswordModal from './ChangeOwnPasswordModal'

// Nav telerad (đơn schema, phẳng) — icon design-system thay emoji.
const NAV_ITEMS = [
  { to: '/reading', label: 'Ca đọc', icon: 'scan' },
  { to: '/staff', label: 'Quản lý nhân sự', icon: 'user' },
  { to: '/partners', label: 'Đối tác tích hợp', icon: 'building-2' },
  { to: '/result-templates', label: 'Cấu hình mẫu kết quả', icon: 'clipboard' },
  { to: '/result-sheet-templates', label: 'Cấu hình phiếu kết quả', icon: 'file-text' },
]
const APP_TITLE = 'Telerad'

// Sidebar: thu gọn/mở + kéo cạnh phải để chỉnh độ rộng; lưu localStorage để tái sử dụng.
const SIDEBAR_MIN_W = 160
const SIDEBAR_MAX_W = 480
const SIDEBAR_DEFAULT_W = 224
const SIDEBAR_WIDTH_LS_KEY = 'telerad_sidebar_width'
const SIDEBAR_OPEN_LS_KEY = 'telerad_sidebar_open'

/* Tiêu đề trang trên topbar — từ PageHeaderContext (mỗi trang đẩy lên qua
   <PageHeader title=.../>). Fallback "Medisync Telerad". */
function TopbarTitle() {
  const ctx = usePageHeaderCtx()
  return <span className="t-title text-neutral-800 truncate">{ctx?.title || 'Medisync Telerad'}</span>
}

/* Profile popover — tên + đổi mật khẩu + đăng xuất. */
function ProfilePopover({ name, onChangePassword, onLogout, onClose }) {
  const ref = React.useRef(null)
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])
  const initials = (name || '?').slice(0, 2).toUpperCase()
  return (
    <div ref={ref} className="absolute right-0 top-full mt-1 w-56 rounded-xl overflow-hidden shadow-lg border border-neutral-200 bg-white z-50 py-1">
      <div className="px-4 py-3 flex items-center gap-3 border-b border-neutral-100">
        <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{initials}</div>
        <p className="text-sm font-medium tc-1 truncate">{name}</p>
      </div>
      <button onClick={onChangePassword} className="w-full flex items-center gap-3 px-4 py-2 text-sm tc-2 hover:bg-neutral-50 text-left">
        <Icon name="lock" size={15} className="tc-4" /> Đổi mật khẩu
      </button>
      <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger-600 hover:bg-danger-600/10 text-left">
        <Icon name="logout" size={15} /> Đăng xuất
      </button>
    </div>
  )
}

export default function Layout({ children }) {
  const { auth, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)

  /* Sidebar mở/đóng — lưu localStorage */
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_OPEN_LS_KEY) !== 'false' } catch { return true }
  })
  const toggleSidebar = (open) => {
    setSidebarOpen(open)
    try { localStorage.setItem(SIDEBAR_OPEN_LS_KEY, open ? 'true' : 'false') } catch {}
  }

  /* Độ rộng sidebar — kéo cạnh phải để chỉnh, lưu localStorage */
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    try {
      const v = parseInt(localStorage.getItem(SIDEBAR_WIDTH_LS_KEY), 10)
      if (!Number.isNaN(v)) return Math.min(SIDEBAR_MAX_W, Math.max(SIDEBAR_MIN_W, v))
    } catch {}
    return SIDEBAR_DEFAULT_W
  })
  const [dragging, setDragging] = useState(false)

  const startResize = (e) => {
    e.preventDefault()
    setDragging(true)
    const startX = e.clientX
    const startW = sidebarWidth
    let finalW = startW
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    const onMove = (ev) => {
      finalW = Math.min(SIDEBAR_MAX_W, Math.max(SIDEBAR_MIN_W, startW + (ev.clientX - startX)))
      setSidebarWidth(finalW)
    }
    const onUp = () => {
      setDragging(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      try { localStorage.setItem(SIDEBAR_WIDTH_LS_KEY, String(finalW)) } catch {}
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  useEffect(() => {
    if (auth?.user?.fullName) return
    getMe().then((me) => me && updateUser(me)).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const active = [...NAV_ITEMS]
      .filter((item) => location.pathname.startsWith(item.to))
      .sort((a, b) => b.to.length - a.to.length)[0]
    document.title = active ? `${APP_TITLE} - ${active.label}` : APP_TITLE
  }, [location.pathname])

  const displayName = auth?.user?.fullName || auth?.user?.username || 'Tài khoản'
  const handleLogout = () => { logout(); navigate('/', { replace: true }) }

  return (
    <PageHeaderProvider moduleLabel="Telerad">
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>

      {/* ── Sidebar (dark, design-system) — thu gọn/mở + kéo chỉnh độ rộng ──── */}
      <aside
        className={`relative flex-shrink-0 flex flex-col overflow-hidden ${dragging ? '' : 'transition-[width] duration-200 ease-in-out'}`}
        style={{ width: sidebarOpen ? sidebarWidth : 0, backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
      >
        <div className="flex flex-col h-full overflow-hidden" style={{ width: sidebarWidth }}>
          <div className="flex items-center gap-2.5 px-4 h-14 flex-shrink-0" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-600/40">
              <Icon name="heartbeat" size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm font-semibold tracking-tight truncate">Medisync Telerad</div>
              <div className="t-micro text-sidebar-text-muted">Trang quản trị</div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto py-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors ${
                    isActive ? 'bg-primary-600 text-white font-medium' : 'text-sidebar-text hover:bg-white/8 hover:text-white'
                  }`
                }
              >
                <Icon name={item.icon} size={15} className="flex-shrink-0 opacity-80" />
                <span className="flex-1 truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Thanh kéo chỉnh độ rộng (cạnh phải sidebar) */}
        {sidebarOpen && (
          <div
            onMouseDown={startResize}
            title="Kéo để chỉnh độ rộng menu"
            className={`absolute top-0 right-0 h-full w-1.5 cursor-col-resize z-30 transition-colors ${
              dragging ? 'bg-primary-500/50' : 'hover:bg-primary-500/30'
            }`}
          />
        )}
      </aside>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b border-neutral-200 px-5 flex items-center justify-between shadow-xs flex-shrink-0" style={{ height: 'var(--header-h, 56px)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => toggleSidebar(!sidebarOpen)}
              className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors flex-shrink-0"
              title={sidebarOpen ? 'Ẩn menu' : 'Hiện menu'}
            >
              <Icon name="menu" size={18} />
            </button>
            <TopbarTitle />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 text-sm tc-2 hover:bg-neutral-50 rounded-lg px-2 py-1.5"
              >
                <span className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <span className="font-medium hidden sm:inline">{displayName}</span>
                <Icon name="chevron-down" size={13} className="tc-4" />
              </button>
              {profileOpen && (
                <ProfilePopover
                  name={displayName}
                  onChangePassword={() => { setProfileOpen(false); setShowChangePassword(true) }}
                  onLogout={handleLogout}
                  onClose={() => setProfileOpen(false)}
                />
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>

      {showChangePassword && <ChangeOwnPasswordModal onClose={() => setShowChangePassword(false)} />}
    </div>
    </PageHeaderProvider>
  )
}
