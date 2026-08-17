import { useCallback, useEffect, useState } from "react";
import { readJson, writeJson, STORAGE_KEYS } from "../utils/storage";

const EVENT_NAME = "rapchieu:favorites-changed";
const loadFavorites = () => readJson(STORAGE_KEYS.FAVORITES, []);

/**
 * Danh sách phim yêu thích lưu local (không cần đăng nhập). Đồng bộ
 * qua custom event để nhiều component (nút toggle, trang /yeu-thich)
 * cùng cập nhật khi 1 nơi ghi dữ liệu, cộng sự kiện "storage" gốc để
 * đồng bộ giữa các tab.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState(loadFavorites);

  useEffect(() => {
    const sync = () => setFavorites(loadFavorites());
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isFavorite = useCallback(
    (slug) => favorites.some((m) => m.slug === slug),
    [favorites]
  );

  const toggleFavorite = useCallback((movie) => {
    const current = loadFavorites();
    const exists = current.some((m) => m.slug === movie.slug);
    const next = exists
      ? current.filter((m) => m.slug !== movie.slug)
      : [{ ...movie, addedAt: Date.now() }, ...current];
    writeJson(STORAGE_KEYS.FAVORITES, next);
    setFavorites(next);
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
