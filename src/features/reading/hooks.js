import { useState, useEffect, useCallback } from 'react'
import { getReadingPartners, getReadingOrders, getReadingOrderDetail } from '@/api'

const todayISO = () => new Date().toISOString().slice(0, 10)

// Cây bên trái: đối tác nhóm theo loại chụp (đã scope theo quyền user ở backend).
export function useReadingPartners() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getReadingPartners()
      .then((r) => setGroups(Array.isArray(r) ? r : []))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false))
  }, [])

  return { groups, loading }
}

// Chi tiết 1 ca đọc cho tab chi tiết. Nạp 1 lần theo uuid; tự nạp lại nếu uuid đổi.
export function useReadingOrderDetail(uuid) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uuid) return
    let alive = true
    setLoading(true)
    getReadingOrderDetail(uuid)
      .then((d) => alive && setDetail(d || null))
      .catch(() => alive && setDetail(null))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [uuid])

  // setDetail để bind lại data sau khi nhận ca / hủy khóa (API trả chi tiết mới).
  return { detail, loading, setDetail }
}

// Danh sách ca đọc + bộ lọc. `filters` gom mọi tiêu chí (lựa chọn cây trái +
// ngày chụp + text); đổi filters reset về trang 1 và nạp lại.
export function useReadingOrders() {
  const [page, setPage] = useState(1)
  const [size] = useState(20)
  const [filters, setFiltersState] = useState({
    teleradPartnerUuid: '',
    modality: '',
    dateFrom: todayISO(),
    dateTo: todayISO(),
    patientName: '',
    patientCode: '',
    phone: '',
    status: '', // '' = tất cả; UNREAD/READING/PENDING_APPROVAL/APPROVED
    resultReturned: '', // '' = tất cả; 'true' = đã trả; 'false' = chưa trả
  })
  const [items, setItems] = useState([])
  const [recordCount, setRecordCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const setFilters = (partial) => {
    setPage(1)
    setFiltersState((f) => ({ ...f, ...partial }))
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getReadingOrders({
        page,
        size,
        teleradPartnerUuid: filters.teleradPartnerUuid,
        modality: filters.modality,
        // telerad chạy GMT+7; gửi mốc ngày kèm offset +07:00 để khớp "ngày chụp" VN.
        performEndedFrom: filters.dateFrom ? `${filters.dateFrom}T00:00:00+07:00` : '',
        performEndedTo: filters.dateTo ? `${filters.dateTo}T23:59:59+07:00` : '',
        patientName: filters.patientName,
        patientCode: filters.patientCode,
        phone: filters.phone,
        status: filters.status,
        resultReturned: filters.resultReturned,
      })
      setItems(res?.records || [])
      setRecordCount(Number(res?.recordCount || 0))
    } catch {
      setItems([])
      setRecordCount(0)
    } finally {
      setLoading(false)
    }
  }, [page, size, filters])
  useEffect(() => {
    load()
  }, [load])

  const pageCount = Math.max(1, Math.ceil(recordCount / size))

  return {
    items,
    recordCount,
    pageCount,
    loading,
    page,
    setPage,
    size,
    filters,
    setFilters,
    reload: load,
  }
}
