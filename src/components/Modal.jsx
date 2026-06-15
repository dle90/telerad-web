import React from 'react'

// Generic centered modal shell. Clicking the backdrop closes it unless `busy`.
// `footer` is rendered in a sticky action bar; `size` widens the dialog.
export default function Modal({ title, subtitle, onClose, busy = false, size = 'md', children, footer }) {
  const maxW = size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-sm' : 'max-w-lg'
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4"
      onClick={() => !busy && onClose()}
    >
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${maxW} max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
        </div>

        <div className="px-5 py-4 overflow-y-auto">{children}</div>

        {footer && (
          <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">{footer}</div>
        )}
      </div>
    </div>
  )
}
