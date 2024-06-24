// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import axios from "axios";
import * as SecureStore from "expo-secure-store";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import { setTokens, clearTokens } from "./AuthService"; // Import functions to set and clear authentication tokens
import { BASE_URL } from "./Api"; // Import the base URL for API requests

// Function to refresh the authentication tokens
const refreshAuthLogic = async () => {
  try {
    const refreshToken = await SecureStore.getItemAsync("refresh_token"); // Retrieve the refresh token from secure storage

    // If no refresh token is available, throw an error
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    // Make a POST request to refresh the token using the refresh token
    const response = await axios.post(`/auth/refresh-token`, {
      Headers: { Authorization: `Bearer ${refreshToken}` },
    });
    const { access, refresh, secret } = response.data; // Extract the new tokens from the response
    await setTokens({ access, refresh, secret }); // Store the new tokens
    return access; // Return the new access token
  } catch (error) {
    await clearTokens(); // Clear the tokens if an error occurs
    throw error; // Rethrow the error to be handled by the caller
  }
};

export { refreshAuthLogic };
