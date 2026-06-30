import React, { useEffect, useMemo, useState } from 'react'
import { getPaginatedImagingResultTemplates } from '@/api'
import { Icon } from '@/design-system/icons'

// 5 loại chụp hệ thống (khi ca đọc không có modality).
const ALL_MODALITIES = ['CT', 'MR', 'US', 'CR', 'MG']

// Modal "Chọn mẫu phiếu": lọc mẫu kết quả theo Nhóm máy (modality) + bộ phận (overlap
// với body_parts của ca khi KHÔNG "hiện tất cả"). Double-click 1 mẫu -> onPick(uuid).
export default function TemplatePickerModal({ caModality, caBodyParts, onPick, onClose }) {
  // Nhóm máy: nếu ca có modality -> chỉ 1 lựa chọn; nếu không -> cả 5.
  const modalities = useMemo(
    () => (caModality ? [caModality] : ALL_MODALITIES),
    [caModality],
  )
  const hasBodyParts = Array.isArray(caBodyParts) && caBodyParts.length > 0

  const [modality, setModality] = useState(modalities[0])
  // Có body_parts -> mặc định uncheck (lọc theo overlap); không có -> check (tất cả).
  const [showAll, setShowAll] = useState(!hasBodyParts)
  const [search, setSearch] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    getPaginatedImagingResultTemplates({
      page: 1,
      size: 500,
      modality,
      isActive: true,
      search: search.trim(),
      bodyParts: showAll ? [] : caBodyParts || [],
    })
      .then((res) => alive && setItems(res?.records || []))
      .catch(() => alive && setItems([]))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [modality, showAll, search, caBodyParts])

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
      {/* Không đóng khi click nền (tránh mất thao tác); chỉ đóng bằng nút ✕. */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">Chọn mẫu phiếu</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 px-1" aria-label="Đóng">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="px-4 py-3 space-y-3 border-b border-gray-100">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm.."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              Nhóm máy
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                disabled={modalities.length <= 1}
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-500"
              >
                {modalities.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 select-none">
              <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
              Hiện tất cả mẫu KQ
            </label>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="py-10 text-center text-gray-400 text-sm">Đang tải…</div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">Không có mẫu phù hợp</div>
          ) : (
            <div className="grid grid-cols-2 gap-px bg-gray-100 border border-gray-100 rounded-lg overflow-hidden">
              {items.map((t) => {
                const fullName = `${t.displayOrder != null ? `${t.displayOrder}. ` : ''}${t.name}`
                return (
                  <button
                    key={t.uuid}
                    onDoubleClick={() => onPick(t.uuid)}
                    title={`${fullName}\n(Nhấp đúp để tải mẫu vào form kết quả)`}
                    className="text-left bg-white hover:bg-blue-50 px-3 py-2.5 text-sm text-gray-700 truncate"
                  >
                    {t.displayOrder != null && <span className="text-gray-400">{t.displayOrder}. </span>}
                    {t.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
