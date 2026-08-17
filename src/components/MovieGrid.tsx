import MovieCard from "./MovieCard";
import type { Movie } from "../types/movie";
import "./MovieGrid.css";

interface MovieGridProps {
  movies: Movie[] | null | undefined;
  cdnImageDomain: string;
}

export default function MovieGrid({ movies, cdnImageDomain }: MovieGridProps) {
  if (!movies || movies.length === 0) {
    return <p className="state-message">Không tìm thấy phim nào.</p>;
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard
          key={movie._id || movie.slug}
          movie={movie}
          cdnImageDomain={cdnImageDomain}
        />
      ))}
    </div>
  );
}
