import axios from "axios";
import { setTokens, clearTokens } from "./authService";
import * as SecureStore from "expo-secure-store";
import { BASE_URL } from "./api";

const refreshAuthLogic = async () => {
  try {
    const refreshToken = await SecureStore.getItemAsync("refresh_token");

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post(`/auth/refresh-token`, {
      Headers: { "Authorization": `Bearer ${refreshToken}` },
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
