/**
 * Lớp bọc localStorage an toàn: một số trình duyệt (Safari riêng tư,
 * chế độ ẩn danh, hoặc storage đầy quota) ném lỗi khi gọi get/setItem —
 * bọc try/catch để một tính năng phụ (yêu thích / xem tiếp) không lưu
 * được thì cũng không làm crash cả app.
 */
const PREFIX = "rapchieu:v1:";

export const STORAGE_KEYS = {
  FAVORITES: `${PREFIX}favorites`,
  CONTINUE_WATCHING: `${PREFIX}continue-watching`,
};

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
