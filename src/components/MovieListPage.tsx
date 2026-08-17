import { useEffect, useRef, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { useOphim } from "../hooks/useOphim";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import MovieGrid from "./MovieGrid";
import Pagination from "./Pagination";
import Loader from "./Loader";
import ErrorState from "./ErrorState";
import type { ListResponse } from "../types/movie";

interface MovieListPageProps {
  eyebrow?: string;
  title: string;
  fetcher: (page: number) => Promise<ListResponse>;
  deps?: React.DependencyList;
  filterSlot?: ReactNode;
}

/**
 * Khung trang danh sách phim dùng chung cho: danh sách theo loại,
 * theo thể loại, theo quốc gia, và kết quả tìm kiếm.
 *
 * fetcher: (page) => Promise<{items, cdnImageDomain, currentPage, totalPages}>
 * deps: mảng dependency — đổi khi slug/keyword đổi để reset trang về 1
 *
 * Số trang lưu ở query string (?page=) thay vì state nội bộ — để khi
 * người dùng vào xem phim rồi bấm back, trình duyệt khôi phục đúng URL
 * (kèm ?page=) và danh sách hiện lại đúng trang đang xem dở, thay vì
 * component mount lại từ đầu và luôn về trang 1.
 */
export default function MovieListPage({
  eyebrow,
  title,
  fetcher,
  deps = [],
  filterSlot,
}: MovieListPageProps) {
  useDocumentTitle(title);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  // Khi slug/keyword/bộ lọc đổi (deps đổi) TRONG LÚC đã mở trang, quay
  // về trang 1 — nhưng chỉ khi deps THẬT SỰ đổi so với lần lưu gần nhất
  // (so sánh giá trị, không dùng cờ "đã chạy lần đầu" kiểu 1 lần) — vì
  // React StrictMode chạy effect này 2 lần lúc mount ở dev, một cờ boolean
  // đơn giản sẽ bị "dùng hết" ở lần gọi đầu và làm lần gọi thứ 2 tưởng
  // nhầm là deps đổi, xoá mất ?page= có sẵn trên URL (bấm back/mở link
  // chia sẻ tới trang N sẽ bị nhảy về trang 1).
  const depsKey = JSON.stringify(deps);
  const prevDepsKey = useRef(depsKey);
  useEffect(() => {
    if (depsKey === prevDepsKey.current) return;
    prevDepsKey.current = depsKey;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("page", "1");
        return next;
      },
      { replace: true }
    );
  }, [depsKey, setSearchParams]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { data, loading, error } = useOphim(() => fetcher(page), [page, ...deps]);

  function handlePageChange(nextPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(nextPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="section container">
      <div className="section-head">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2>{title}</h2>
        </div>
      </div>

      {filterSlot}

      {loading && <Loader />}
      {error && <ErrorState message={error.message} />}
      {!loading && !error && data && (
        <>
          <MovieGrid movies={data.items} cdnImageDomain={data.cdnImageDomain} />
          <Pagination
            currentPage={data.currentPage}
            totalPages={data.totalPages}
            onChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
