import { apiFetch } from '../client'

// Cây bên trái màn "Ca đọc": đối tác nhóm theo loại chụp (đã lọc theo quyền user
// ở backend). Trả [{ modality, partners: [{ uuid, code, name }] }].
export const getReadingPartners = () =>
  apiFetch('/telerad-core/v1/staff/telerad-partner/actions/get-partners-for-reading')

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
  return apiFetch(`/telerad-core/v1/staff/reading-order?${qs.toString()}`)
}
