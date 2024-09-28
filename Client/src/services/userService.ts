// ~~~~~~~~ Own components imports ~~~~~~~ //
import { axiosInstance } from "./api";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { UserProps } from "../interfaces/userInterfaces";

// Function to fetch user data and update the state
const fetchUser = async (setUser: (userdata: UserProps) => void) => {
  try {
    // Fetch user data from the server
    const response = await axiosInstance.get("/user/me");
    setUser(response.data); // Update the state with the fetched user data
  } catch (error) {
    console.error(error); // Log any errors that occur during the fetch
  }
};

export { fetchUser };
