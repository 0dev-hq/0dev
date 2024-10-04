import axios, { InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";

// API client for general API routes (e.g., /api)
const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`, // Assuming general API routes under /api
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// if the response of any requests via apiClient is 403 show a notification with toastify
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 403) {
      toast.error("You are not authorized to perform this action.");
    }
    return Promise.reject(error);
  }
);

// API client for auth routes (e.g., /auth)
const authClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/auth`, // Assuming auth routes under /auth
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

const configAxios = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
};

apiClient.interceptors.request.use(configAxios, (error) =>
  Promise.reject(error)
);

authClient.interceptors.request.use(configAxios, (error) =>
  Promise.reject(error)
);

export { apiClient, authClient };
