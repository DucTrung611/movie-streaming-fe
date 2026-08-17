import { Link } from "react-router-dom";
import { useOphim } from "../hooks/useOphim";
import { getCountries } from "../api/ophim";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import "./IndexTags.css";

export default function CountryIndex() {
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
          {(data || []).map((c) => (
            <Link key={c.slug} to={`/quoc-gia/${c.slug}`} className="tag-chip">
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
