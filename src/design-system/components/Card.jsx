/**
 * Card — main surface container.
 *
 * Usage:
 *   <Card>
 *     <Card.Header title="Tiêu đề" actions={<Button>...</Button>} />
 *     <Card.Body>...</Card.Body>
 *     <Card.Footer>...</Card.Footer>
 *   </Card>
 *
 * Or shorthand with title prop:
 *   <Card title="Danh sách bệnh nhân" actions={...}>...</Card>
 */

const VARIANT = {
  default:  'bg-white border border-neutral-200 shadow-card',
  flat:     'bg-white border border-neutral-200',
  elevated: 'bg-white border border-neutral-200 shadow-card-md',
  ghost:    'bg-transparent border-0',
  tinted:   'bg-neutral-50 border border-neutral-200',
}

export function Card({
  variant   = 'default',
  title,
  subtitle,
  actions,
  padding   = true,
  children,
  className = '',
  ...props
}) {
  return (
    <div
      className={`rounded-xl overflow-hidden ${VARIANT[variant] ?? VARIANT.default} ${className}`}
      {...props}
    >
      {(title || actions) && (
        <Card.Header title={title} subtitle={subtitle} actions={actions} />
      )}
      {padding && !(title || actions) ? (
        <div className="px-5 py-4">{children}</div>
      ) : (
        children
      )}
    </div>
  )
}

/* ── Card.Header ───────────────────────────────────────────────────────────── */
Card.Header = function CardHeader({ title, subtitle, actions, children, className = '', ...props }) {
  return (
    <div
      className={`px-5 py-4 flex items-center justify-between gap-3 border-b border-neutral-200 ${className}`}
      {...props}
    >
      <div className="min-w-0">
        {title && (
          <h3 className="text-base font-semibold text-neutral-900 leading-tight truncate">{title}</h3>
        )}
        {subtitle && (
          <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
        )}
        {children}
      </div>
      {actions && (
        <div className="flex-shrink-0 flex items-center gap-2">{actions}</div>
      )}
    </div>
  )
}

/* ── Card.Body ─────────────────────────────────────────────────────────────── */
Card.Body = function CardBody({ className = '', children, noPadding = false, ...props }) {
  return (
    <div className={noPadding ? className : `px-5 py-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

/* ── Card.Footer ───────────────────────────────────────────────────────────── */
Card.Footer = function CardFooter({ className = '', align = 'right', children, ...props }) {
  const alignCls = align === 'right' ? 'justify-end' : align === 'between' ? 'justify-between' : 'justify-start'
  return (
    <div
      className={`px-5 py-3 border-t border-neutral-100 bg-neutral-50/70 flex items-center gap-2 ${alignCls} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

/* ── KPI / Stat card ───────────────────────────────────────────────────────── */
/**
 * @param {string}           title
 * @param {string|number}    value
 * @param {string}           subtitle   — optional caption / unit
 * @param {React.ReactNode}  trend      — e.g. <Badge>+12%</Badge>
 * @param {React.ReactNode}  icon
 * @param {'primary'|'success'|'warning'|'danger'|'teal'} color
 */
export function StatCard({ title, value, subtitle, trend, icon, color = 'primary', className = '', ...props }) {
  const iconBg = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-success-50  text-success-600',
    warning: 'bg-warning-50  text-warning-600',
    danger:  'bg-danger-50   text-danger-600',
    teal:    'bg-teal-50     text-teal-600',
    neutral: 'bg-neutral-100 text-neutral-500',
  }[color] ?? 'bg-primary-100 text-primary-600'

  return (
    <div
      className={`ds-card p-5 flex items-start gap-4 ${className}`}
      {...props}
    >
      {icon && (
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide truncate">{title}</p>
        <p className="text-2xl font-bold text-neutral-900 leading-tight mt-1 tabular-nums">{value}</p>
        <div className="flex items-center gap-2 mt-1">
          {subtitle && <span className="text-xs text-neutral-500">{subtitle}</span>}
          {trend}
        </div>
      </div>
    </div>
  )
}
