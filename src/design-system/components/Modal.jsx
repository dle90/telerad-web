import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../icons'
import { Button } from './Button'

const SIZE = {
  sm:   'max-w-sm',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-[95vw]',
}

/**
 * Modal — portal-based dialog.
 *
 * Usage:
 *   <Modal open={open} onClose={() => setOpen(false)} title="Tạo mới">
 *     <Modal.Body>...</Modal.Body>
 *     <Modal.Footer>
 *       <Button variant="secondary" onClick={() => setOpen(false)}>Huỷ</Button>
 *       <Button onClick={handleSave}>Lưu</Button>
 *     </Modal.Footer>
 *   </Modal>
 *
 * @param {boolean}          open
 * @param {() => void}       onClose
 * @param {string}           title
 * @param {string}           subtitle
 * @param {'sm'|'md'|'lg'|'xl'|'full'} size
 * @param {boolean}          closable   — show ✕ button (default true)
 * @param {boolean}          closeOnBackdrop
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  size          = 'md',
  closable      = true,
  closeOnBackdrop = true,
  children,
  className     = '',
}) {
  // Lock body scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  // Keyboard: Escape closes
  useEffect(() => {
    if (!open || !closable) return
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, closable, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-[1px] animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Panel */}
      <div
        className={[
          'relative z-10 w-full bg-white rounded-2xl shadow-modal flex flex-col',
          'animate-scale-in max-h-[90vh]',
          SIZE[size] ?? SIZE.md,
          className,
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || closable) && (
          <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-neutral-200 flex-shrink-0">
            <div>
              {title && (
                <h2 className="text-base font-semibold text-neutral-900 leading-snug">{title}</h2>
              )}
              {subtitle && (
                <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
              )}
            </div>
            {closable && (
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors"
                aria-label="Đóng"
              >
                <Icon name="x" size={16} />
              </button>
            )}
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Modal.Body ────────────────────────────────────────────────────────────── */
Modal.Body = function ModalBody({ className = '', children, ...props }) {
  return (
    <div className={`px-6 py-5 ${className}`} {...props}>
      {children}
    </div>
  )
}

/* ── Modal.Footer ──────────────────────────────────────────────────────────── */
Modal.Footer = function ModalFooter({ className = '', align = 'right', children, ...props }) {
  const alignCls = align === 'right' ? 'justify-end' : align === 'between' ? 'justify-between' : 'justify-start'
  return (
    <div
      className={`flex items-center gap-2.5 px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl flex-shrink-0 ${alignCls} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

/* ── Confirm dialog ────────────────────────────────────────────────────────── */
/**
 * @param {string}      message        — main question
 * @param {string}      description    — optional detail
 * @param {string}      confirmLabel
 * @param {string}      cancelLabel
 * @param {'danger'|'primary'|'warning'} variant
 * @param {() => void}  onConfirm
 * @param {() => void}  onCancel
 */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  message      = 'Bạn có chắc chắn không?',
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel  = 'Huỷ',
  variant      = 'danger',
  loading      = false,
}) {
  const iconName = variant === 'danger' ? 'alert-triangle' : variant === 'warning' ? 'alert-circle' : 'help-circle'
  const iconCls  = variant === 'danger' ? 'text-danger-500' : variant === 'warning' ? 'text-warning-500' : 'text-primary-500'
  const iconBg   = variant === 'danger' ? 'bg-danger-50' : variant === 'warning' ? 'bg-warning-50' : 'bg-primary-50'

  return (
    <Modal open={open} onClose={onClose} size="sm" title="">
      <Modal.Body className="text-center">
        <div className={`mx-auto w-12 h-12 rounded-full ${iconBg} flex items-center justify-center mb-4`}>
          <Icon name={iconName} size={24} className={iconCls} />
        </div>
        <p className="font-semibold text-neutral-900 text-base">{message}</p>
        {description && <p className="text-sm text-neutral-500 mt-1.5">{description}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </Modal.Footer>
    </Modal>
  )
}
