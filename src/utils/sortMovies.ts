import type { Movie } from "../types/movie";

export type SortOption = "year-desc" | "year-asc" | "name-asc" | "name-desc";

/**
 * API Ophim không hỗ trợ sắp xếp theo năm phát hành/tên phim ở phía
 * server (tham số sort_field/sort_type bị bỏ qua), nên sắp xếp lại danh
 * sách đã fetch ở client.
 */
export function sortMovies<T extends Movie>(
  movies: T[],
  sort: SortOption = "year-desc"
): T[] {
  const sorted = [...movies];
  switch (sort) {
    case "year-asc":
      return sorted.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name, "vi"));
    case "year-desc":
    default:
      return sorted.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  }
}

/** @deprecated dùng sortMovies với SortOption thay thế */
export function sortMoviesByYear<T extends Movie>(
  movies: T[],
  order: "desc" | "asc" = "desc"
): T[] {
  return sortMovies(movies, order === "desc" ? "year-desc" : "year-asc");
}
