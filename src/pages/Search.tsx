import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { searchMovies } from "../api/ophim";
import MovieListPage from "../components/MovieListPage";

export default function Search() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";

  const fetcher = useCallback(
    (page: number) => searchMovies(keyword, { page, limit: 24 }),
    [keyword]
  );

  if (!keyword) {
    return (
      <div className="section container">
        <p className="state-message">Nhập từ khoá để tìm phim.</p>
      </div>
    );
  }

  return (
    <MovieListPage
      eyebrow="Kết quả tìm kiếm"
      title={`“${keyword}”`}
      fetcher={fetcher}
      deps={[keyword]}
      breadcrumb={[{ label: "Tìm kiếm", to: "/tim-kiem" }, { label: keyword }]}
    />
  );
}
