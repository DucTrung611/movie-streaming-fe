export type ToastVariant = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  text: string;
  variant: ToastVariant;
}

export const TOAST_EVENT_NAME = "rapchieu:toast";

let counter = 0;

/** Bắn 1 toast — ToastContainer (mount 1 lần ở App.tsx) lắng nghe và hiển thị. */
export function showToast(text: string, variant: ToastVariant = "info") {
  const detail: ToastMessage = { id: ++counter, text, variant };
  window.dispatchEvent(new CustomEvent<ToastMessage>(TOAST_EVENT_NAME, { detail }));
}
