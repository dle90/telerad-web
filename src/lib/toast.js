// Toast thành công dùng chung: bắn event 'app:success', SuccessToast lắng nghe và
// hiển thị. Song song với 'api:error' do apiFetch bắn (ApiErrorToast hiển thị).
export function notifySuccess(message) {
  window.dispatchEvent(new CustomEvent('app:success', { detail: { message } }))
}
