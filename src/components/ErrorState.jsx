export default function ErrorState({ message = "Có lỗi xảy ra." }) {
  return <p className="state-message error">{message}</p>;
}
