// Kiểu dữ liệu lỏng (nhiều field optional) vì API Ophim/phimapi trả cấu
// trúc hơi khác nhau tuỳ domain — xem ghi chú trong src/api/ophim.ts.

export interface NamedSlug {
  name: string;
  slug: string;
}

export interface Movie {
  _id?: string;
  slug: string;
  name: string;
  origin_name?: string;
  content?: string;
  type?: string;
  status?: string;
  poster_url?: string;
  thumb_url?: string;
  year?: number;
  quality?: string;
  lang?: string;
  time?: string;
  episode_current?: string;
  category?: NamedSlug[];
  country?: NamedSlug[];
  director?: string[];
  actor?: string[];
}

/** Mục "tiếp tục xem" / "yêu thích" — Movie kèm thêm thông tin tiến trình xem. */
export interface ContinueWatchingItem extends Movie {
  episodeSlug: string;
  episodeName?: string;
  serverIndex?: number;
  currentTime: number;
  duration: number;
  updatedAt?: number;
}

export interface FavoriteItem extends Movie {
  addedAt?: number;
}

export interface Episode {
  name: string;
  slug: string;
  filename?: string;
  link_embed?: string;
  link_m3u8?: string;
}

export interface EpisodeServer {
  server_name: string;
  server_data: Episode[];
}

export interface Pagination {
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  totalItemsPerPage?: number;
}

export interface ListResponse {
  items: Movie[];
  cdnImageDomain: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  titlePage: string;
  breadCrumb: unknown[];
}

export interface DetailResponse {
  movie: Movie | null;
  episodes: EpisodeServer[];
  cdnImageDomain: string;
}

export interface MovieType {
  slug: string;
  label: string;
}

export interface ListFilters {
  /** Thể loại được chọn — phần tử đầu dùng làm tham số lọc phía server,
   * các phần tử còn lại dùng để lọc thêm ở client (server chỉ nhận 1 slug). */
  categories?: string[];
  country?: string;
  year?: string;
  sort_lang?: string;
  [key: string]: string | string[] | number | undefined;
}
