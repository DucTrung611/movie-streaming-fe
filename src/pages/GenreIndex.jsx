import { Link } from "react-router-dom";
import { useOphim } from "../hooks/useOphim";
import { getGenres } from "../api/ophim";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import "./IndexTags.css";

export default function GenreIndex() {
  const { data, loading, error } = useOphim(() => getGenres(), []);

  return (
    <div className="section container">
      <div className="section-head">
        <div>
          <span className="eyebrow">Duyệt theo</span>
          <h2>Thể loại</h2>
        </div>
      </div>
      {loading && <Loader />}
      {error && <ErrorState message={error.message} />}
      {!loading && !error && (
        <div className="tag-grid">
          {(data || []).map((g) => (
            <Link key={g.slug} to={`/the-loai/${g.slug}`} className="tag-chip">
              {g.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
