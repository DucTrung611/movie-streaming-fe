import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ListByType from "./pages/ListByType";
import GenreIndex from "./pages/GenreIndex";
import GenreDetail from "./pages/GenreDetail";
import CountryIndex from "./pages/CountryIndex";
import CountryDetail from "./pages/CountryDetail";
import Search from "./pages/Search";
import MovieDetail from "./pages/MovieDetail";
import Watch from "./pages/Watch";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/danh-sach/:type" element={<ListByType />} />
          <Route path="/the-loai" element={<GenreIndex />} />
          <Route path="/the-loai/:slug" element={<GenreDetail />} />
          <Route path="/quoc-gia" element={<CountryIndex />} />
          <Route path="/quoc-gia/:slug" element={<CountryDetail />} />
          <Route path="/tim-kiem" element={<Search />} />
          <Route path="/phim/:slug" element={<MovieDetail />} />
          <Route path="/xem-phim/:slug/:episodeSlug" element={<Watch />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
