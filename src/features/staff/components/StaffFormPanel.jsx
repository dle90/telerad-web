import React, { useState } from 'react'
import SidePanel from '@/components/SidePanel'
import FieldRow from '@/components/FieldRow'
import DateField from '@/components/DateField'
import { createStaffAccount, updateStaffAccount } from '@/api'
import { inputCls } from '@/lib/ui'
import { ddmmyyyyToISO, isoToDDMMYYYY } from '@/lib/format'
import { GENDER_OPTIONS, ROLE_OPTIONS } from '../constants'

// Create / edit a staff PROFILE in a right-side drawer. Login account, reading
// permission and roles are managed via separate modals — except `roles`, which
// telerad-core accepts at creation time, so we collect it only when creating.
export default function StaffFormPanel({ staff, onClose, onSaved }) {
  const isEdit = !!staff?.uuid
  const [form, setForm] = useState(() => ({
    code: staff?.code || '',
    fullName: staff?.fullName || '',
    gender: staff?.gender || 'MALE',
    // telerad-core date is "DD/MM/YYYY"; <input type=date> needs "YYYY-MM-DD".
    dateOfBirth: ddmmyyyyToISO(staff?.dateOfBirth || ''),
    citizenIdentityNumber: staff?.citizenIdentityNumber || '',
    phone: staff?.phone || '',
    email: staff?.email || '',
    fullAddress: staff?.fullAddress || '',
    roles: staff?.roles || [],
  }))
  const [saving, setSaving] = useState(false)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const toggleRole = (value) =>
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(value) ? f.roles.filter((r) => r !== value) : [...f.roles, value],
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    // Optional fields go as null (not "") so telerad-core stores NULL.
    const payload = {
      code: form.code,
      fullName: form.fullName,
      gender: form.gender,
      dateOfBirth: form.dateOfBirth ? isoToDDMMYYYY(form.dateOfBirth) : null,
      citizenIdentityNumber: form.citizenIdentityNumber || null,
      phone: form.phone || null,
      email: form.email || null,
      fullAddress: form.fullAddress || null,
    }
    try {
      if (isEdit) await updateStaffAccount(staff.uuid, payload)
      else await createStaffAccount({ ...payload, roles: form.roles })
      onSaved()
    } catch {
      // apiFetch toasts the backend message; keep the panel open to retry.
    } finally {
      setSaving(false)
    }
  }

  return (
    <SidePanel
      title={isEdit ? (staff.fullName || 'Sửa hồ sơ nhân sự') : 'Thêm nhân sự'}
      subtitle={isEdit ? staff.code : 'Nhân sự mới'}
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
            form="staff-form"
            disabled={saving}
            className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Đang lưu…' : isEdit ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </>
      }
    >
      <form id="staff-form" onSubmit={handleSubmit}>
        <FieldRow label="Mã nhân sự" required>
          <input
            value={form.code}
            onChange={(e) => set('code', e.target.value)}
            className={`${inputCls} font-mono`}
            disabled={saving}
            required
          />
        </FieldRow>
        <FieldRow label="Họ và tên" required>
          <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className={inputCls} disabled={saving} required />
        </FieldRow>
        <FieldRow label="Giới tính" required>
          <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className={inputCls} disabled={saving}>
            {GENDER_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </FieldRow>
        <FieldRow label="Ngày sinh">
          <DateField value={form.dateOfBirth} onChange={(v) => set('dateOfBirth', v)} disabled={saving} />
        </FieldRow>
        <FieldRow label="Số căn cước công dân">
          <input value={form.citizenIdentityNumber} onChange={(e) => set('citizenIdentityNumber', e.target.value)} className={`${inputCls} font-mono`} disabled={saving} />
        </FieldRow>
        <FieldRow label="Số điện thoại">
          <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={`${inputCls} font-mono`} disabled={saving} />
        </FieldRow>
        <FieldRow label="Email">
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} disabled={saving} />
        </FieldRow>
        <FieldRow label="Địa chỉ">
          <input value={form.fullAddress} onChange={(e) => set('fullAddress', e.target.value)} className={inputCls} disabled={saving} />
        </FieldRow>

        {/* Roles only at creation time — editing roles later has its own modal. */}
        {!isEdit && (
          <FieldRow label="Vai trò">
            <div className="flex flex-wrap gap-3 pt-1.5">
              {ROLE_OPTIONS.map((r) => (
                <label key={r.value} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.roles.includes(r.value)}
                    onChange={() => toggleRole(r.value)}
                    className="accent-blue-600"
                    disabled={saving}
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </FieldRow>
        )}
      </form>
    </SidePanel>
  )
}
