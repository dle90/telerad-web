import React, { useCallback, useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import FieldRow from '@/components/FieldRow'
import { Icon } from '@/design-system/icons'
import { inputCls, inputClsTextarea } from '@/lib/ui'
import { MODALITY_OPTIONS, labelOf } from '@/lib/enums'
import {
  getPaginatedImagingResultTemplates,
  getImagingResultTemplate,
  getImagingResultTemplateFormOptions,
  createImagingResultTemplate,
  updateImagingResultTemplate,
  activateImagingResultTemplate,
  deactivateImagingResultTemplate,
} from '@/api'

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'true', label: 'Đang hoạt động' },
  { value: 'false', label: 'Ngừng hoạt động' },
]

export default function ResultTemplatePage() {
  const [items, setItems] = useState([])
  const [recordCount, setRecordCount] = useState(0)
  const [page, setPage] = useState(1)
  const [size] = useState(20)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [modality, setModality] = useState('')
  const [isActive, setIsActive] = useState('')
  const [loading, setLoading] = useState(true)

  const [viewing, setViewing] = useState(null)
  const [editing, setEditing] = useState(null) // null=closed, {}=new, record=edit

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getPaginatedImagingResultTemplates({ page, size, search, modality, isActive })
      setItems(res?.records || [])
      setRecordCount(Number(res?.recordCount || 0))
    } catch {
      setItems([])
      setRecordCount(0)
    } finally {
      setLoading(false)
    }
  }, [page, size, search, modality, isActive])
  useEffect(() => {
    load()
  }, [load])

  const pageCount = Math.max(1, Math.ceil(recordCount / size))

  const submitSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  const openDetail = async (row) => {
    try {
      const detail = await getImagingResultTemplate(row.uuid)
      setViewing(detail || row)
    } catch {
      setViewing(row)
    }
  }

  const handleToggleActive = async (row) => {
    try {
      if (row.isActive) await deactivateImagingResultTemplate(row.uuid)
      else await activateImagingResultTemplate(row.uuid)
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
        <h1 className="text-xl font-semibold text-gray-900">Cấu hình mẫu kết quả</h1>
        <button
          onClick={() => setEditing({})}
          className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Thêm mẫu
        </button>
      </div>

      {/* Modality tabs (hệ thống hỗ trợ CT MR US CR MG) */}
      <div className="flex flex-wrap gap-1.5">
        {[{ value: '', label: 'Tất cả' }, ...MODALITY_OPTIONS].map((m) => (
          <button
            key={m.value}
            onClick={() => {
              setPage(1)
              setModality(m.value)
            }}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${
              modality === m.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={submitSearch} className="flex items-center gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên mẫu…"
            className="w-72 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
          />
          <button type="submit" className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            Tìm
          </button>
        </form>
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
                {['Tên mẫu biểu', 'Loại chụp', 'Bộ phận', 'Trạng thái', 'Thao tác'].map((h, i) => (
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
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    Đang tải…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                items.map((t) => (
                  <tr key={t.uuid} className="hover:bg-blue-50/40">
                    <td className="px-4 py-3 font-medium text-gray-800">{t.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{labelOf(MODALITY_OPTIONS, t.modality)}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">
                      {(t.bodyParts || []).length ? t.bodyParts.join(', ') : '—'}
                    </td>
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
                          <Icon name="eye" size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(t)}
                          title={t.isActive ? 'Ngừng hoạt động' : 'Kích hoạt'}
                          aria-label={t.isActive ? 'Ngừng hoạt động' : 'Kích hoạt'}
                          className={t.isActive ? 'text-gray-500 hover:text-red-600' : 'text-gray-500 hover:text-emerald-600'}
                        >
                          {t.isActive ? <Icon name="x-circle" size={14} /> : <Icon name="check-circle" size={14} />}
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
            <span>Tổng {recordCount} mẫu</span>
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
        <ResultTemplateDetailPanel
          template={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setEditing(viewing)
            setViewing(null)
          }}
        />
      )}

      {editing && (
        <ResultTemplateFormPanel
          template={editing}
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

function ResultTemplateDetailPanel({ template, onClose, onEdit }) {
  return (
    <Modal
      title={template.name || 'Mẫu kết quả'}
      subtitle={labelOf(MODALITY_OPTIONS, template.modality)}
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
      <FieldRow label="Tên mẫu biểu">{template.name}</FieldRow>
      <FieldRow label="Loại chụp">{labelOf(MODALITY_OPTIONS, template.modality)}</FieldRow>
      <FieldRow label="Bộ phận chụp">{(template.bodyParts || []).join(', ') || '—'}</FieldRow>
      <FieldRow label="Thứ tự">{template.displayOrder ?? '—'}</FieldRow>
      <FieldRow label="Trạng thái">{template.isActive ? 'Đang hoạt động' : 'Ngừng'}</FieldRow>
      <div className="pt-3">
        <div className="text-xs font-medium text-gray-500 pb-1">Nội dung mẫu</div>
        {/* transform → containing-block giữ position:fixed của HTML mẫu trong khung */}
        <div
          className="relative border border-gray-200 rounded-lg p-3 text-sm overflow-auto max-h-[45vh] bg-gray-50"
          style={{ transform: 'translateZ(0)' }}
          dangerouslySetInnerHTML={{ __html: template.htmlContent || '' }}
        />
      </div>
    </Modal>
  )
}

function ResultTemplateFormPanel({ template, onClose, onSaved }) {
  const isEdit = !!template?.uuid
  const [options, setOptions] = useState({ modalities: [], bodyParts: [] })
  const [form, setForm] = useState(() => ({
    modality: template?.modality || 'CT',
    name: template?.name || '',
    bodyParts: template?.bodyParts || [],
    displayOrder: template?.displayOrder ?? '',
    htmlContent: template?.htmlContent || '',
  }))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getImagingResultTemplateFormOptions()
      .then((res) => res && setOptions({ modalities: res.modalities || [], bodyParts: res.bodyParts || [] }))
      .catch(() => {})
  }, [])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const toggleBodyPart = (value) =>
    setForm((f) => ({
      ...f,
      bodyParts: f.bodyParts.includes(value) ? f.bodyParts.filter((b) => b !== value) : [...f.bodyParts, value],
    }))
  const selectAllBodyParts = () => setForm((f) => ({ ...f, bodyParts: options.bodyParts.map((b) => b.value) }))
  const clearBodyParts = () => setForm((f) => ({ ...f, bodyParts: [] }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const body = {
        modality: form.modality,
        name: form.name,
        bodyParts: form.bodyParts,
        htmlContent: form.htmlContent,
        displayOrder: form.displayOrder === '' ? null : Number(form.displayOrder),
      }
      if (isEdit) await updateImagingResultTemplate(template.uuid, body)
      else await createImagingResultTemplate(body)
      onSaved()
    } catch {
      // apiFetch toasts the backend message
    } finally {
      setSaving(false)
    }
  }

  const labelCls = 'block text-xs font-medium text-gray-500 mb-1'

  return (
    <Modal
      title={isEdit ? template.name || 'Sửa mẫu kết quả' : 'Thêm mẫu kết quả'}
      subtitle={isEdit ? labelOf(MODALITY_OPTIONS, template.modality) : 'Mẫu mới'}
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
          <button type="submit" form="result-template-form" disabled={saving} className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Đang lưu…' : 'Ghi lại'}
          </button>
        </>
      }
    >
      <form id="result-template-form" onSubmit={handleSubmit} className="flex flex-col h-full min-h-0 space-y-4">
        {/* Hàng tham số: loại chụp + thứ tự hiển thị */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>
              Loại chụp <span className="text-rose-500">*</span>
            </label>
            <select value={form.modality} onChange={(e) => set('modality', e.target.value)} className={inputCls} disabled={saving} required>
              {MODALITY_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Thứ tự hiển thị</label>
            <input type="number" value={form.displayOrder} onChange={(e) => set('displayOrder', e.target.value)} className={inputCls} disabled={saving} />
          </div>
        </div>

        <div>
          <label className={labelCls}>
            Tên mẫu biểu <span className="text-rose-500">*</span>
          </label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} disabled={saving} required />
        </div>

        {/* Bộ phận chụp — lưới 4 cột + Tất cả / Bỏ chọn */}
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <label className={`${labelCls} mb-0`}>Bộ phận chụp</label>
            <button type="button" onClick={selectAllBodyParts} disabled={saving} className="text-xs text-blue-600 hover:text-blue-800">
              Tất cả
            </button>
            <button type="button" onClick={clearBodyParts} disabled={saving} className="text-xs text-gray-500 hover:text-gray-700">
              Bỏ chọn
            </button>
          </div>
          <div className="grid grid-cols-4 gap-x-4 gap-y-1.5 border border-gray-200 rounded-lg p-3">
            {options.bodyParts.map((bp) => (
              <label key={bp.value} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.bodyParts.includes(bp.value)}
                  onChange={() => toggleBodyPart(bp.value)}
                  className="accent-blue-600"
                  disabled={saving}
                />
                {bp.name}
              </label>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <label className={labelCls}>
            Nội dung mẫu (HTML) <span className="text-rose-500">*</span>
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
