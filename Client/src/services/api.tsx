import axios, { AxiosInstance } from "axios";

const BASE_URL = "https://thestudentmaster.de/api";
axios.defaults.baseURL = BASE_URL;

// Create an axios instance
const axiosInstance: AxiosInstance = axios.create();

export { axiosInstance, BASE_URL };
