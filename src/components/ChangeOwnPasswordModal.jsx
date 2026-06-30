import React, { useState } from 'react'
import Modal from './Modal'
import { Icon } from '@/design-system/icons'
import { changeOwnPassword } from '../api'
import { inputClsLg } from '../lib/ui'

// Self-service "đổi mật khẩu" for the logged-in user. Requires the current
// password (telerad-core verifies it server-side).
export default function ChangeOwnPasswordModal({ onClose }) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    setSaving(true)
    try {
      await changeOwnPassword(oldPassword, newPassword)
      setDone(true)
    } catch {
      // apiFetch already toasts the backend message; keep the dialog open.
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title="Đổi mật khẩu"
      onClose={onClose}
      busy={saving}
      size="sm"
      footer={
        done ? (
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Đóng
          </button>
        ) : (
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
              form="change-own-password-form"
              disabled={saving}
              className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Đang lưu…' : 'Cập nhật'}
            </button>
          </>
        )
      }
    >
      {done ? (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-3 flex items-center gap-2">
          <Icon name="check" size={14} /> Đổi mật khẩu thành công.
        </div>
      ) : (
        <form id="change-own-password-form" onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className={inputClsLg}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClsLg}
              required
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
      )}
    </Modal>
  )
}
