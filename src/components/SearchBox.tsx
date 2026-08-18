import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchMovies } from "../api/ophim";
import { resolveImageUrl } from "../utils/image";
import type { Movie } from "../types/movie";

const DEBOUNCE_MS = 350;
const MIN_KEYWORD_LENGTH = 2;
const SUGGESTION_LIMIT = 6;

export default function SearchBox({ className = "" }: { className?: string }) {
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [cdnImageDomain, setCdnImageDomain] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLFormElement>(null);
  const requestId = useRef(0);

  // Debounce: chỉ gọi API sau khi người dùng ngừng gõ ~350ms, tránh bắn
  // request dồn dập theo từng phím bấm. requestId dùng để bỏ qua kết quả
  // trả về muộn của những lần gõ trước (race condition khi gõ nhanh).
  useEffect(() => {
    const trimmed = keyword.trim();
    if (trimmed.length < MIN_KEYWORD_LENGTH) {
      // Tăng requestId ở đây để bỏ luôn kết quả trễ của 1 request cũ
      // (từ từ khoá dài hơn) đang bay về — dropdown đang ẩn theo điều
      // kiện độ dài keyword nên hiện tại vô hại, nhưng phòng hờ nếu
      // logic hiển thị đổi sau này thì vẫn không set nhầm state cũ.
      ++requestId.current;
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const currentId = ++requestId.current;
    setIsLoading(true);
    const timer = setTimeout(() => {
      searchMovies(trimmed, { limit: SUGGESTION_LIMIT })
        .then((res) => {
          if (currentId !== requestId.current) return;
          setSuggestions(res.items);
          setCdnImageDomain(res.cdnImageDomain);
          setIsLoading(false);
        })
        .catch(() => {
          if (currentId !== requestId.current) return;
          setSuggestions([]);
          setIsLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToSearchPage(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setIsOpen(false);
    setActiveIndex(-1);
    navigate(`/tim-kiem?keyword=${encodeURIComponent(trimmed)}`);
  }

  function goToMovie(movie: Movie) {
    setIsOpen(false);
    setActiveIndex(-1);
    setKeyword("");
    navigate(`/phim/${movie.slug}`);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      goToMovie(suggestions[activeIndex]);
    } else {
      goToSearchPage(keyword);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  const showDropdown = isOpen && keyword.trim().length >= MIN_KEYWORD_LENGTH;

  return (
    <form
      ref={containerRef}
      className={`search-box ${className}`}
      onSubmit={handleSubmit}
    >
      <div className="search-box__field">
        <input
          type="search"
          placeholder="Tìm tên phim..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Tìm phim"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          autoComplete="off"
        />
        <button type="submit" aria-label="Tìm kiếm">
          ⌕
        </button>
      </div>

      {showDropdown && (
        <div className="search-suggest" role="listbox">
          {isLoading && <div className="search-suggest__state">Đang tìm...</div>}
          {!isLoading && suggestions.length === 0 && (
            <div className="search-suggest__state">Không tìm thấy phim nào khớp.</div>
          )}
          {!isLoading &&
            suggestions.map((movie, index) => {
              const poster = resolveImageUrl(
                movie.poster_url || movie.thumb_url,
                cdnImageDomain
              );
              return (
                <button
                  type="button"
                  key={movie._id || movie.slug}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`search-suggest__item${
                    index === activeIndex ? " is-active" : ""
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => goToMovie(movie)}
                >
                  {poster ? (
                    <img src={poster} alt="" loading="lazy" />
                  ) : (
                    <span className="search-suggest__poster-empty" />
                  )}
                  <span className="search-suggest__info">
                    <span className="search-suggest__name">{movie.name}</span>
                    <span className="search-suggest__meta">
                      {movie.year}
                      {movie.episode_current ? ` · ${movie.episode_current}` : ""}
                    </span>
                  </span>
                </button>
              );
            })}
          <button
            type="button"
            className="search-suggest__all"
            onClick={() => goToSearchPage(keyword)}
          >
            Xem tất cả kết quả cho "{keyword.trim()}"
          </button>
        </div>
      )}
    </form>
  );
}
