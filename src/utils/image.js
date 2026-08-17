/**
 * API trả poster/thumb dưới dạng URL đầy đủ hoặc đường dẫn tương đối
 * (khi đó phải nối với domain CDN ảnh, thường có trong field
 * APP_DOMAIN_CDN_IMAGE của response). Hàm này xử lý cả hai trường hợp.
 */
export function resolveImageUrl(path, cdnImageDomain) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const domain = (cdnImageDomain || "").replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  return domain ? `${domain}/${cleanPath}` : `/${cleanPath}`;
}
