# Mẫu phiếu kết quả (in / xem trước) — Quy ước & cách hoạt động

> Tài liệu này là **căn cứ** để: (1) sinh một mẫu phiếu in mới, (2) giải thích một mẫu phiếu
> đang có, (3) sửa lỗi padding / phân trang. Đọc kỹ phần **Cấu trúc bắt buộc** và **Auto-derive padding**.

Code liên quan:
- **Component in dùng chung**: [components/PrintModal.jsx](../src/components/PrintModal.jsx) — chứa toàn bộ máy paged.js (`derivePrintGeometry`, `buildOverrideCss`, `buildHtml`, `fillTokens`). Dùng cho MỌI loại phiếu in.
- Ví dụ tích hợp: [features/reading/PrintResultModal.jsx](../src/features/reading/PrintResultModal.jsx) (phiếu kết quả ca đọc).
- Backend lắp data: [telerad-core mapper `ToStaffGetReadingOrderResultSheetResponse`](../../telerad-core/internals/object-mappers/telerad-reading-order-controller-responses_mapper.go).
- Polyfill: [public/vendor/paged.polyfill.js](../public/vendor/paged.polyfill.js).

> ⚠️ Thư viện in **`PrintModal.jsx` + `public/vendor/paged.polyfill.js` ĐỒNG BỘ 1-1 với his-web** (file giống hệt).
> Sửa máy in (paged.js, data-list, multi-page, zoom…) ở một bên → **copy sang bên kia**. his-web có guide
> song song `his-web/docs/mau-phieu-in.md`. Các tính năng mới (data-list, lặp thead/colgroup khi tràn trang,
> zoom xem trước) đã có ở §7, §10, §11.

---

## 1. Tổng quan

- Mỗi CSYT có 1 mẫu phiếu lưu ở bảng `imaging_result_sheet_template` (telerad-core):
  - `html_content` — **toàn bộ HTML** của phiếu (kèm `<style>`), có chứa **token** `{{...}}`.
  - `result_font_size` (int16), `result_line_spacing` (float) — cỡ chữ / giãn dòng cho **vùng kết quả**.
- Màn **Ca đọc → In kết quả** ([PrintResultModal.jsx](../src/features/reading/PrintResultModal.jsx)):
  1. Lấy `html_content` + thay token bằng dữ liệu ca đọc.
  2. Nhúng **paged.js** để phân trang A4 WYSIWYG (lề trắng, header/footer lặp mỗi trang, tự sang trang).
  3. Hiển thị qua **blob URL** trong `<iframe>`.
  4. Nút **In KQ** = `iframe.contentWindow.print()` trên **chính tài liệu paged.js** → **xem trước và bản in GIỐNG HỆT nhau** (cùng một engine).

### Nguồn dữ liệu — BACKEND lắp, frontend KHÔNG map (quan trọng)
Endpoint phiếu in trả **`{ htmlContent, data }`**, trong đó **`data` có key = ĐÚNG tên token** trên mẫu
(`patientName`, `readBy`…) và **đã format hiển thị sẵn** (giới tính "Nam/Nữ", ngày
"24 tháng 06 năm 2026", năm sinh…). Frontend chỉ `fillTokens(htmlContent, data)` — **không có logic map
token ở frontend**. Thêm token nội dung mới trên mẫu → thêm field cùng tên ở response/mapper backend.

Riêng **cấu hình render của phiếu** (vd `resultFontSize`/`resultLineSpacing` từ cột `result_font_size`/
`result_line_spacing`) để **top-level cạnh `data`** (typed int16/float) vì là config, không phải token nội
dung ca đọc. Frontend gộp chúng vào map fill (panel sửa nhanh được). Mẫu reading:
`{ htmlContent, resultFontSize, resultLineSpacing, data }`.

> Hệ quả: mỗi loại phiếu in mới = 1 endpoint backend trả `{ htmlContent, data }` + tái dùng `PrintModal`.
> Phần đặc thù ở frontend chỉ là: fetch endpoint, (tuỳ chọn) panel sửa nhanh vài field, override field
> cần lấy "đang soạn" (vd `resultContent`). Xem [PrintResultModal.jsx](../src/features/reading/PrintResultModal.jsx).

