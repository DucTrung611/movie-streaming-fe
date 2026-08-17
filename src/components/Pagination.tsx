import "./Pagination.css";

const BLOCK_SIZE = 10;

/**
 * Hiện đúng 1 khối 10 trang liên tiếp (kiểu Google) thay vì rải rác
 * đầu/cuối + "...". blockStart luôn có dạng 10k+1 nên nút lùi khối
 * luôn đáp xuống mốc chục tròn (10, 20, 30...).
 */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onChange,
}: PaginationProps) {
  if (!totalPages || totalPages <= 1) return null;

  const page = Number(currentPage) || 1;
  const total = Number(totalPages) || 1;

  const blockStart = Math.floor((page - 1) / BLOCK_SIZE) * BLOCK_SIZE + 1;
  const blockEnd = Math.min(blockStart + BLOCK_SIZE - 1, total);
  const blockPages = [];
  for (let p = blockStart; p <= blockEnd; p++) blockPages.push(p);

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
        {blockStart > 1 && (
          <button
            className="pagination__block"
            title="Lùi 10 trang"
            onClick={() => onChange(blockStart - 1)}
          >
            «
          </button>
        )}

        {blockPages.map((p) => (
          <button
            key={p}
            className={
              p === page ? "pagination__page is-active" : "pagination__page"
            }
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ))}

        {blockEnd < total && (
          <button
            className="pagination__block"
            title="Tiến 10 trang"
            onClick={() => onChange(blockEnd + 1)}
          >
            »
          </button>
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
