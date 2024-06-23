import axios from "axios";
import { setTokens, clearTokens } from "./AuthService";
import * as SecureStore from "expo-secure-store";
import { BASE_URL } from "./Api";

const refreshAuthLogic = async () => {
  try {
    const refreshToken = await SecureStore.getItemAsync("refresh_token");

    // If no refresh token is available, throw an error
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post(`/auth/refresh-token`, {
      Headers: { Authorization: `Bearer ${refreshToken}` },
    });
    const { access, refresh, secret } = response.data;
    await setTokens({ access, refresh, secret });
    return access;
  } catch (error) {
    await clearTokens();
    throw error;
  }
};

export { refreshAuthLogic };
