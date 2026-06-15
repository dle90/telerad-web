import React from 'react'
import SidePanel from '@/components/SidePanel'
import FieldRow from '@/components/FieldRow'
import ReadOnlyText from '@/components/ReadOnlyText'
import { formatDateTime } from '@/lib/timezone'
import { GENDER_OPTIONS, MODALITY_OPTIONS, ROLE_OPTIONS, labelOf } from '../constants'

// Read-only detail drawer for a staff member (mirrors his-web's "view detail →
// Sửa" flow). `staff` is the full record fetched by the page; `onEdit` switches
// to the edit form drawer. partnerOptions maps teleradPartnerUuids -> names.
export default function StaffDetailPanel({ staff, partnerOptions = [], onClose, onEdit }) {
  const partnerNames = (staff.teleradPartnerUuids || [])
    .map((id) => partnerOptions.find((p) => p.uuid === id)?.name || id)

  return (
    <SidePanel
      title={staff.fullName || 'Chi tiết nhân sự'}
      subtitle={staff.code}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Đóng
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sửa
          </button>
        </>
      }
    >
      <FieldRow label="Mã nhân sự">
        <ReadOnlyText value={staff.code} />
      </FieldRow>
      <FieldRow label="Họ và tên">
        <ReadOnlyText value={staff.fullName} />
      </FieldRow>
      <FieldRow label="Giới tính">
        <ReadOnlyText value={labelOf(GENDER_OPTIONS, staff.gender)} />
      </FieldRow>
      <FieldRow label="Ngày sinh">
        <ReadOnlyText value={staff.dateOfBirth} />
      </FieldRow>
      <FieldRow label="Số căn cước công dân">
        <ReadOnlyText value={staff.citizenIdentityNumber} />
      </FieldRow>
      <FieldRow label="Số điện thoại">
        <ReadOnlyText value={staff.phone} />
      </FieldRow>
      <FieldRow label="Email">
        <ReadOnlyText value={staff.email} />
      </FieldRow>
      <FieldRow label="Địa chỉ">
        <ReadOnlyText value={staff.fullAddress} />
      </FieldRow>
      <FieldRow label="Tài khoản">
        {staff.username ? (
          <span className="font-mono text-sm text-gray-800">{staff.username}</span>
        ) : (
          <span className="text-sm text-gray-400">Chưa cấp</span>
        )}
      </FieldRow>
      <FieldRow label="Vai trò">
        <ReadOnlyText
          value={(staff.roles || []).map((r) => labelOf(ROLE_OPTIONS, r)).join(', ')}
        />
      </FieldRow>
      <FieldRow label="Loại chụp được đọc">
        <ReadOnlyText
          value={(staff.modalities || []).map((m) => labelOf(MODALITY_OPTIONS, m)).join(', ')}
        />
      </FieldRow>
      <FieldRow label="Đối tác được đọc">
        {partnerNames.length === 0 ? (
          <span className="text-sm text-gray-400">—</span>
        ) : (
          <div className="flex flex-wrap gap-1 py-0.5">
            {partnerNames.map((name, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                {name}
              </span>
            ))}
          </div>
        )}
      </FieldRow>
      <FieldRow label="Trạng thái">
        <div className="py-0.5">
          {staff.isActive ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700">
              Đang hoạt động
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
              Ngừng
            </span>
          )}
        </div>
      </FieldRow>
      <FieldRow label="Tạo lúc">
        <ReadOnlyText value={formatDateTime(staff.createdAt)} />
      </FieldRow>
    </SidePanel>
  )
}
