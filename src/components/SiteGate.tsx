import { useState, type FormEvent, type ReactNode } from "react";
import "./SiteGate.css";

const STORAGE_KEY = "rapchieu:v1:site-unlocked";
const SITE_PASSWORD = import.meta.env.VITE_SITE_PASSWORD as string | undefined;

/**
 * Màn hình khoá tạm thời cho site đang trong giai đoạn test/dev — không
 * phải cơ chế bảo mật thật sự (mật khẩu nằm trong bundle JS, người rành
 * kỹ thuật vẫn đọc được), chỉ nhằm chặn khách vãng lai tình cờ vào xem.
 * Nếu VITE_SITE_PASSWORD không được cấu hình thì không khoá gì cả.
 */
export default function SiteGate({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(
    () => !SITE_PASSWORD || sessionStorage.getItem(STORAGE_KEY) === "1"
  );
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (input === SITE_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setIsUnlocked(true);
    } else {
      setError(true);
    }
  }

  if (isUnlocked) return <>{children}</>;

  return (
    <div className="site-gate">
      <form className="site-gate__box" onSubmit={handleSubmit}>
        <h1 className="site-gate__title">RẠPCHIẾU</h1>
        <p className="site-gate__hint">Nhập mật khẩu để tiếp tục.</p>
        <input
          type="password"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(false);
          }}
          placeholder="Mật khẩu"
          autoFocus
          className={error ? "is-error" : ""}
        />
        {error && <p className="site-gate__error">Sai mật khẩu, thử lại.</p>}
        <button type="submit" className="btn btn-primary">
          Vào trang
        </button>
      </form>
    </div>
  );
}
