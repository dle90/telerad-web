import React, { useState } from 'react'
import { generateReadingOrderViewerUrl } from '@/api'
import { formatDateTime } from '@/lib/timezone'
import DateField from '@/components/DateField'
import { useReadingPartners, useReadingOrders } from './hooks'
import { statusMeta } from './constants'

// Màn "Ca đọc": cây đối tác (nhóm theo loại chụp) bên trái + danh sách ca đọc bên
// phải. Chọn 1 đối tác hoặc 1 nhóm loại chụp ở cây để lọc; bộ lọc trên cùng lọc
// theo ngày chụp / tên / mã bệnh nhân / SĐT.
export default function ReadingPage() {
  const { groups, loading: treeLoading } = useReadingPartners()
  const list = useReadingOrders()

  return (
    <div className="flex gap-4 h-full">
      <PartnerTree groups={groups} loading={treeLoading} filters={list.filters} setFilters={list.setFilters} />

      <div className="flex-1 min-w-0 space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">Ca đọc</h1>
        <FilterBar list={list} />
        <WorklistTable list={list} />
      </div>
    </div>
  )
}

// ─── Cây đối tác theo loại chụp ───────────────────────────────────────────────

function PartnerTree({ groups, loading, filters, setFilters }) {
  const isAll = !filters.teleradPartnerUuid && !filters.modality

  return (
    <aside className="w-64 shrink-0 bg-white border border-gray-200 rounded-lg overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-100 text-sm font-semibold text-gray-700">
        Đối tác tích hợp
      </div>
      <div className="py-2">
        <button
          onClick={() => setFilters({ teleradPartnerUuid: '', modality: '' })}
          className={`w-full text-left px-4 py-2 text-sm font-medium ${
            isAll ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Toàn bộ
        </button>

        {loading ? (
          <div className="px-4 py-3 text-sm text-gray-400">Đang tải…</div>
        ) : groups.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-400">Chưa có đối tác nào.</div>
        ) : (
          groups.map((g) => <ModalityGroup key={g.modality} group={g} filters={filters} setFilters={setFilters} />)
        )}
      </div>
    </aside>
  )
}

function ModalityGroup({ group, filters, setFilters }) {
  const [open, setOpen] = useState(true)
  const modalityActive = filters.modality === group.modality && !filters.teleradPartnerUuid

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-2 text-sm font-semibold ${
          modalityActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
        }`}
      >
        <button onClick={() => setOpen((v) => !v)} className="w-5 text-gray-400 hover:text-gray-600">
          {open ? '▾' : '▸'}
        </button>
        {/* Click nhãn loại chụp → lọc theo toàn bộ đối tác của loại chụp đó. */}
        <button
          onClick={() => setFilters({ modality: group.modality, teleradPartnerUuid: '' })}
          className="flex-1 text-left hover:text-blue-700"
        >
          {group.modality}
          <span className="ml-1 text-xs font-normal text-gray-400">({group.partners.length})</span>
        </button>
      </div>

      {open &&
        group.partners.map((p) => {
          // Đối tác đang chọn = trùng cả uuid VÀ loại chụp của nhóm (1 đối tác có
          // thể nằm ở nhiều nhóm loại chụp).
          const active = filters.teleradPartnerUuid === p.uuid && filters.modality === group.modality
          return (
            <button
              key={p.uuid}
              onClick={() => setFilters({ teleradPartnerUuid: p.uuid, modality: group.modality })}
              title={p.code}
              className={`w-full text-left pl-9 pr-3 py-1.5 text-sm truncate ${
                active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p.name}
            </button>
          )
        })}
    </div>
  )
}

// ─── Bộ lọc ───────────────────────────────────────────────────────────────────

function FilterBar({ list }) {
  // Draft cục bộ cho ngày + text; commit vào filters khi bấm "Tìm".
  const [draft, setDraft] = useState({
    dateFrom: list.filters.dateFrom,
    dateTo: list.filters.dateTo,
    patientName: list.filters.patientName,
    patientCode: list.filters.patientCode,
    phone: list.filters.phone,
  })
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    list.setFilters({
      dateFrom: draft.dateFrom,
      dateTo: draft.dateTo,
      patientName: draft.patientName.trim(),
      patientCode: draft.patientCode.trim(),
      phone: draft.phone.trim(),
    })
  }

  const inputCls =
    'border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50'

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2 bg-white border border-gray-200 rounded-lg p-3">
      <Field label="Từ ngày chụp">
        <DateField value={draft.dateFrom} onChange={(v) => set('dateFrom', v)} />
      </Field>
      <Field label="Đến ngày chụp">
        <DateField value={draft.dateTo} onChange={(v) => set('dateTo', v)} />
      </Field>
      <Field label="Tên bệnh nhân">
        <input value={draft.patientName} onChange={(e) => set('patientName', e.target.value)} className={`${inputCls} w-48`} />
      </Field>
      <Field label="Mã bệnh nhân">
        <input value={draft.patientCode} onChange={(e) => set('patientCode', e.target.value)} className={`${inputCls} w-36`} />
      </Field>
      <Field label="Số điện thoại">
        <input value={draft.phone} onChange={(e) => set('phone', e.target.value)} className={`${inputCls} w-36`} />
      </Field>
      <button type="submit" className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Tìm
      </button>
    </form>
  )
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      {children}
    </label>
  )
}

// ─── Bảng danh sách ───────────────────────────────────────────────────────────

const HEADERS = [
  'STT',
  'Mã bệnh nhân',
  'Tên bệnh nhân',
  'Đối tác',
  'Dịch vụ',
  'Loại chụp',
  'Ngày chụp',
  'Ngày đọc',
  'Bác sĩ đọc',
  'Trạng thái',
]

function WorklistTable({ list }) {
  // Nhấp đúp 1 ca → sinh URL viewer rồi mở tab mới đọc ảnh. Mở tab trắng NGAY trong
  // cử chỉ (tránh popup blocker), điều hướng sau khi có URL.
  const openViewer = async (readingOrderUuid) => {
    const win = window.open('', '_blank')
    try {
      const url = await generateReadingOrderViewerUrl(readingOrderUuid)
      if (win) {
        win.opener = null
        win.location = url
      } else {
        window.open(url, '_blank')
      }
    } catch {
      // apiFetch đã toast lỗi; đóng tab trắng đã mở.
      if (win) win.close()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.loading ? (
              <tr>
                <td colSpan={HEADERS.length} className="px-4 py-10 text-center text-gray-400">
                  Đang tải…
                </td>
              </tr>
            ) : list.items.length === 0 ? (
              <tr>
                <td colSpan={HEADERS.length} className="px-4 py-10 text-center text-gray-400">
                  Không có ca đọc
                </td>
              </tr>
            ) : (
              list.items.map((r, i) => {
                const s = statusMeta(r.status)
                return (
                  <tr
                    key={r.uuid}
                    onDoubleClick={() => openViewer(r.uuid)}
                    title="Nhấp đúp để mở PACS viewer đọc ca"
                    className="hover:bg-blue-50/40 cursor-pointer select-none"
                  >
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {(list.page - 1) * list.size + i + 1}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{r.patientCode || '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{r.fullName}</td>
                    <td className="px-4 py-3 text-gray-600">{r.partnerName}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{r.serviceName || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.modality || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                      {formatDateTime(r.performEndedAt, { withSeconds: false }) || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                      {r.readCompletedAt ? formatDateTime(r.readCompletedAt, { withSeconds: false }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{r.assignedToName || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-full font-medium ${s.cls}`}>
                        {s.label}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {list.recordCount > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
          <span>Tổng {list.recordCount} ca đọc</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => list.setPage(Math.max(1, list.page - 1))}
              disabled={list.page <= 1}
              className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              Trước
            </button>
            <span>
              Trang {list.page}/{list.pageCount}
            </span>
            <button
              onClick={() => list.setPage(Math.min(list.pageCount, list.page + 1))}
              disabled={list.page >= list.pageCount}
              className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
