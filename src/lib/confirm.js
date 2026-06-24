// Modal xác nhận DÙNG CHUNG (thay window.confirm để đồng bộ style). Kiểu promise:
//   const r = await confirmDialog({ title, message, confirmLabel, cancelLabel, tone })
// Trả về 3 kết quả:
//   true  -> bấm Đồng ý (confirmLabel) / Enter
//   false -> bấm Hủy (cancelLabel) — đây là 1 LỰA CHỌN
//   null  -> ĐÓNG: nút ✕ / backdrop / Esc = NGẮT hẳn (không làm gì phía sau)
// Confirm đơn giản (Đồng ý/Hủy đều = thôi): dùng `if ((await confirmDialog(...)) !== true) return`.
// tone: 'primary' (mặc định) | 'danger'. Bắn event 'app:confirm'; ConfirmDialog (mount ở App) hiển thị.
export function confirmDialog(options) {
  return new Promise((resolve) => {
    window.dispatchEvent(new CustomEvent('app:confirm', { detail: { options: options || {}, resolve } }))
  })
}
