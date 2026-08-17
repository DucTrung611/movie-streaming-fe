import { useContinueWatching } from "../hooks/useContinueWatching";
import MovieRow from "./MovieRow";

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
      <MovieRow movies={items} cdnImageDomain="" />
    </section>
  );
}
