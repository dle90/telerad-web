import React, { useEffect, useState } from 'react'
import { Icon } from '@/design-system/icons'

// Host cho confirmDialog() — mount 1 lần ở App. Lắng nghe 'app:confirm', hiện modal xác nhận.
// 3 kết quả:
//   true  -> bấm nút Đồng ý (confirmLabel) / Enter
//   false -> bấm nút Hủy (cancelLabel) — đây là 1 LỰA CHỌN, không phải đóng
//   null  -> ĐÓNG (nút ✕ / backdrop / Esc) = NGẮT, không làm gì phía sau
export default function ConfirmDialog() {
  const [req, setReq] = useState(null) // { options, resolve }

  useEffect(() => {
    const onConfirm = (e) => {
      // Đang mở 1 confirm khác -> coi như đóng cái cũ (resolve null) rồi thay bằng cái mới.
      setReq((prev) => {
        if (prev) prev.resolve(null)
        return e.detail || null
      })
    }
    window.addEventListener('app:confirm', onConfirm)
    return () => window.removeEventListener('app:confirm', onConfirm)
  }, [])

  useEffect(() => {
    if (!req) return
    const onKey = (e) => {
      if (e.key === 'Escape') { req.resolve(null); setReq(null) }
      else if (e.key === 'Enter') { req.resolve(true); setReq(null) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [req])

  if (!req) return null
  const { options, resolve } = req
  const {
    title = 'Xác nhận',
    message = '',
    confirmLabel = 'Đồng ý',
    cancelLabel = 'Hủy',
    tone = 'primary',
  } = options

  const done = (val) => {
    resolve(val)
    setReq(null)
  }

  const confirmCls = tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
      onClick={() => done(null)}
    >
      <div
        className="w-full max-w-sm bg-white rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-2">
          <div className="text-base font-semibold text-gray-800">{title}</div>
          <button
            onClick={() => done(null)}
            className="-mr-1 -mt-0.5 shrink-0 text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="Đóng"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="px-5 pb-4 text-sm text-gray-600 whitespace-pre-line">{message}</div>
        <div className="px-5 py-3 bg-gray-50 flex items-center justify-end gap-2">
          <button
            onClick={() => done(false)}
            className="px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => done(true)}
            className={`px-3 py-1.5 text-sm font-semibold text-white rounded-lg ${confirmCls}`}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
