import { Link, useParams } from "react-router-dom";
import type { CSSProperties } from "react";
import type { EpisodeServer, Movie } from "../types/movie";
import { useOphim } from "../hooks/useOphim";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useFavorites } from "../hooks/useFavorites";
import { getMovieDetail } from "../api/ophim";
import { resolveImageUrl } from "../utils/image";
import { showToast } from "../utils/toast";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import RelatedMovies from "../components/RelatedMovies";
import Breadcrumb from "../components/Breadcrumb";
import "./MovieDetail.css";

export default function MovieDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data, loading, error } = useOphim(() => getMovieDetail(slug), [slug]);
  useDocumentTitle(data?.movie?.name);
  const { isFavorite, toggleFavorite } = useFavorites();

  if (loading) return <Loader variant="hero" />;
  if (error) return <ErrorState message={error.message} />;
  if (!data?.movie) return <ErrorState message="Không tìm thấy phim." />;

  const { movie, episodes, cdnImageDomain } = data;
  const poster = resolveImageUrl(movie.poster_url || movie.thumb_url, cdnImageDomain);
  const backdrop = resolveImageUrl(movie.thumb_url || movie.poster_url, cdnImageDomain);
  const firstEpisode = episodes?.[0]?.server_data?.[0];
  const favorited = isFavorite(movie.slug);

  function handleToggleFavorite() {
    const wasFavorited = favorited;
    toggleFavorite({
      _id: movie._id,
      slug: movie.slug,
      name: movie.name,
      origin_name: movie.origin_name,
      year: movie.year,
      poster_url: poster,
      episode_current: movie.episode_current,
    });
    showToast(
      wasFavorited ? "Đã bỏ khỏi danh sách yêu thích" : "Đã thêm vào danh sách yêu thích",
      "success"
    );
  }

  return (
    <div>
      <div
        className="movie-hero"
        style={{ "--backdrop": `url(${backdrop})` } as CSSProperties}
      >
        <div className="movie-hero__scrim" />
        <div className="container movie-hero__row">
          <img className="movie-hero__poster" src={poster} alt={movie.name} />

          <div className="movie-hero__info">
            <Breadcrumb
              items={[
                { label: movie.type === "series" ? "Phim bộ" : "Phim lẻ" },
                { label: movie.name },
              ]}
            />
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
            {movie.director && movie.director.length > 0 && (
              <p className="movie-hero__meta">
                <strong>Đạo diễn:</strong> {movie.director.join(", ")}
              </p>
            )}
            {movie.actor && movie.actor.length > 0 && (
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

            <div className="movie-hero__actions">
              {firstEpisode && (
                <Link
                  to={`/xem-phim/${movie.slug}/${firstEpisode.slug}?server=0`}
                  className="btn btn-primary"
                >
                  ▶ Xem phim
                </Link>
              )}
              <button
                type="button"
                onClick={handleToggleFavorite}
                aria-pressed={favorited}
                className={`btn btn-outline favorite-toggle${
                  favorited ? " is-active" : ""
                }`}
              >
                {favorited ? "♥ Đã lưu" : "♡ Yêu thích"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="section container">
        <div className="section-head">
          <h2>Danh sách tập</h2>
        </div>
        <EpisodeLists movie={movie} episodes={episodes} />
      </div>

      <RelatedMovies movie={movie} />
    </div>
  );
}

function EpisodeLists({
  movie,
  episodes,
}: {
  movie: Movie;
  episodes: EpisodeServer[] | undefined;
}) {
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
