// Toast thành công dùng chung: bắn event 'app:success', SuccessToast lắng nghe và
// hiển thị. Song song với 'api:error' do apiFetch bắn (ApiErrorToast hiển thị).
export function notifySuccess(message) {
  window.dispatchEvent(new CustomEvent('app:success', { detail: { message } }))
}

// Toast lỗi phía client (validation...) — tái dùng kênh 'api:error' (ApiErrorToast hiển thị).
export function notifyError(message) {
  window.dispatchEvent(new CustomEvent('api:error', { detail: { status: 0, message } }))
}
