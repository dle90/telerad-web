// Plain read-only value with an em-dash fallback (mirrors his-web's ReadOnlyText).
export default function ReadOnlyText({ value }) {
  return <span className="text-sm text-gray-800">{value || value === 0 ? value : '—'}</span>
}
