import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { getMoviesByGenre } from "../api/ophim";
import MovieListPage from "../components/MovieListPage";

export default function GenreDetail() {
  const { slug } = useParams();
  const fetcher = useCallback(
    (page) => getMoviesByGenre(slug, { page, limit: 24 }),
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
