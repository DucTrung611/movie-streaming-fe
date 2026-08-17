import { useEffect } from "react";

const SITE_NAME = "Rạp Chiếu";

/** Đặt tiêu đề tab trình duyệt theo từng trang, khôi phục mặc định khi unmount. */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title
      ? `${title} — ${SITE_NAME}`
      : `${SITE_NAME} — Xem phim online`;
  }, [title]);
}
