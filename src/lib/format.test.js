import { describe, it, expect } from 'vitest'
import { ddmmyyyyToISO, isoToDDMMYYYY, normalizeText } from './format'

describe('format helpers', () => {
  it('ddmmyyyyToISO converts DD/MM/YYYY to YYYY-MM-DD', () => {
    expect(ddmmyyyyToISO('15/06/2026')).toBe('2026-06-15')
  })

  it('ddmmyyyyToISO returns empty for invalid input', () => {
    expect(ddmmyyyyToISO('')).toBe('')
    expect(ddmmyyyyToISO(null)).toBe('')
    expect(ddmmyyyyToISO('not-a-date')).toBe('')
  })

  it('isoToDDMMYYYY converts YYYY-MM-DD (and ISO datetime) to DD/MM/YYYY', () => {
    expect(isoToDDMMYYYY('2026-06-15')).toBe('15/06/2026')
    expect(isoToDDMMYYYY('2026-06-15T08:30:00Z')).toBe('15/06/2026')
  })

  it('round-trips a date through both converters', () => {
    expect(isoToDDMMYYYY(ddmmyyyyToISO('01/12/2026'))).toBe('01/12/2026')
  })

  it('normalizeText strips Vietnamese diacritics and lowercases', () => {
    expect(normalizeText('Đặng Trung Việt')).toBe('dang trung viet')
    expect(normalizeText('CT Sọ não')).toBe('ct so nao')
  })
})
