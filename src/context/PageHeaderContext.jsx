import React, { createContext, useContext, useState } from 'react'

// Cầu nối tiêu đề trang ↔ topbar: mỗi trang gọi <PageHeader title=.../> (trong
// content) sẽ ĐẨY title lên topbar qua context này; breadcrumb + actions vẫn render
// ở content. moduleLabel do Layout cung cấp (vd "HIS") để prefix breadcrumb.
const PageHeaderContext = createContext(null)

export function PageHeaderProvider({ moduleLabel, children }) {
  const [title, setTitle] = useState('')
  return (
    <PageHeaderContext.Provider value={{ title, setTitle, moduleLabel }}>
      {children}
    </PageHeaderContext.Provider>
  )
}

// Trả null nếu không có provider (PageHeader vẫn render được, chỉ không đẩy topbar).
export function usePageHeaderCtx() {
  return useContext(PageHeaderContext)
}
