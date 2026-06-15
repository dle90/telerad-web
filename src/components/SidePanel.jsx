import React from 'react'

// Right-side slide-over drawer used for create/edit forms (mirrors his-web's
// Equipment form drawer). Clicking the backdrop closes it unless `busy`.
// `footer` renders in a sticky action bar at the bottom.
export default function SidePanel({ title, subtitle, onClose, busy = false, size = 'md', children, footer }) {
  const maxW = size === 'lg' ? 'max-w-xl' : 'max-w-md'
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={() => !busy && onClose()}>
      <div
        className={`w-full ${maxW} bg-white h-full flex flex-col shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <div className="text-base font-semibold text-gray-900">{title}</div>
            {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">{children}</div>

        {footer && (
          <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">{footer}</div>
        )}
      </div>
    </div>
  )
}
