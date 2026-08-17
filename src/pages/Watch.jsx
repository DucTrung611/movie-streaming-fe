import { Link, useParams, useSearchParams } from "react-router-dom";
import { useOphim } from "../hooks/useOphim";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getMovieDetail } from "../api/ophim";
import VideoPlayer from "../components/VideoPlayer";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import "./Watch.css";

export default function Watch() {
  const { slug, episodeSlug } = useParams();
  const [searchParams] = useSearchParams();
  const serverIndex = Number(searchParams.get("server") || 0);

  // Chỉ phụ thuộc slug — chuyển tập/server không fetch lại toàn bộ phim.
  const { data, loading, error } = useOphim(() => getMovieDetail(slug), [slug]);

  const movieForTitle = data?.movie;
  const episodeForTitle = movieForTitle
    ? data.episodes
        .flatMap((s) => s.server_data)
        .find((e) => e.slug === episodeSlug)
    : null;
  useDocumentTitle(
    movieForTitle &&
      `${episodeForTitle?.name || ""} ${movieForTitle.name}`.trim()
  );

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error.message} />;
  if (!data?.movie) return <ErrorState message="Không tìm thấy phim." />;

  const { movie, episodes } = data;
  const server = episodes[serverIndex] || episodes[0];
  const episode =
    server?.server_data?.find((e) => e.slug === episodeSlug) ||
    server?.server_data?.[0];

  if (!episode) {
    return <ErrorState message="Không tìm thấy tập phim này." />;
  }

  return (
    <div className="section container watch-page">
      <div className="watch-page__header">
        <Link to={`/phim/${movie.slug}`} className="see-all">
          ‹ {movie.name}
        </Link>
        <h1>{episode.name}</h1>
      </div>

      <div className="watch-page__player">
        <div className="film-rail" aria-hidden="true" />
        {episode.link_m3u8 ? (
          <VideoPlayer src={episode.link_m3u8} />
        ) : episode.link_embed ? (
          <iframe
            className="watch-page__iframe"
            src={episode.link_embed}
            title={episode.name}
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
          />
        ) : (
          <p className="state-message error">
            Tập này chưa có link phát. Thử server khác bên dưới.
          </p>
        )}
        <div className="film-rail" aria-hidden="true" />
      </div>

      <div className="watch-page__servers">
        {episodes.map((s, i) => (
          <Link
            key={s.server_name}
            to={`/xem-phim/${movie.slug}/${
              s.server_data.find((e) => e.slug === episodeSlug)?.slug ||
              s.server_data[0]?.slug
            }?server=${i}`}
            className={
              i === serverIndex ? "server-tab is-active" : "server-tab"
            }
          >
            {s.server_name}
          </Link>
        ))}
      </div>

      <div className="episode-list watch-page__episodes">
        {server.server_data.map((ep) => (
          <Link
            key={ep.slug}
            to={`/xem-phim/${movie.slug}/${ep.slug}?server=${serverIndex}`}
            className={
              ep.slug === episodeSlug
                ? "episode-chip is-active"
                : "episode-chip"
            }
          >
            {ep.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
