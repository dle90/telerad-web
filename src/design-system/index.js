/**
 * Medisync Design System — unified entry point
 *
 * Import everything from here:
 *   import { Button, Card, Badge, Icon, Modal, Input, Alert } from '@/design-system'
 *
 * For icons only (tree-shakeable):
 *   import { Icon, ICON_NAMES } from '@/design-system/icons'
 */

// Icons
export { Icon, IconGrid, ICON_NAMES } from './icons'

// Components
export { Button, IconButton }                                from './components/Button'
export { Card, StatCard }                                    from './components/Card'
export { Badge, RoleBadge, StatusBadge }                    from './components/Badge'
export { Input, SearchInput, Textarea, Select, Checkbox,
         Label, FieldError, FieldHelper }                   from './components/Input'
export { Spinner, PageSpinner }                              from './components/Spinner'
export { Alert, Toast }                                      from './components/Alert'
export { Modal, ConfirmModal }                               from './components/Modal'
export { PageHeader }                                        from './components/PageHeader'
