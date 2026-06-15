// Centralised timezone handling. All datetime values displayed in the app go
// through these helpers so a future "user can pick their timezone" feature only
// needs to call setTimezone(...) — display callsites don't change.
//
// Date-only values (birthdays, effective dates, etc.) MUST NOT use these
// helpers — those don't carry a time/zone and shifting them by ±N hours would
// produce off-by-one bugs. Use formatDate for those.

const TIMEZONE_KEY = 'telerad_timezone'
const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh' // GMT+7, no DST

export function getTimezone() {
  try {
    const v = localStorage.getItem(TIMEZONE_KEY)
    return v && v.trim() ? v : DEFAULT_TIMEZONE
  } catch {
    return DEFAULT_TIMEZONE
  }
}

export function setTimezone(tz) {
  try {
    if (!tz) localStorage.removeItem(TIMEZONE_KEY)
    else localStorage.setItem(TIMEZONE_KEY, tz)
  } catch {}
}

// "15/05/2026 14:30:00" in the active timezone. Pass withSeconds=false to drop
// the ":ss" suffix for compact rows.
export function formatDateTime(input, { withSeconds = true } = {}) {
  if (input == null || input === '') return ''
  const d = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(d.getTime())) return ''
  const tz = getTimezone()
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: tz,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...(withSeconds ? { second: '2-digit' } : {}),
      hour12: false,
    }).format(d)
  } catch {
    return d.toISOString()
  }
}

// Date-only formatter — does NOT shift by timezone. Accepts:
//   - "DD/MM/YYYY"   → returned as-is (already telerad-core format)
//   - "YYYY-MM-DD"   → reformatted to "DD/MM/YYYY" (no time, no shift)
//   - Date instance  → uses local Y/M/D components, no UTC conversion
// Use this for birthdays, effective dates, etc.
export function formatDate(input) {
  if (input == null || input === '') return ''
  if (typeof input === 'string') {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) return input
    const iso = input.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`
    return input
  }
  if (input instanceof Date && !Number.isNaN(input.getTime())) {
    const dd = String(input.getDate()).padStart(2, '0')
    const mm = String(input.getMonth() + 1).padStart(2, '0')
    const yyyy = input.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }
  return ''
}
