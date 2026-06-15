import { apiFetch } from '../client'

const BASE = '/telerad-core/v1/staff/telerad-partner'

// Paginated partner list. `isActive`: true/false to filter, '' / undefined = all.
export const getPaginatedTeleradPartners = ({ page = 1, size = 20, search = '', isActive = '' } = {}) => {
  const qs = new URLSearchParams()
  qs.set('page', String(page))
  qs.set('size', String(size))
  if (search) qs.set('search', search)
  if (isActive === true || isActive === false) qs.set('isActive', String(isActive))
  return apiFetch(`${BASE}?${qs.toString()}`)
}

// Tất cả đối tác (kèm trạng thái) — combobox để chọn khi phân quyền đọc phim.
export const getAllTeleradPartners = () => apiFetch(`${BASE}/actions/get-all`)

export const getTeleradPartner = (objectUuid) => apiFetch(`${BASE}/${objectUuid}`)

// Tạo đối tác mới. body gồm credential telerad (username/password) + cấu hình
// callback phía partner (callback/callbackUrl/partnerUsername/partnerPassword).
export const createTeleradPartner = (body) => apiFetch(BASE, { method: 'POST', body })

// Sửa thông tin chung của đối tác (không đụng credential / cấu hình partner).
export const updateTeleradPartner = (objectUuid, body) =>
  apiFetch(`${BASE}/${objectUuid}`, { method: 'PUT', body })

export const activateTeleradPartner = (objectUuid) =>
  apiFetch(`${BASE}/${objectUuid}/activate`, { method: 'PATCH' })

export const deactivateTeleradPartner = (objectUuid) =>
  apiFetch(`${BASE}/${objectUuid}/deactivate`, { method: 'PATCH' })

// Cấu hình tài khoản phía partner (telerad dùng để callback sang hệ thống đối tác).
export const getTeleradPartnerConfig = (objectUuid) =>
  apiFetch(`${BASE}/${objectUuid}/partner-config`)

export const updateTeleradPartnerConfig = (objectUuid, body) =>
  apiFetch(`${BASE}/${objectUuid}/partner-config`, { method: 'PUT', body })

// Đổi mật khẩu phía telerad của đối tác (mật khẩu mới do admin cung cấp).
export const changeTeleradPartnerPassword = (objectUuid, password) =>
  apiFetch(`${BASE}/${objectUuid}/change-password`, { method: 'PATCH', body: { password } })
