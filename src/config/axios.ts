import axios from "axios";
import { useAuthStore } from "./store/useAuthStore"; // Adjust the import path for your store

const api = axios.create({
  baseURL: "https://dms-backend-3.onrender.com/api", // Your base URL
  headers: {
    "Content-Type": "application/json", // Standard content type
  },
});

// Add Axios request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().tokens?.accessToken; // Get the access token from Zustand store

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`; // Add the token to the headers
    }

    return config;
  },
  (error) => {
    return Promise.reject(error); // Handle request errors
  }
);

export default api;

