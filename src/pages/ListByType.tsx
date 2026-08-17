import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { useOphim } from "../hooks/useOphim";
import { getMoviesByType, getGenres, getCountries, MOVIE_TYPES } from "../api/ophim";
import MovieListPage from "../components/MovieListPage";
import FilterBar from "../components/FilterBar";
import { sortMoviesByYear } from "../utils/sortMovies";
import type { ListFilters } from "../types/movie";

export default function ListByType() {
  const { type = "" } = useParams<{ type: string }>();
  const [filters, setFilters] = useState<ListFilters>({});
  const [sort, setSort] = useState<"desc" | "asc">("desc");

  const { data: genres } = useOphim(() => getGenres(), []);
  const { data: countries } = useOphim(() => getCountries(), []);

  const fetcher = useCallback(
    (page: number) =>
      getMoviesByType(type, { page, limit: 24, ...filters }).then((res) => ({
        ...res,
        items: sortMoviesByYear(res.items, sort),
      })),
    [type, filters, sort]
  );

  const label =
    MOVIE_TYPES.find((t) => t.slug === type)?.label || "Danh sách phim";

  return (
    <MovieListPage
      eyebrow="Danh mục"
      title={label}
      fetcher={fetcher}
      deps={[type, JSON.stringify(filters), sort]}
      filterSlot={
        <FilterBar
          genres={genres || []}
          countries={countries || []}
          value={filters}
          onChange={setFilters}
          sort={sort}
          onSortChange={setSort}
        />
      }
    />
  );
}
