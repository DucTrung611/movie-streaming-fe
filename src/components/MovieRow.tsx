import MovieCard from "./MovieCard";
import type { Movie } from "../types/movie";
import "./MovieRow.css";

interface MovieRowProps {
  movies: Movie[] | null | undefined;
  cdnImageDomain: string;
}

/** Hàng phim cuộn ngang kiểu Netflix, dùng cho các mục nổi bật trên trang chủ. */
export default function MovieRow({ movies, cdnImageDomain }: MovieRowProps) {
  if (!movies || movies.length === 0) {
    return <p className="state-message">Không tìm thấy phim nào.</p>;
  }

  return (
    <div className="movie-row">
      {movies.map((movie) => (
        <div className="movie-row__item" key={movie._id || movie.slug}>
          <MovieCard movie={movie} cdnImageDomain={cdnImageDomain} />
        </div>
      ))}
    </div>
  );
}
