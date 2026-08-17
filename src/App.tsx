import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import ListByType from "./pages/ListByType";
import GenreIndex from "./pages/GenreIndex";
import GenreDetail from "./pages/GenreDetail";
import CountryIndex from "./pages/CountryIndex";
import CountryDetail from "./pages/CountryDetail";
import Search from "./pages/Search";
import MovieDetail from "./pages/MovieDetail";
import Favorites from "./pages/Favorites";
import Watch from "./pages/Watch";
import NotFound from "./pages/NotFound";

export default function App() {
  const { pathname } = useLocation();
  // Trang chủ và trang chi tiết phim có hero full-bleed nằm ngay dưới
  // header trong suốt nên không cần padding-top; các trang còn lại cần
  // chừa chỗ cho header fixed để nội dung không bị che mất.
  const isFlush = pathname === "/" || pathname.startsWith("/phim/");

  return (
    <>
      <Header />
      <main className={`app-main${isFlush ? " app-main--flush" : ""}`}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/danh-sach/:type" element={<ListByType />} />
            <Route path="/the-loai" element={<GenreIndex />} />
            <Route path="/the-loai/:slug" element={<GenreDetail />} />
            <Route path="/quoc-gia" element={<CountryIndex />} />
            <Route path="/quoc-gia/:slug" element={<CountryDetail />} />
            <Route path="/tim-kiem" element={<Search />} />
            <Route path="/yeu-thich" element={<Favorites />} />
            <Route path="/phim/:slug" element={<MovieDetail />} />
            <Route path="/xem-phim/:slug/:episodeSlug" element={<Watch />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
}
