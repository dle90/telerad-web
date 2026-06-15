// Pure formatting helpers shared across screens. No React, no side effects.
//
// telerad-core stores dates as "DD/MM/YYYY" (types.Date) while native <input
// type="date"> speaks "YYYY-MM-DD". These convert at the I/O boundary.

// "DD/MM/YYYY" -> "YYYY-MM-DD". Date-only, does NOT shift timezone.
export const ddmmyyyyToISO = (s) => {
  if (!s || typeof s !== 'string') return ''
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : ''
}

// "YYYY-MM-DD" (or ISO datetime) -> "DD/MM/YYYY".
export const isoToDDMMYYYY = (s) => {
  if (!s || typeof s !== 'string') return ''
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}

// Accent-insensitive Vietnamese normalize: lowercase, strip combining
// diacritics (U+0300–U+036F), đ -> d.
export const normalizeText = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
