import { useCallback, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useOphim } from "../hooks/useOphim";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useContinueWatching } from "../hooks/useContinueWatching";
import { getMovieDetail } from "../api/ophim";
import { resolveImageUrl } from "../utils/image";
import VideoPlayer from "../components/VideoPlayer";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import "./Watch.css";

export default function Watch() {
  const { slug = "", episodeSlug } = useParams<{
    slug: string;
    episodeSlug: string;
  }>();
  const [searchParams] = useSearchParams();
  const serverIndex = Number(searchParams.get("server") || 0);

  // Chỉ phụ thuộc slug — chuyển tập/server không fetch lại toàn bộ phim.
  const { data, loading, error } = useOphim(() => getMovieDetail(slug), [slug]);

  // Mọi hook phải gọi trước các early return bên dưới (quy tắc hook của
  // React), nên dùng optional chaining trên `data` thay vì destructure.
  const movie = data?.movie;
  const episodes = data?.episodes;
  const cdnImageDomain = data?.cdnImageDomain;

  const episodeForTitle = movie
    ? episodes?.flatMap((s) => s.server_data).find((e) => e.slug === episodeSlug)
    : null;
  useDocumentTitle(
    movie && `${episodeForTitle?.name || ""} ${movie.name}`.trim()
  );

  const poster = movie
    ? resolveImageUrl(movie.thumb_url || movie.poster_url, cdnImageDomain)
    : "";

  const { getSavedProgress, saveProgress } = useContinueWatching();

  const server = episodes ? episodes[serverIndex] || episodes[0] : null;
  const episode =
    server?.server_data?.find((e) => e.slug === episodeSlug) ||
    server?.server_data?.[0];

  // Chỉ đọc vị trí đã lưu 1 lần lúc mount/đổi phim — không phụ thuộc
  // vào tiến trình đang được ghi định kỳ, tránh VideoPlayer bị tua lại.
  const resumeEntry = useMemo(
    () => (movie ? getSavedProgress(movie.slug) : undefined),
    [getSavedProgress, movie?.slug]
  );
  const resumeTime =
    resumeEntry && episode && resumeEntry.episodeSlug === episode.slug
      ? resumeEntry.currentTime
      : 0;

  const handleProgress = useCallback(
    (currentTime: number, duration: number) => {
      if (!movie || !episode) return;
      saveProgress({
        slug: movie.slug,
        name: movie.name,
        poster_url: poster,
        episodeSlug: episode.slug,
        episodeName: episode.name,
        serverIndex,
        currentTime,
        duration,
      });
    },
    [
      saveProgress,
      movie?.slug,
      movie?.name,
      poster,
      episode?.slug,
      episode?.name,
      serverIndex,
    ]
  );

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error.message} />;
  if (!movie) return <ErrorState message="Không tìm thấy phim." />;

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
        {episode.link_m3u8 ? (
          <VideoPlayer
            src={episode.link_m3u8}
            poster={poster}
            resumeTime={resumeTime}
            onProgress={handleProgress}
          />
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
      </div>

      <div className="watch-page__servers">
        {episodes!.map((s, i) => (
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
        {server!.server_data.map((ep) => (
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
