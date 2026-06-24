import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getPublicResultSheet } from '@/api'
import PrintModal from '@/components/PrintModal'

// Trang CÔNG KHAI xem + in phiếu kết quả (cho HIS / bệnh nhân). KHÔNG cần đăng nhập, KHÔNG Layout.
// URL: /reading/public-result-sheet?uuid=<reading order uuid>
// Giao diện giống tính năng "In kết quả" (PrintModal), nhưng panel chỉ có Cỡ chữ + Độ cao dòng,
// và KHÔNG có nút Đóng/✕ (không truyền onClose).
const FIELDS = [
  { key: 'resultFontSize', label: 'Cỡ chữ', type: 'number', step: 1 },
  { key: 'resultLineSpacing', label: 'Độ cao dòng chữ', type: 'number', step: 0.1 },
]

export default function PublicResultSheetPage() {
  const [sp] = useSearchParams()
  const uuid = sp.get('uuid') || ''
  const [resp, setResp] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uuid) {
      setLoading(false)
      return
    }
    let alive = true
    setLoading(true)
    getPublicResultSheet(uuid)
      .then((r) => alive && setResp(r || null))
      .catch(() => alive && setResp(null))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [uuid])

  const data = useMemo(
    () => ({
      ...(resp?.data || {}),
      resultFontSize: resp?.resultFontSize ?? 13,
      resultLineSpacing: resp?.resultLineSpacing ?? 1.5,
      resultContent: resp?.data?.resultContent ?? '',
    }),
    [resp],
  )

  return (
    <PrintModal
      title="Phiếu kết quả"
      templateHtml={resp?.htmlContent || ''}
      data={data}
      fields={resp ? FIELDS : null}
      placeholder={
        loading
          ? 'Đang tải phiếu…'
          : !uuid
            ? 'Thiếu mã phiếu (uuid).'
            : !resp
              ? 'Không tìm thấy phiếu kết quả.'
              : 'Đang dựng bản in…'
      }
    />
  )
}
