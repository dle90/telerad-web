import React, { useState, useRef, useEffect } from 'react'
import {
  generateReadingOrderViewerUrl,
  receiveReadingOrder,
  cancelReadingOrderLock,
  saveReadingOrderResult,
  approveReadingOrder,
  getImagingResultTemplate,
} from '@/api'
import { formatDateTime } from '@/lib/timezone'
import { notifySuccess, notifyError } from '@/lib/toast'
import { confirmDialog } from '@/lib/confirm'
import { statusMeta } from './constants'
import { useReadingOrderDetail } from './hooks'
import TemplatePickerModal from './TemplatePickerModal'
import PrintResultModal from './PrintResultModal'
import { Icon } from '@/design-system/icons'

// Thanh công cụ tĩnh (luôn hiện). "Xem ảnh" có logic; các nút còn lại gắn sau.
const TOOLBAR = [
  { key: 'viewImage', label: 'Xem ảnh', icon: 'eye' },
  { key: 'print', label: 'In kết quả', icon: 'print' },
  { key: 'video', label: 'Xem - Tải Video', icon: 'scan' },
  { key: 'attachment', label: 'Tải tệp đính kèm', icon: 'link' },
  { key: 'portal', label: 'In Tra cứu Portal', icon: 'print' },
]

const genderLabel = (g) => {
  if (!g) return '—'
  const k = String(g).trim().toUpperCase()
  if (['MALE', 'M', 'NAM'].includes(k)) return 'Nam'
  if (['FEMALE', 'F', 'NU', 'NỮ'].includes(k)) return 'Nữ'
  return g
}

// dob dạng "dd/mm/yyyy" -> năm sinh (yyyy). Trả null nếu không parse được.
const birthYear = (dob) => {
  if (!dob) return null
  const parts = String(dob).split('/')
  return parts.length === 3 ? parts[2] : dob
}

