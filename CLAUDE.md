# telerad-web — Quy ước phát triển

Frontend trang quản trị Telerad. Stack: **React 18 + Vite 5 + React Router 6 + TailwindCSS 3**.
Backend `telerad-core` (Go) gọi qua REST (CORS trực tiếp, base từ `window.__TELERAD_CORE_URL__`).
Quản lý gói: **pnpm**. Clone cấu trúc & quy ước từ `his-web`.

> Ngôn ngữ trả lời tiếng Việt, không viết tắt. Comment trong code viết bằng tiếng Anh.

## 0. Lệnh
```
pnpm dev | build | preview
pnpm lint            # ESLint (warn; exit 0 nếu 0 error)
pnpm test            # Vitest (unit)
```

## 1. Khác biệt cốt lõi so với his-web
- **Đơn schema**: telerad-core dùng một schema `telerad` cố định → KHÔNG có chọn cơ sở (facility) và KHÔNG có header `Facility-Uuid`. `apiFetch` chỉ chèn `Authorization`.
- **Login trả token thô**: endpoint `/telerad-core/v1/staff/auth/token` trả `{ access_token, token_type, expires_in }` (KHÔNG bọc BaseResponse) → [api/endpoints/auth.js](src/api/endpoints/auth.js) gọi `fetch` trực tiếp, không qua `apiFetch`.
- **Base URL** phải gồm đoạn `/services`, ví dụ `http://localhost:8101/services`; path SPA bắt đầu bằng `/telerad-core/v1/...`.

## 2. Kiến trúc — Feature-Sliced
```
src/
  App.jsx, main.jsx, index.css
  components/   dùng chung (Layout, Modal, RowActionMenu, ApiErrorToast, ChangeOwnPasswordModal)
  context/      AuthContext.jsx
  lib/          tiện ích THUẦN (baseResponse, ui, timezone, format, enums)
  api/          client.js (apiFetch) + endpoints/<domain>.js + index.js (barrel)
  features/<domain>/
    <Feature>Page.jsx   route-level, mỏng (render + UI state)
    hooks.js            useXxx — data-fetching + business logic
    constants.js        enum/hằng của domain
    components/         sub-component riêng feature
  pages/        Login.jsx
```

## 3. Quy tắc
- Mọi call qua `apiFetch` ([@/api/client.js](src/api/client.js)); unwrap BaseResponse `{ code, message, result }`; xử lý 401 (`auth:unauthorized`); toast lỗi (`api:error`).
- Thêm endpoint → `api/endpoints/<domain>.js`; barrel `api/index.js` tự gom. Import từ `@/api`.
- Dùng lại ≥ 2 nơi → `lib/`/`components/`. Enum dùng chung (modalities) ở [@/lib/enums](src/lib/enums.js).
- Dùng alias `@/`, không `../../..`. UI tiếng Việt không viết tắt; comment tiếng Anh giải thích WHY.
- Ngày: telerad-core dùng `DD/MM/YYYY` (types.Date); `<input type=date>` dùng `YYYY-MM-DD` → cầu nối bằng [@/lib/format](src/lib/format.js).

## 4. Tính năng hiện có
- **Đăng nhập** ([pages/Login.jsx](src/pages/Login.jsx)) — sau login gọi `getMe` để lấy hồ sơ.
- **Quản lý nhân sự** ([features/staff](src/features/staff/StaffPage.jsx)) — danh sách + lọc, thêm/sửa hồ sơ, cấp tài khoản, đặt lại mật khẩu, phân quyền đọc phim (modalities + đối tác), phân vai trò, kích hoạt/ngừng.
- **Đối tác tích hợp** ([features/partner](src/features/partner/PartnerPage.jsx)) — danh sách + lọc, thêm (kèm credential telerad + cấu hình callback)/sửa, cấu hình callback, đổi mật khẩu, kích hoạt/ngừng.
