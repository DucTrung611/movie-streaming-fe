import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBox({ className = "" }) {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;
    navigate(`/tim-kiem?keyword=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form className={`search-box ${className}`} onSubmit={handleSubmit}>
      <input
        type="search"
        placeholder="Tìm tên phim..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        aria-label="Tìm phim"
      />
      <button type="submit" aria-label="Tìm kiếm">
        ⌕
      </button>
    </form>
  );
}
