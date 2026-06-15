import React, { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import { getStaffAccount, assignReadingPermission } from '@/api'
import { MODALITY_OPTIONS } from '../constants'

// Assign reading permission: which modalities the staff may read + which telerad
// partners' studies they may read. The list row doesn't carry teleradPartnerUuids,
// so we fetch the full staff record on open to pre-tick the current selection.
export default function ReadingPermissionModal({ staff, partnerOptions, onClose, onSaved }) {
  const [modalities, setModalities] = useState([])
  const [partnerUuids, setPartnerUuids] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    getStaffAccount(staff.uuid)
      .then((detail) => {
        if (cancelled || !detail) return
        setModalities(detail.modalities || [])
        setPartnerUuids(detail.teleradPartnerUuids || [])
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [staff.uuid])

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

  const handleSave = async () => {
    setSaving(true)
    try {
      await assignReadingPermission(staff.uuid, {
        modalities,
        teleradPartnerUuids: partnerUuids,
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
      title="Phân quyền đọc phim"
      subtitle={staff.fullName}
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
            onClick={handleSave}
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
        <div className="space-y-5">
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Loại chụp được phép đọc</div>
            <div className="flex flex-wrap gap-3">
              {MODALITY_OPTIONS.map((m) => (
                <label key={m.value} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={modalities.includes(m.value)}
                    onChange={() => toggle(modalities, setModalities, m.value)}
                    className="accent-blue-600"
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Đối tác được đọc phim</div>
            {partnerOptions.length === 0 ? (
              <div className="text-sm text-gray-400">Chưa có đối tác nào.</div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {partnerOptions.map((p) => (
                  <label
                    key={p.uuid}
                    className="flex items-center gap-2 text-sm text-gray-700 border border-gray-100 rounded-lg px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={partnerUuids.includes(p.uuid)}
                      onChange={() => toggle(partnerUuids, setPartnerUuids, p.uuid)}
                      className="accent-blue-600"
                    />
                    <span className="flex-1">
                      {p.name} <span className="text-gray-400">({p.code})</span>
                    </span>
                    {!p.isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        Ngừng
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
