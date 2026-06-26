import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '@/design-system/icons'

// ============================================================================
// PrintModal — modal in/xem trước A4 DÙNG CHUNG (paged.js client-side).
// Quy ước mẫu phiếu: xem telerad-web/docs/mau-phieu-ket-qua.md
//
// Props:
//   title         tiêu đề thanh trên (mặc định "In")
//   templateHtml  HTML mẫu phiếu (kèm <style>, token {{...}})
//   data          map token { key: value } -> thay {{key}}. Nếu phiếu có danh sách thì
//                 caller TỰ dựng HTML các dòng rồi để vào data (vd data.rows = "<tr>..</tr>.."),
//                 template đặt {{rows}} ở chỗ cần (giá trị có thể là chuỗi HTML).
//   fields        KHAI BÁO field sửa nhanh cho VÙNG "Thông tin" (panel phải) — THAY ĐỔI THEO
//                 TỪNG MẪU PHIẾU. Mỗi field: { key, label, type, ... }. type:
//                   'text'   -> ô nhập
//                   'number' -> ô số + nút +/- (step, mặc định 1)
//                   'radio'  -> chọn 1 (options: ['Nam','Nữ'])
//                   'group'  -> { type:'group', fields:[...] } xếp 2 cột cạnh nhau
//                 key = tên token; giá trị sửa GHI ĐÈ lên data khi fill. Bỏ trống / [] -> KHÔNG
//                 có panel (phiếu không cần sửa). PrintModal tự quản state sửa + gộp vào data.
//   infoTitle     tiêu đề panel (mặc định "Thông tin")
//   aside         (escape hatch) node panel tự dựng — dùng khi panel quá đặc thù, fields không tả nổi.
//                 Nếu có fields thì fields được ưu tiên.
//   placeholder   thông báo khi chưa có nội dung (đang tải / chưa cấu hình)
//   onClose       đóng modal
//
// Cơ chế (đã kiểm chứng, chi tiết trong doc):
//  - position:fixed header/footer -> override sang running header/footer cho paged.js.
//  - Lề KHÔNG hardcode: derivePrintGeometry đọc @page margin + .page-body padding của template.
//  - Polyfill nạp bằng <script src> trong <head>; iframe chạy qua BLOB URL (cùng origin).
//  - Nền xem trước inject SAU khi paged.js xong (PagedConfig.after).
// ============================================================================

// Thay {{token}} bằng giá trị (split/join để không dính ký tự $ trong chuỗi thay thế).
// Giá trị có thể là chuỗi HTML (vd danh sách dòng do caller dựng sẵn) -> chèn nguyên văn.
const fillTokens = (html, map) => {
  let out = html
  for (const [k, v] of Object.entries(map || {})) out = out.split(`{{${k}}}`).join(v ?? '')
  return out
}

const ORIGIN = window.location.origin

