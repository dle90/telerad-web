import React, { useState } from 'react'
import Modal from '@/components/Modal'
import { changeTeleradPartnerPassword } from '@/api'
import { inputClsLg } from '@/lib/ui'

// Admin changes the partner's telerad-side password (the credential telerad
// issued to the partner). Username cannot be changed; admin supplies the new
// password directly (not auto-generated).
export default function ChangePasswordModal({ partner, onClose, onSaved }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    setSaving(true)
    try {
      await changeTeleradPartnerPassword(partner.uuid, password)
      onSaved()
    } catch {
      // apiFetch toasts the backend message.
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title="Đổi mật khẩu đối tác"
      subtitle={`${partner.name} · ${partner.username}`}
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
            form="partner-change-password-form"
            disabled={saving}
            className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Đang lưu…' : 'Cập nhật'}
          </button>
        </>
      }
    >
      <form id="partner-change-password-form" onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Mật khẩu mới</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClsLg}
            required
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClsLg}
            required
          />
        </div>
        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </form>
    </Modal>
  )
}
