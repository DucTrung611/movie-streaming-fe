import { Link, useParams } from "react-router-dom";
import { useOphim } from "../hooks/useOphim";
import { getMovieDetail } from "../api/ophim";
import { resolveImageUrl } from "../utils/image";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import "./MovieDetail.css";

export default function MovieDetail() {
  const { slug } = useParams();
  const { data, loading, error } = useOphim(() => getMovieDetail(slug), [slug]);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error.message} />;
  if (!data?.movie) return <ErrorState message="Không tìm thấy phim." />;

  const { movie, episodes, cdnImageDomain } = data;
  const poster = resolveImageUrl(movie.thumb_url || movie.poster_url, cdnImageDomain);
  const firstEpisode = episodes?.[0]?.server_data?.[0];

  return (
    <div>
      <div
        className="movie-hero"
        style={{ "--backdrop": `url(${poster})` }}
      >
        <div className="movie-hero__scrim" />
        <div className="container movie-hero__row">
          <img className="movie-hero__poster" src={poster} alt={movie.name} />

          <div className="movie-hero__info">
            <span className="eyebrow">
              {movie.type === "series" ? "Phim bộ" : "Phim lẻ"} ·{" "}
              {movie.year}
            </span>
            <h1>{movie.name}</h1>
            {movie.origin_name && (
              <p className="movie-hero__original">{movie.origin_name}</p>
            )}

            <div className="movie-hero__badges">
              {movie.quality && <span className="badge">{movie.quality}</span>}
              {movie.lang && <span className="badge">{movie.lang}</span>}
              {movie.episode_current && (
                <span className="badge">{movie.episode_current}</span>
              )}
              {movie.time && <span className="badge">{movie.time}</span>}
            </div>

            {movie.category && (
              <p className="movie-hero__meta">
                <strong>Thể loại:</strong>{" "}
                {movie.category.map((c) => c.name).join(", ")}
              </p>
            )}
            {movie.country && (
              <p className="movie-hero__meta">
                <strong>Quốc gia:</strong>{" "}
                {movie.country.map((c) => c.name).join(", ")}
              </p>
            )}
            {movie.director?.length > 0 && (
              <p className="movie-hero__meta">
                <strong>Đạo diễn:</strong> {movie.director.join(", ")}
              </p>
            )}
            {movie.actor?.length > 0 && (
              <p className="movie-hero__meta">
                <strong>Diễn viên:</strong> {movie.actor.join(", ")}
              </p>
            )}

            {movie.content && (
              <p
                className="movie-hero__content"
                dangerouslySetInnerHTML={{ __html: movie.content }}
              />
            )}

            {firstEpisode && (
              <Link
                to={`/xem-phim/${movie.slug}/${firstEpisode.slug}?server=0`}
                className="btn btn-primary"
              >
                ▶ Xem phim
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="film-rail" aria-hidden="true" />

      <div className="section container">
        <div className="section-head">
          <h2>Danh sách tập</h2>
        </div>
        <EpisodeLists movie={movie} episodes={episodes} />
      </div>
    </div>
  );
}

function EpisodeLists({ movie, episodes }) {
  if (!episodes || episodes.length === 0) {
    return <p className="state-message">Chưa có dữ liệu tập phim.</p>;
  }

  return (
    <div className="episode-servers">
      {episodes.map((server, serverIndex) => (
        <div key={server.server_name} className="episode-server">
          <h3 className="episode-server__name">{server.server_name}</h3>
          <div className="episode-list">
            {server.server_data.map((ep) => (
              <Link
                key={ep.slug}
                to={`/xem-phim/${movie.slug}/${ep.slug}?server=${serverIndex}`}
                className="episode-chip"
              >
                {ep.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
