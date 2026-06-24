import React, { useEffect, useMemo, useState } from 'react'
import { getReadingOrderResultSheet } from '@/api'
import PrintModal from '@/components/PrintModal'

// Modal "In kết quả" = PrintModal chung. Dữ liệu in do BACKEND trả (key = tên token) -> không map.
// Vùng "Thông tin" (sửa nhanh trước khi in) khai báo bằng FIELDS — RIÊNG cho phiếu CĐHA; phiếu in
// khác khai field khác (hoặc không có). resultContent lấy nội dung đang soạn (CaseDetailTab quyết).
// Quy ước mẫu phiếu + token + cơ chế fields: telerad-web/docs/mau-phieu-ket-qua.md

// Field editable của phiếu CĐHA (key = tên token tương ứng). resultFontSize/resultLineSpacing là
// config phiếu (top-level response) nhưng vẫn cho sửa nhanh ở đây.
const FIELDS = [
  { key: 'patientName', label: 'Tên bệnh nhân', type: 'text' },
  {
    type: 'group',
    fields: [
      { key: 'patientGender', label: 'Giới tính', type: 'radio', options: ['Nam', 'Nữ'] },
      { key: 'patientBirthYear', label: 'Năm sinh', type: 'text' },
    ],
  },
  { key: 'clinicalDiagnosis', label: 'Chẩn đoán lâm sàng', type: 'text' },
  { key: 'resultFontSize', label: 'Cỡ chữ', type: 'number', step: 1 },
  { key: 'resultLineSpacing', label: 'Độ cao dòng chữ', type: 'number', step: 0.1 },
]

export default function PrintResultModal({ uuid, resultContent, onClose }) {
  const [resp, setResp] = useState(null) // { htmlContent, resultFontSize, resultLineSpacing, data }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    getReadingOrderResultSheet(uuid)
      .then((r) => alive && setResp(r || null))
      .catch(() => alive && setResp(null))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [uuid])

  // data = token nội dung (backend) + config (top-level) + resultContent đang soạn.
  const data = useMemo(() => ({
    ...(resp?.data || {}),
    resultFontSize: resp?.resultFontSize ?? 13,
    resultLineSpacing: resp?.resultLineSpacing ?? 1.5,
    resultContent: resultContent ?? resp?.data?.resultContent ?? '',
  }), [resp, resultContent])

  return (
    <PrintModal
      title="In kết quả"
      templateHtml={resp?.htmlContent || ''}
      data={data}
      fields={resp ? FIELDS : null}
      placeholder={loading ? 'Đang tải phiếu…' : !resp ? 'CSYT chưa cấu hình mẫu phiếu kết quả.' : 'Đang dựng bản in…'}
      onClose={onClose}
    />
  )
}
