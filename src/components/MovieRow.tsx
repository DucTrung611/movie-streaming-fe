import MovieCard from "./MovieCard";
import type { Movie } from "../types/movie";
import "./MovieRow.css";

interface MovieRowProps {
  movies: Movie[] | null | undefined;
  cdnImageDomain: string;
  /** Số item đầu tải ảnh eager/priority thay vì lazy — dùng cho hàng nằm ngay dưới hero. */
  priorityCount?: number;
}

/** Hàng phim cuộn ngang kiểu Netflix, dùng cho các mục nổi bật trên trang chủ. */
export default function MovieRow({
  movies,
  cdnImageDomain,
  priorityCount = 0,
}: MovieRowProps) {
  if (!movies || movies.length === 0) {
    return <p className="state-message">Không tìm thấy phim nào.</p>;
  }

  return (
    <div className="movie-row">
      {movies.map((movie, index) => (
        <div className="movie-row__item" key={movie._id || movie.slug}>
          <MovieCard
            movie={movie}
            cdnImageDomain={cdnImageDomain}
            priority={index < priorityCount}
          />
        </div>
      ))}
    </div>
  );
}
