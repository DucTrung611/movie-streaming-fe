import { useFavorites } from "../hooks/useFavorites";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import MovieGrid from "../components/MovieGrid";

export default function Favorites() {
  useDocumentTitle("Yêu thích");
  const { favorites } = useFavorites();

  return (
    <div className="section container">
      <div className="section-head">
        <div>
          <span className="eyebrow">Danh sách của bạn</span>
          <h2>Yêu thích</h2>
        </div>
      </div>
      {favorites.length === 0 ? (
        <p className="state-message">
          Bạn chưa lưu phim yêu thích nào. Bấm biểu tượng trái tim trên
          trang phim để lưu vào đây.
        </p>
      ) : (
        <MovieGrid movies={favorites} cdnImageDomain="" priorityCount={6} />
      )}
    </div>
  );
}
