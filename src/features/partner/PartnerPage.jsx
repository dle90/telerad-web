import React, { useState } from 'react'
import { activateTeleradPartner, deactivateTeleradPartner } from '@/api'
import { usePartnerList } from './hooks'
import { MODALITY_OPTIONS, labelOf } from './constants'
import PartnerFormPanel from './components/PartnerFormPanel'
import PartnerConfigModal from './components/PartnerConfigModal'
import ChangePasswordModal from './components/ChangePasswordModal'

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'true', label: 'Đang hoạt động' },
  { value: 'false', label: 'Ngừng hoạt động' },
]

export default function PartnerPage() {
  const list = usePartnerList()
  const [modal, setModal] = useState(null) // { type, partner }
  const [searchInput, setSearchInput] = useState('')

  const closeModal = () => setModal(null)
  const afterChange = () => {
    closeModal()
    list.reload()
  }

  const submitSearch = (e) => {
    e.preventDefault()
    list.setPage(1)
    list.setSearch(searchInput.trim())
  }

  const handleToggleActive = async (partner) => {
    try {
      if (partner.isActive) await deactivateTeleradPartner(partner.uuid)
      else await activateTeleradPartner(partner.uuid)
      list.reload()
    } catch {
      // apiFetch toasts the error.
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Đối tác tích hợp</h1>
        <button
          onClick={() => setModal({ type: 'form', partner: null })}
          className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Thêm đối tác
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={submitSearch} className="flex items-center gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo mã, tên…"
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
                {['Mã', 'Tên đối tác', 'Tài khoản', 'Liên hệ', 'Loại chụp', 'Callback', 'Trạng thái', 'Thao tác'].map(
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
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                    Đang tải…
                  </td>
                </tr>
              ) : list.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                list.items.map((p) => (
                  <tr key={p.uuid} className="hover:bg-blue-50/40">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{p.code}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{p.username}</td>
                    <td className="px-4 py-3 text-gray-600">{p.contact || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {(p.modalities || []).length
                        ? p.modalities.map((m) => labelOf(MODALITY_OPTIONS, m)).join(', ')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.callback ? (
                        <span className="inline-flex text-[10px] px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700">
                          Bật
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Tắt</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.isActive ? (
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
                          onClick={() => setModal({ type: 'form', partner: p })}
                          title="Sửa thông tin"
                          aria-label="Sửa thông tin"
                          className="text-gray-500 hover:text-blue-600"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setModal({ type: 'config', partner: p })}
                          title="Cấu hình callback"
                          aria-label="Cấu hình callback"
                          className="text-gray-500 hover:text-blue-600"
                        >
                          🔗
                        </button>
                        <button
                          onClick={() => setModal({ type: 'change-password', partner: p })}
                          title="Đổi mật khẩu"
                          aria-label="Đổi mật khẩu"
                          className="text-gray-500 hover:text-orange-600"
                        >
                          🔑
                        </button>
                        <button
                          onClick={() => handleToggleActive(p)}
                          title={p.isActive ? 'Ngừng hoạt động' : 'Kích hoạt'}
                          aria-label={p.isActive ? 'Ngừng hoạt động' : 'Kích hoạt'}
                          className={p.isActive ? 'text-gray-500 hover:text-red-600' : 'text-gray-500 hover:text-emerald-600'}
                        >
                          {p.isActive ? '🚫' : '✅'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination list={list} />
      </div>

      {/* Modals */}
      {modal?.type === 'form' && (
        <PartnerFormPanel partner={modal.partner} onClose={closeModal} onSaved={afterChange} />
      )}
      {modal?.type === 'config' && (
        <PartnerConfigModal partner={modal.partner} onClose={closeModal} onSaved={afterChange} />
      )}
      {modal?.type === 'change-password' && (
        <ChangePasswordModal partner={modal.partner} onClose={closeModal} onSaved={afterChange} />
      )}
    </div>
  )
}

function Pagination({ list }) {
  if (list.recordCount === 0) return null
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
      <span>Tổng {list.recordCount} đối tác</span>
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
