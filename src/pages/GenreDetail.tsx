import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { getMoviesByGenre } from "../api/ophim";
import MovieListPage from "../components/MovieListPage";
import { sortMoviesByYear } from "../utils/sortMovies";

export default function GenreDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const fetcher = useCallback(
    (page: number) =>
      getMoviesByGenre(slug, { page, limit: 24 }).then((res) => ({
        ...res,
        items: sortMoviesByYear(res.items),
      })),
    [slug]
  );

  return (
    <MovieListPage
      eyebrow="Thể loại"
      title={slug.replace(/-/g, " ")}
      fetcher={fetcher}
      deps={[slug]}
    />
  );
}
