import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '@/design-system/icons'

// ============================================================================
// PrintModal — modal in/xem trước A4 DÙNG CHUNG (paged.js client-side).
// Quy ước mẫu phiếu: xem telerad-web/docs/mau-phieu-ket-qua.md
//
// Props:
//   title         tiêu đề thanh trên (mặc định "In")
//   templateHtml  HTML mẫu phiếu (kèm <style>, token {{...}})
//   data          map token { key: value } -> thay {{key}} (giá trị vô hướng). Phiếu có DANH SÁCH:
//                 để data[listName] = MẢNG object; template khai báo <table data-list="listName">
//                 + 1 <tr> mẫu, ô dùng {{$field}} -> PrintModal tự nhân bản dòng (xem §5 doc).
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

// Thay {{token}} bằng giá trị vô hướng (split/join để không dính ký tự $ trong chuỗi thay thế).
// Giá trị MẢNG / OBJECT KHÔNG thay ở đây — do expandLists ([data-list]) xử lý.
const fillTokens = (html, map) => {
  let out = html
  for (const [k, v] of Object.entries(map || {})) {
    if (v != null && typeof v === 'object') continue
    out = out.split(`{{${k}}}`).join(v ?? '')
  }
  return out
}

// ===== Danh sách / bảng LẶP DÒNG (khai báo, không cần backend dựng HTML) =====
// Template:  <table data-list="serviceRows"> ... <tbody><tr><td>{{$stt}}</td>...</tr></tbody>
//   - data-list="<listName>"  : tên mảng trong data (data[listName] = MẢNG object)
//   - {{$field}}              : field của TỪNG phần tử mảng (tiền tố $ -> phân biệt {{field}} của body)
// PrintModal nhân bản nội dung <tbody> (vùng mẫu) cho mỗi phần tử. host KHÔNG phải <table> thì
// dùng chính host làm vùng mẫu (lặp các phần tử con) — tái dùng cho list không phải bảng.
// data[listName] KHÔNG phải mảng (vd "In thử" chưa có dữ liệu) -> GIỮ NGUYÊN mẫu (hiện {{$field}}).
const ITEM_TOKEN = /\{\{\s*\$([\w.-]+)\s*\}\}/g
const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const getField = (item, path) => {
  if (item == null) return undefined
  if (Object.prototype.hasOwnProperty.call(item, path)) return item[path]
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), item)
}
const fillItemTokens = (tplHtml, item) =>
  tplHtml.replace(ITEM_TOKEN, (_, f) => { const v = getField(item, f); return v == null ? '' : escapeHtml(v) })
