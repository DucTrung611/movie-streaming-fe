import { useEffect, useMemo, useRef, useState } from "react";
import type { ListFilters, NamedSlug } from "../types/movie";
import type { SortOption } from "../utils/sortMovies";
import { sortPinnedCountriesFirst } from "../utils/pinnedCountries";
import "./FilterBar.css";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1969 }, (_, i) => currentYear - i);

interface FilterBarProps {
  genres?: NamedSlug[];
  countries?: NamedSlug[];
  value: ListFilters;
  onChange: (value: ListFilters) => void;
  sort?: SortOption;
  onSortChange?: (sort: SortOption) => void;
}

export default function FilterBar({
  genres = [],
  countries = [],
  value,
  onChange,
  sort = "year-desc",
  onSortChange,
}: FilterBarProps) {
  const selectedCategories = value.categories || [];
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const genreRef = useRef<HTMLDivElement>(null);
  const sortedCountries = useMemo(
    () => sortPinnedCountriesFirst(countries),
    [countries]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) {
        setIsGenreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function set(field: keyof ListFilters, val: string) {
    onChange({ ...value, [field]: val || undefined });
  }

  // Thứ tự phần tử trong value.categories chính là thứ tự người dùng bấm
  // chọn (không sắp xếp lại) — nơi gọi FilterBar (vd. ListByType.tsx)
  // dùng categories[0] làm thể loại "chính" gửi lên server (server chỉ
  // nhận 1 slug/lần), các thể loại còn lại chỉ lọc thêm ở client. Vì vậy
  // bỏ chọn thể loại đã chọn đầu tiên sẽ đổi luôn thể loại chính và kích
  // hoạt fetch lại — đây là hành vi có chủ đích, không phải bug.
  function toggleCategory(slug: string) {
    const next = selectedCategories.includes(slug)
      ? selectedCategories.filter((s) => s !== slug)
      : [...selectedCategories, slug];
    onChange({ ...value, categories: next.length ? next : undefined });
  }

  const hasActiveFilters =
    selectedCategories.length > 0 || Boolean(value.country) || Boolean(value.year) || Boolean(value.sort_lang);

  return (
    <div className="filter-bar">
      {onSortChange && (
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
        >
          <option value="year-desc">Năm phát hành: Mới nhất</option>
          <option value="year-asc">Năm phát hành: Cũ nhất</option>
          <option value="name-asc">Tên phim: A-Z</option>
          <option value="name-desc">Tên phim: Z-A</option>
        </select>
      )}

      <div className="filter-multiselect" ref={genreRef}>
        <button
          type="button"
          className={`filter-multiselect__trigger${
            selectedCategories.length ? " is-active" : ""
          }`}
          onClick={() => setIsGenreOpen((v) => !v)}
          aria-expanded={isGenreOpen}
        >
          Thể loại{selectedCategories.length ? ` (${selectedCategories.length})` : ""}
          <span className="filter-multiselect__caret">▾</span>
        </button>
        {isGenreOpen && (
          <div className="filter-multiselect__panel" role="listbox" aria-multiselectable>
            {genres.map((g) => (
              <label key={g.slug} className="filter-multiselect__option">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(g.slug)}
                  onChange={() => toggleCategory(g.slug)}
                />
                {g.name}
              </label>
            ))}
            {genres.length === 0 && (
              <p className="filter-multiselect__empty">Không có thể loại.</p>
            )}
          </div>
        )}
      </div>

      <select
        value={value.country || ""}
        onChange={(e) => set("country", e.target.value)}
      >
        <option value="">Tất cả quốc gia</option>
        {sortedCountries.map((c) => (
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

      {hasActiveFilters && (
        <button type="button" className="filter-bar__clear" onClick={() => onChange({})}>
          Xoá lọc
        </button>
      )}
    </div>
  );
}
