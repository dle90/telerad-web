import { apiFetch } from '../client'

const BASE = '/telerad-core/v1/staff/imaging-result-sheet-template'

// Mẫu phiếu kết quả theo từng CSYT (telerad_partner).
export const getPaginatedImagingResultSheetTemplates = ({ page = 1, size = 20, teleradPartnerUuid = '', isActive = '' } = {}) => {
  const qs = new URLSearchParams()
  qs.set('page', String(page))
  qs.set('size', String(size))
  if (teleradPartnerUuid) qs.set('teleradPartnerUuid', teleradPartnerUuid)
  if (isActive === true || isActive === false) qs.set('isActive', String(isActive))
  return apiFetch(`${BASE}?${qs.toString()}`)
}

export const getImagingResultSheetTemplate = (objectUuid) => apiFetch(`${BASE}/${objectUuid}`)

export const createImagingResultSheetTemplate = (body) => apiFetch(BASE, { method: 'POST', body })

export const updateImagingResultSheetTemplate = (objectUuid, body) =>
  apiFetch(`${BASE}/${objectUuid}`, { method: 'PUT', body })

export const activateImagingResultSheetTemplate = (objectUuid) =>
  apiFetch(`${BASE}/${objectUuid}/activate`, { method: 'PATCH' })

export const deactivateImagingResultSheetTemplate = (objectUuid) =>
  apiFetch(`${BASE}/${objectUuid}/deactivate`, { method: 'PATCH' })
