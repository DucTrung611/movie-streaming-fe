import MovieCard from "./MovieCard";
import "./MovieGrid.css";

export default function MovieGrid({ movies, cdnImageDomain }) {
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
