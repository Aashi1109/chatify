import config from "@/config";
import axios from "axios";

const axiosClient = axios.create({
  baseURL: config.apiURL,
  withCredentials: true,
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.error?.message || "An unexpected error occurred";

    error.message = errorMessage;
    return Promise.reject(error);
  }
);

export default axiosClient;
