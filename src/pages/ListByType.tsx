import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { useOphim } from "../hooks/useOphim";
import { getMoviesByType, getGenres, getCountries, MOVIE_TYPES } from "../api/ophim";
import MovieListPage from "../components/MovieListPage";
import FilterBar from "../components/FilterBar";
import { sortMovies, type SortOption } from "../utils/sortMovies";
import type { ListFilters } from "../types/movie";

export default function ListByType() {
  const { type = "" } = useParams<{ type: string }>();
  const [filters, setFilters] = useState<ListFilters>({});
  const [sort, setSort] = useState<SortOption>("year-desc");

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
      filterSlot={
        <>
          <FilterBar
            genres={genres || []}
            countries={countries || []}
            value={filters}
            onChange={setFilters}
            sort={sort}
            onSortChange={setSort}
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
