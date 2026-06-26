import React, { useState, useEffect, useRef } from 'react'
import { Icon } from '@/design-system/icons'

// Global listener for `api:error` events dispatched by apiFetch (client.js).
// Surfaces the backend message as a dismissible toast so every failing API call
// shows feedback without each caller wiring its own handler.
export default function ApiErrorToast() {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  useEffect(() => {
    const onError = (e) => {
      const message = e.detail?.message || 'Đã xảy ra lỗi'
      const id = ++idRef.current
      setToasts((prev) => [...prev, { id, message }])
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 6000)
    }
    window.addEventListener('api:error', onError)
    return () => window.removeEventListener('api:error', onError)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-red-600 text-white text-sm px-4 py-3 rounded-lg shadow-lg flex items-start gap-2"
        >
          <span className="flex-shrink-0 mt-0.5"><Icon name="alert-triangle" size={15} /></span>
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
