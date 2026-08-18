import { Component, Fragment, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryState {
  error: Error | null;
  // Tăng lên mỗi lần "Thử lại" — dùng làm key để ép React tạo mới hẳn
  // cây con thay vì tái sử dụng, nhờ vậy các hook bên trong (fetch dữ
  // liệu, state...) cũng chạy lại từ đầu chứ không lặp lại đúng lỗi cũ.
  resetCount: number;
}

/**
 * Bắt lỗi runtime ở bất kỳ component con nào (VD: dữ liệu API trả về
 * sai định dạng khiến .map() throw) để hiện màn hình lỗi thân thiện
 * thay vì làm trắng cả trang. Chỉ class component mới bắt được lỗi
 * render — React chưa có hook tương đương.
 */
export default class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null, resetCount: 0 };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Lỗi không bắt được:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState((s) => ({ error: null, resetCount: s.resetCount + 1 }));
  };

  handleGoHome = () => {
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
            Có lỗi ngoài dự kiến xảy ra. Thử lại hoặc quay về trang chủ.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.handleRetry}
            >
              ↻ Thử lại
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={this.handleGoHome}
            >
              ‹ Về trang chủ
            </button>
          </div>
        </div>
      );
    }

    return <Fragment key={this.state.resetCount}>{this.props.children}</Fragment>;
  }
}
