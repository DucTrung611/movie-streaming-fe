import { useEffect, useState } from "react";
import "./BackToTop.css";

const SHOW_AFTER_PX = 600;

/** Nút nổi "lên đầu trang" — chỉ hiện khi đã cuộn đủ xa, hữu ích cho các
 * trang danh sách/lưới phim dài. */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Lên đầu trang"
    >
      ↑
    </button>
  );
}
