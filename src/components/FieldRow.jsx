// Label-left / control-right row used in form & detail drawers (mirrors
// his-web's FieldRow).
export default function FieldRow({ label, required, children }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2 border-b border-gray-100 last:border-b-0">
      <div className="text-xs font-medium text-gray-500 pt-1.5">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </div>
      <div className="col-span-2">{children}</div>
    </div>
  )
}
