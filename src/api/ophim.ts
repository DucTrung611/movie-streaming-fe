import { apiClient, API_BASE_URL } from "./client";
import type {
  DetailResponse,
  ListResponse,
  Movie,
  MovieType,
  NamedSlug,
} from "../types/movie";

/**
 * LƯU Ý QUAN TRỌNG
 * ------------------
 * File này được viết theo cấu trúc API phổ biến của "họ" Ophim
 * (ophim1.com, ophim16/17/19.cc, phimapi.com, kkphim...) vì trang
 * https://ophim19.cc/api-document chặn truy cập tự động nên không đọc
 * trực tiếp được. Cấu trúc bên dưới dựa trên tài liệu tương đương của
 * các domain anh em cùng hệ. Nếu domain bạn dùng trả dữ liệu hơi khác
 * (tên field khác, path khác...), chỉ cần sửa lại trong file này —
 * phần UI ở các trang khác không cần đổi.
 *
 * Cách kiểm tra nhanh: mở thẳng một URL bên dưới trên trình duyệt,
 * xem JSON trả về rồi đối chiếu với các hàm normalize*.
 *
 * apiClient bóc thẳng res.data qua interceptor (xem client.ts) nên các
 * lời gọi apiClient.get() bên dưới thực chất trả về JSON thô — kiểu dữ
 * liệu của nó không cố định giữa các domain nên khai báo là `unknown`
 * và tự bóc tách bằng optional chaining trong các hàm normalize*.
 */

type RawResponse = Record<string, any>;

// Chuẩn hoá danh sách phim (nhiều dạng response khác nhau tuỳ endpoint)
function normalizeListResponse(raw: RawResponse): ListResponse {
  const data = raw?.data ?? raw;
  const items: Movie[] = data?.items ?? [];
  const pagination =
    data?.params?.pagination ?? data?.pagination ?? raw?.pagination ?? {};
  const cdnImageDomain =
    data?.APP_DOMAIN_CDN_IMAGE ?? raw?.APP_DOMAIN_CDN_IMAGE ?? "";

  return {
    items,
    cdnImageDomain,
    currentPage: pagination.currentPage ?? 1,
    totalPages:
      pagination.totalPages ??
      Math.ceil(
        (pagination.totalItems ?? items.length) /
          (pagination.totalItemsPerPage ?? 24)
      ) ??
      1,
    totalItems: pagination.totalItems ?? items.length,
    titlePage: data?.titlePage ?? data?.seoOnPage?.titleHead ?? "",
    breadCrumb: data?.breadCrumb ?? [],
  };
}

function normalizeDetailResponse(raw: RawResponse): DetailResponse {
  const movie = raw?.movie ?? raw?.data?.item ?? raw?.data ?? null;
  const episodes = raw?.episodes ?? raw?.data?.item?.episode ?? [];
  const cdnImageDomain =
    raw?.data?.APP_DOMAIN_CDN_IMAGE ?? raw?.APP_DOMAIN_CDN_IMAGE ?? "";
  return { movie, episodes, cdnImageDomain };
}

/** Phim mới cập nhật */
export async function getLatestMovies(page = 1): Promise<ListResponse> {
  const raw: RawResponse = await apiClient.get(
    "/danh-sach/phim-moi-cap-nhat",
    { params: { page } }
  );
  return normalizeListResponse(raw);
}

/**
 * Danh sách theo loại: phim-bo, phim-le, tv-shows, hoat-hinh,
 * phim-vietsub, phim-thuyet-minh, phim-long-tieng
 */
export async function getMoviesByType(
  typeList: string,
  params: Record<string, unknown> = {}
): Promise<ListResponse> {
  const raw: RawResponse = await apiClient.get(
    `/v1/api/danh-sach/${typeList}`,
    { params }
  );
  return normalizeListResponse(raw);
}

function normalizeSimpleListResponse(raw: RawResponse): NamedSlug[] {
  const data = raw?.data ?? raw;
  if (Array.isArray(data)) return data;
  return data?.items ?? [];
}

// Ẩn khỏi mọi nơi lọc theo thể loại (trang duyệt thể loại, dropdown bộ lọc...).
const HIDDEN_GENRE_SLUGS = ["phim-18"];

export async function getGenres(): Promise<NamedSlug[]> {
  const raw: RawResponse = await apiClient.get("/v1/api/the-loai");
  const items = normalizeSimpleListResponse(raw);
  return items.filter((g) => !HIDDEN_GENRE_SLUGS.includes(g.slug));
}

export async function getMoviesByGenre(
  slug: string,
  params: Record<string, unknown> = {}
): Promise<ListResponse> {
  const raw: RawResponse = await apiClient.get(`/v1/api/the-loai/${slug}`, {
    params,
  });
  return normalizeListResponse(raw);
}

export async function getCountries(): Promise<NamedSlug[]> {
  const raw: RawResponse = await apiClient.get("/v1/api/quoc-gia");
  return normalizeSimpleListResponse(raw);
}

export async function getMoviesByCountry(
  slug: string,
  params: Record<string, unknown> = {}
): Promise<ListResponse> {
  const raw: RawResponse = await apiClient.get(`/v1/api/quoc-gia/${slug}`, {
    params,
  });
  return normalizeListResponse(raw);
}

export async function getMoviesByYear(
  year: string | number,
  params: Record<string, unknown> = {}
): Promise<ListResponse> {
  const raw: RawResponse = await apiClient.get(`/v1/api/nam/${year}`, {
    params,
  });
  return normalizeListResponse(raw);
}

export async function searchMovies(
  keyword: string,
  params: Record<string, unknown> = {}
): Promise<ListResponse> {
  const raw: RawResponse = await apiClient.get("/v1/api/tim-kiem", {
    params: { keyword, ...params },
  });
  return normalizeListResponse(raw);
}

export async function getMovieDetail(slug: string): Promise<DetailResponse> {
  const raw: RawResponse = await apiClient.get(`/phim/${slug}`);
  return normalizeDetailResponse(raw);
}

export const MOVIE_TYPES: MovieType[] = [
  { slug: "phim-bo", label: "Phim bộ" },
  { slug: "phim-le", label: "Phim lẻ" },
  { slug: "hoat-hinh", label: "Hoạt hình" },
  { slug: "tv-shows", label: "TV Shows" },
  { slug: "phim-vietsub", label: "Vietsub" },
  { slug: "phim-thuyet-minh", label: "Thuyết minh" },
  { slug: "phim-long-tieng", label: "Lồng tiếng" },
];

export { API_BASE_URL };
