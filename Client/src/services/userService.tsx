import { axiosInstance } from "./api";


interface User {
    username: string | "";
    email: string | "";
    uuid: string | "";
    avatar: string  | "";
    address: {
        address1: string;
        address2: string;
        district: string;
        postal_code: string;
        city: string;
        country: string;
    } | "";
  }
  


const fetchUser = async (setUser: (userdata: User) => void) => {
    try {
        const response = await axiosInstance.get("/user/me/");
        setUser(response.data);
    } catch (error) {
        console.error(error);
    }
}

export { fetchUser };