import { Link } from "react-router-dom";
import { resolveImageUrl } from "../utils/image";
import type { Movie } from "../types/movie";
import "./MovieCard.css";

interface MovieCardProps {
  movie: Movie & {
    episodeSlug?: string;
    episodeName?: string;
    serverIndex?: number;
    currentTime?: number;
    duration?: number;
  };
  cdnImageDomain: string;
}

export default function MovieCard({ movie, cdnImageDomain }: MovieCardProps) {
  const poster = resolveImageUrl(
    movie.poster_url || movie.thumb_url,
    cdnImageDomain
  );
  const meta = movie.episode_current || movie.quality || movie.lang;

  // Thẻ "tiếp tục xem" mang thêm episodeSlug/currentTime/duration — dùng
  // các trường này để trỏ thẳng tới tập đang xem dở và hiện vạch tiến
  // trình, không cần thêm prop riêng xuyên qua MovieGrid.
  const isContinueWatching = Boolean(movie.episodeSlug);
  const linkTo = isContinueWatching
    ? `/xem-phim/${movie.slug}/${movie.episodeSlug}?server=${movie.serverIndex || 0}`
    : `/phim/${movie.slug}`;
  const progressPercent =
    isContinueWatching && movie.duration
      ? Math.min(100, ((movie.currentTime ?? 0) / movie.duration) * 100)
      : null;

  return (
    <Link to={linkTo} className="movie-card">
      <div className="movie-card__poster">
        {poster ? (
          <img src={poster} alt={movie.name} loading="lazy" />
        ) : (
          <div className="movie-card__poster movie-card__poster--empty" />
        )}
        {isContinueWatching
          ? movie.episodeName && (
              <span className="movie-card__badge">{movie.episodeName}</span>
            )
          : meta && <span className="movie-card__badge">{meta}</span>}
        {progressPercent !== null && (
          <div className="movie-card__progress">
            <div
              className="movie-card__progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
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
