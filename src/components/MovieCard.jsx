import { Link } from "react-router-dom";
import { resolveImageUrl } from "../utils/image";
import "./MovieCard.css";

export default function MovieCard({ movie, cdnImageDomain }) {
  const poster = resolveImageUrl(
    movie.poster_url || movie.thumb_url,
    cdnImageDomain
  );
  const meta = movie.episode_current || movie.quality || movie.lang;

  return (
    <Link to={`/phim/${movie.slug}`} className="movie-card">
      <div className="movie-card__poster">
        {poster ? (
          <img src={poster} alt={movie.name} loading="lazy" />
        ) : (
          <div className="movie-card__poster movie-card__poster--empty" />
        )}
        {meta && <span className="movie-card__badge">{meta}</span>}
      </div>
      <div className="movie-card__tear" aria-hidden="true" />
      <div className="movie-card__info">
        <h3 className="movie-card__title">{movie.name}</h3>
        {movie.origin_name && (
          <p className="movie-card__original">{movie.origin_name}</p>
        )}
        {movie.year && <p className="movie-card__year">{movie.year}</p>}
      </div>
    </Link>
  );
}