### Vì sao paged.js client-side, không phải PDF server?
Phần mềm RIS cũ tạo PDF ở server (mPDF) rồi nhúng iframe. Dự án telerad **chọn client-side** (paged.js)
để không phải dựng hạ tầng render PDF. Mẫu phiếu HTML in đúng bằng Chrome nên paged.js render khớp.

---

## 2. Cấu trúc BẮT BUỘC của `html_content`

paged.js cần biết đâu là header/footer để **lặp mỗi trang**. Mẫu phiếu **phải** theo đúng quy ước sau,
nếu lệch → rơi về số mặc định (xem mục Fallback) và có thể sai phân trang.

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <style>
    @page { size: A4; margin: <Trên> <Bên> <Dưới> <Bên>; }   /* (1) lề giấy */

    .page-header { position: fixed; top: 0; left: 0; right: 0; height: <Hh>; } /* (2) header */
    .page-footer { position: fixed; bottom: 0; left: 0; right: 0; height: <Hf>; } /* (3) footer */
    .page-body   { padding-top: <Pt>; padding-bottom: <Pb>; }   /* (4) chừa chỗ header/footer */
    /* ... style trang trí tuỳ ý ... */
  </style>
</head>
<body>
  <div class="page-header"> ...header LẶP: text/căn giữa đơn giản — bảng ≥3 cột để xuống .page-body, xem §7... </div>
  <div class="page-footer"> ...chữ ký, ngày, bác sĩ...      </div>   <!-- lặp mỗi trang -->
  <div class="page-body">
    ...letterhead ≥3 cột (logo·tên·địa chỉ) đặt Ở ĐÂY nếu cần (xem §7); thông tin bệnh nhân (hiện 1 lần)...
    <div data-region="result-content"
         style="font-size: {{resultFontSize}}pt; line-height: {{resultLineSpacing}}; white-space: pre-wrap;">{{resultContent}}</div>
  </div>
