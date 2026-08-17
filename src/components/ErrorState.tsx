export default function ErrorState({
  message = "Có lỗi xảy ra.",
}: {
  message?: string;
}) {
  return <p className="state-message error">{message}</p>;
}
