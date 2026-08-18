import { next } from "@vercel/edge";

// Chặn truy cập toàn bộ site bằng HTTP Basic Auth ở tầng edge, thay cho
// tính năng "Deployment Protection: All Deployments" của Vercel (trả phí
// từ gói Pro trở lên). Middleware này chạy trên gói Hobby (free).
//
// Bắt buộc phải khai báo 2 biến môi trường trong Vercel Project Settings
// → Environment Variables (áp dụng cho Production):
//   BASIC_AUTH_USER
//   BASIC_AUTH_PASS
// Chạy `vercel dev`/`npm run dev` cục bộ sẽ KHÔNG bị chặn vì middleware
// chỉ được Vercel thực thi khi deploy.

export const config = {
  matcher: "/:path*",
};

export default function middleware(request: Request) {
  const expectedUser = process.env.BASIC_AUTH_USER;
  const expectedPass = process.env.BASIC_AUTH_PASS;

  // Chưa cấu hình biến môi trường thì không chặn (tránh tự khoá site khi
  // quên set env, ví dụ ở preview deployment không set biến).
  if (!expectedUser || !expectedPass) {
    return next();
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = atob(authHeader.slice("Basic ".length));
    const separatorIndex = decoded.indexOf(":");
    const user = decoded.slice(0, separatorIndex);
    const pass = decoded.slice(separatorIndex + 1);
    if (user === expectedUser && pass === expectedPass) {
      return next();
    }
  }

  return new Response("Yêu cầu đăng nhập.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Rạp Chiếu", charset="UTF-8"',
    },
  });
}
