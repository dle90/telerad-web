// Cross-feature domain enums (used by both staff and partner screens). Values
// mirror telerad-core validate tags; labels are Vietnamese display text.

// Imaging modalities (telerad-core: oneof CT MR US CR MG). Hiển thị mã thuần,
// không kèm chú thích.
export const MODALITY_OPTIONS = [
  { value: 'CT', label: 'CT' },
  { value: 'MR', label: 'MR' },
  { value: 'US', label: 'US' },
  { value: 'CR', label: 'CR' },
  { value: 'MG', label: 'MG' },
]

export const labelOf = (options, value) => options.find((o) => o.value === value)?.label || value
