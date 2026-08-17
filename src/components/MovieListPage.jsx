import { useEffect, useState } from "react";
import { useOphim } from "../hooks/useOphim";
import MovieGrid from "./MovieGrid";
import Pagination from "./Pagination";
import Loader from "./Loader";
import ErrorState from "./ErrorState";

/**
 * Khung trang danh sách phim dùng chung cho: danh sách theo loại,
 * theo thể loại, theo quốc gia, và kết quả tìm kiếm.
 *
 * fetcher: (page) => Promise<{items, cdnImageDomain, currentPage, totalPages}>
 * deps: mảng dependency — đổi khi slug/keyword đổi để reset trang về 1
 */
export default function MovieListPage({ eyebrow, title, fetcher, deps = [], filterSlot }) {
  const [page, setPage] = useState(1);

  // Khi slug/keyword/bộ lọc đổi (deps đổi), quay lại trang 1.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setPage(1), deps);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { data, loading, error } = useOphim(() => fetcher(page), [page, ...deps]);

  function handlePageChange(nextPage) {
    setPage(nextPage);
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
