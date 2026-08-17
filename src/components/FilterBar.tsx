import type { ListFilters, NamedSlug } from "../types/movie";
import "./FilterBar.css";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1969 }, (_, i) => currentYear - i);

interface FilterBarProps {
  genres?: NamedSlug[];
  countries?: NamedSlug[];
  value: ListFilters;
  onChange: (value: ListFilters) => void;
  sort?: "desc" | "asc";
  onSortChange?: (sort: "desc" | "asc") => void;
}

export default function FilterBar({
  genres = [],
  countries = [],
  value,
  onChange,
  sort = "desc",
  onSortChange,
}: FilterBarProps) {
  function set(field: keyof ListFilters, val: string) {
    onChange({ ...value, [field]: val });
  }

  return (
    <div className="filter-bar">
      {onSortChange && (
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as "desc" | "asc")}
        >
          <option value="desc">Năm phát hành: Mới nhất</option>
          <option value="asc">Năm phát hành: Cũ nhất</option>
        </select>
      )}

      <select
        value={value.category || ""}
        onChange={(e) => set("category", e.target.value)}
      >
        <option value="">Tất cả thể loại</option>
        {genres.map((g) => (
          <option key={g.slug} value={g.slug}>
            {g.name}
          </option>
        ))}
      </select>

      <select
        value={value.country || ""}
        onChange={(e) => set("country", e.target.value)}
      >
        <option value="">Tất cả quốc gia</option>
        {countries.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={value.year || ""}
        onChange={(e) => set("year", e.target.value)}
      >
        <option value="">Tất cả năm</option>
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <select
        value={value.sort_lang || ""}
        onChange={(e) => set("sort_lang", e.target.value)}
      >
        <option value="">Vietsub / TM / LT</option>
        <option value="vietsub">Vietsub</option>
        <option value="thuyet-minh">Thuyết minh</option>
        <option value="long-tieng">Lồng tiếng</option>
      </select>
    </div>
  );
}
