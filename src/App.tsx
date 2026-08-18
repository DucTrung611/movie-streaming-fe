import { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import Loader from "./components/Loader";
import Home from "./pages/Home";

const ListByType = lazy(() => import("./pages/ListByType"));
const GenreIndex = lazy(() => import("./pages/GenreIndex"));
const GenreDetail = lazy(() => import("./pages/GenreDetail"));
const CountryIndex = lazy(() => import("./pages/CountryIndex"));
const CountryDetail = lazy(() => import("./pages/CountryDetail"));
const Search = lazy(() => import("./pages/Search"));
const MovieDetail = lazy(() => import("./pages/MovieDetail"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Watch = lazy(() => import("./pages/Watch"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
          <Suspense fallback={<Loader />}>
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
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
}
