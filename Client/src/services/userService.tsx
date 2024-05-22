import { axiosInstance } from "./api";
import { User } from "../interfaces/userInterfaces";

const fetchUser = async (setUser: (userdata: User) => void) => {
  try {
    const response = await axiosInstance.get("/user/me");
    setUser(response.data);
  } catch (error) {
    console.error(error);
  }
};

export { fetchUser };
