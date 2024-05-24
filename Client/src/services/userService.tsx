import { axiosInstance } from "./Api";
import { UserProps } from "../interfaces/UserInterfaces";

const fetchUser = async (setUser: (userdata: UserProps) => void) => {
  try {
    const response = await axiosInstance.get("/user/me");
    setUser(response.data);
  } catch (error) {
    console.error(error);
  }
};

export { fetchUser };
