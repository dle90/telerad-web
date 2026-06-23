import React, { useCallback, useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import FieldRow from '@/components/FieldRow'
import { inputCls, inputClsTextarea } from '@/lib/ui'
import {
  getPaginatedImagingResultSheetTemplates,
  getImagingResultSheetTemplate,
  createImagingResultSheetTemplate,
  updateImagingResultSheetTemplate,
  activateImagingResultSheetTemplate,
  deactivateImagingResultSheetTemplate,
  getAllTeleradPartners,
} from '@/api'

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'true', label: 'Đang hoạt động' },
  { value: 'false', label: 'Ngừng hoạt động' },
]

export default function ResultSheetTemplatePage() {
  const [items, setItems] = useState([])
  const [recordCount, setRecordCount] = useState(0)
  const [page, setPage] = useState(1)
  const [size] = useState(20)
  const [partnerUuid, setPartnerUuid] = useState('')
  const [isActive, setIsActive] = useState('')
  const [loading, setLoading] = useState(true)

  const [partners, setPartners] = useState([])
  const [viewing, setViewing] = useState(null)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    getAllTeleradPartners()
      .then((list) => setPartners(Array.isArray(list) ? list : []))
      .catch(() => setPartners([]))
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getPaginatedImagingResultSheetTemplates({ page, size, teleradPartnerUuid: partnerUuid, isActive })
      setItems(res?.records || [])
      setRecordCount(Number(res?.recordCount || 0))
    } catch {
      setItems([])
      setRecordCount(0)
    } finally {
      setLoading(false)
    }
  }, [page, size, partnerUuid, isActive])
  useEffect(() => {
    load()
  }, [load])

  const pageCount = Math.max(1, Math.ceil(recordCount / size))

  const openDetail = async (row) => {
    try {
      const detail = await getImagingResultSheetTemplate(row.uuid)
      setViewing(detail || row)
    } catch {
      setViewing(row)
    }
  }

  const handleToggleActive = async (row) => {
    try {
      if (row.isActive) await deactivateImagingResultSheetTemplate(row.uuid)
      else await activateImagingResultSheetTemplate(row.uuid)
      load()
    } catch {
      // apiFetch toasts the error
    }
  }

  const afterSave = () => {
    setEditing(null)
    setViewing(null)
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Cấu hình phiếu kết quả</h1>
        <button
          onClick={() => setEditing({})}
          className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Thêm phiếu
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={partnerUuid}
          onChange={(e) => {
            setPage(1)
            setPartnerUuid(e.target.value)
          }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
        >
          <option value="">Tất cả CSYT</option>
          {partners.map((p) => (
            <option key={p.uuid} value={p.uuid}>
              {p.code} — {p.name}
            </option>
          ))}
        </select>
        <select
          value={String(isActive)}
          onChange={(e) => {
            setPage(1)
            setIsActive(e.target.value === '' ? '' : e.target.value === 'true')
          }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Mã CSYT', 'Cơ sở y tế', 'Trạng thái', 'Thao tác'].map((h, i) => (
                  <th
                    key={i}
                    className={`px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap ${
                      h === 'Thao tác' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                    Đang tải…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                items.map((t) => (
                  <tr key={t.uuid} className="hover:bg-blue-50/40">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{t.teleradPartnerCode || '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{t.teleradPartnerName || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {t.isActive ? (
                        <span className="inline-flex text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700">
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
                          Ngừng
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-3 text-sm">
                        <button onClick={() => openDetail(t)} title="Xem chi tiết" aria-label="Xem chi tiết" className="text-gray-500 hover:text-blue-600">
                          👁️
                        </button>
                        <button
                          onClick={() => handleToggleActive(t)}
                          title={t.isActive ? 'Ngừng hoạt động' : 'Kích hoạt'}
                          aria-label={t.isActive ? 'Ngừng hoạt động' : 'Kích hoạt'}
                          className={t.isActive ? 'text-gray-500 hover:text-red-600' : 'text-gray-500 hover:text-emerald-600'}
                        >
                          {t.isActive ? '🚫' : '✅'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {recordCount > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>Tổng {recordCount} phiếu</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                Trước
              </button>
              <span>
                Trang {page}/{pageCount}
              </span>
              <button onClick={() => setPage(Math.min(pageCount, page + 1))} disabled={page >= pageCount} className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {viewing && (
        <ResultSheetDetailPanel
          sheet={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setEditing(viewing)
            setViewing(null)
          }}
        />
      )}

      {editing && (
        <ResultSheetFormPanel
          sheet={editing}
          partners={partners}
          onClose={() => {
            if (editing.uuid) setViewing(editing)
            setEditing(null)
          }}
          onSaved={afterSave}
        />
      )}
    </div>
  )
}

function ResultSheetDetailPanel({ sheet, onClose, onEdit }) {
  return (
    <Modal
      title={sheet.teleradPartnerName || 'Phiếu kết quả'}
      subtitle={sheet.teleradPartnerCode}
      onClose={onClose}
      size="xl"
      dismissible={false}
      footer={
        <>
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">
            Đóng
          </button>
          <button onClick={onEdit} className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Sửa
          </button>
        </>
      }
    >
      <FieldRow label="Cơ sở y tế">{sheet.teleradPartnerName || '—'}</FieldRow>
      <FieldRow label="Mã CSYT">{sheet.teleradPartnerCode || '—'}</FieldRow>
      <FieldRow label="Trạng thái">{sheet.isActive ? 'Đang hoạt động' : 'Ngừng'}</FieldRow>
      <div className="pt-3">
        <div className="text-xs font-medium text-gray-500 pb-1">Mẫu phiếu</div>
        <div
          className="border border-gray-200 rounded-lg p-3 text-sm overflow-auto max-h-[45vh] bg-gray-50"
          dangerouslySetInnerHTML={{ __html: sheet.htmlContent || '' }}
        />
      </div>
    </Modal>
  )
}

function ResultSheetFormPanel({ sheet, partners, onClose, onSaved }) {
  const isEdit = !!sheet?.uuid
  const [form, setForm] = useState(() => ({
    teleradPartnerUuid: sheet?.teleradPartnerUuid || '',
    htmlContent: sheet?.htmlContent || '',
  }))
  const [saving, setSaving] = useState(false)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) {
        await updateImagingResultSheetTemplate(sheet.uuid, { htmlContent: form.htmlContent })
      } else {
        await createImagingResultSheetTemplate({
          teleradPartnerUuid: form.teleradPartnerUuid,
          htmlContent: form.htmlContent,
        })
      }
      onSaved()
    } catch {
      // apiFetch toasts the backend message
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={isEdit ? sheet.teleradPartnerName || 'Sửa phiếu kết quả' : 'Thêm phiếu kết quả'}
      subtitle={isEdit ? sheet.teleradPartnerCode : 'Phiếu mới'}
      onClose={onClose}
      busy={saving}
      size="xl"
      dismissible={false}
      heightFull
      footer={
        <>
          <button onClick={onClose} disabled={saving} className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50">
            Hủy bỏ
          </button>
          <button type="submit" form="result-sheet-form" disabled={saving} className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Đang lưu…' : 'Ghi lại'}
          </button>
        </>
      }
    >
      <form id="result-sheet-form" onSubmit={handleSubmit} className="flex flex-col h-full min-h-0 space-y-4">
        <div className="max-w-md">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Cơ sở y tế <span className="text-rose-500">*</span>
          </label>
          {isEdit ? (
            <input value={`${sheet.teleradPartnerCode || ''} — ${sheet.teleradPartnerName || ''}`} className={inputCls} disabled readOnly />
          ) : (
            <select value={form.teleradPartnerUuid} onChange={(e) => set('teleradPartnerUuid', e.target.value)} className={inputCls} disabled={saving} required>
              <option value="">-- Chọn CSYT --</option>
              {partners.map((p) => (
                <option key={p.uuid} value={p.uuid}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex-1 min-h-0 flex flex-col">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Mẫu phiếu (HTML) <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={form.htmlContent}
            onChange={(e) => set('htmlContent', e.target.value)}
            className={`${inputClsTextarea} font-mono text-xs flex-1 min-h-[160px] resize-none`}
            disabled={saving}
            required
          />
        </div>
      </form>
    </Modal>
  )
}
