import "./Pagination.css";

export default function Pagination({ currentPage, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const page = Number(currentPage) || 1;
  const total = Number(totalPages) || 1;

  const pages = new Set([1, total, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const items = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) items.push("ellipsis-" + p);
    items.push(p);
    prev = p;
  }

  return (
    <nav className="pagination" aria-label="Phân trang">
      <button
        className="pagination__nav"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ‹ Trước
      </button>

      <div className="pagination__pages">
        {items.map((item) =>
          typeof item === "number" ? (
            <button
              key={item}
              className={
                item === page
                  ? "pagination__page is-active"
                  : "pagination__page"
              }
              onClick={() => onChange(item)}
            >
              {item}
            </button>
          ) : (
            <span key={item} className="pagination__ellipsis">
              …
            </span>
          )
        )}
      </div>

      <button
        className="pagination__nav"
        disabled={page >= total}
        onClick={() => onChange(page + 1)}
      >
        Sau ›
      </button>
    </nav>
  );
}
