import { Link } from "react-router-dom";
import "./Breadcrumb.css";

interface Crumb {
  label: string;
  to?: string;
}

/** Luôn có "Trang chủ" làm mốc đầu tiên — items truyền vào là các mốc
 * còn lại, mốc cuối (trang hiện tại) nên bỏ trống `to`. */
export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li>
          <Link to="/">Trang chủ</Link>
        </li>
        {items.map((item, index) => (
          <li key={index} aria-current={item.to ? undefined : "page"}>
            {item.to ? <Link to={item.to}>{item.label}</Link> : item.label}
          </li>
        ))}
      </ol>
    </nav>
  );
}
