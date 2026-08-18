import MovieCard from "./MovieCard";
import type { Movie } from "../types/movie";
import "./MovieGrid.css";

interface MovieGridProps {
  movies: Movie[] | null | undefined;
  cdnImageDomain: string;
  /** Số item đầu tải ảnh eager/priority thay vì lazy — dùng cho hàng đầu của lưới, gần đầu trang. */
  priorityCount?: number;
}

export default function MovieGrid({
  movies,
  cdnImageDomain,
  priorityCount = 0,
}: MovieGridProps) {
  if (!movies || movies.length === 0) {
    return <p className="state-message">Không tìm thấy phim nào.</p>;
  }

  return (
    <div className="movie-grid">
      {movies.map((movie, index) => (
        <MovieCard
          key={movie._id || movie.slug}
          movie={movie}
          cdnImageDomain={cdnImageDomain}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
