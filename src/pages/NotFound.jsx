import { Link } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("Không tìm thấy trang");
  return (
    <div className="section container" style={{ textAlign: "center", padding: "100px 20px" }}>
      <span className="eyebrow">404</span>
      <h1 style={{ fontSize: 40, margin: "10px 0 16px" }}>Suất chiếu không tồn tại</h1>
      <p className="state-message" style={{ padding: 0, marginBottom: 24 }}>
        Trang bạn tìm không có trong rạp. Quay về trang chủ nhé.
      </p>
      <Link to="/" className="btn btn-outline">
        ‹ Về trang chủ
      </Link>
    </div>
  );
}
