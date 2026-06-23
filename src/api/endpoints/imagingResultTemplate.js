import { apiFetch } from '../client'

const BASE = '/telerad-core/v1/staff/imaging-result-template'

// Mẫu nội dung kết quả CĐHA. `modality`/`isActive`/`search`/`bodyParts` lọc danh sách.
// bodyParts: lọc overlap (mẫu trùng ít nhất 1 bộ phận) — bỏ trống = không lọc.
export const getPaginatedImagingResultTemplates = ({
  page = 1,
  size = 20,
  search = '',
  modality = '',
  isActive = '',
  bodyParts = [],
} = {}) => {
  const qs = new URLSearchParams()
  qs.set('page', String(page))
  qs.set('size', String(size))
  if (search) qs.set('search', search)
  if (modality) qs.set('modality', modality)
  if (isActive === true || isActive === false) qs.set('isActive', String(isActive))
  for (const bp of bodyParts || []) if (bp) qs.append('bodyParts', bp)
  return apiFetch(`${BASE}?${qs.toString()}`)
}

// Option cho form: loại chụp hỗ trợ + danh sách bộ phận chụp (PACS_BODY_PART).
export const getImagingResultTemplateFormOptions = () => apiFetch(`${BASE}/actions/get-form-options`)

export const getImagingResultTemplate = (objectUuid) => apiFetch(`${BASE}/${objectUuid}`)

export const createImagingResultTemplate = (body) => apiFetch(BASE, { method: 'POST', body })

export const updateImagingResultTemplate = (objectUuid, body) =>
  apiFetch(`${BASE}/${objectUuid}`, { method: 'PUT', body })

export const activateImagingResultTemplate = (objectUuid) =>
  apiFetch(`${BASE}/${objectUuid}/activate`, { method: 'PATCH' })

export const deactivateImagingResultTemplate = (objectUuid) =>
  apiFetch(`${BASE}/${objectUuid}/deactivate`, { method: 'PATCH' })
