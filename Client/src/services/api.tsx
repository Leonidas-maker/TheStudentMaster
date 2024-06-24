// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import axios, { AxiosInstance } from "axios";

// Define the base URL
const BASE_URL = "https://thestudentmaster.de/api";
axios.defaults.baseURL = BASE_URL;

// Create an axios instance
const axiosInstance: AxiosInstance = axios.create();

export { axiosInstance, BASE_URL };
