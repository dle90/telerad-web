// Cross-feature domain enums (used by both staff and partner screens). Values
// mirror telerad-core validate tags; labels are Vietnamese display text.

// Imaging modalities (telerad-core: oneof CT MR US CR MG).
export const MODALITY_OPTIONS = [
  { value: 'CT', label: 'CT' },
  { value: 'MR', label: 'MR' },
  { value: 'US', label: 'Siêu âm (US)' },
  { value: 'CR', label: 'X-quang (CR)' },
  { value: 'MG', label: 'Nhũ ảnh (MG)' },
]

export const labelOf = (options, value) => options.find((o) => o.value === value)?.label || value
