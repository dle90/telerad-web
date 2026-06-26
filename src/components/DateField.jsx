import React, { useEffect, useRef, useState } from 'react'
import { Icon } from '@/design-system/icons'
import { ddmmyyyyToISO, isoToDDMMYYYY } from '@/lib/format'

// Tự chèn "/" khi gõ ngày: "010" -> "01/0", "01012026" -> "01/01/2026".
// KHÔNG chặn dấu "/" do user gõ — tôn trọng nó làm dấu phân tách nên vẫn nhập
// được 1 chữ số ("1/2/2026"). Mỗi phân đoạn tối đa [2,2,4]; tràn thì đẩy sang
// phân đoạn sau (tự thêm "/").
function maskDateInput(raw) {
  const segsRaw = String(raw)
    .replace(/[^\d/]/g, '')
    .replace(/\/{2,}/g, '/')
    .split('/')
  const maxLen = [2, 2, 4]
  const segs = []
  let i = 0
  for (let k = 0; k < segsRaw.length && i < 3; k++) {
    let seg = segsRaw[k]
    while (seg.length > maxLen[i] && i < 2) {
      segs.push(seg.slice(0, maxLen[i]))
      seg = seg.slice(maxLen[i])
      i++
    }
    segs.push(seg.slice(0, maxLen[i]))
    i++
  }
  return segs.join('/')
}

// Ô ngày: HIỂN THỊ/NHẬP TAY theo DD/MM/YYYY, nhưng `value`/`onChange` luôn ở dạng
// ISO (YYYY-MM-DD) để callsite build query thẳng. Kèm nút 📅 mở lịch native.
// Nhập tay được commit khi blur/Enter; chuỗi sai → revert về value hiện tại.
// (Mô phỏng DatePicker của his-web.)
export default function DateField({ value, onChange, disabled = false }) {
  const pickerRef = useRef(null)
  const [text, setText] = useState(value ? isoToDDMMYYYY(value) : '')

  // Đồng bộ lại text khi value đổi từ bên ngoài (vd. reset bộ lọc).
  useEffect(() => {
    setText(value ? isoToDDMMYYYY(value) : '')
  }, [value])

  const commit = (raw) => {
    const trimmed = raw.trim()
    if (!trimmed) {
      onChange('')
      return
    }
    // Chấp nhận D/M/YYYY hoặc DD/MM/YYYY.
    const m = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (!m) {
      setText(value ? isoToDDMMYYYY(value) : '')
      return
    }
    const normalized = `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[3]}`
    const iso = ddmmyyyyToISO(normalized)
    // Kiểm tra ngày có thật (vd. 31/02 → không hợp lệ → revert).
    const d = new Date(`${iso}T00:00:00`)
    const valid =
      !Number.isNaN(d.getTime()) &&
      d.getFullYear() === Number(m[3]) &&
      d.getMonth() + 1 === Number(m[2]) &&
      d.getDate() === Number(m[1])
    if (!valid) {
      setText(value ? isoToDDMMYYYY(value) : '')
      return
    }
    onChange(iso)
  }

  const openPicker = () => {
    const el = pickerRef.current
    if (!el) return
    if (typeof el.showPicker === 'function') el.showPicker()
    else el.focus()
  }

  return (
    <div className="relative inline-flex items-center">
      <input
        type="text"
        value={text}
        placeholder="dd/mm/yyyy"
        disabled={disabled}
        onChange={(e) => setText(maskDateInput(e.target.value))}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit(e.currentTarget.value)
            e.currentTarget.blur()
          }
        }}
        className="w-32 border border-gray-200 rounded-l-lg px-3 py-2 text-sm font-mono outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 disabled:bg-gray-50"
      />
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled}
        title="Mở lịch"
        className="border border-l-0 border-gray-200 rounded-r-lg px-2 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
      >
        <Icon name="calendar" size={15} />
      </button>
      {/* Native date picker ẩn — chỉ để bật lịch qua nút 📅. */}
      <input
        ref={pickerRef}
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="absolute right-0 top-0 w-0 h-0 opacity-0 pointer-events-none"
        tabIndex={-1}
        aria-hidden
      />
    </div>
  )
}
