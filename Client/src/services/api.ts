// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import axios, { AxiosInstance } from "axios";

// Define the base URL
const BASE_URL = "https://thestudentmaster.de/api";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
});

export { axiosInstance, BASE_URL };
