// Trạng thái ca đọc (telerad-core: PENDING / ASSIGNED / COMPLETED).
export const READING_STATUS = {
  PENDING: { label: 'Chờ đọc', cls: 'bg-amber-100 text-amber-700' },
  ASSIGNED: { label: 'Đã phân công', cls: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: 'Đã đọc', cls: 'bg-emerald-100 text-emerald-700' },
}

export const statusMeta = (status) =>
  READING_STATUS[status] || { label: status || '—', cls: 'bg-gray-100 text-gray-500' }
