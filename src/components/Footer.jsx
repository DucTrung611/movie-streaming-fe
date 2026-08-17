import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="film-rail" aria-hidden="true" />
      <div className="container site-footer__row">
        <p>
          RẠP<span className="brand__accent">CHIẾU</span> — dự án cá nhân, dữ
          liệu phim lấy từ nguồn API công khai. Không lưu trữ video trên máy
          chủ riêng.
        </p>
        <p className="site-footer__muted">
          Made for học & thực hành React · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
