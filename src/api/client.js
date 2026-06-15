// Shared API client: telerad-core base URL resolution, the apiFetch wrapper,
// and auth storage. Domain endpoint modules import from here.
//
// Unlike his-web, telerad-core is single-schema (one fixed `telerad` schema) —
// there is NO facility selection and NO Facility-Uuid header.

import { getResult, getMessage } from '../lib/baseResponse'

// --- telerad-core base URL (cross-origin) --------------------------------
// telerad-web calls telerad-core directly at its own origin (public CORS API)
// instead of a same-origin proxy. Resolved at RUNTIME from
// window.__TELERAD_CORE_URL__ (set by /config.js) so one build serves every
// env. Value should include the '/services' segment, e.g.
// http://localhost:8101/services.
export const TELERAD_CORE_BASE = (
  (typeof window !== 'undefined' && window.__TELERAD_CORE_URL__) ||
  import.meta.env.VITE_TELERAD_CORE_URL ||
  ''
).replace(/\/+$/, '')

// --- Auth storage ---------------------------------------------------------

export const AUTH_KEY = 'telerad_auth'

function readAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null')
  } catch {
    return null
  }
}

// Wrapper around fetch that injects the Authorization header and unwraps the
// telerad-core BaseResponse shape: { code, message, result }.
export async function apiFetch(path, { method = 'GET', body, headers = {} } = {}) {
  const auth = readAuth()

  const finalHeaders = { 'Content-Type': 'application/json', ...headers }
  if (auth?.token) finalHeaders['Authorization'] = `Bearer ${auth.token}`

  const res = await fetch(TELERAD_CORE_BASE + path, {
    method,
    headers: finalHeaders,
    body: body != null ? JSON.stringify(body) : undefined,
  })

  let payload = null
  try {
    payload = await res.json()
  } catch {}

  if (!res.ok) {
    const message = getMessage(payload) || `Yêu cầu thất bại (${res.status})`

    if (res.status === 401) {
      // 401: token hết hạn / không hợp lệ — xoá auth và báo cho AuthContext để
      // đá về màn hình đăng nhập. Không toast (đã điều hướng về login).
      try {
        localStorage.removeItem(AUTH_KEY)
      } catch {}
      try {
        window.dispatchEvent(new Event('auth:unauthorized'))
      } catch {}
    } else {
      // Mọi lỗi khác (400, 500, …): đẩy message ra toast chung cho toàn app.
      // Caller vẫn nhận lỗi qua throw để xử lý riêng nếu cần.
      try {
        window.dispatchEvent(
          new CustomEvent('api:error', { detail: { status: res.status, message } }),
        )
      } catch {}
    }

    const err = new Error(message)
    err.response = { status: res.status, data: { ...payload, error: message } }
    throw err
  }

  // telerad-core wraps everything in BaseResponse; return the inner `result`.
  return getResult(payload)
}
