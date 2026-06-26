import React, { useState } from 'react'
import {
  getStaffAccount,
  activateStaffAccount,
  deactivateStaffAccount,
  resetStaffPassword,
} from '@/api'
import { useStaffList, useTeleradPartnerOptions } from './hooks'
import { GENDER_OPTIONS, MODALITY_OPTIONS, labelOf } from './constants'
import StaffDetailPanel from './components/StaffDetailPanel'
import StaffFormPanel from './components/StaffFormPanel'
import CreateAccountModal from './components/CreateAccountModal'
import CredentialResultModal from './components/CredentialResultModal'
import ReadingPermissionModal from './components/ReadingPermissionModal'
import RolesModal from './components/RolesModal'
import { Icon } from '@/design-system/icons'

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'true', label: 'Đang hoạt động' },
  { value: 'false', label: 'Ngừng hoạt động' },
]

export default function StaffPage() {
  const list = useStaffList()
  const partnerOptions = useTeleradPartnerOptions()

  // Detail (read-only) and edit (form) drawers are their own state, mirroring
  // his-web's "view detail → Sửa → Cập nhật" flow. `modal` drives the secondary
  // dialogs (reading-permission, roles, create-account).
  const [viewing, setViewing] = useState(null) // full fetched record for detail
  const [editing, setEditing] = useState(null) // null=closed, {}=new, record=edit
  const [modal, setModal] = useState(null)
  const [credential, setCredential] = useState(null) // reset-password result
  const [searchInput, setSearchInput] = useState('')

  const closeModal = () => setModal(null)
  const afterModal = () => {
    closeModal()
    list.reload()
  }

  // Open the read-only detail drawer with a freshly-fetched full record (the
  // list row lacks fields like dateOfBirth/email/address).
  const openDetail = async (row) => {
    try {
      const detail = await getStaffAccount(row.uuid)
      setViewing(detail || row)
    } catch {
      setViewing(row)
    }
  }

  const afterSave = () => {
    setEditing(null)
    setViewing(null)
    list.reload()
  }

  const submitSearch = (e) => {
    e.preventDefault()
    list.setPage(1)
    list.setSearch(searchInput.trim())
  }

  const handleToggleActive = async (staff) => {
    try {
      if (staff.isActive) await deactivateStaffAccount(staff.uuid)
      else await activateStaffAccount(staff.uuid)
      list.reload()
    } catch {
      // apiFetch toasts the error.
    }
  }

  const handleResetPassword = async (staff) => {
    try {
      const result = await resetStaffPassword(staff.uuid)
      setCredential(result)
    } catch {
      // apiFetch toasts the error.
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Quản lý nhân sự</h1>
        <button
          onClick={() => setEditing({})}
          className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Thêm nhân sự
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={submitSearch} className="flex items-center gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo mã, tên, số điện thoại…"
            className="w-72 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
          />
          <button
            type="submit"
            className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Tìm
          </button>
        </form>
        <select
          value={String(list.isActive)}
          onChange={(e) => {
            list.setPage(1)
            list.setIsActive(e.target.value === '' ? '' : e.target.value === 'true')
          }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Mã', 'Họ và tên', 'Giới tính', 'Số điện thoại', 'Tài khoản', 'Vai trò', 'Loại chụp', 'Trạng thái', 'Thao tác'].map(
                  (h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap ${
                        h === 'Thao tác' ? 'text-center' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                    Đang tải…
                  </td>
                </tr>
              ) : list.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                list.items.map((s) => (
                  <tr key={s.uuid} className="hover:bg-blue-50/40">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{s.code}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{s.fullName}</td>
                    <td className="px-4 py-3 text-gray-600">{labelOf(GENDER_OPTIONS, s.gender)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.phone || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {s.hasAccount ? (
                        <span className="font-mono text-xs text-gray-700">{s.username}</span>
                      ) : (
                        <span className="text-xs text-gray-400">Chưa cấp</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {(s.roles || []).length ? s.roles.join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {(s.modalities || []).length
                        ? s.modalities.map((m) => labelOf(MODALITY_OPTIONS, m)).join(', ')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {s.isActive ? (
                        <span className="inline-flex text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700">
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
                          Ngừng
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-3 text-sm">
                        <button
                          onClick={() => openDetail(s)}
                          title="Xem chi tiết"
                          aria-label="Xem chi tiết"
                          className="text-gray-500 hover:text-blue-600"
                        >
                          <Icon name="eye" size={14} />
                        </button>
                        <button
                          onClick={() => setModal({ type: 'reading-permission', staff: s })}
                          title="Phân quyền đọc phim"
                          aria-label="Phân quyền đọc phim"
                          className="text-gray-500 hover:text-blue-600"
                        >
                          <Icon name="shield" size={14} />
                        </button>
                        <button
                          onClick={() => setModal({ type: 'roles', staff: s })}
                          title="Phân vai trò"
                          aria-label="Phân vai trò"
                          className="text-gray-500 hover:text-blue-600"
                        >
                          <Icon name="tag" size={14} />
                        </button>
                        {s.hasAccount ? (
                          <button
                            onClick={() => handleResetPassword(s)}
                            title="Đặt lại mật khẩu"
                            aria-label="Đặt lại mật khẩu"
                            className="text-gray-500 hover:text-orange-600"
                          >
                            <Icon name="refresh" size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => setModal({ type: 'create-account', staff: s })}
                            title="Cấp tài khoản"
                            aria-label="Cấp tài khoản"
                            className="text-gray-500 hover:text-blue-600"
                          >
                            <Icon name="unlock" size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleActive(s)}
                          title={s.isActive ? 'Ngừng hoạt động' : 'Kích hoạt'}
                          aria-label={s.isActive ? 'Ngừng hoạt động' : 'Kích hoạt'}
                          className={s.isActive ? 'text-gray-500 hover:text-red-600' : 'text-gray-500 hover:text-emerald-600'}
                        >
                          {s.isActive ? <Icon name="x-circle" size={14} /> : <Icon name="check-circle" size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination list={list} />
      </div>

      {/* Detail (read-only) drawer → Sửa switches to the edit form drawer. */}
      {viewing && (
        <StaffDetailPanel
          staff={viewing}
          partnerOptions={partnerOptions}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setEditing(viewing)
            setViewing(null)
          }}
        />
      )}

      {/* Create / edit form drawer. Cancelling an edit returns to its detail. */}
      {editing && (
        <StaffFormPanel
          staff={editing}
          onClose={() => {
            if (editing.uuid) setViewing(editing)
            setEditing(null)
          }}
          onSaved={afterSave}
        />
      )}

      {/* Secondary modals */}
      {modal?.type === 'create-account' && (
        <CreateAccountModal staff={modal.staff} onClose={closeModal} onDone={list.reload} />
      )}
      {modal?.type === 'reading-permission' && (
        <ReadingPermissionModal
          staff={modal.staff}
          partnerOptions={partnerOptions}
          onClose={closeModal}
          onSaved={afterModal}
        />
      )}
      {modal?.type === 'roles' && (
        <RolesModal staff={modal.staff} onClose={closeModal} onSaved={afterModal} />
      )}
      {credential && (
        <CredentialResultModal
          title="Đã đặt lại mật khẩu"
          credential={credential}
          onClose={() => {
            setCredential(null)
            list.reload()
          }}
        />
      )}
    </div>
  )
}

function Pagination({ list }) {
  if (list.recordCount === 0) return null
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
      <span>Tổng {list.recordCount} nhân sự</span>
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
  )
}
