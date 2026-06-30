import { Icon } from '../icons'

const CFG = {
  info:    { icon: 'info',           wrap: 'bg-primary-50 border-primary-100 text-primary-900', icon_cls: 'text-primary-500' },
  success: { icon: 'check-circle',   wrap: 'bg-success-50 border-success-200 text-success-800', icon_cls: 'text-success-500' },
  warning: { icon: 'alert-triangle', wrap: 'bg-warning-50 border-warning-200 text-warning-800', icon_cls: 'text-warning-500' },
  danger:  { icon: 'alert-circle',   wrap: 'bg-danger-50  border-danger-200  text-danger-800',  icon_cls: 'text-danger-500'  },
  teal:    { icon: 'info',           wrap: 'bg-teal-50    border-teal-200    text-teal-800',    icon_cls: 'text-teal-500'    },
}

/**
 * @param {'info'|'success'|'warning'|'danger'|'teal'} variant
 * @param {string}           title      — optional bold title line
 * @param {boolean}          dismissible
 * @param {() => void}       onDismiss
 * @param {React.ReactNode}  icon       — override default icon (pass false to hide)
 */
export function Alert({
  variant    = 'info',
  title,
  dismissible = false,
  onDismiss,
  icon,
  children,
  className  = '',
  ...props
}) {
  const cfg = CFG[variant] ?? CFG.info
  const showIcon = icon !== false

  return (
    <div
      role="alert"
      className={[
        'flex gap-3 rounded-xl border px-4 py-3 text-sm leading-relaxed',
        cfg.wrap,
        className,
      ].join(' ')}
      {...props}
    >
      {showIcon && (
        <span className={`flex-shrink-0 mt-0.5 ${cfg.icon_cls}`}>
          {icon ?? <Icon name={cfg.icon} size={16} />}
        </span>
      )}
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {children && <div className="opacity-90">{children}</div>}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 -mt-0.5 -mr-1 p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Đóng"
        >
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  )
}

/* ── Toast notification (self-dismissing strip) ────────────────────────────── */
export function Toast({ variant = 'info', children, onDismiss }) {
  const cfg = CFG[variant] ?? CFG.info
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-dropdown text-sm animate-slide-up ${cfg.wrap}`}>
      <span className={`flex-shrink-0 ${cfg.icon_cls}`}>
        <Icon name={cfg.icon} size={15} />
      </span>
      <span className="flex-1">{children}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity p-0.5">
          <Icon name="x" size={13} />
        </button>
      )}
    </div>
  )
}
