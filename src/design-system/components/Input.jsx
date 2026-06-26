import { Icon } from '../icons'

/* ── Label ─────────────────────────────────────────────────────────────────── */
export function Label({ children, required, className = '', ...props }) {
  return (
    <label className={`block text-sm font-medium text-neutral-700 mb-1 ${className}`} {...props}>
      {children}
      {required && <span className="text-danger-500 ml-0.5">*</span>}
    </label>
  )
}

/* ── Helper / Error message ────────────────────────────────────────────────── */
export function FieldError({ children }) {
  if (!children) return null
  return (
    <p className="text-xs text-danger-600 mt-1 flex items-center gap-1">
      <Icon name="alert-circle" size={12} />
      {children}
    </p>
  )
}
export function FieldHelper({ children }) {
  if (!children) return null
  return <p className="text-xs text-neutral-500 mt-1">{children}</p>
}

/* ── Base classes ──────────────────────────────────────────────────────────── */
const BASE = [
  'w-full rounded-lg border bg-white px-3 text-sm text-neutral-900',
  'placeholder:text-neutral-400',
  'transition-[border-color,box-shadow] duration-150',
  'focus:outline-none focus:border-primary-400 focus:shadow-input-focus',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-50',
  'shadow-input border-neutral-200',
].join(' ')

const ERROR_CLS = 'border-danger-400 focus:border-danger-400 focus:ring-2 focus:ring-danger-200 focus:shadow-none'

/* ── Input ─────────────────────────────────────────────────────────────────── */
/**
 * @param {string}  label
 * @param {string}  helper      — hint text below
 * @param {string}  error       — error message (also turns border red)
 * @param {boolean} required
 * @param {React.ReactNode} leftAddon  — icon/text inside left
 * @param {React.ReactNode} rightAddon
 */
export function Input({
  label,
  helper,
  error,
  required = false,
  leftAddon,
  rightAddon,
  id,
  className = '',
  wrapperClassName = '',
  ...props
}) {
  const inputId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined)
  const hasLeft  = Boolean(leftAddon)
  const hasRight = Boolean(rightAddon)

  return (
    <div className={wrapperClassName}>
      {label && <Label htmlFor={inputId} required={required}>{label}</Label>}
      <div className="relative">
        {hasLeft && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            {leftAddon}
          </span>
        )}
        <input
          id={inputId}
          className={[
            BASE,
            'py-2',
            hasLeft  ? 'pl-9'  : '',
            hasRight ? 'pr-9'  : '',
            error    ? ERROR_CLS : '',
            className,
          ].join(' ')}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {hasRight && (
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-400">
            {rightAddon}
          </span>
        )}
      </div>
      <FieldError>{error}</FieldError>
      <FieldHelper>{helper}</FieldHelper>
    </div>
  )
}

/* ── SearchInput ───────────────────────────────────────────────────────────── */
export function SearchInput({ placeholder = 'Tìm kiếm...', className = '', ...props }) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
        <Icon name="search" size={15} />
      </span>
      <input
        type="search"
        placeholder={placeholder}
        className={`${BASE} py-2 pl-9 pr-3`}
        {...props}
      />
    </div>
  )
}

/* ── Textarea ──────────────────────────────────────────────────────────────── */
export function Textarea({
  label,
  helper,
  error,
  required = false,
  rows = 4,
  id,
  className = '',
  wrapperClassName = '',
  ...props
}) {
  const inputId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined)
  return (
    <div className={wrapperClassName}>
      {label && <Label htmlFor={inputId} required={required}>{label}</Label>}
      <textarea
        id={inputId}
        rows={rows}
        className={[BASE, 'py-2 resize-y min-h-[80px]', error ? ERROR_CLS : '', className].join(' ')}
        aria-invalid={Boolean(error)}
        {...props}
      />
      <FieldError>{error}</FieldError>
      <FieldHelper>{helper}</FieldHelper>
    </div>
  )
}

/* ── Select ────────────────────────────────────────────────────────────────── */
export function Select({
  label,
  helper,
  error,
  required = false,
  options = [],     // [{ value, label }] or flat string[]
  placeholder,
  id,
  className = '',
  wrapperClassName = '',
  ...props
}) {
  const inputId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined)
  return (
    <div className={wrapperClassName}>
      {label && <Label htmlFor={inputId} required={required}>{label}</Label>}
      <div className="relative">
        <select
          id={inputId}
          className={[
            BASE,
            'py-2 pr-8 appearance-none cursor-pointer',
            error ? ERROR_CLS : '',
            className,
          ].join(' ')}
          aria-invalid={Boolean(error)}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt =>
            typeof opt === 'string'
              ? <option key={opt} value={opt}>{opt}</option>
              : <option key={opt.value} value={opt.value}>{opt.label}</option>
          )}
        </select>
        <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-neutral-400">
          <Icon name="chevron-down" size={14} />
        </span>
      </div>
      <FieldError>{error}</FieldError>
      <FieldHelper>{helper}</FieldHelper>
    </div>
  )
}

/* ── Checkbox ──────────────────────────────────────────────────────────────── */
export function Checkbox({ label, helper, error, className = '', ...props }) {
  return (
    <label className={`inline-flex items-start gap-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer transition-colors"
        {...props}
      />
      {label && (
        <span className="text-sm text-neutral-700 leading-5 select-none">{label}</span>
      )}
    </label>
  )
}