</body>
</html>
```

| Phần | Bắt buộc | Ghi chú |
|---|---|---|
| 3 class `page-header` / `page-footer` / `page-body` | ✓ | Đúng tên, paged.js nhận diện qua đây |
| `@page { margin }` | nên có | Lề giấy; thiếu → fallback `5mm 8mm` |
| `.page-header/.page-footer { position: fixed; height }` | ✓ | Viết kiểu `fixed` quen thuộc (in native cũng hiểu). telerad render qua paged.js → tự chuyển sang `running` |
| `.page-body { padding-top / padding-bottom }` | ✓ | **Chỗ chừa cho header/footer**; thiếu → fallback `29mm / 36mm` |

---

## 3. Auto-derive padding — "sửa template là ăn theo, KHÔNG hardcode"

paged.js không dùng `position:fixed` để lặp; nó dùng **running header/footer trong margin-box `@page`**.
Component **đọc số đo từ chính template** rồi quy đổi sang `@page` của paged.js — không ghim số trong code.

Quy đổi (xem `derivePrintGeometry` trong [PrintResultModal.jsx](../src/features/reading/PrintResultModal.jsx)):

```
paged @page margin-top    = @page.margin-top    + .page-body.padding-top
paged @page margin-bottom = @page.margin-bottom + .page-body.padding-bottom
paged @page margin sides  = @page.margin-left (= margin-right)
header đẩy vào (margin)    = @page.margin-top      (footer: @page.margin-bottom)
header/footer width        = 210mm - 2 × margin-side  (căn giữa)
```

**Hệ quả thực dụng — muốn đổi padding thì sửa Ở TEMPLATE, không sửa code:**
- Đổi lề giấy / khoảng cách mép → sửa `@page { margin }`.
- Đổi khoảng chừa cho header/footer → sửa `.page-body { padding-top / padding-bottom }`.

**Quy tắc vàng khi thiết kế:**
- `padding-top` **≥ chiều cao header** (`+` chút khe hở). VD header `28mm` → `padding-top: 29mm`.
- `padding-bottom` **≥ chiều cao footer**. VD footer `36mm` → `padding-bottom: 36mm`.
- Hỗ trợ đơn vị `mm / cm / in / px / pt` và shorthand 1–4 giá trị. Khuyến nghị dùng **mm**.

**Ví dụ kiểm chứng (đã test thật):**

| Template | `@page margin` | `.page-body padding` | → Nội dung bắt đầu | Header inset | Footer inset | Bề ngang nội dung |
|---|---|---|---|---|---|---|
| LinkRad | `5mm 8mm` | `29mm / 36mm` | 34mm | 5mm | 5mm | 194mm |
| Mẫu khác | `10mm 12mm 15mm 12mm` | `45mm / 50mm` | 55mm | 10mm | 15mm | 186mm |

---

## 4. Token động (thay khi in)

Đây cũng chính là **các field trong `data`** mà backend trả (key = bỏ `{{ }}`). Cột "Nguồn" = backend
lấy từ đâu. Frontend không format lại — backend đã format sẵn (xem mục Nguồn dữ liệu ở §1).

| Token | Ý nghĩa | Nguồn (backend) |
|---|---|---|
| `{{patientName}}` | Họ tên BN | ca đọc (sửa được ở panel khi in) |
| `{{patientBirthYear}}` | Năm sinh | ca đọc |
| `{{patientGender}}` | Giới tính (Nam/Nữ) | ca đọc |
| `{{indicationPlace}}` | Nơi chỉ định | (hiện để trống) |
| `{{serviceName}}` | Tên dịch vụ / chỉ định | ca đọc |
| `{{clinicalDiagnosis}}` | Chẩn đoán lâm sàng | ca đọc |
| `{{resultContent}}` | **Nội dung kết quả** | `result_in_html` của ca (hoặc nội dung đang soạn nếu đang đọc) |
| `{{resultFontSize}}` | Cỡ chữ vùng kết quả (pt) | config phiếu — **top-level** response (`result_font_size`), FE gộp vào fill |
| `{{resultLineSpacing}}` | Giãn dòng vùng kết quả | config phiếu — **top-level** response (`result_line_spacing`), FE gộp vào fill |
| `{{readCompletedAt}}` | Ngày đọc xong | ca đọc |
| `{{readBy}}` | Bác sĩ hội chẩn (tên) | ca đọc |
| `{{logoUrl}}` | URL logo | (hiện để trống → dùng chữ thay logo) |

- Token chưa có giá trị → thay bằng **chuỗi rỗng** (không để lại `{{...}}`).
- **Vùng kết quả bắt buộc** bọc trong `data-region="result-content"` với `white-space: pre-wrap` để giữ xuống dòng,
  và dùng `font-size: {{resultFontSize}}pt; line-height: {{resultLineSpacing}}` (cỡ chữ/giãn dòng lấy từ cột cấu hình, **không** cố định trong CSS template).

---

## 5. Ràng buộc paged.js (vì sao có các quy ước trên)

Đây là các "bẫy" đã gặp và cách né — giữ nguyên khi sinh mẫu mới:

1. **`position:fixed` gây nhân đôi nội dung** trong paged.js v0.4.3 → component override sang
   `position:running()` + `@page { @top-center/@bottom-center { content: element() } }`. Vì vậy mẫu phải dùng đúng class.
2. **`.page-body padding` không chừa chỗ ở trang ≥ 2** nếu in native — nhưng paged.js (qua auto-derive)
   chuyển padding thành `@page margin` nên **chừa chỗ mọi trang**, không đè header. (Đừng cố in native trực tiếp template kiểu fixed: trang 2 sẽ đè.)
3. **paged.js bỏ qua `vertical-align` trong margin-box** → header/footer được đẩy vào bằng `margin`.
4. **Nền xem trước** (nền xám + trang trắng + bóng) phải inject **sau khi paged.js xong** (`PagedConfig.after`),
   vì paged.js xử lý lại CSS lúc init nên `@media screen` đặt trước bị bỏ.
5. **Polyfill** nạp bằng `<script src>` trong `<head>` (không inline vào srcDoc — React escape làm hỏng JS).

> Không cần nhớ chi tiết để **viết template** — chỉ cần theo "Cấu trúc bắt buộc". Các bẫy này do component lo.

---

## 6. In thật

- Nút **In KQ** gọi `print()` trên iframe paged.js → bản in = đúng những gì thấy ở xem trước (đa trang, lề, header/footer lặp).
- Khi in nhớ bật **"Background graphics"** trong hộp thoại in của Chrome nếu phiếu có màu nền / màu chữ cần in ra.
- (Không còn nút "Tải xuống PDF" — muốn PDF thì in rồi chọn "Save as PDF".)

---

## 7. Fallback & lỗi thường gặp

- Template **không có** `@page margin` → dùng `5mm 8mm`. Không có `.page-body padding` → dùng `29mm / 36mm`.
- Đổi tên class (không phải `page-header/footer/body`) → paged.js **không nhận** header/footer → mất lặp / sai layout.
- CSS viết quá lạ (regex `@page` không bắt được) → rơi về fallback, lề có thể sai.
- Header thực tế **cao hơn** `padding-top` → nội dung trang 1 dính vào header. Tăng `padding-top`.
- ⚠️ **Header lặp (`.page-header`) bị "render đôi" / chồng chữ**: paged.js dựng header trong @top-center
  **margin-box** — chỉ chịu bố cục ĐƠN GIẢN (text 1 dòng / div text căn giữa / `<table>` ≤ 2 ô). TUYỆT ĐỐI
  tránh trong header lặp: `<table>` **≥3 cột/ô**, `display:flex`, `display:inline-block`, `colgroup`,
  `table-layout:fixed`, hoặc nhiều phần tử block anh em — đều khiến header bị nhân đôi. (Header phiếu kết quả
  dùng vài dòng text căn giữa nên KHÔNG sao.)
- ✅ **Letterhead nhiều cột (logo · tên · địa chỉ — ≥3 cột) → ĐẶT TRONG `.page-body`** (phần tử đầu tiên),
  KHÔNG để ở `.page-header`. Trong luồng thường (body) thì bảng ≥3 cột / `colgroup` / `table-layout:fixed`
  render bình thường, không nhân đôi. Lặp tiêu đề trang 2+ thì để `.page-header` **1 dòng text**.
- ✅ **Bảng tràn nhiều trang**: paged.js KHÔNG tự lặp `<thead>`/`<colgroup>` cho mảnh bảng ở trang sau
  (mất tiêu đề cột + loạn `table-layout:fixed`). PrintModal đã tự xử lý (`pgFixSplitTables` trong
  `PagedConfig.after`): clone `<thead>`+`<colgroup>` từ mảnh gốc sang mảnh sau cùng số cột. → Template chỉ
  cần dùng `<thead>` + `<colgroup>` chuẩn, không cần làm gì thêm.
- **Preview harness nhân đôi**: nếu render bằng harness paged.js để soi nhanh, phải gọi
  `PagedPolyfill.preview()` **đúng 1 lần** (auto:false) và render trong **iframe** — gọi 2 lần / render
  top-level cũng gây nhân đôi header (artifact của harness, không phải lỗi mẫu).

---

## 8. Checklist khi sinh mẫu phiếu mới

1. [ ] Đủ `<!DOCTYPE html><html><head><style>...</style></head><body>...</body></html>`.
2. [ ] Có đúng 3 vùng: `.page-header`, `.page-footer`, `.page-body`.
3. [ ] `@page { size: A4; margin: ... }` khai lề giấy (mm).
4. [ ] `.page-header`/`.page-footer`: `position: fixed` + `height` cụ thể.
5. [ ] `.page-body { padding-top ≥ chiều cao header; padding-bottom ≥ chiều cao footer }`.
6. [ ] Vùng kết quả: `<div data-region="result-content" style="font-size:{{resultFontSize}}pt; line-height:{{resultLineSpacing}}; white-space:pre-wrap">{{resultContent}}</div>`.
7. [ ] Dùng token ở mục 4 cho phần dữ liệu động; không hardcode tên BN/ngày...
8. [ ] Header/footer là phần **lặp mỗi trang**; thông tin BN + kết quả nằm trong `.page-body` (hiện 1 lần ở đầu).

---

## 9. Bộ khung tối thiểu (copy rồi sửa)

```html
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8" />
<style>
  @page { size: A4; margin: 5mm 8mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; color: #000; }
  .page-header { position: fixed; top: 0; left: 0; right: 0; height: 28mm; text-align: center; }
  .page-footer { position: fixed; bottom: 0; left: 0; right: 0; height: 36mm; }
  .page-body   { padding-top: 29mm; padding-bottom: 36mm; }
</style>
</head>
<body>
  <div class="page-header">
    <div style="font-size:14pt;font-weight:bold">TÊN CƠ SỞ Y TẾ</div>
    <div>Địa chỉ — Hotline — Website</div>
  </div>

  <div class="page-footer">
    <div style="text-align:right">
      <div><em>Ngày {{readCompletedAt}}</em></div>
      <div style="font-weight:bold">Bác sĩ hội chẩn</div>
      <div style="height:16mm"></div>
      <div style="font-weight:bold">{{readBy}}</div>
    </div>
  </div>

  <div class="page-body">
    <div style="text-align:center;font-size:14pt;font-weight:bold;margin-bottom:3mm">KẾT QUẢ CHẨN ĐOÁN HÌNH ẢNH</div>
    <div><b>Họ và tên:</b> {{patientName}}</div>
    <div><b>Năm sinh:</b> {{patientBirthYear}} &nbsp;&nbsp; <b>Giới tính:</b> {{patientGender}}</div>
    <div><b>Chỉ định:</b> {{serviceName}}</div>
    <div><b>Chẩn đoán lâm sàng:</b> {{clinicalDiagnosis}}</div>

    <div data-region="result-content"
         style="font-size: {{resultFontSize}}pt; line-height: {{resultLineSpacing}}; white-space: pre-wrap;">{{resultContent}}</div>
  </div>
</body>
</html>
```

---

## 10. Phiếu có DANH SÁCH — phiếu chỉ định, phiếu thu tiền…

Danh sách **KHAI BÁO ngay trong template** — `PrintModal` tự nhân bản dòng theo dữ liệu, **KHÔNG** để
backend dựng HTML nữa:

- `<table data-list="<listName>">` — `listName` = tên mảng trong `data` (`data[listName]` = **MẢNG object**).
- Trong `<tbody>` để **đúng 1 `<tr>` mẫu**; mỗi ô dùng **`{{$field}}`** = field của TỪNG phần tử mảng
  (tiền tố `$` để phân biệt với `{{...}}` = field body/toàn phiếu). PrintModal **tự escape** `< & "`.
- `data[listName]` chưa phải mảng (vd preview chưa có dữ liệu) → **giữ nguyên dòng mẫu** (hiện `{{$field}}`).

Template:
```html
<table class="svc" data-list="rows">
  <colgroup>...</colgroup>
  <thead><tr><th>STT</th><th>Dịch vụ</th><th>SL</th><th>Thành tiền</th></tr></thead>
  <tbody>
    <tr><td>{{$stt}}</td><td>{{$name}}</td><td>{{$qty}}</td><td>{{$amount}}</td></tr>
  </tbody>
</table>
<div>Tổng cộng: {{total}}</div>
```

Backend chỉ trả `data` dạng **mảng object** (Go, ví dụ):
```go
rows := make([]map[string]any, 0, len(services))
for i, s := range services {
    rows = append(rows, map[string]any{"stt": i + 1, "name": s.Name, "qty": s.Qty, "amount": s.Amount})
}
data := map[string]any{ "rows": rows, "total": "270.000", "patientName": "..." }
// -> response { htmlContent, data }
```

Lưu ý:
- **KHÔNG dựng HTML, KHÔNG tự escape** ở backend — PrintModal lo. Đổi cột chỉ sửa template, không đụng backend.
- `data-list` đặt trên phần tử KHÔNG phải `<table>` cũng được: `<div data-list="x"><span>{{$y}}</span></div>` → lặp con của host.
- Bảng tràn nhiều trang: `<thead>`/`<colgroup>` tự lặp (xem §7).

---

## 11. Tái sử dụng — component `PrintModal`

Mọi phiếu in mới **dùng lại** [components/PrintModal.jsx](../src/components/PrintModal.jsx), không tự dựng paged.js.

| Prop | Kiểu | Ý nghĩa |
|---|---|---|
| `title` | string | Tiêu đề thanh trên |
| `templateHtml` | string | HTML mẫu phiếu (mục 2) — thường lấy từ DB |
| `data` | object | Map token `{{key}}` (do backend trả, key = tên token). Danh sách = field **MẢNG object** cho `data-list` (mục 10) |
| `fields` | array | **Khai báo vùng "Thông tin"** (panel sửa nhanh) — THAY ĐỔI THEO TỪNG PHIẾU. Bỏ trống/`null` → không có panel. Xem dưới |
| `infoTitle` | string | Tiêu đề panel (mặc định "Thông tin") |
| `aside` | node | (Escape hatch) panel tự dựng khi quá đặc thù, `fields` không tả nổi. Có `fields` thì `fields` ưu tiên |
| `placeholder` | string | Thông báo khi chưa có nội dung (đang tải / chưa cấu hình) |
| `onClose` | fn | Đóng modal |

### Vùng "Thông tin" (editable) — khai báo bằng `fields`, KHÁC NHAU theo từng phiếu

Mỗi phiếu in có vùng sửa-nhanh riêng (phiếu CĐHA có tên BN/giới tính/cỡ chữ…; phiếu thu tiền có thể khác;
phiếu khác có thể **không có**). Khai báo ở **front-end** bằng mảng `fields`; `PrintModal` tự render panel,
tự quản state sửa, và **ghi đè giá trị sửa lên `data`** khi fill (key của field = tên token). Người dùng
chưa sửa thì field lấy giá trị từ `data`.

```js
const FIELDS = [
  { key: 'patientName', label: 'Tên bệnh nhân', type: 'text' },
  { type: 'group', fields: [                       // xếp 2 cột cạnh nhau
    { key: 'patientGender', label: 'Giới tính', type: 'radio', options: ['Nam', 'Nữ'] },
    { key: 'patientBirthYear', label: 'Năm sinh', type: 'text' },
  ] },
  { key: 'resultFontSize', label: 'Cỡ chữ', type: 'number', step: 1 },     // ô số + nút +/-
]
```

| `type` | Hiển thị |
|---|---|
| `text` (mặc định) | ô nhập |
| `number` | ô số + nút +/- (`step`, mặc định 1) |
| `radio` | chọn 1 trong `options` |
| `group` | gom `fields` con xếp 2 cột |

Phiếu **không cần sửa gì** → không truyền `fields` (hoặc `[]`): modal chỉ có preview + nút In/Đóng nổi.

**Zoom xem trước:** thanh ngay TRÊN trang in (không ở header modal) gồm nút −/+, thanh kéo % và **ô % gõ được**
(Enter/blur áp dụng, tự kẹp 50–200%). Chỉ phóng to/thu nhỏ bản xem trước (CSS `transform`), KHÔNG ảnh hưởng bản in thật.

### Mẫu tích hợp phiếu mới (backend đã trả `{ htmlContent, data }`)
```jsx
import PrintModal from '@/components/PrintModal'

const FIELDS = [ { key: 'patientName', label: 'Tên bệnh nhân', type: 'text' } /* ...tuỳ phiếu... */ ]

function PhieuChiDinhModal({ orderUuid, onClose }) {
  const [resp, setResp] = useState(null) // { htmlContent, data }
  useEffect(() => { getPhieuChiDinh(orderUuid).then(setResp).catch(() => setResp(null)) }, [orderUuid])
  return (
    <PrintModal
      title="In phiếu chỉ định"
      templateHtml={resp?.htmlContent || ''}
      data={resp?.data || {}}
      fields={resp ? FIELDS : null}   /* bỏ dòng này nếu phiếu không cần sửa */
      placeholder="Đang tải phiếu…"
      onClose={onClose}
    />
  )
}
```

Việc của feature mới:
1. **Backend**: 1 endpoint trả `{ htmlContent, data }` — `data` key = tên token, format hiển thị sẵn (kể cả HTML danh sách). Theo mẫu [mapper ToStaffGetReadingOrderResultSheetResponse](../../telerad-core/internals/object-mappers/telerad-reading-order-controller-responses_mapper.go).
2. **Frontend**: wrapper mỏng fetch endpoint đó → `PrintModal`, khai `fields` cho vùng "Thông tin" (nếu cần). Xem [PrintResultModal.jsx](../src/features/reading/PrintResultModal.jsx).

`PrintModal` chỉ lo render + phân trang + in.
