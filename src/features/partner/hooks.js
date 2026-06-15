import { useState, useEffect, useCallback } from 'react'
import { getPaginatedTeleradPartners } from '@/api'

// Paginated telerad-partner list + filters. Owns all list/query state so
// PartnerPage is purely presentational. `reload()` re-fetches the current view.
export function usePartnerList() {
  const [items, setItems] = useState([])
  const [recordCount, setRecordCount] = useState(0)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(20)
  const [search, setSearch] = useState('')
  // '' = tất cả, true = đang hoạt động, false = ngừng hoạt động.
  const [isActive, setIsActive] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getPaginatedTeleradPartners({ page, size, search, isActive })
      setItems(res?.records || [])
      setRecordCount(Number(res?.recordCount || 0))
    } catch {
      setItems([])
      setRecordCount(0)
    } finally {
      setLoading(false)
    }
  }, [page, size, search, isActive])
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
    setSize,
    search,
    setSearch,
    isActive,
    setIsActive,
    reload: load,
  }
}
