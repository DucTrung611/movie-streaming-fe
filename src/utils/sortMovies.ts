import type { Movie } from "../types/movie";

/**
 * API Ophim không hỗ trợ sắp xếp theo năm phát hành ở phía server (tham
 * số sort_field/sort_type bị bỏ qua), nên sắp xếp lại danh sách đã fetch
 * ở client để mặc định hiển thị phim mới phát hành trước.
 */
export function sortMoviesByYear<T extends Movie>(
  movies: T[],
  order: "desc" | "asc" = "desc"
): T[] {
  return [...movies].sort((a, b) => {
    const ay = a.year ?? 0;
    const by = b.year ?? 0;
    return order === "desc" ? by - ay : ay - by;
  });
}