const expandLists = (html, data) => {
  if (!html || html.indexOf('data-list') === -1) return html
  let doc
  try { doc = new DOMParser().parseFromString(html, 'text/html') } catch { return html }
  const hosts = doc.querySelectorAll('[data-list]')
  if (!hosts.length) return html
  let touched = false
  hosts.forEach((host) => {
    const arr = data ? data[host.getAttribute('data-list')] : undefined
    if (!Array.isArray(arr)) return // chưa có dữ liệu -> để nguyên dòng mẫu
    const region = host.tagName.toLowerCase() === 'table'
      ? (host.querySelector(':scope > tbody') || host)
      : host
    const tpl = region.innerHTML
    region.innerHTML = arr.map((item) => fillItemTokens(tpl, item)).join('')
    touched = true
  })
  return touched ? (doc.doctype ? '<!DOCTYPE html>\n' : '') + doc.documentElement.outerHTML : html
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
// paged.js KHÔNG tự lặp <thead>/<colgroup> khi 1 <table> bị cắt sang trang sau: fragment ở
// trang tiếp theo mất thead (mất tiêu đề cột) và mất colgroup (table-layout:fixed loạn width).
// Sau khi phân trang xong, clone thead + colgroup từ fragment gốc (fragment CÓ thead) sang các
// fragment cùng số cột phía sau. Chạy trong PagedConfig.after (chỉ luồng auto mới gọi after).
const PAGED_TABLE_FIX =
  `function pgKid(el,tag){for(var c=el.firstElementChild;c;c=c.nextElementSibling){if(c.tagName.toLowerCase()===tag)return c}return null}` +
  `function pgCols(tb){var b=pgKid(tb,'tbody');var r=(b&&pgKid(b,'tr'))||tb.querySelector('tr');return r?r.children.length:0}` +
  `function pgFixSplitTables(){try{var ts=document.querySelectorAll('table'),last=null,lastCols=0;` +
  `for(var i=0;i<ts.length;i++){var tb=ts[i],th=pgKid(tb,'thead'),cols=pgCols(tb);` +
  `if(th){last=tb;lastCols=cols;continue}if(!last||!cols||cols!==lastCols)continue;` +
  `if(!pgKid(tb,'colgroup')){var cg=pgKid(last,'colgroup');if(cg)tb.insertBefore(cg.cloneNode(true),tb.firstChild)}` +
  `var mth=pgKid(last,'thead');if(mth){var cl=mth.cloneNode(true),ci=pgKid(tb,'colgroup');if(ci)ci.insertAdjacentElement('afterend',cl);else tb.insertBefore(cl,tb.firstChild)}` +
  `}}catch(e){}}`
const PAGED_SCRIPTS =
  `<script>${PAGED_TABLE_FIX}window.PagedConfig={auto:true,after:function(){try{` +
  `pgFixSplitTables();` +
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

// Zoom xem trước: nút +/−, thanh kéo %, ô hiển thị %.
const ZOOM_MIN = 0.5
const ZOOM_MAX = 2
const ZOOM_STEP = 0.1
const A4_PX = 820 // bề ngang khung A4 (~794px trang paged.js + chừa lề/box-shadow)
const clampZoom = (z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 100) / 100))
const ZOOM_BTN = 'w-6 h-6 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-base leading-none disabled:opacity-40'

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
  const [zoom, setZoom] = useState(1) // tỉ lệ phóng xem trước (1 = 100%)
  const [zoomText, setZoomText] = useState('100') // text trong ô % (cho phép gõ)
  const iframeRef = useRef(null)

  // paged.js báo tổng chiều cao mọi trang -> fit iframe để cuộn xem hết.
  useEffect(() => {
    const onMsg = (e) => {
      if (e.data && e.data.__paged && typeof e.data.h === 'number') setPreviewHeight(e.data.h + 24)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  // Đồng bộ ô % khi zoom đổi từ nút +/− hoặc thanh kéo; commit khi gõ xong (Enter/blur).
  useEffect(() => { setZoomText(String(Math.round(zoom * 100))) }, [zoom])
  const commitZoomText = () => {
    const n = parseInt(zoomText, 10)
    if (Number.isNaN(n)) { setZoomText(String(Math.round(zoom * 100))); return }
    setZoom(clampZoom(n / 100))
  }

  const valueOf = (key) => (edits[key] !== undefined ? edits[key] : (data?.[key] ?? ''))
  const setField = (key, v) => setEdits((p) => ({ ...p, [key]: v }))

  // Gộp sửa (edits) đè lên data rồi fill. data có thể chứa mảng cho [data-list].
  const fillData = useMemo(() => ({ ...(data || {}), ...edits }), [data, edits])
  // 1) expandLists: nhân bản dòng theo data-list ([[field]]); 2) fillTokens: token {{...}} body.
  const filledHtml = useMemo(
    () => (templateHtml ? fillTokens(expandLists(templateHtml, fillData), fillData) : ''),
    [templateHtml, fillData],
  )

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
        {/* Cột xem trước: thanh zoom (trên) đẩy trang in xuống; vùng cuộn (dưới) chứa trang in */}
        <div className="flex-1 min-w-0 flex flex-col">
          {blobUrl && (
            <div className="shrink-0 flex items-center justify-center gap-2 py-1.5 bg-gray-800 border-b border-gray-700 text-gray-100" title="Phóng to / thu nhỏ bản xem trước">
              <button onClick={() => setZoom((z) => clampZoom(z - ZOOM_STEP))} disabled={zoom <= ZOOM_MIN} className={ZOOM_BTN} aria-label="Thu nhỏ">−</button>
              <input
                type="range" min={ZOOM_MIN * 100} max={ZOOM_MAX * 100} step={ZOOM_STEP * 100}
                value={Math.round(zoom * 100)}
                onChange={(e) => setZoom(clampZoom(Number(e.target.value) / 100))}
                className="w-40 accent-blue-500 cursor-pointer"
              />
              <button onClick={() => setZoom((z) => clampZoom(z + ZOOM_STEP))} disabled={zoom >= ZOOM_MAX} className={ZOOM_BTN} aria-label="Phóng to">+</button>
              <span className="inline-flex items-center gap-0.5 text-gray-300">
                <input
                  type="text" inputMode="numeric" value={zoomText}
                  onChange={(e) => setZoomText(e.target.value.replace(/[^\d]/g, ''))}
                  onBlur={commitZoomText}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                  className="w-10 bg-gray-700 rounded text-xs text-right px-1 py-0.5 tabular-nums text-gray-100 outline-none focus:ring-1 focus:ring-blue-500"
                  title="Nhập % rồi Enter" aria-label="Tỉ lệ phóng (%)"
                />
                <span className="text-xs">%</span>
              </span>
            </div>
          )}
          {/* Nền vùng cuộn = đúng màu nền iframe (#3f3f46) để không lộ khung xám quanh trang */}
          <div className="flex-1 min-h-0 overflow-auto" style={{ background: '#3f3f46' }}>
            {blobUrl ? (
              // Wrapper chiếm đúng kích thước ĐÃ scale để cuộn đúng; iframe scale từ góc trên-trái.
              <div style={{ width: `${A4_PX * zoom}px`, height: `${previewHeight * zoom}px`, margin: '0 auto' }}>
                <iframe
                  ref={iframeRef}
                  title="preview"
                  src={blobUrl}
                  scrolling="no"
                  style={{
                    width: `${A4_PX}px`,
                    height: `${previewHeight}px`,
                    border: 'none',
                    display: 'block',
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                  }}
                />
              </div>
            ) : (
              <div className="text-gray-300 mt-10 text-center">{placeholder}</div>
            )}
          </div>
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
