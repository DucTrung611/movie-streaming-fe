import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { useOphim } from "../hooks/useOphim";
import { getMoviesByType, getGenres, getCountries, MOVIE_TYPES } from "../api/ophim";
import MovieListPage from "../components/MovieListPage";
import FilterBar from "../components/FilterBar";

export default function ListByType() {
  const { type } = useParams();
  const [filters, setFilters] = useState({});

  const { data: genres } = useOphim(() => getGenres(), []);
  const { data: countries } = useOphim(() => getCountries(), []);

  const fetcher = useCallback(
    (page) => getMoviesByType(type, { page, limit: 24, ...filters }),
    [type, filters]
  );

  const label =
    MOVIE_TYPES.find((t) => t.slug === type)?.label || "Danh sách phim";

  return (
    <MovieListPage
      eyebrow="Danh mục"
      title={label}
      fetcher={fetcher}
      deps={[type, JSON.stringify(filters)]}
      filterSlot={
        <FilterBar
          genres={genres || []}
          countries={countries || []}
          value={filters}
          onChange={setFilters}
        />
      }
    />
  );
}
