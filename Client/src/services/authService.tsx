import jwtDecode from "jwt-decode";
import * as SecureStore from "expo-secure-store";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let secretToken: string | null = null;

const setTokens = async ({
  access = "",
  refresh = "",
  secret = "",
}: {
  access: string;
  refresh: string;
  secret: string;
}) => {
  await SecureStore.setItemAsync("access_token", access);
  await SecureStore.setItemAsync("refresh_token", refresh);
  await SecureStore.setItemAsync("secret_token", secret);
  accessToken = access;
  refreshToken = refresh;
  secretToken = secret;
};

const clearTokens = async () => {
  await SecureStore.deleteItemAsync("access_token");
  await SecureStore.deleteItemAsync("refresh_token");
  await SecureStore.deleteItemAsync("secret_token");
  accessToken = null;
  refreshToken = null;
  secretToken = null;
};

const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  const { exp } = jwtDecode<{ exp: number }>(token);
  return Date.now() < exp * 1000;
};

const getAuthToken = async (): Promise<string | null> => {
  if (secretToken === null) {
    secretToken = await SecureStore.getItemAsync("secret_token");
  }
  if (accessToken === null) {
    accessToken = await SecureStore.getItemAsync("access_token");
  }

  if (secretToken && isTokenValid(secretToken)) return secretToken;
  if (accessToken && isTokenValid(accessToken)) return accessToken;
  return null;
};

const isLoggedIn = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return token !== null && isTokenValid(token) === true;
};

export { setTokens, clearTokens, getAuthToken, isTokenValid, isLoggedIn };
