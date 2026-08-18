import { useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useOphim } from "../hooks/useOphim";
import { getMoviesByType, getGenres, getCountries, MOVIE_TYPES } from "../api/ophim";
import MovieListPage from "../components/MovieListPage";
import FilterBar from "../components/FilterBar";
import { sortMovies, type SortOption } from "../utils/sortMovies";
import type { ListFilters } from "../types/movie";

function setOrDelete(params: URLSearchParams, key: string, value: string | undefined) {
  if (value) params.set(key, value);
  else params.delete(key);
}

// Bộ lọc và cách sắp xếp lưu ở query string (?category=, ?country=, ...)
// thay vì useState nội bộ — để khi người dùng chọn lọc rồi bấm vào xem
// phim và back lại, URL (và trạng thái lọc trong đó) được trình duyệt
// khôi phục nguyên vẹn thay vì component mount lại và mất hết bộ lọc.
export default function ListByType() {
  const { type = "" } = useParams<{ type: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: ListFilters = {
    categories: searchParams.getAll("category").length
      ? searchParams.getAll("category")
      : undefined,
    country: searchParams.get("country") || undefined,
    year: searchParams.get("year") || undefined,
    sort_lang: searchParams.get("sort_lang") || undefined,
  };
  const sort = (searchParams.get("sort") as SortOption) || "year-desc";

  function handleFiltersChange(next: ListFilters) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.delete("category");
      (next.categories || []).forEach((slug) => params.append("category", slug));
      setOrDelete(params, "country", next.country);
      setOrDelete(params, "year", next.year);
      setOrDelete(params, "sort_lang", next.sort_lang);
      return params;
    });
  }

  function handleSortChange(next: SortOption) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      setOrDelete(params, "sort", next);
      return params;
    });
  }

  const { data: genres } = useOphim(() => getGenres(), []);
  const { data: countries } = useOphim(() => getCountries(), []);

  // Server chỉ nhận 1 slug thể loại trong query "category" — thể loại đầu
  // được gửi lên server, các thể loại còn lại (nếu người dùng chọn nhiều)
  // dùng để lọc thêm (AND) trên kết quả trả về ở client.
  const categories = filters.categories || [];
  const primaryCategory = categories[0];
  const extraCategories = categories.slice(1);

  const fetcher = useCallback(
    (page: number) =>
      getMoviesByType(type, {
        page,
        limit: 24,
        category: primaryCategory,
        country: filters.country,
        year: filters.year,
        sort_lang: filters.sort_lang,
      }).then((res) => {
        const items = extraCategories.length
          ? res.items.filter((item) =>
              extraCategories.every((slug) =>
                (item.category || []).some((c) => c.slug === slug)
              )
            )
          : res.items;
        return { ...res, items: sortMovies(items, sort) };
      }),
    [type, primaryCategory, extraCategories, filters.country, filters.year, filters.sort_lang, sort]
  );

  const label =
    MOVIE_TYPES.find((t) => t.slug === type)?.label || "Danh sách phim";

  // Lọc thêm (AND) ở client sau khi server đã phân trang khiến
  // totalPages/currentPage của server không còn đúng cho tập kết quả đã
  // lọc — ẩn phân trang trong trường hợp này thay vì hiện số trang sai.
  const hidePagination = extraCategories.length > 0;

  return (
    <MovieListPage
      eyebrow="Danh mục"
      title={label}
      fetcher={fetcher}
      deps={[type, JSON.stringify(filters), sort]}
      hidePagination={hidePagination}
      breadcrumb={[{ label }]}
      filterSlot={
        <>
          <FilterBar
            genres={genres || []}
            countries={countries || []}
            value={filters}
            onChange={handleFiltersChange}
            sort={sort}
            onSortChange={handleSortChange}
          />
          {hidePagination && (
            <p className="filter-bar__note">
              Đang lọc theo nhiều thể loại — chỉ hiện kết quả khớp trong
              phạm vi trang đầu tiên từ server, không phân trang tiếp.
            </p>
          )}
        </>
      }
    />
  );
}
