import axios from "axios";

// Domain gốc của nguồn API phim (kiểu Ophim). Có thể đổi qua biến môi trường
// VITE_API_BASE_URL nếu domain hiện tại bị chặn / đổi tên (các site dạng này
// hay phải đổi domain: ophim1, ophim16, ophim17, ophim19...).
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://phimapi.com";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err?.response?.data?.msg ||
      err?.message ||
      "Không thể kết nối tới nguồn phim.";
    return Promise.reject(new Error(message));
  }
);
