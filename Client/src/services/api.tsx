import axios, { AxiosInstance } from "axios";

const BASE_URL = "https://thestudentmaster.de";
axios.defaults.baseURL = BASE_URL;
const axiosInstance: AxiosInstance = axios.create();

export { axiosInstance, BASE_URL };
