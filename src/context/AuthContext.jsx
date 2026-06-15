import React, { createContext, useContext, useEffect, useState } from 'react'
import { AUTH_KEY } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = (data) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data))
    setAuth(data)
  }

  const logout = () => {
    localStorage.removeItem(AUTH_KEY)
    setAuth(null)
  }

  // Cập nhật thông tin user đang đăng nhập (vd. sau getMe) mà không đổi token.
  const updateUser = (user) => {
    setAuth((prev) => {
      if (!prev) return prev
      const next = { ...prev, user }
      localStorage.setItem(AUTH_KEY, JSON.stringify(next))
      return next
    })
  }

  // Khi apiFetch nhận 401, nó xoá storage và bắn 'auth:unauthorized'.
  // Đồng bộ React state để AuthenticatedRoutes render <Login /> ngay lập tức.
  useEffect(() => {
    const handler = () => setAuth(null)
    window.addEventListener('auth:unauthorized', handler)
    return () => window.removeEventListener('auth:unauthorized', handler)
  }, [])

  return (
    <AuthContext.Provider value={{ auth, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
