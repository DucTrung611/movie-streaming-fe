import { Link } from "react-router-dom";
import { useOphim } from "../hooks/useOphim";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getLatestMovies, getMoviesByType } from "../api/ophim";
import { resolveImageUrl } from "../utils/image";
import MovieGrid from "../components/MovieGrid";
import ContinueWatchingSection from "../components/ContinueWatchingSection";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import "./Home.css";

const SECTIONS = [
  { type: "phim-bo", eyebrow: "Đang chiếu", title: "Phim bộ mới cập nhật" },
  { type: "phim-le", eyebrow: "Đang chiếu", title: "Phim lẻ mới cập nhật" },
  { type: "hoat-hinh", eyebrow: "Đang chiếu", title: "Hoạt hình mới cập nhật" },
];

export default function Home() {
  useDocumentTitle();
  const { data, loading, error } = useOphim(() => getLatestMovies(1), []);

  return (
    <div>
      <ReelHero data={data} loading={loading} error={error} />
      <ContinueWatchingSection />

      {SECTIONS.map((s) => (
        <TypeSection key={s.type} {...s} />
      ))}
    </div>
  );
}

function ReelHero({ data, loading, error }) {
  const items = data?.items?.slice(0, 10) || [];

  return (
    <section className="reel-hero">
      <div className="film-rail" aria-hidden="true" />
      <div className="container reel-hero__head">
        <span className="eyebrow">Suất chiếu hôm nay</span>
        <h1>Mới cập nhật</h1>
      </div>

      {loading && <Loader />}
      {error && <ErrorState message={error.message} />}

      {!loading && !error && (
        <div className="reel-strip">
          {items.map((movie) => (
            <Link
              key={movie._id || movie.slug}
              to={`/phim/${movie.slug}`}
              className="reel-frame"
            >
              <img
                src={resolveImageUrl(
                  movie.poster_url || movie.thumb_url,
                  data.cdnImageDomain
                )}
                alt={movie.name}
                loading="lazy"
              />
              <div className="reel-frame__caption">
                <p className="reel-frame__title">{movie.name}</p>
                <p className="reel-frame__meta">
                  {movie.episode_current || movie.year}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
      <div className="film-rail" aria-hidden="true" />
    </section>
  );
}

function TypeSection({ type, eyebrow, title }) {
  const { data, loading, error } = useOphim(
    () => getMoviesByType(type, { page: 1, limit: 12 }),
    [type]
  );

  return (
    <section className="section container">
      <div className="section-head">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        <Link to={`/danh-sach/${type}`} className="see-all">
          Xem tất cả →
        </Link>
      </div>

      {loading && <Loader />}
      {error && <ErrorState message={error.message} />}
      {!loading && !error && (
        <MovieGrid
          movies={data.items.slice(0, 12)}
          cdnImageDomain={data.cdnImageDomain}
        />
      )}
    </section>
  );
}
