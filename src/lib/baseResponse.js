// Mirror của telerad-core BaseResponse — wrap mọi response dạng:
//   { code: number, message: string, result: any }
// Đóng thành 1 chỗ để khi backend đổi tên field thì chỉ sửa file này.

export const BASE_RESPONSE_KEYS = Object.freeze({
  code: 'code',
  message: 'message',
  result: 'result',
})

// Trả về phần `result` bên trong payload, fallback về payload nếu không phải
// BaseResponse (vd. response tự do như token đăng nhập).
export function getResult(payload) {
  if (payload && typeof payload === 'object' && BASE_RESPONSE_KEYS.result in payload) {
    return payload[BASE_RESPONSE_KEYS.result]
  }
  return payload
}

// Lấy `message` (text lỗi hoặc thông báo) từ payload. Trả null nếu không có.
export function getMessage(payload) {
  return payload?.[BASE_RESPONSE_KEYS.message] ?? null
}

// Lấy `code` (mã trạng thái nghiệp vụ) từ payload. Trả null nếu không có.
export function getCode(payload) {
  return payload?.[BASE_RESPONSE_KEYS.code] ?? null
}
