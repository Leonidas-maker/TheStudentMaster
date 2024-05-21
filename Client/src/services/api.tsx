import axios, { AxiosInstance } from "axios";

const BASE_URL = "https://thestudentmaster.de";
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
});

export { axiosInstance, BASE_URL };
