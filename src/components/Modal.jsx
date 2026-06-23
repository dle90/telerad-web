import React from 'react'

// Generic centered modal shell. `footer` is rendered in a sticky action bar;
// `size` widens the dialog (xl dùng cho form nội dung lớn như mẫu/phiếu kết quả).
// `dismissible` = false thì KHÔNG đóng khi click nền (tránh mất dữ liệu form lớn).
export default function Modal({ title, subtitle, onClose, busy = false, size = 'md', dismissible = true, heightFull = false, children, footer }) {
  const maxW = size === 'xl' ? 'max-w-5xl' : size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-sm' : 'max-w-lg'
  // heightFull: panel cao bằng ~90% chiều cao window (responsive), body co giãn để
  // phần nội dung lớn (textarea HTML) lấp đầy khoảng trống. Mặc định: cao theo nội dung.
  const heightCls = heightFull ? 'h-[90vh]' : 'max-h-[90vh]'
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4"
      onClick={() => dismissible && !busy && onClose()}
    >
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${maxW} ${heightCls} flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
        </div>

        <div className="px-5 py-4 overflow-y-auto flex-1 min-h-0">{children}</div>

        {footer && (
          <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2 shrink-0">{footer}</div>
        )}
      </div>
    </div>
  )
}
