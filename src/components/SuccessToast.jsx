import React, { useState, useEffect, useRef } from 'react'
import { Icon } from '@/design-system/icons'

// Global listener cho event 'app:success' (notifySuccess). Hiển thị toast xanh tự
// tắt. Song song với ApiErrorToast (đỏ) cho lỗi API.
export default function SuccessToast() {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  useEffect(() => {
    const onSuccess = (e) => {
      const message = e.detail?.message || 'Thành công'
      const id = ++idRef.current
      setToasts((prev) => [...prev, { id, message }])
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
    }
    window.addEventListener('app:success', onSuccess)
    return () => window.removeEventListener('app:success', onSuccess)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-emerald-600 text-white text-sm px-4 py-3 rounded-lg shadow-lg flex items-start gap-2"
        >
          <span className="flex-shrink-0 mt-0.5"><Icon name="check" size={15} /></span>
          <span className="flex-1 break-words">{t.message}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="flex-shrink-0 text-white/80 hover:text-white"
            aria-label="Đóng"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
