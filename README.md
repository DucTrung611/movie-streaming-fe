# Rạp Chiếu — FE xem phim (React + Vite)

Frontend xem phim online, gọi trực tiếp vào một API phim dạng "họ Ophim"
(ophim1.com, ophim16/17/19.cc, phimapi.com, kkphim... đều dùng chung một
kiểu cấu trúc endpoint/JSON).

## ⚠️ Lưu ý quan trọng trước khi chạy

Trang `https://ophim19.cc/api-document` mà bạn gửi bị chặn truy cập tự
động (bot detection) nên mình **không đọc trực tiếp được** tài liệu đó.
Toàn bộ lớp gọi API (`src/api/ophim.js`) được viết dựa trên cấu trúc
endpoint tiêu chuẩn của các domain "anh em" cùng hệ Ophim mà mình tra
cứu được (ophim1.com, ophim16.cc, ophim17.cc, phimapi.com/kkphim.com).
Khả năng cao `ophim19.cc` dùng đúng cấu trúc này, nhưng **bạn nên kiểm
tra lại** trước khi coi là xong:

1. Mở thử vài URL sau trên trình duyệt (thay domain nếu cần) và xem
   JSON trả về có khớp không:
   - `https://ophim19.cc/danh-sach/phim-moi-cap-nhat?page=1`
   - `https://ophim19.cc/v1/api/danh-sach/phim-bo?page=1`
   - `https://ophim19.cc/v1/api/the-loai`
   - `https://ophim19.cc/phim/<slug-phim-bất-kỳ>`
2. Nếu tên field hoặc đường dẫn khác đi chút, chỉ cần sửa trong
   `src/api/ophim.js` — các trang/component khác không cần đổi vì đều
   dùng dữ liệu đã được chuẩn hoá qua `normalizeListResponse` /
   `normalizeDetailResponse`.
3. Nếu domain `ophim19.cc` đổi hoặc die (các site dạng này hay bị chặn
   và phải đổi domain định kỳ), chỉ cần sửa `VITE_API_BASE_URL` trong
   file `.env`.

## Cài đặt & chạy

```bash
npm install
npm run dev
```

Mặc định app gọi tới `https://ophim19.cc`. Muốn đổi domain, sửa file
`.env`:

```
VITE_API_BASE_URL=https://ophim19.cc
```

## Cấu trúc thư mục

```
src/
  api/            # gọi API + chuẩn hoá response
  hooks/          # useOphim: hook fetch chung (loading/error)
  components/     # Header, MovieCard, MovieGrid, Pagination, VideoPlayer...
  pages/          # Home, ListByType, GenreDetail, MovieDetail, Watch...
  utils/image.js  # resolve URL ảnh poster (tương đối -> CDN)
```

## Tính năng

- Trang chủ: dải phim mới cập nhật (cuộn ngang) + các mục theo loại
  (phim bộ, phim lẻ, hoạt hình)
- Danh sách theo loại phim (`/danh-sach/:type`) có bộ lọc thể loại /
  quốc gia / năm / ngôn ngữ (vietsub, thuyết minh, lồng tiếng)
- Duyệt theo thể loại (`/the-loai`) và quốc gia (`/quoc-gia`)
- Tìm kiếm (`/tim-kiem?keyword=...`)
- Trang chi tiết phim: poster, mô tả, diễn viên, đạo diễn, danh sách
  tập theo từng server
- Trang xem phim (`/xem-phim/:slug/:episodeSlug`): phát HLS (.m3u8)
  qua `hls.js`, tự fallback sang iframe embed nếu tập không có link
  m3u8; chuyển server/tập không cần tải lại thông tin phim

## Điểm cần lưu ý khi phát triển tiếp

- Chưa có xử lý cache/React Query — mỗi lần đổi trang sẽ gọi lại API.
  Nếu API rate-limit, cân nhắc thêm cache đơn giản trong `useOphim`.
- Chưa có trang danh sách theo năm (`/v1/api/nam/:year`) dù hàm API đã
  có sẵn (`getMoviesByYear`) — có thể thêm route tương tự
  `GenreDetail`/`CountryDetail` nếu cần.
- `dangerouslySetInnerHTML` được dùng để hiển thị `movie.content` vì
  API thường trả mô tả kèm thẻ HTML cơ bản — nếu nguồn dữ liệu không
  đáng tin, nên lọc HTML trước khi hiển thị.
