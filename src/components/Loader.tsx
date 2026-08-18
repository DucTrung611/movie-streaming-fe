import "./Loader.css";

interface LoaderProps {
  label?: string;
  /** "text": dòng chữ đơn giản (mặc định, dùng cho chỗ nhỏ/không rõ layout).
   * "grid"/"row": khung xương thay cho lưới/hàng phim sắp hiện ra.
   * "hero": khung xương cho khối hero lớn (trang chi tiết phim, trang xem phim). */
  variant?: "text" | "grid" | "row" | "hero";
  count?: number;
}

export default function Loader({
  label = "Đang tải...",
  variant = "text",
  count = 8,
}: LoaderProps) {
  if (variant === "text") {
    return <p className="state-message">{label}</p>;
  }

  return (
    <div className="skeleton-wrap" role="status" aria-label={label}>
      <span className="visually-hidden">{label}</span>
      {variant === "hero" && <div className="skeleton skeleton-hero" aria-hidden="true" />}
      {(variant === "grid" || variant === "row") && (
        <div
          className={variant === "grid" ? "skeleton-grid" : "skeleton-row"}
          aria-hidden="true"
        >
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      )}
    </div>
  );
}
