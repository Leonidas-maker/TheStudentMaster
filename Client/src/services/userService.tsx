import { axiosInstance } from "./api";
import { UserProps } from "../interfaces/userInterfaces";

const fetchUser = async (setUser: (userdata: UserProps) => void) => {
  try {
    const response = await axiosInstance.get("/user/me");
    setUser(response.data);
  } catch (error) {
    console.error(error);
  }
};

export { fetchUser };
