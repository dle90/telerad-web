import React from 'react'
import { getAllTeleradPartners } from '../api'
import { Icon } from '../design-system/icons'
import { useSelectedPartner } from '../context/SelectedPartnerContext'

// Dropdown chọn "chi nhánh" (đối tác tích hợp) trên topbar — như FacilitySwitcher
// của HIS. Chọn 1 đối tác → lưu vào SelectedPartnerContext; màn Ca đọc lọc theo.
export default function PartnerSwitcher() {
  const { partner, choose } = useSelectedPartner()
  const [open, setOpen] = React.useState(false)
  const [partners, setPartners] = React.useState([])
  const ref = React.useRef(null)

  React.useEffect(() => {
    let alive = true
    getAllTeleradPartners()
      .then((res) => { if (alive) setPartners(Array.isArray(res) ? res : (res?.records || [])) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  React.useEffect(() => {
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const options = [{ uuid: '', name: 'Tất cả đối tác' }, ...partners]
  const label = partner?.name || 'Tất cả đối tác'

  const pick = (p) => {
    setOpen(false)
    choose(p.uuid ? { uuid: p.uuid, name: p.name } : null)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Đổi đối tác (chi nhánh)"
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
      >
        <Icon name="building-2" size={15} className="text-primary-600 flex-shrink-0" />
        <span className="whitespace-nowrap font-medium">{label}</span>
        <Icon name="chevron-down" size={13} className="text-neutral-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 max-h-80 overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-lg py-1 z-50">
          <p className="px-3 pt-2 pb-1 t-micro tc-4 uppercase tracking-wide">Chọn đối tác</p>
          {options.map((p) => {
            const active = (partner?.uuid || '') === p.uuid
            return (
              <button
                key={p.uuid || 'all'}
                onClick={() => pick(p)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                  active ? 'bg-primary-50 text-primary-700 font-medium' : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Icon name={active ? 'check-circle' : 'building-2'} size={15} className={active ? 'text-primary-600' : 'text-neutral-400'} />
                <span className="flex-1">{p.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
