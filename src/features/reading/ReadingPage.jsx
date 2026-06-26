import React, { useState, useEffect, useMemo } from 'react'
import { formatDateTime } from '@/lib/timezone'
import DateField from '@/components/DateField'
import { useSelectedPartner } from '@/context/SelectedPartnerContext'
import { useReadingPartners, useReadingOrders } from './hooks'
import { statusMeta, READING_STATUS_OPTIONS, RESULT_RETURNED_OPTIONS } from './constants'
import CaseDetailTab from './CaseDetailTab'
import { Icon } from '@/design-system/icons'

// Màn "Ca đọc": chia tab giống phần mềm cũ. Tab "Danh sách ca" (worklist) luôn mở;
// nhấp đúp 1 ca → mở tab chi tiết ca ngay trong màn (không phải tab trình duyệt).
export default function ReadingPage() {
  const { groups, loading: treeLoading } = useReadingPartners()
  const list = useReadingOrders()

  // Đồng bộ bộ lọc theo "chi nhánh" (đối tác) chọn trên topbar: đổi đối tác trên
  // PartnerSwitcher → lọc toàn bộ danh sách ca theo đối tác đó. Cây trái vẫn
  // dùng để chọn theo modality/đối tác cụ thể (ghi đè cục bộ).
  const { partner } = useSelectedPartner()
  useEffect(() => {
    list.setFilters({ teleradPartnerUuid: partner?.uuid || '', modality: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partner])

  // Cây "Đối tác tích hợp" bên trái cũng lọc theo đối tác chọn trên topbar: chỉ
  // hiện chi nhánh đang chọn (ẩn nhóm modality không có chi nhánh đó). null = tất cả.
  const visibleGroups = useMemo(() => {
    if (!partner?.uuid) return groups
    return groups
      .map((g) => ({ ...g, partners: (g.partners || []).filter((p) => p.uuid === partner.uuid) }))
      .filter((g) => g.partners.length > 0)
  }, [groups, partner])

  // Tab chi tiết đang mở: [{ uuid, label }]. active = 'list' hoặc uuid 1 tab chi tiết.
  const [tabs, setTabs] = useState([])
  const [active, setActive] = useState('list')

  const openDetail = (row) => {
    setTabs((prev) => (prev.some((t) => t.uuid === row.uuid) ? prev : [...prev, { uuid: row.uuid, label: row.fullName }]))
    setActive(row.uuid)
  }
  const closeDetail = (uuid) => {
    setTabs((prev) => prev.filter((t) => t.uuid !== uuid))
    setActive((cur) => (cur === uuid ? 'list' : cur))
  }

  return (
    <div className="flex flex-col h-full">
      <TabBar tabs={tabs} active={active} setActive={setActive} closeDetail={closeDetail} />

      <div className="flex-1 min-h-0 mt-3">
        {/* Tab danh sách: luôn mount, chỉ ẩn khi không active để giữ bộ lọc + vị trí cuộn. */}
        <div className={`h-full ${active === 'list' ? '' : 'hidden'}`}>
          <CaseListTab groups={visibleGroups} treeLoading={treeLoading} list={list} openDetail={openDetail} />
        </div>
        {/* Mỗi tab chi tiết giữ nguyên trạng thái khi chuyển qua lại. */}
        {tabs.map((t) => (
          <div key={t.uuid} className={`h-full ${active === t.uuid ? '' : 'hidden'}`}>
            <CaseDetailTab uuid={t.uuid} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Thanh tab ────────────────────────────────────────────────────────────────

function TabBar({ tabs, active, setActive, closeDetail }) {
  return (
    <div className="flex items-stretch gap-1 border-b border-gray-200 overflow-x-auto">
      <button
        onClick={() => setActive('list')}
        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
          active === 'list' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
      >
        Danh sách ca
      </button>
      {tabs.map((t) => (
        <div
          key={t.uuid}
          className={`flex items-center gap-2 pl-4 pr-2 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
            active === t.uuid ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <button onClick={() => setActive(t.uuid)} className="max-w-[14rem] truncate">
            {t.label}
          </button>
          <button
            onClick={() => closeDetail(t.uuid)}
            className="text-gray-400 hover:text-red-600 rounded px-1"
            title="Đóng tab"
            aria-label="Đóng tab"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Tab danh sách ca (worklist) ──────────────────────────────────────────────

function CaseListTab({ groups, treeLoading, list, openDetail }) {
  return (
    <div className="flex gap-4 h-full">
      <PartnerTree groups={groups} loading={treeLoading} filters={list.filters} setFilters={list.setFilters} />
      <div className="flex-1 min-w-0 space-y-4">
        <FilterBar list={list} />
        <WorklistTable list={list} openDetail={openDetail} />
      </div>
    </div>
  )
}

// ─── Cây đối tác theo loại chụp ───────────────────────────────────────────────

// Cây trái = danh sách LOẠI MÁY (modality). Chi nhánh (đối tác) chọn trên topbar
// nên ở đây KHÔNG hiện chi nhánh con; click loại máy chỉ lọc theo modality, GIỮ
// đối tác đang chọn (teleradPartnerUuid do PartnerSwitcher topbar quản lý).
function PartnerTree({ groups, loading, filters, setFilters }) {
  const noModality = !filters.modality

  return (
    <aside className="w-64 shrink-0 bg-white border border-neutral-200 rounded-xl overflow-y-auto">
      <div className="px-4 py-3 border-b border-neutral-100 t-strong tc-1">Loại máy</div>
      <div className="py-2">
        <button
          onClick={() => setFilters({ modality: '' })}
          className={`w-full text-left px-4 py-2 text-sm font-medium ${
            noModality ? 'bg-primary-50 text-primary-700' : 'tc-2 hover:bg-neutral-50'
          }`}
        >
          Toàn bộ
        </button>

        {loading ? (
          <div className="px-4 py-3 text-sm tc-4">Đang tải…</div>
        ) : groups.length === 0 ? (
          <div className="px-4 py-3 text-sm tc-4">Chưa có loại máy nào.</div>
        ) : (
          groups.map((g) => {
            const active = filters.modality === g.modality
            return (
              <button
                key={g.modality}
                onClick={() => setFilters({ modality: g.modality })}
                className={`w-full text-left px-4 py-2 text-sm ${
                  active ? 'bg-primary-50 text-primary-700 font-medium' : 'tc-2 hover:bg-neutral-50'
                }`}
              >
                {g.modality}
              </button>
            )
          })
        )}
      </div>
    </aside>
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
    status: list.filters.status,
    resultReturned: list.filters.resultReturned,
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
      status: draft.status,
      resultReturned: draft.resultReturned,
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
      <Field label="Tình trạng ca">
        <select value={draft.status} onChange={(e) => set('status', e.target.value)} className={`${inputCls} w-44`}>
          <option value="">Tất cả</option>
          {READING_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Trả kết quả">
        <select
          value={draft.resultReturned}
          onChange={(e) => set('resultReturned', e.target.value)}
          className={`${inputCls} w-32`}
        >
          <option value="">Tất cả</option>
          {RESULT_RETURNED_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
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
  'Ngày chụp',
  'Ngày đọc',
  'Bác sĩ đọc',
  'Trạng thái',
  'Trả KQ',
]

function WorklistTable({ list, openDetail }) {
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
                    onDoubleClick={() => openDetail(r)}
                    title="Nhấp đúp để mở chi tiết ca"
                    className="hover:bg-blue-50/40 cursor-pointer select-none"
                  >
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {(list.page - 1) * list.size + i + 1}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{r.patientCode || '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{r.fullName}</td>
                    <td className="px-4 py-3 text-gray-600">{r.partnerName}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{r.serviceName || '—'}</td>
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
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          r.resultReturned ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {r.resultReturned ? 'Đã trả' : 'Chưa trả'}
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
