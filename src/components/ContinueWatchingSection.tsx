import { useContinueWatching } from "../hooks/useContinueWatching";
import MovieGrid from "./MovieGrid";

export default function ContinueWatchingSection() {
  const { items } = useContinueWatching();

  // Không hiển thị mục này nếu người dùng chưa xem dở phim nào.
  if (!items || items.length === 0) return null;

  return (
    <section className="section container">
      <div className="section-head">
        <div>
          <span className="eyebrow">Xem tiếp</span>
          <h2>Tiếp tục xem</h2>
        </div>
      </div>
      <MovieGrid movies={items} cdnImageDomain="" />
    </section>
  );
}
