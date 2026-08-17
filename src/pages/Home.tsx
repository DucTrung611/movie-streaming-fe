import { Link } from "react-router-dom";
import { useOphim } from "../hooks/useOphim";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getLatestMovies, getMoviesByType } from "../api/ophim";
import { resolveImageUrl } from "../utils/image";
import { sortMoviesByYear } from "../utils/sortMovies";
import MovieRow from "../components/MovieRow";
import ContinueWatchingSection from "../components/ContinueWatchingSection";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import type { ListResponse } from "../types/movie";
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
      <FeaturedHero data={data} loading={loading} error={error} />

      <div className="home-rows">
        <ContinueWatchingSection />

        {SECTIONS.map((s) => (
          <TypeSection key={s.type} {...s} />
        ))}
      </div>
    </div>
  );
}

function FeaturedHero({
  data,
  loading,
  error,
}: {
  data: ListResponse | null;
  loading: boolean;
  error: Error | null;
}) {
  const featured = data?.items?.[0];
  const backdrop = featured
    ? resolveImageUrl(
        featured.thumb_url || featured.poster_url,
        data?.cdnImageDomain
      )
    : "";
  const firstEpisodeHint = featured?.episode_current;

  if (loading) {
    return (
      <section className="hero hero--empty">
        <Loader />
      </section>
    );
  }

  if (error) {
    return (
      <section className="hero hero--empty">
        <ErrorState message={error.message} />
      </section>
    );
  }

  if (!featured) return null;

  return (
    <section
      className="hero"
      style={{ backgroundImage: `url(${backdrop})` }}
    >
      <div className="hero__scrim" />
      <div className="hero__scrim hero__scrim--side" />
      <div className="container hero__content">
        <span className="hero__eyebrow">Mới cập nhật</span>
        <h1 className="hero__title">{featured.name}</h1>
        {featured.origin_name && (
          <p className="hero__original">{featured.origin_name}</p>
        )}
        <div className="hero__badges">
          {featured.quality && <span className="badge">{featured.quality}</span>}
          {firstEpisodeHint && <span className="badge">{firstEpisodeHint}</span>}
          {featured.year && <span className="badge">{featured.year}</span>}
        </div>
        {featured.content && (
          <p
            className="hero__desc"
            dangerouslySetInnerHTML={{ __html: featured.content }}
          />
        )}
        <div className="hero__actions">
          <Link to={`/phim/${featured.slug}`} className="btn btn-primary">
            ▶ Xem ngay
          </Link>
          <Link to={`/phim/${featured.slug}`} className="btn btn-outline">
            ⓘ Chi tiết
          </Link>
        </div>
      </div>
    </section>
  );
}

function TypeSection({
  type,
  eyebrow,
  title,
}: {
  type: string;
  eyebrow: string;
  title: string;
}) {
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
        <MovieRow
          movies={sortMoviesByYear(data!.items).slice(0, 12)}
          cdnImageDomain={data!.cdnImageDomain}
        />
      )}
    </section>
  );
}
