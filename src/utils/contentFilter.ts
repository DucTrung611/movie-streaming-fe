import type { Movie } from "../types/movie";

/** Thể loại bị chặn hiển thị ở mọi nơi trong app (danh sách, trang chủ,
 * tìm kiếm, xem trực tiếp qua URL). */
export const BLOCKED_CATEGORY_SLUGS = ["phim-18"];

export function isBlockedMovie(movie: Pick<Movie, "category"> | null | undefined): boolean {
  if (!movie?.category) return false;
  return movie.category.some((c) => BLOCKED_CATEGORY_SLUGS.includes(c.slug));
}

export function filterBlockedMovies<T extends Movie>(movies: T[]): T[] {
  return movies.filter((m) => !isBlockedMovie(m));
}
