import { NavLink } from "react-router-dom";
import SearchBox from "./SearchBox";
import "./Header.css";

const NAV_LINKS = [
  { to: "/", label: "Trang chủ", end: true },
  { to: "/danh-sach/phim-bo", label: "Phim bộ" },
  { to: "/danh-sach/phim-le", label: "Phim lẻ" },
  { to: "/danh-sach/hoat-hinh", label: "Hoạt hình" },
  { to: "/danh-sach/tv-shows", label: "TV Shows" },
  { to: "/the-loai", label: "Thể loại" },
  { to: "/quoc-gia", label: "Quốc gia" },
];

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__row">
        <NavLink to="/" className="brand">
          <span className="brand__mark">●</span>
          <span className="brand__word">
            RẠP<span className="brand__accent">CHIẾU</span>
          </span>
        </NavLink>

        <nav className="site-nav">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? "site-nav__link is-active" : "site-nav__link"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <SearchBox className="site-header__search" />
      </div>
      <div className="film-rail" aria-hidden="true" />
    </header>
  );
}
