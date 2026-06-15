import React, { useState } from 'react'
import Modal from '@/components/Modal'
import { assignRoles } from '@/api'
import { ROLE_OPTIONS } from '../constants'

// Assign roles to a staff member. The list row already carries `roles`, so we
// seed from it directly (no extra fetch needed).
export default function RolesModal({ staff, onClose, onSaved }) {
  const [roles, setRoles] = useState(staff.roles || [])
  const [saving, setSaving] = useState(false)

  const toggle = (value) =>
    setRoles((r) => (r.includes(value) ? r.filter((v) => v !== value) : [...r, value]))

  const handleSave = async () => {
    setSaving(true)
    try {
      await assignRoles(staff.uuid, roles)
      onSaved()
    } catch {
      // apiFetch toasts the backend message.
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title="Phân vai trò"
      subtitle={staff.fullName}
      onClose={onClose}
      busy={saving}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={saving}
            className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Đang lưu…' : 'Lưu'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        {ROLE_OPTIONS.map((r) => (
          <label key={r.value} className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={roles.includes(r.value)}
              onChange={() => toggle(r.value)}
              className="accent-blue-600"
            />
            {r.label}
          </label>
        ))}
      </div>
    </Modal>
  )
}
