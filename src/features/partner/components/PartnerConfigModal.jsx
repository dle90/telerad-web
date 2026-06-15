import React, { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import { getTeleradPartnerConfig, updateTeleradPartnerConfig } from '@/api'
import { inputClsLg } from '@/lib/ui'

// Edit the partner-side callback config (telerad calls back into the partner
// system). telerad-core returns partnerPassword in plaintext so admins can
// review it. partnerUsername/Password are required when callback is on.
export default function PartnerConfigModal({ partner, onClose, onSaved }) {
  const [form, setForm] = useState({
    callback: false,
    callbackUrl: '',
    partnerUsername: '',
    partnerPassword: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    getTeleradPartnerConfig(partner.uuid)
      .then((cfg) => {
        if (cancelled || !cfg) return
        setForm({
          callback: !!cfg.callback,
          callbackUrl: cfg.callbackUrl || '',
          partnerUsername: cfg.partnerUsername || '',
          partnerPassword: cfg.partnerPassword || '',
        })
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [partner.uuid])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateTeleradPartnerConfig(partner.uuid, {
        callback: form.callback,
        callbackUrl: form.callback ? form.callbackUrl || null : null,
        partnerUsername: form.callback ? form.partnerUsername || null : null,
        partnerPassword: form.callback ? form.partnerPassword || null : null,
      })
      onSaved()
    } catch {
      // apiFetch toasts the backend message.
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title="Cấu hình tài khoản phía đối tác"
      subtitle={partner.name}
      onClose={onClose}
      busy={saving}
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
            form="partner-config-form"
            disabled={saving || loading}
            className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Đang lưu…' : 'Lưu'}
          </button>
        </>
      }
    >
      {loading ? (
        <div className="text-sm text-gray-400 py-4">Đang tải…</div>
      ) : (
        <form id="partner-config-form" onSubmit={handleSubmit} className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={form.callback}
              onChange={(e) => set('callback', e.target.checked)}
              className="accent-blue-600"
            />
            Bật callback sang hệ thống đối tác
          </label>

          {form.callback && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Callback URL</label>
                <input
                  value={form.callbackUrl}
                  onChange={(e) => set('callbackUrl', e.target.value)}
                  className={inputClsLg}
                  placeholder="https://…"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Tên đăng nhập phía đối tác <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.partnerUsername}
                  onChange={(e) => set('partnerUsername', e.target.value)}
                  className={inputClsLg}
                  required={form.callback}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Mật khẩu phía đối tác <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.partnerPassword}
                  onChange={(e) => set('partnerPassword', e.target.value)}
                  className={`${inputClsLg} font-mono`}
                  required={form.callback}
                />
              </div>
            </div>
          )}
        </form>
      )}
    </Modal>
  )
}
