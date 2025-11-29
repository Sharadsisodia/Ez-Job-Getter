import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// API routes that must NOT carry Authorization token
const noAuthEndpoints = [
  "/api/accounts/login/",
  "/api/accounts/signup/",
  "/api/accounts/verify_otp/",
];

// Attach JWT access token EXCEPT login, signup, OTP
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  // Do NOT attach token for no-auth endpoints
  if (!noAuthEndpoints.includes(config.url)) {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Auto logout on 401 (invalid/expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !noAuthEndpoints.includes(error.config.url) // Prevent logout during login
    ) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
