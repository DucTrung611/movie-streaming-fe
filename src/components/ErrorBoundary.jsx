import { Component } from "react";

/**
 * Bắt lỗi runtime ở bất kỳ component con nào (VD: dữ liệu API trả về
 * sai định dạng khiến .map() throw) để hiện màn hình lỗi thân thiện
 * thay vì làm trắng cả trang. Chỉ class component mới bắt được lỗi
 * render — React chưa có hook tương đương.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Lỗi không bắt được:", error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.error) {
      return (
        <div
          className="section container"
          style={{ textAlign: "center", padding: "100px 20px" }}
        >
          <span className="eyebrow">Sự cố</span>
          <h1 style={{ fontSize: 40, margin: "10px 0 16px" }}>
            Suất chiếu gặp trục trặc
          </h1>
          <p className="state-message" style={{ padding: 0, marginBottom: 24 }}>
            Có lỗi ngoài dự kiến xảy ra. Thử quay lại trang chủ nhé.
          </p>
          <button
            type="button"
            className="btn btn-outline"
            onClick={this.handleReload}
          >
            ‹ Về trang chủ
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