// ---- Auto-derive hình học bản in từ chính template (không hardcode) ----
const toMm = (numStr, unit) => {
  const n = parseFloat(numStr)
  if (Number.isNaN(n)) return null
  switch ((unit || 'mm').toLowerCase()) {
    case 'cm': return n * 10
    case 'in': return n * 25.4
    case 'px': return (n * 25.4) / 96
    case 'pt': return (n * 25.4) / 72
    default: return n
  }
}
const parseBox = (value) => {
  const parts = String(value).trim().split(/\s+/)
    .map((p) => { const m = p.match(/^([\d.]+)([a-z%]*)$/i); return m ? toMm(m[1], m[2]) : null })
    .filter((v) => v != null)
  if (!parts.length) return null
  if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] }
  if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] }
  if (parts.length === 3) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] }
  return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] }
}
const blockBody = (css, selectorRe) => { const m = css.match(selectorRe); return m ? m[1] : '' }
const derivePrintGeometry = (html) => {
  const g = { mTop: 5, mBottom: 5, mSide: 8, pTop: 29, pBottom: 36 }
  try {
    const pageBody = blockBody(html, /@page\b[^{]*\{([^}]*)\}/i)
    const pm = pageBody.match(/(?:^|[;{\s])margin\s*:\s*([^;]+)/i)
    if (pm) { const b = parseBox(pm[1]); if (b) { g.mTop = b.top; g.mBottom = b.bottom; g.mSide = b.left } }
    const body = blockBody(html, /\.page-body\s*\{([^}]*)\}/i)
    const pad = body.match(/(?:^|[;{\s])padding\s*:\s*([^;]+)/i)
    if (pad) { const b = parseBox(pad[1]); if (b) { g.pTop = b.top; g.pBottom = b.bottom } }
    const pt = body.match(/padding-top\s*:\s*([\d.]+)([a-z%]*)/i)
    if (pt) { const v = toMm(pt[1], pt[2]); if (v != null) g.pTop = v }
    const pb = body.match(/padding-bottom\s*:\s*([\d.]+)([a-z%]*)/i)
    if (pb) { const v = toMm(pb[1], pb[2]); if (v != null) g.pBottom = v }
  } catch { /* giữ fallback */ }
  return {
    top: g.mTop + g.pTop,
    bottom: g.mBottom + g.pBottom,
    side: g.mSide,
    headerInset: g.mTop,
    footerInset: g.mBottom,
    contentWidth: Math.max(0, 210 - 2 * g.mSide),
  }
}
const buildOverrideCss = (geo) =>
  `<style>` +
  `.page-header{position:running(rhead) !important;width:${geo.contentWidth}mm;margin:${geo.headerInset}mm auto 0;}` +
  `.page-footer{position:running(rfoot) !important;width:${geo.contentWidth}mm;margin:0 auto ${geo.footerInset}mm;}` +
  `.page-body{padding:0 !important;}` +
  `@page{size:A4;margin:${geo.top}mm ${geo.side}mm ${geo.bottom}mm ${geo.side}mm;` +
  `@top-center{content:element(rhead);}@bottom-center{content:element(rfoot);}}` +
  `</style>`
const PAGED_SCRIPTS =
  `<script>window.PagedConfig={auto:true,after:function(){try{` +
  `var s=document.createElement('style');` +
  `s.textContent='@media screen{html,body{background:#3f3f46;margin:0}.pagedjs_pages{padding:12px 0}.pagedjs_page{background:#fff;margin:0 auto 12px;box-shadow:0 0 8px rgba(0,0,0,.5)}}';` +
  `document.head.appendChild(s);` +
  `parent.postMessage({__paged:true,h:document.documentElement.scrollHeight},'*')` +
  `}catch(e){}}};</script>` +
  `<script src="${ORIGIN}/vendor/paged.polyfill.js"></script>`

// Nhúng override (suy từ template) + scripts paged.js vào <head>.
const buildHtml = (html) => {
  const headInject = buildOverrideCss(derivePrintGeometry(html)) + PAGED_SCRIPTS
  if (html.includes('</head>')) return html.replace('</head>', `${headInject}</head>`)
  return headInject + html
}

const round1 = (n) => Math.round(n * 10) / 10
const FIELD_INPUT = 'w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400'
const FIELD_BTN = 'px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50'

// 1 field trong vùng "Thông tin" (text / number / radio). value đã resolve, onChange(newValue).
function PrintField({ field, value, onChange }) {
  if (field.type === 'radio') {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
        <div className="flex items-center gap-3 text-sm pt-1">
          {(field.options || []).map((opt) => (
            <label key={opt} className="flex items-center gap-1">
              <input type="radio" checked={value === opt} onChange={() => onChange(opt)} /> {opt}
            </label>
          ))}
        </div>
      </div>
    )
  }
  if (field.type === 'number') {
    const step = field.step || 1
    return (
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
        <div className="flex items-center gap-1">
          <input type="number" step={step} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={FIELD_INPUT} />
          <button type="button" onClick={() => onChange(round1(Number(value || 0) + step))} className={FIELD_BTN}>+</button>
          <button type="button" onClick={() => onChange(round1(Number(value || 0) - step))} className={FIELD_BTN}>−</button>
        </div>
      </div>
    )
  }
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
      <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={FIELD_INPUT} />
    </div>
  )
}

