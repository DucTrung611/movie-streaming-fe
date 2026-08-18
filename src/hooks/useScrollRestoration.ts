import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Vị trí cuộn theo từng location.key — sống trong bộ nhớ JS (không cần
// localStorage) vì chỉ cần tồn tại trong phiên SPA hiện tại.
const positions = new Map<string, number>();

const RESTORE_INTERVAL_MS = 50;
const RESTORE_MAX_ATTEMPTS = 30; // ~1.5s — đủ thời gian cho fetch async render xong

/**
 * Khôi phục đúng vị trí cuộn khi bấm Back/Forward (POP), thay vì luôn
 * nhảy về đầu trang hoặc dừng ở vị trí ngẫu nhiên. Trình duyệt có cơ
 * chế tự khôi phục cuộn cho SPA (history.scrollRestoration = "auto")
 * nhưng nó áp dụng NGAY khi popstate xảy ra — lúc đó nội dung trang
 * (vừa mount lại, đang fetch dữ liệu) còn thấp hơn nhiều so với lúc đã
 * tải xong, nên khôi phục "quá sớm" rồi không tự làm lại khi trang cao
 * dần lên. Tắt cơ chế mặc định và tự làm: lưu scrollY liên tục theo
 * location.key, rồi khi quay lại (POP) thử scrollTo lặp lại trong ít
 * giây đầu — mỗi lần nội dung cao thêm (ảnh/data tải xong) thì lại
 * chỉnh đúng vị trí, tới khi ổn định hoặc hết thời gian.
 *
 * Điều hướng tới (PUSH, vd. bấm vào 1 phim) luôn cuộn về đầu trang mới.
 */
export default function useScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    if (typeof window === "undefined" || !("scrollRestoration" in window.history)) return;
    window.history.scrollRestoration = "manual";
  }, []);

  // Lưu vị trí cuộn hiện tại của location đang đứng — CHỈ qua sự kiện
  // "scroll" thật (không đọc lại window.scrollY lúc cleanup/unmount):
  // khi điều hướng đi, React đã commit xong DOM của trang mới (thường
  // thấp hơn — trang đích còn đang loading) TRƯỚC KHI effect cleanup
  // của trang cũ chạy, lúc đó trình duyệt đã tự kẹp scrollY về vừa với
  // chiều cao mới, nên đọc window.scrollY trong cleanup cho ra giá trị
  // sai (thấp hơn nhiều so với vị trí thật lúc người dùng bấm rời đi).
  useEffect(() => {
    const key = location.key;
    const save = () => positions.set(key, window.scrollY);
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, [location.key]);

  useEffect(() => {
    if (navigationType !== "POP") {
      // Chỉ tự cuộn lên đầu khi thật sự chuyển sang path khác (vd. bấm
      // vào 1 phim) — đổi query trên CÙNG path (đổi trang/bộ lọc) để
      // nguyên vị trí, trang gọi tự lo việc cuộn nếu cần (Pagination
      // đã tự smooth-scroll khi đổi trang).
      if (prevPathname.current !== location.pathname) {
        window.scrollTo(0, 0);
      }
      prevPathname.current = location.pathname;
      return;
    }
    prevPathname.current = location.pathname;

    const target = positions.get(location.key);
    if (target == null) return;

    let attempts = 0;
    const id = window.setInterval(() => {
      attempts += 1;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.min(target, Math.max(0, maxScroll)));
      if (attempts >= RESTORE_MAX_ATTEMPTS) window.clearInterval(id);
    }, RESTORE_INTERVAL_MS);

    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, navigationType]);
}
