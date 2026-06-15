import React, { useState } from 'react'
import Modal from '@/components/Modal'
import { createStaffLoginAccount } from '@/api'
import { inputClsLg } from '@/lib/ui'
import CredentialResultModal from './CredentialResultModal'

// Grant a login account to a staff member who doesn't have one yet. Admin
// supplies the username; telerad-core auto-generates the password and returns it
// once. On success we hand off to CredentialResultModal to display it.
export default function CreateAccountModal({ staff, onClose, onDone }) {
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [credential, setCredential] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const result = await createStaffLoginAccount(staff.uuid, username)
      setCredential(result)
    } catch {
      // apiFetch toasts the backend message; keep the dialog open.
    } finally {
      setSaving(false)
    }
  }

  if (credential) {
    return (
      <CredentialResultModal
        title="Đã cấp tài khoản"
        credential={credential}
        onClose={() => {
          onDone()
          onClose()
        }}
      />
    )
  }

  return (
    <Modal
      title="Cấp tài khoản đăng nhập"
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
            type="submit"
            form="create-account-form"
            disabled={saving}
            className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Đang cấp…' : 'Cấp tài khoản'}
          </button>
        </>
      }
    >
      <form id="create-account-form" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-gray-600 mb-1">Tên đăng nhập</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inputClsLg}
          required
          autoFocus
        />
        <p className="text-xs text-gray-400 mt-2">
          Mật khẩu sẽ được hệ thống tự sinh và hiển thị một lần sau khi cấp.
        </p>
      </form>
    </Modal>
  )
}
