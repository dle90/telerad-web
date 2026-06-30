const VARIANT = {
  default: 'bg-neutral-100 text-neutral-600',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-50  text-success-700',
  warning: 'bg-warning-50  text-warning-700',
  danger:  'bg-danger-50   text-danger-700',
  teal:    'bg-teal-50     text-teal-700',
  purple:  'bg-purple-100  text-purple-700',
  indigo:  'bg-indigo-100  text-indigo-700',
}

const DOT_COLOR = {
  default: 'bg-neutral-400',
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger:  'bg-danger-500',
  teal:    'bg-teal-500',
  purple:  'bg-purple-500',
  indigo:  'bg-indigo-500',
}

const SIZE = {
  sm: 'text-[11px] px-1.5 py-0.5 gap-1',
  md: 'text-xs    px-2   py-0.5 gap-1',
  lg: 'text-sm    px-2.5 py-1   gap-1.5',
}

/**
 * @param {'default'|'primary'|'success'|'warning'|'danger'|'teal'|'purple'|'indigo'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} dot     — show colored dot prefix
 * @param {boolean} pill    — fully rounded (default: true)
 */
export function Badge({
  variant = 'default',
  size    = 'md',
  dot     = false,
  pill    = true,
  children,
  className = '',
  ...props
}) {
  return (
    <span
      className={[
        'inline-flex items-center font-medium whitespace-nowrap',
        pill ? 'rounded-full' : 'rounded',
        VARIANT[variant] ?? VARIANT.default,
        SIZE[size]       ?? SIZE.md,
        className,
      ].join(' ')}
      {...props}
    >
      {dot && (
        <span
          className={`rounded-full flex-shrink-0 ${
            size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2'
          } ${DOT_COLOR[variant] ?? DOT_COLOR.default}`}
        />
      )}
      {children}
    </span>
  )
}

/* ── Pre-built status badges ───────────────────────────────────────────────── */
export const StatusBadge = {
  Active:    (p) => <Badge variant="success" dot {...p}>{p.children ?? 'Hoạt động'}</Badge>,
  Inactive:  (p) => <Badge variant="default" dot {...p}>{p.children ?? 'Ngừng HĐ'}</Badge>,
  Pending:   (p) => <Badge variant="warning" dot {...p}>{p.children ?? 'Chờ xử lý'}</Badge>,
  Critical:  (p) => <Badge variant="danger"  dot {...p}>{p.children ?? 'Khẩn cấp'}</Badge>,
  InProgress:(p) => <Badge variant="primary" dot {...p}>{p.children ?? 'Đang xử lý'}</Badge>,
  Done:      (p) => <Badge variant="teal"    dot {...p}>{p.children ?? 'Hoàn tất'}</Badge>,
}

/* ── Role badges ───────────────────────────────────────────────────────────── */
const ROLE_CFG = {
  admin:       { variant: 'warning', label: 'Admin'       },
  giamdoc:     { variant: 'purple',  label: 'Giám đốc'    },
  truongphong: { variant: 'indigo',  label: 'Trưởng phòng'},
  bacsi:       { variant: 'teal',    label: 'Bác sĩ'      },
  nhanvien:    { variant: 'primary', label: 'Nhân viên'   },
  guest:       { variant: 'default', label: 'Guest'       },
}

export function RoleBadge({ role }) {
  const cfg = ROLE_CFG[role] ?? { variant: 'default', label: role }
  return <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
}
