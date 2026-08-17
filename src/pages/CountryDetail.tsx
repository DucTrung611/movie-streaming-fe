import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { getMoviesByCountry } from "../api/ophim";
import MovieListPage from "../components/MovieListPage";

export default function CountryDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const fetcher = useCallback(
    (page: number) => getMoviesByCountry(slug, { page, limit: 24 }),
    [slug]
  );

  return (
    <MovieListPage
      eyebrow="Quốc gia"
      title={slug.replace(/-/g, " ")}
      fetcher={fetcher}
      deps={[slug]}
    />
  );
}
