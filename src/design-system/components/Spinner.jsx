const sizes = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
  xl: 'w-12 h-12 border-4',
}

/**
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} size
 * @param {string} className  — color via text-* (default: text-primary-600)
 */
export function Spinner({ size = 'md', className = 'text-primary-600' }) {
  return (
    <span
      role="status"
      aria-label="Đang tải..."
      className={`inline-block animate-spin rounded-full border-current border-t-transparent ${sizes[size] ?? sizes.md} ${className}`}
    />
  )
}

/** Full-page / full-container centered loader */
export function PageSpinner({ message = 'Đang tải...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-neutral-500">
      <Spinner size="lg" />
      {message && <span className="text-sm">{message}</span>}
    </div>
  )
}
