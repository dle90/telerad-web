import { apiFetch, TELERAD_CORE_BASE } from '../client'
import { getMessage } from '../../lib/baseResponse'

// Auth — wired to telerad-core: POST /telerad-core/v1/staff/auth/token
// telerad-core's login endpoint returns the raw token object
// { access_token, token_type, expires_in } (NOT wrapped in BaseResponse), so we
// call fetch directly here instead of going through apiFetch (which unwraps
// `result`).
export const loginUser = async (username, password) => {
  const res = await fetch(TELERAD_CORE_BASE + '/telerad-core/v1/staff/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  let body = null
  try {
    body = await res.json()
  } catch {}

  if (!res.ok) {
    // telerad-core error shape: { code, message, result }
    const message = getMessage(body) || `Đăng nhập thất bại (${res.status})`
    const err = new Error(message)
    err.response = { status: res.status, data: { ...body, error: message } }
    throw err
  }

  return {
    token: body?.access_token,
    tokenType: body?.token_type,
    expiresIn: body?.expires_in,
    // role kept so AuthContext.hasPerm has a shape to work with; this is an
    // internal admin console so every authenticated staff is treated as admin.
    role: 'admin',
  }
}

// Thông tin bản thân của user đang đăng nhập.
export const getMe = () => apiFetch('/telerad-core/v1/staff/staff-account/actions/me')

// User tự đổi mật khẩu (cần mật khẩu hiện tại).
export const changeOwnPassword = (oldPassword, newPassword) =>
  apiFetch('/telerad-core/v1/staff/staff-account/actions/change-password', {
    method: 'PATCH',
    body: { oldPassword, newPassword },
  })
