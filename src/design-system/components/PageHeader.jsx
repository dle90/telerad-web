import React from 'react'
import { Icon } from '../icons'
import { usePageHeaderCtx } from '@/context/PageHeaderContext'

/**
 * PageHeader — header chuẩn his-web.
 *
 * Mô hình: TIÊU ĐỀ trang đẩy lên TOPBAR (thay "Medisync HIS"); CONTENT chỉ hiển
 * thị BREADCRUMB + ACTIONS thẳng hàng nhau (breadcrumb trái, nút phải). Breadcrumb
 * được prefix tên module (vd "HIS › Tiếp đón › Phiếu thu"), mục cuối (trang hiện
 * tại) in đậm.
 *
 * @param {string}  title       Tiêu đề trang → topbar (cũng là mục cuối breadcrumb)
 * @param {Array<string|{label}>} breadcrumb  Đường dẫn KHÔNG gồm module (Layout tự thêm)
 * @param {string}  subtitle    Mô tả ngắn (tùy chọn, hiện dưới breadcrumb)
 * @param {React.ReactNode} actions  Nút bên phải (tùy chọn)
 * @param {React.ReactNode} center   Slot giữa (vd stepper Đăng ký) (tùy chọn)
 */
export function PageHeader({ title, subtitle, breadcrumb, actions, center, className = '' }) {
  const ctx = usePageHeaderCtx()
  const setTitle = ctx?.setTitle

  // Đẩy tiêu đề trang lên topbar; dọn khi rời trang để topbar không giữ tiêu đề cũ.
  React.useEffect(() => {
    if (!setTitle) return
    setTitle(title || '')
    return () => setTitle('')
  }, [setTitle, title])

  // Breadcrumb hiển thị: [module] › [...breadcrumb]. Module do Layout cấp.
  const crumbs = [ctx?.moduleLabel, ...(Array.isArray(breadcrumb) ? breadcrumb : [])].filter(Boolean)
  const labelOf = (c) => (typeof c === 'string' ? c : c?.label)

  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        {crumbs.length > 0 ? (
          <nav className="flex items-center flex-wrap gap-1 text-xs tc-3 min-w-0" aria-label="breadcrumb">
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1
              return (
                <span key={i} className="inline-flex items-center gap-1">
                  {i > 0 && <Icon name="chevron-right" size={12} className="tc-4" />}
                  <span className={last ? 'tc-1 font-semibold' : ''}>{labelOf(c)}</span>
                </span>
              )
            })}
          </nav>
        ) : <span />}
        {center && <div className="flex-1 flex justify-center min-w-0">{center}</div>}
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
      {subtitle && <p className="t-caption tc-3 mt-1">{subtitle}</p>}
    </div>
  )
}
