import { apiFetch } from '../client'

// Cây bên trái màn "Ca đọc": đối tác nhóm theo loại chụp (đã lọc theo quyền user
// ở backend). Trả [{ modality, partners: [{ uuid, code, name }] }].
export const getReadingPartners = () =>
  apiFetch('/telerad-core/v1/staff/telerad-partner/actions/get-partners-for-reading')

// Chi tiết 1 ca đọc (tab chi tiết màn "Ca đọc").
export const getReadingOrderDetail = (readingOrderUuid) =>
  apiFetch(`/telerad-core/v1/staff/reading-order/${readingOrderUuid}`)

// Nhận ca (UNREAD -> READING). Trả về chi tiết ca sau khi nhận.
export const receiveReadingOrder = (readingOrderUuid) =>
  apiFetch(`/telerad-core/v1/staff/reading-order/${readingOrderUuid}/actions/receive`, { method: 'POST' })

// Hủy khóa (READING của mình -> UNREAD). Trả về chi tiết ca sau khi hủy.
export const cancelReadingOrderLock = (readingOrderUuid) =>
  apiFetch(`/telerad-core/v1/staff/reading-order/${readingOrderUuid}/actions/cancel-lock`, { method: 'POST' })

// Lưu kết quả đọc (result_in_html). Trả về chi tiết ca sau khi lưu.
export const saveReadingOrderResult = (readingOrderUuid, resultInHtml) =>
  apiFetch(`/telerad-core/v1/staff/reading-order/${readingOrderUuid}/actions/save-result`, {
    method: 'POST',
    body: { resultInHtml },
  })

// Sinh URL mở PACS viewer cho 1 ca đọc (kèm view-token trong URL hash). Trả về
// chuỗi URL để mở tab mới đọc ảnh DICOM.
export const generateReadingOrderViewerUrl = (readingOrderUuid) =>
  apiFetch(`/telerad-core/v1/staff/reading-order/${readingOrderUuid}/generate-pacs-viewer-url`)

// Danh sách ca đọc (màn chính). Thời gian (performEndedFrom/To) phải là RFC3339.
export const getReadingOrders = ({
  page = 1,
  size = 20,
  teleradPartnerUuid = '',
  modality = '',
  performEndedFrom = '',
  performEndedTo = '',
  patientName = '',
  patientCode = '',
  phone = '',
  status = '',
  resultReturned = '',
} = {}) => {
  const qs = new URLSearchParams()
  qs.set('page', String(page))
  qs.set('size', String(size))
  if (teleradPartnerUuid) qs.set('teleradPartnerUuid', teleradPartnerUuid)
  if (modality) qs.set('modality', modality)
  if (performEndedFrom) qs.set('performEndedFrom', performEndedFrom)
  if (performEndedTo) qs.set('performEndedTo', performEndedTo)
  if (patientName) qs.set('patientName', patientName)
  if (patientCode) qs.set('patientCode', patientCode)
  if (phone) qs.set('phone', phone)
  if (status) qs.set('status', status)
  if (resultReturned === 'true' || resultReturned === 'false') qs.set('resultReturned', resultReturned)
  return apiFetch(`/telerad-core/v1/staff/reading-order?${qs.toString()}`)
}
