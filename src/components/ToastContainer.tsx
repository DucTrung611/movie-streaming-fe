import { useEffect, useState } from "react";
import { TOAST_EVENT_NAME, type ToastMessage } from "../utils/toast";
import "./ToastContainer.css";

const DISPLAY_MS = 3000;

/** Khay hiện toast góc màn hình — mount 1 lần ở App.tsx, nhận toast qua
 * window event nên bất kỳ component nào cũng gọi showToast() được mà
 * không cần Context/Provider bọc quanh cây component. */
export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    function handle(e: Event) {
      const detail = (e as CustomEvent<ToastMessage>).detail;
      setToasts((prev) => [...prev, detail]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== detail.id));
      }, DISPLAY_MS);
    }
    window.addEventListener(TOAST_EVENT_NAME, handle);
    return () => window.removeEventListener(TOAST_EVENT_NAME, handle);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.variant}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
