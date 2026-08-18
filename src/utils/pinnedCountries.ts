import type { NamedSlug } from "../types/movie";

// Quốc gia có nhiều phim/được tìm nhiều nhất — ưu tiên hiện đầu danh sách.
const PINNED_SLUGS = ["han-quoc", "trung-quoc", "au-my", "viet-nam"];

export function sortPinnedCountriesFirst(items: NamedSlug[]) {
  const bySlug = new Map(items.map((c) => [c.slug, c]));
  const pinned = PINNED_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (c): c is NamedSlug => Boolean(c)
  );
  const rest = items.filter((c) => !PINNED_SLUGS.includes(c.slug));
  return [...pinned, ...rest];
}
