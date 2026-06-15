import React from 'react'
import Modal from '@/components/Modal'

// Shows a one-time credential ({ username, password }) returned by create-account
// or reset-password. The plaintext password is only ever returned once by
// telerad-core, so we warn the admin to copy it now.
export default function CredentialResultModal({ title, credential, onClose }) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      size="sm"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Đã lưu, đóng
        </button>
      }
    >
      <div className="space-y-3">
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Mật khẩu chỉ hiển thị một lần. Vui lòng sao chép và bàn giao cho nhân sự trước khi đóng.
        </div>
        <CredentialRow label="Tên đăng nhập" value={credential?.username} />
        <CredentialRow label="Mật khẩu" value={credential?.password} mono />
      </div>
    </Modal>
  )
}

function CredentialRow({ label, value, mono }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div
        className={`flex items-center justify-between gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 ${
          mono ? 'font-mono' : ''
        } text-sm text-gray-800`}
      >
        <span className="break-all">{value || '—'}</span>
        <button
          type="button"
          onClick={() => value && navigator.clipboard?.writeText(value)}
          className="shrink-0 text-xs text-blue-600 hover:text-blue-800"
        >
          Sao chép
        </button>
      </div>
    </div>
  )
}
