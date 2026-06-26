import React, { createContext, useContext, useState } from 'react'

// "Chi nhánh" trên telerad = đối tác tích hợp (teleradPartner). Topbar
// PartnerSwitcher chọn 1 đối tác → lưu ở đây; các trang (Ca đọc) lọc theo.
// Telerad đơn-schema nên KHÔNG có header Facility-Uuid — đây thuần là bộ lọc
// toàn cục ở client. null = "Tất cả đối tác".
const Ctx = createContext(null)
const KEY = 'telerad_selected_partner'

export function SelectedPartnerProvider({ children }) {
  const [partner, setPartner] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null') } catch { return null }
  })
  const choose = (p) => {
    setPartner(p)
    try { localStorage.setItem(KEY, JSON.stringify(p)) } catch {}
  }
  return <Ctx.Provider value={{ partner, choose }}>{children}</Ctx.Provider>
}

export function useSelectedPartner() {
  return useContext(Ctx) || { partner: null, choose: () => {} }
}
