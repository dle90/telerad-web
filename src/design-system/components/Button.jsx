import { Spinner } from './Spinner'

const VARIANT = {
  primary:         'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white border-transparent shadow-xs focus:ring-primary-500/40',
  secondary:       'bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-700 border-neutral-200 shadow-xs focus:ring-primary-200/40',
  ghost:           'bg-transparent hover:bg-neutral-50 active:bg-neutral-100 text-neutral-600 border-transparent focus:ring-primary-200/40',
  danger:          'bg-danger-600 hover:bg-danger-700 active:bg-danger-800 text-white border-transparent shadow-xs focus:ring-danger-400/40',
  success:         'bg-success-600 hover:bg-success-700 text-white border-transparent shadow-xs focus:ring-success-400/40',
  teal:            'bg-teal-600 hover:bg-teal-700 text-white border-transparent shadow-xs focus:ring-teal-400/40',
  'outline':       'bg-transparent hover:bg-primary-50 text-primary-600 border-primary-300 focus:ring-primary-400/30',
  'outline-danger':'bg-transparent hover:bg-danger-50 text-danger-600 border-danger-300 focus:ring-danger-400/30',
  warning:         'bg-warning-500 hover:bg-warning-600 text-white border-transparent shadow-xs focus:ring-warning-400/40',
}

const SIZE = {
  xs: 'text-xs px-2.5 py-1 gap-1 rounded-md',
  sm: 'text-sm px-3 py-1.5 gap-1.5 rounded-lg',
  md: 'text-sm px-4 py-2 gap-2 rounded-lg',
  lg: 'text-base px-5 py-2.5 gap-2 rounded-lg',
  xl: 'text-base px-6 py-3 gap-2.5 rounded-xl',
}

/**
 * @param {'primary'|'secondary'|'ghost'|'danger'|'success'|'teal'|'outline'|'outline-danger'|'warning'} variant
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} size
 * @param {boolean} loading    — replaces leftIcon with spinner
 * @param {boolean} disabled
 * @param {boolean} fullWidth
 * @param {React.ReactNode} leftIcon
 * @param {React.ReactNode} rightIcon
 */
export function Button({
  variant = 'primary',
  size    = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading
  return (
    <button
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-medium border',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT[variant] ?? VARIANT.primary,
        SIZE[size]       ?? SIZE.md,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading
        ? <Spinner size="sm" className="text-current" />
        : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
}

/** Icon-only button (square, centered) */
export function IconButton({
  variant = 'ghost',
  size    = 'md',
  disabled = false,
  title,
  children,
  className = '',
  ...props
}) {
  const paddings = { xs: 'p-1', sm: 'p-1.5', md: 'p-2', lg: 'p-2.5', xl: 'p-3' }
  return (
    <button
      disabled={disabled}
      title={title}
      aria-label={title}
      className={[
        'inline-flex items-center justify-center rounded-lg border',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT[variant] ?? VARIANT.ghost,
        paddings[size]   ?? paddings.md,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
