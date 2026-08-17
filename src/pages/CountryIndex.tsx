import { Link } from "react-router-dom";
import { useOphim } from "../hooks/useOphim";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getCountries } from "../api/ophim";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import type { NamedSlug } from "../types/movie";
import "./IndexTags.css";

// Quốc gia có nhiều phim/được tìm nhiều nhất — ưu tiên hiện đầu danh sách.
const PINNED_SLUGS = ["viet-nam", "au-my", "han-quoc", "trung-quoc"];

function sortPinnedFirst(items: NamedSlug[]) {
  const bySlug = new Map(items.map((c) => [c.slug, c]));
  const pinned = PINNED_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (c): c is NamedSlug => Boolean(c)
  );
  const rest = items.filter((c) => !PINNED_SLUGS.includes(c.slug));
  return [...pinned, ...rest];
}

export default function CountryIndex() {
  useDocumentTitle("Quốc gia");
  const { data, loading, error } = useOphim(() => getCountries(), []);

  return (
    <div className="section container">
      <div className="section-head">
        <div>
          <span className="eyebrow">Duyệt theo</span>
          <h2>Quốc gia</h2>
        </div>
      </div>
      {loading && <Loader />}
      {error && <ErrorState message={error.message} />}
      {!loading && !error && (
        <div className="tag-grid">
          {sortPinnedFirst(data || []).map((c) => (
            <Link key={c.slug} to={`/quoc-gia/${c.slug}`} className="tag-chip">
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
