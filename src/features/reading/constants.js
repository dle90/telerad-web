// Trạng thái ca đọc (telerad-core: UNREAD / READING / PENDING_APPROVAL / APPROVED).
export const READING_STATUS = {
  UNREAD: { label: 'Chưa đọc', cls: 'bg-gray-100 text-gray-600' },
  READING: { label: 'Đang đọc', cls: 'bg-amber-100 text-amber-700' },
  PENDING_APPROVAL: { label: 'Đã đọc, chờ duyệt', cls: 'bg-blue-100 text-blue-700' },
  APPROVED: { label: 'Đã duyệt', cls: 'bg-emerald-100 text-emerald-700' },
}

// Tuỳ chọn cho filter "Tình trạng ca" (giữ đúng thứ tự luồng).
// READING_ONGOING_BY_ME là pseudo-status CHỈ DÙNG ĐỂ LỌC (không phải status thật của ca):
// backend dịch sang status=READING + assigned_to = user đăng nhập.
export const READING_STATUS_OPTIONS = [
  { value: 'UNREAD', label: 'Chưa đọc' },
  { value: 'READING', label: 'Đang đọc' },
  { value: 'PENDING_APPROVAL', label: 'Đã đọc, chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'READING_ONGOING_BY_ME', label: 'Đang nhận bởi tôi' },
]

// Tuỳ chọn cho filter "Trả kết quả".
export const RESULT_RETURNED_OPTIONS = [
  { value: 'true', label: 'Đã trả' },
  { value: 'false', label: 'Chưa trả' },
]

export const statusMeta = (status) =>
  READING_STATUS[status] || { label: status || '—', cls: 'bg-gray-100 text-gray-500' }
