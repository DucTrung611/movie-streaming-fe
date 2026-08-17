import "./FilterBar.css";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1969 }, (_, i) => currentYear - i);

export default function FilterBar({
  genres = [],
  countries = [],
  value,
  onChange,
}) {
  function set(field, val) {
    onChange({ ...value, [field]: val });
  }

  return (
    <div className="filter-bar">
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
