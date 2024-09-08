import axios from "axios";

// Create an axios instance with a base URL and common settings
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api", // Use environment variable or fallback to '/api'
  timeout: 5000, // Timeout after 5 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Optionally, you can add interceptors here for request/response if needed
apiClient.interceptors.request.use(
  (config) => {
    // You can modify the request here, for example by adding authorization headers
    // config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
