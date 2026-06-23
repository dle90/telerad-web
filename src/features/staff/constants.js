// Staff-specific enums. Cross-feature ones (modalities, labelOf) live in
// @/lib/enums and are re-exported here so existing imports keep working.

export { MODALITY_OPTIONS, labelOf } from '@/lib/enums'

// Roles (telerad-core: oneof DOCTOR).
export const ROLE_OPTIONS = [{ value: 'DOCTOR', label: 'Bác sĩ' }]

// Gender — telerad-core stores a free string; align with his-core (MALE/FEMALE).
export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
]
