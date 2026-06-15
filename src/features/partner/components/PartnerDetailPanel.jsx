import React from 'react'
import SidePanel from '@/components/SidePanel'
import FieldRow from '@/components/FieldRow'
import ReadOnlyText from '@/components/ReadOnlyText'
import { formatDateTime } from '@/lib/timezone'
import { MODALITY_OPTIONS, labelOf } from '../constants'

// Read-only detail drawer for a telerad partner (mirrors his-web's "view detail
// → Sửa" flow). `partner` is the full record fetched by the page. The partner-side
// password is NOT shown here — it lives in the dedicated callback-config modal.
export default function PartnerDetailPanel({ partner, onClose, onEdit }) {
  return (
    <SidePanel
      title={partner.name || 'Chi tiết đối tác'}
      subtitle={partner.code}
      onClose={onClose}
      size="lg"
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
      <FieldRow label="Mã đối tác">
        <ReadOnlyText value={partner.code} />
      </FieldRow>
      <FieldRow label="Tên đối tác">
        <ReadOnlyText value={partner.name} />
      </FieldRow>
      <FieldRow label="Tài khoản (phía telerad)">
        <span className="font-mono text-sm text-gray-800">{partner.username || '—'}</span>
      </FieldRow>
      <FieldRow label="Thông tin liên hệ">
        <ReadOnlyText value={partner.contact} />
      </FieldRow>
      <FieldRow label="Loại chụp cung cấp">
        <ReadOnlyText
          value={(partner.modalities || []).map((m) => labelOf(MODALITY_OPTIONS, m)).join(', ')}
        />
      </FieldRow>
      <FieldRow label="Callback">
        <div className="py-0.5">
          {partner.callback ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700">
              Bật
            </span>
          ) : (
            <span className="text-sm text-gray-400">Tắt</span>
          )}
        </div>
      </FieldRow>
      {partner.callback && (
        <>
          <FieldRow label="Callback URL">
            <ReadOnlyText value={partner.callbackUrl} />
          </FieldRow>
          <FieldRow label="Tên đăng nhập phía đối tác">
            <span className="font-mono text-sm text-gray-800">{partner.partnerUsername || '—'}</span>
          </FieldRow>
        </>
      )}
      <FieldRow label="Trạng thái">
        <div className="py-0.5">
          {partner.isActive ? (
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
        <ReadOnlyText value={formatDateTime(partner.createdAt)} />
      </FieldRow>
    </SidePanel>
  )
}
