import { apiFetch } from '../client'

const BASE = '/telerad-core/v1/staff/staff-account'

// Paginated staff list. `isActive`: true/false to filter, '' / undefined = all.
export const getPaginatedStaffAccounts = ({ page = 1, size = 20, search = '', isActive = '' } = {}) => {
  const qs = new URLSearchParams()
  qs.set('page', String(page))
  qs.set('size', String(size))
  if (search) qs.set('search', search)
  if (isActive === true || isActive === false) qs.set('isActive', String(isActive))
  return apiFetch(`${BASE}?${qs.toString()}`)
}

export const getStaffAccount = (objectUuid) => apiFetch(`${BASE}/${objectUuid}`)

// Tạo hồ sơ nhân viên (chưa có tài khoản đăng nhập).
export const createStaffAccount = (body) => apiFetch(BASE, { method: 'POST', body })

// Sửa hồ sơ nhân viên (không đụng username/password/quyền — endpoint riêng).
export const updateStaffAccount = (objectUuid, body) =>
  apiFetch(`${BASE}/${objectUuid}`, { method: 'PUT', body })

export const activateStaffAccount = (objectUuid) =>
  apiFetch(`${BASE}/${objectUuid}/activate`, { method: 'PATCH' })

export const deactivateStaffAccount = (objectUuid) =>
  apiFetch(`${BASE}/${objectUuid}/deactivate`, { method: 'PATCH' })

// Phân quyền đọc phim: modalities + danh sách đối tác telerad được đọc.
export const assignReadingPermission = (objectUuid, { modalities, teleradPartnerUuids }) =>
  apiFetch(`${BASE}/${objectUuid}/reading-permission`, {
    method: 'PATCH',
    body: { modalities, teleradPartnerUuids },
  })

// Phân roles cho nhân viên.
export const assignRoles = (objectUuid, roles) =>
  apiFetch(`${BASE}/${objectUuid}/roles`, { method: 'PATCH', body: { roles } })

// Cấp tài khoản đăng nhập (staff chưa có username). Trả { uuid, username, password }
// với password plaintext tự sinh — chỉ hiện 1 lần.
export const createStaffLoginAccount = (objectUuid, username) =>
  apiFetch(`${BASE}/${objectUuid}/create-account`, { method: 'POST', body: { username } })

// Reset mật khẩu (staff đã có username). Trả { uuid, username, password } mới.
export const resetStaffPassword = (objectUuid) =>
  apiFetch(`${BASE}/${objectUuid}/reset-password`, { method: 'PATCH' })
