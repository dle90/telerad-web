import React, { useState } from 'react'
import SidePanel from '@/components/SidePanel'
import FieldRow from '@/components/FieldRow'
import { createTeleradPartner, updateTeleradPartner } from '@/api'
import { inputCls } from '@/lib/ui'
import { MODALITY_OPTIONS } from '../constants'

// Create / edit a telerad partner in a right-side drawer.
//   - Create: full set — general info + telerad credential (username/password) +
//     partner-side callback config. If callback is on, partnerUsername/Password
//     are required (telerad needs them to call back into the partner system).
//   - Edit: general info only (code/name/contact/modalities). Credential and
//     callback config have their own modals.
export default function PartnerFormPanel({ partner, onClose, onSaved }) {
  const isEdit = !!partner?.uuid
  const [form, setForm] = useState(() => ({
    code: partner?.code || '',
    name: partner?.name || '',
    contact: partner?.contact || '',
    modalities: partner?.modalities || [],
    // create-only fields
    username: '',
    password: '',
    callback: false,
    callbackUrl: '',
    partnerUsername: '',
    partnerPassword: '',
  }))
  const [saving, setSaving] = useState(false)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const toggleModality = (value) =>
    setForm((f) => ({
      ...f,
      modalities: f.modalities.includes(value)
        ? f.modalities.filter((m) => m !== value)
        : [...f.modalities, value],
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) {
        await updateTeleradPartner(partner.uuid, {
          code: form.code,
          name: form.name,
          contact: form.contact || null,
          modalities: form.modalities,
        })
      } else {
        await createTeleradPartner({
          code: form.code,
          name: form.name,
          contact: form.contact || null,
          modalities: form.modalities,
          username: form.username,
          password: form.password,
          callback: form.callback,
          callbackUrl: form.callback ? form.callbackUrl || null : null,
          partnerUsername: form.callback ? form.partnerUsername || null : null,
          partnerPassword: form.callback ? form.partnerPassword || null : null,
        })
      }
      onSaved()
    } catch {
      // apiFetch toasts the backend message; keep the panel open to retry.
    } finally {
      setSaving(false)
    }
  }

  return (
    <SidePanel
      title={isEdit ? (partner.name || 'Sửa đối tác') : 'Thêm đối tác tích hợp'}
      subtitle={isEdit ? partner.code : 'Đối tác mới'}
      onClose={onClose}
      busy={saving}
      size="lg"
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
            form="partner-form"
            disabled={saving}
            className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Đang lưu…' : isEdit ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </>
      }
    >
      <form id="partner-form" onSubmit={handleSubmit}>
        <FieldRow label="Mã đối tác" required>
          <input value={form.code} onChange={(e) => set('code', e.target.value)} className={`${inputCls} font-mono`} disabled={saving} required />
        </FieldRow>
        <FieldRow label="Tên đối tác" required>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} disabled={saving} required />
        </FieldRow>
        <FieldRow label="Thông tin liên hệ">
          <input value={form.contact} onChange={(e) => set('contact', e.target.value)} className={inputCls} disabled={saving} />
        </FieldRow>
        <FieldRow label="Loại chụp cung cấp">
          <div className="flex flex-wrap gap-3 pt-1.5">
            {MODALITY_OPTIONS.map((m) => (
              <label key={m.value} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.modalities.includes(m.value)}
                  onChange={() => toggleModality(m.value)}
                  className="accent-blue-600"
                  disabled={saving}
                />
                {m.label}
              </label>
            ))}
          </div>
        </FieldRow>

        {/* Credential + callback config only exist at creation; both have their
            own dedicated endpoints/modals for later changes. */}
        {!isEdit && (
          <>
            <div className="pt-4 pb-1 text-sm font-semibold text-gray-700">Tài khoản phía telerad</div>
            <p className="text-xs text-gray-400 pb-1">
              Tên đăng nhập và mật khẩu telerad cấp cho đối tác để gửi ca đọc sang hệ thống.
            </p>
            <FieldRow label="Tên đăng nhập" required>
              <input value={form.username} onChange={(e) => set('username', e.target.value)} className={`${inputCls} font-mono`} disabled={saving} required />
            </FieldRow>
            <FieldRow label="Mật khẩu" required>
              <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} className={inputCls} disabled={saving} required />
            </FieldRow>

            <div className="pt-4 pb-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={form.callback}
                  onChange={(e) => set('callback', e.target.checked)}
                  className="accent-blue-600"
                  disabled={saving}
                />
                Bật callback sang hệ thống đối tác
              </label>
            </div>
            {form.callback && (
              <>
                <FieldRow label="Callback URL">
                  <input value={form.callbackUrl} onChange={(e) => set('callbackUrl', e.target.value)} className={inputCls} placeholder="https://…" disabled={saving} />
                </FieldRow>
                <FieldRow label="Tên đăng nhập phía đối tác" required>
                  <input value={form.partnerUsername} onChange={(e) => set('partnerUsername', e.target.value)} className={`${inputCls} font-mono`} disabled={saving} required={form.callback} />
                </FieldRow>
                <FieldRow label="Mật khẩu phía đối tác" required>
                  <input type="password" value={form.partnerPassword} onChange={(e) => set('partnerPassword', e.target.value)} className={inputCls} disabled={saving} required={form.callback} />
                </FieldRow>
              </>
            )}
          </>
        )}
      </form>
    </SidePanel>
  )
}