export default function CaseDetailTab({ uuid }) {
  const { detail, loading, setDetail } = useReadingOrderDetail(uuid)
  const [busy, setBusy] = useState(false)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [printOpen, setPrintOpen] = useState(false)
  const resultRef = useRef(null) // vùng "Nhập kết quả" (contentEditable)
  const initedRef = useRef(false) // đã khởi tạo editor cho ca này chưa (nạp 1 lần)

  // Khi mở ca (detail nạp xong lần đầu): nạp kết quả đã lưu vào editor; nếu ca đang
  // READING của mình mà result_in_html rỗng -> tự bật modal "Chọn mẫu phiếu".
  useEffect(() => {
    if (!detail || initedRef.current) return
    initedRef.current = true
    if (detail.resultInHtml && resultRef.current) {
      resultRef.current.innerHTML = detail.resultInHtml
    }
    if (detail.status === 'READING' && detail.assignedToMe && !detail.resultInHtml) {
      setTemplateModalOpen(true)
    }
  }, [detail])

  // Mở PACS viewer cho ca này ở tab trình duyệt mới. Mở tab trắng NGAY trong cử chỉ
  // click (tránh popup blocker), điều hướng sau khi có URL.
  const openViewer = async () => {
    const win = window.open('', '_blank')
    try {
      const url = await generateReadingOrderViewerUrl(uuid)
      if (win) {
        win.opener = null
        win.location = url
      } else {
        window.open(url, '_blank')
      }
    } catch {
      if (win) win.close()
    }
  }

  const onToolbar = (key) => {
    if (key === 'viewImage') openViewer()
    else if (key === 'print') setPrintOpen(true)
    // các nút khác: chưa gắn logic
  }

  // Nhận ca / Hủy khóa: gọi API, bind lại chi tiết ca trả về (nút hiển thị tự cập
  // nhật theo detail.status mới). Lỗi đã được apiFetch toast sẵn.
  const runAction = async (fn, successMsg) => {
    if (busy) return null
    setBusy(true)
    try {
      const updated = await fn(uuid)
      if (updated) {
        setDetail(updated)
        notifySuccess(successMsg)
      }
      return updated
    } catch {
      // toast lỗi đã hiển thị; giữ nguyên màn hình
      return null
    } finally {
      setBusy(false)
    }
  }

  // Nhận ca: sau khi nhận thành công, nếu chưa có kết quả -> bật ngay modal chọn mẫu.
  const doReceive = async () => {
    const updated = await runAction(receiveReadingOrder, 'Nhận ca thành công')
    if (updated && updated.status === 'READING' && updated.assignedToMe && !updated.resultInHtml) {
      setTemplateModalOpen(true)
    }
  }

  // Có nội dung thật trong editor chưa (bỏ qua thẻ rỗng) — dùng để chặn lưu rỗng.
  const editorHasContent = () => !!(resultRef.current && resultRef.current.textContent && resultRef.current.textContent.trim())

  // Lưu kết quả: ghi nội dung editor (html) vào result_in_html. BẮT BUỘC có nội dung.
  const doSaveResult = async () => {
    if (busy) return
    if (!editorHasContent()) {
      notifyError('Chưa có nội dung kết quả để lưu')
      return
    }
    setBusy(true)
    try {
      const html = resultRef.current ? resultRef.current.innerHTML : ''
      const updated = await saveReadingOrderResult(uuid, html)
      if (updated) {
        setDetail(updated)
        notifySuccess('Lưu kết quả thành công')
      }
    } catch {
      // toast lỗi đã hiển thị
    } finally {
      setBusy(false)
    }
  }

  // Kết thúc & Duyệt: hỏi có lưu nội dung đang soạn trước không. Có -> lưu (yêu cầu có nội
  // dung) rồi duyệt; Không -> duyệt thẳng (server kiểm tra result_in_html != rỗng).
  const doApprove = async () => {
    if (busy) return
    // true = lưu rồi duyệt; false = duyệt không lưu; null = đóng (X/Esc/backdrop) -> ngắt hẳn.
    const choice = await confirmDialog({
      title: 'Kết thúc & Duyệt',
      message: 'Bạn có cần lưu nội dung đang soạn thảo trước khi duyệt?',
      confirmLabel: 'Lưu rồi duyệt',
      cancelLabel: 'Duyệt, không lưu',
    })
    if (choice === null) return
    setBusy(true)
    try {
      if (choice === true) {
        if (!editorHasContent()) {
          notifyError('Chưa có nội dung kết quả để lưu')
          return
        }
        const html = resultRef.current ? resultRef.current.innerHTML : ''
        const saved = await saveReadingOrderResult(uuid, html)
        if (!saved) return // lưu lỗi -> dừng, không duyệt
        setDetail(saved)
      }
      const updated = await approveReadingOrder(uuid)
      if (updated) {
        setDetail(updated)
        notifySuccess('Duyệt ca thành công')
      }
    } catch {
      // toast lỗi đã hiển thị
    } finally {
      setBusy(false)
    }
  }

  // Tải mẫu phiếu đã chọn: lấy html_content rồi đổ xuống form "Nhập kết quả".
  const pickTemplate = async (templateUuid) => {
    try {
      const tpl = await getImagingResultTemplate(templateUuid)
      if (tpl && resultRef.current) {
        // Chỉ đổ nội dung. font_size/line_spacing trong danh mục dành cho IN phiếu,
        // không áp vào khung nhập (khung nhập dùng cỡ chữ cố định dễ đọc/soạn).
        resultRef.current.innerHTML = tpl.htmlContent || ''
      }
      setTemplateModalOpen(false)
      notifySuccess('Đã tải mẫu phiếu')
    } catch {
      // toast lỗi đã hiển thị
    }
  }

  // Hàm chung quyết định CÁC nút hành động theo trạng thái ca:
  //  - UNREAD            -> Nhận ca
  //  - READING & của mình -> Hủy khóa + Chọn mẫu phiếu
  const actionButtonsFor = (d) => {
    if (!d) return []
    if (d.status === 'UNREAD') {
      return [{ key: 'receive', label: 'Nhận ca', icon: 'lock', run: doReceive }]
    }
    if (d.status === 'READING' && d.assignedToMe) {
      return [
        { key: 'cancelLock', label: 'Hủy khóa', icon: 'unlock', run: () => runAction(cancelReadingOrderLock, 'Hủy ca thành công') },
        { key: 'pickTemplate', label: 'Chọn mẫu phiếu', icon: 'clipboard', run: () => setTemplateModalOpen(true) },
        { key: 'saveResult', label: 'Lưu kết quả', icon: 'save', run: doSaveResult },
        { key: 'approve', label: 'Kết thúc & Duyệt', icon: 'check-circle', run: doApprove },
      ]
    }
    return []
  }

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">Đang tải chi tiết ca…</div>
  }
  if (!detail) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">Không tải được chi tiết ca.</div>
  }

  const s = statusMeta(detail.status)
  const year = birthYear(detail.dateOfBirth)
  const actionBtns = actionButtonsFor(detail)

  return (
    <div className="flex gap-4 h-full">
      {/* Cột trái: thông tin ca */}
      <aside className="w-72 shrink-0 bg-white border border-gray-200 rounded-lg overflow-y-auto p-4 space-y-5">
        <Section title="Thông tin bệnh nhân">
          <Row label="PID">{detail.patientCode || '—'}</Row>
          <Row label="Họ và tên">{detail.fullName}</Row>
          <Row label="Năm sinh">
            {year || '—'}
            <span className="text-gray-400"> · </span>
            {genderLabel(detail.gender)}
            {detail.yearsOld != null && <span className="text-gray-400"> · {detail.yearsOld}t</span>}
          </Row>
          <Row label="CĐ lâm sàng">{detail.clinicalDiagnosis || '—'}</Row>
        </Section>

        <Section title="Yêu cầu chẩn đoán">
          <Row label="Chỉ định">{detail.serviceName || '—'}</Row>
          <Row label="Mã ICD">{detail.icd?.length ? detail.icd.join(', ') : '—'}</Row>
        </Section>

        <Section title="Thông tin ca">
          <Row label="Đối tác">{detail.partnerName || '—'}</Row>
          <Row label="Ngày chụp">{formatDateTime(detail.performEndedAt, { withSeconds: false }) || '—'}</Row>
          <Row label="Loại chụp">{detail.modality || '—'}</Row>
          <Row label="Bộ phận">{detail.bodyParts?.length ? detail.bodyParts.join(', ') : '—'}</Row>
          <Row label="Máy chụp">{detail.modalityName || '—'}</Row>
          <Row label="Ghi chú">{detail.note || '—'}</Row>
          <Row label="Điện thoại">{detail.phone || '—'}</Row>
          <Row label="Địa chỉ">{detail.fullAddress || '—'}</Row>
          <Row label="Trạng thái">
            <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
          </Row>
          <Row label="Trả KQ">
            <span
              className={`inline-flex text-[10px] px-2 py-0.5 rounded-full font-medium ${
                detail.resultReturned ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {detail.resultReturned ? 'Đã trả' : 'Chưa trả'}
            </span>
          </Row>
        </Section>
      </aside>

      {/* Cột phải: thanh công cụ + vùng nội dung (để trống, gắn sau) */}
      <div className="flex-1 min-w-0 flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50">
          {/* Nút động theo trạng thái: Nhận ca / Hủy khóa / Chọn mẫu phiếu */}
          {actionBtns.map((b) => (
            <button
              key={b.key}
              onClick={b.run}
              disabled={busy}
              className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-blue-700 hover:bg-white hover:shadow-sm transition-colors disabled:opacity-50"
              title={b.label}
            >
              <span className="leading-none"><Icon name={b.icon} size={16} /></span>
              <span className="whitespace-nowrap">{b.label}</span>
            </button>
          ))}
          {TOOLBAR.map((b) => (
            <button
              key={b.key}
              onClick={() => onToolbar(b.key)}
              className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-[11px] text-gray-600 hover:bg-white hover:text-blue-700 hover:shadow-sm transition-colors"
              title={b.label}
            >
              <span className="leading-none"><Icon name={b.icon} size={16} /></span>
              <span className="whitespace-nowrap">{b.label}</span>
            </button>
          ))}
        </div>

        {/* Form "Nhập kết quả": chọn mẫu phiếu -> đổ html_content vào đây.
            white-space:pre-wrap giữ xuống dòng "\n"; giữ inline style (căn giữa...).
            Cỡ chữ/giãn dòng CỐ ĐỊNH cho dễ nhập — KHÔNG dùng font_size/line_spacing
            của danh mục (cái đó chỉ dùng khi IN phiếu). */}
        <div className="px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-blue-800">Nhập kết quả</div>
        <div
          ref={resultRef}
          contentEditable
          suppressContentEditableWarning
          className="result-editor flex-1 m-3 mt-2 overflow-y-auto border border-gray-200 rounded-lg p-4 text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
          style={{ whiteSpace: 'pre-wrap', fontSize: '16px', lineHeight: 1.6 }}
        />
      </div>

      {templateModalOpen && (
        <TemplatePickerModal
          caModality={detail.modality || ''}
          caBodyParts={detail.bodyParts || []}
          onPick={pickTemplate}
          onClose={() => setTemplateModalOpen(false)}
        />
      )}

      {printOpen && (
        <PrintResultModal
          uuid={uuid}
          detail={detail}
          /* READING: lấy nội dung đang soạn; trạng thái khác: dùng result_in_html đã lưu */
          resultContent={
            detail.status === 'READING'
              ? (resultRef.current ? resultRef.current.innerHTML : '')
              : (detail.resultInHtml || '')
          }
          onClose={() => setPrintOpen(false)}
        />
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-blue-800 mb-2">{title}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-24 shrink-0 text-gray-500">{label}</span>
      <span className="flex-1 min-w-0 text-gray-800 break-words">{children}</span>
    </div>
  )
}
