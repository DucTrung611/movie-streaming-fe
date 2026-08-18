import { useMemo } from "react";
import { useOphim } from "../hooks/useOphim";
import { getMoviesByGenre, getMoviesByCountry } from "../api/ophim";
import MovieRow from "./MovieRow";
import type { Movie } from "../types/movie";

interface RelatedMoviesProps {
  movie: Movie;
}

/**
 * API nguồn (dạng Ophim) không có endpoint "phim liên quan" — đây chỉ là
 * suy luận client-side: lấy danh sách theo thể loại đầu tiên (hoặc quốc
 * gia nếu phim không có thể loại) rồi chấm điểm/sắp xếp lại theo số điểm
 * trùng (thể loại, quốc gia, cùng thập niên phát hành) với phim đang xem.
 * Vì vậy gọi là "Phim cùng thể loại", không phải gợi ý cá nhân hoá thật.
 */
export default function RelatedMovies({ movie }: RelatedMoviesProps) {
  const genreSlug = movie.category?.[0]?.slug;
  const countrySlug = movie.country?.[0]?.slug;

  const { data, loading } = useOphim(() => {
    if (genreSlug) return getMoviesByGenre(genreSlug, { limit: 16 });
    if (countrySlug) return getMoviesByCountry(countrySlug, { limit: 16 });
    return Promise.resolve(null);
  }, [genreSlug, countrySlug]);

  const related = useMemo(() => {
    if (!data) return [];
    const categorySlugs = new Set((movie.category || []).map((c) => c.slug));
    const countrySlugs = new Set((movie.country || []).map((c) => c.slug));

    return data.items
      .filter((item) => item.slug !== movie.slug)
      .map((item) => {
        let score = 0;
        for (const c of item.category || []) if (categorySlugs.has(c.slug)) score++;
        for (const c of item.country || []) if (countrySlugs.has(c.slug)) score++;
        if (item.year && movie.year && Math.floor(item.year / 10) === Math.floor(movie.year / 10)) {
          score++;
        }
        return { item, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((entry) => entry.item);
  }, [data, movie]);

  if (!genreSlug && !countrySlug) return null;
  if (!loading && related.length === 0) return null;

  return (
    <div className="section container">
      <div className="section-head">
        <h2>Phim cùng thể loại</h2>
      </div>
      {loading ? (
        <p className="state-message">Đang tải...</p>
      ) : (
        <MovieRow movies={related} cdnImageDomain={data?.cdnImageDomain || ""} />
      )}
    </div>
  );
}
