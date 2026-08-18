import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { getMoviesByGenre } from "../api/ophim";
import MovieListPage from "../components/MovieListPage";
import NotFound from "./NotFound";
import { sortMoviesByYear } from "../utils/sortMovies";
import { BLOCKED_CATEGORY_SLUGS } from "../utils/contentFilter";

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

  if (BLOCKED_CATEGORY_SLUGS.includes(slug)) return <NotFound />;

  return (
    <MovieListPage
      eyebrow="Thể loại"
      title={slug.replace(/-/g, " ")}
      fetcher={fetcher}
      deps={[slug]}
      breadcrumb={[
        { label: "Thể loại", to: "/the-loai" },
        { label: slug.replace(/-/g, " ") },
      ]}
    />
  );
}
