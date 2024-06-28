// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import axios from "axios";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import { axiosInstance } from "./Api"; // Custom axios instance
import { refreshAuthLogic } from "./TokenService"; // Logic to refresh authentication token
import { getAuthToken } from "./AuthService"; // Function to get the current authentication token

// ~~~~~~~~~~~~~~~ Function ~~~~~~~~~~~~~~~ //
const ApplyInterceptor = () => {
  // Add a request interceptor to the axios instance
  axiosInstance.interceptors.request.use(
    async (config) => {
      const token = await getAuthToken(); // Get the authentication token
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`; // Set the Authorization header with the token
        return config; // Return the modified config
      }
      throw new Error("Not authenticated!"); // Throw an error if not authenticated
    },
    (error) => Promise.reject(error), // Handle request errors
  );

  // Add a response interceptor to the axios instance
  axiosInstance.interceptors.response.use(
    (response) => response, // Return the response if successful
    async (error) => {
      const originalRequest = error.config;
      if (
        error.response &&
        error.response.status === 401 &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true; // Set retry flag to true
        try {
          const newToken = await refreshAuthLogic(); // Refresh the authentication token
          axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`; // Set the new token in default headers
          return axiosInstance(originalRequest); // Retry the original request with the new token
        } catch (refreshError) {
          return Promise.reject(refreshError); // Handle token refresh errors
        }
      }
      return Promise.reject(error); // Handle response errors
    },
  );
};

export default ApplyInterceptor;
