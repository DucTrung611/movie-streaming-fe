export default function Loader({
  label = "Đang tải...",
}: {
  label?: string;
}) {
  return <p className="state-message">{label}</p>;
}
