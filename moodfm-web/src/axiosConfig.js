import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  // Prefer explicit web API envs; fall back to local dev server
  baseURL:
    process.env.REACT_APP_API_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the JWT from cookies
axiosInstance.interceptors.request.use(
  (config) => {
    // Use the token cookie (set by the frontend after login) for Authorization.
    // This works in both dev and production, independently of any HttpOnly cookie
    // the backend may choose to set.
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If the data is FormData, remove the Content-Type header to let the browser set it
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;