export default function PrintModal({
  title = 'In',
  templateHtml = '',
  data,
  fields,
  infoTitle = 'Thông tin',
  aside = null,
  placeholder = 'Đang dựng bản in…',
  onClose,
}) {
  const [blobUrl, setBlobUrl] = useState('')
  const [previewHeight, setPreviewHeight] = useState(1200)
  const [edits, setEdits] = useState({}) // chỉ chứa field user đã sửa; còn lại fallback về data
  const iframeRef = useRef(null)

  // paged.js báo tổng chiều cao mọi trang -> fit iframe để cuộn xem hết.
  useEffect(() => {
    const onMsg = (e) => {
      if (e.data && e.data.__paged && typeof e.data.h === 'number') setPreviewHeight(e.data.h + 24)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  const valueOf = (key) => (edits[key] !== undefined ? edits[key] : (data?.[key] ?? ''))
  const setField = (key, v) => setEdits((p) => ({ ...p, [key]: v }))

  // Gộp sửa (edits) đè lên data rồi fill token. data có thể chứa cả chuỗi HTML danh sách.
  const fillData = useMemo(() => ({ ...(data || {}), ...edits }), [data, edits])
  const filledHtml = useMemo(() => (templateHtml ? fillTokens(templateHtml, fillData) : ''), [templateHtml, fillData])

  // Dựng tài liệu iframe qua BLOB URL (debounce để sửa field không chạy lại paged.js mỗi phím gõ).
  useEffect(() => {
    if (!filledHtml) { setBlobUrl(''); return }
    let url
    const t = setTimeout(() => {
      const blob = new Blob([buildHtml(filledHtml)], { type: 'text/html' })
      url = URL.createObjectURL(blob)
      setBlobUrl(url)
    }, 350)
    return () => { clearTimeout(t); if (url) URL.revokeObjectURL(url) }
  }, [filledHtml])

  const doPrint = () => {
    const w = iframeRef.current?.contentWindow
    if (w) { w.focus(); w.print() }
  }

  const hasFields = Array.isArray(fields) && fields.length > 0
  const hasPanel = hasFields || aside != null

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-gray-800">
      <div className="h-11 shrink-0 flex items-center justify-between px-4 bg-gray-900 text-gray-100">
        <span className="text-sm font-semibold">{title}</span>
        {onClose && (
          <button onClick={onClose} className="text-gray-300 hover:text-white text-lg leading-none" aria-label="Đóng"><Icon name="x" size={18} /></button>
        )}
      </div>

      <div className="flex-1 min-h-0 flex">
        <div className="flex-1 min-w-0 overflow-auto">
          {blobUrl ? (
            <iframe
              ref={iframeRef}
              title="preview"
              src={blobUrl}
              scrolling="no"
              className="block w-full"
              style={{ height: `${previewHeight}px`, border: 'none' }}
            />
          ) : (
            <div className="text-gray-300 mt-10 text-center">{placeholder}</div>
          )}
        </div>

        {hasPanel && (
          <div className="w-80 shrink-0 bg-white border-l border-gray-200 flex flex-col">
            {hasFields ? (
              <>
                <div className="px-4 py-3 border-b border-gray-100 text-sm font-semibold text-gray-700">{infoTitle}</div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {fields.map((field, i) =>
                    field.type === 'group' ? (
                      <div key={i} className="grid grid-cols-2 gap-3">
                        {(field.fields || []).map((f) => (
                          <PrintField key={f.key} field={f} value={valueOf(f.key)} onChange={(v) => setField(f.key, v)} />
                        ))}
                      </div>
                    ) : (
                      <PrintField key={field.key || i} field={field} value={valueOf(field.key)} onChange={(v) => setField(field.key, v)} />
                    )
                  )}
                </div>
              </>
            ) : (
              aside
            )}
            <div className="border-t border-gray-200 p-3 flex items-center justify-end gap-2">
              <button onClick={doPrint} disabled={!blobUrl} className="px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">In</button>
              {onClose && (
                <button onClick={onClose} className="px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Đóng</button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Không có panel -> thanh nút nổi góc dưới phải */}
      {!hasPanel && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button onClick={doPrint} disabled={!blobUrl} className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow disabled:opacity-50">In</button>
          {onClose && (
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-white text-gray-700 rounded-lg hover:bg-gray-100 shadow">Đóng</button>
          )}
        </div>
      )}
    </div>
  )
}
