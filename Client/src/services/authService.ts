// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import jwtDecode from "jwt-decode";
import * as SecureStore from "expo-secure-store";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import { refreshAuthLogic } from "./tokenService"; // Logic to refresh authentication tokens

// Variables to store tokens in memory
let accessToken: string | null = null;
let refreshToken: string | null = null;
let secretToken: string | null = null;

// Function to set tokens both in SecureStore and in memory
const setTokens = async ({
  access = "",
  refresh = "",
  secret = "",
}: {
  access: string;
  refresh: string;
  secret: string;
}) => {
  await SecureStore.setItemAsync("access_token", access); // Store access token
  await SecureStore.setItemAsync("refresh_token", refresh); // Store refresh token
  await SecureStore.setItemAsync("secret_token", secret); // Store secret token
  accessToken = access; // Set access token in memory
  refreshToken = refresh; // Set refresh token in memory
  secretToken = secret; // Set secret token in memory
};

// Function to clear tokens both from SecureStore and memory
const clearTokens = async () => {
  await SecureStore.deleteItemAsync("access_token"); // Delete access token
  await SecureStore.deleteItemAsync("refresh_token"); // Delete refresh token
  await SecureStore.deleteItemAsync("secret_token"); // Delete secret token
  accessToken = null; // Clear access token in memory
  refreshToken = null; // Clear refresh token in memory
  secretToken = null; // Clear secret token in memory
};

// Function to check if a token is valid based on its expiration time
const isTokenValid = (token: string | null): boolean => {
  if (!token) return false; // Return false if token is null
  const { exp } = jwtDecode<{ exp: number }>(token); // Decode token to get expiration time
  return Date.now() < exp * 1000; // Check if current time is before the token's expiration time
};

// Function to get the authentication token
const getAuthToken = async (): Promise<string | null> => {
  if (secretToken === null) {
    secretToken = await SecureStore.getItemAsync("secret_token"); // Retrieve secret token from SecureStore
  }
  if (accessToken === null) {
    accessToken = await SecureStore.getItemAsync("access_token"); // Retrieve access token from SecureStore
  }

  // Return the secret token if it is valid
  if (secretToken && isTokenValid(secretToken)) return secretToken;
  // Return the access token if it is valid
  if (accessToken && isTokenValid(accessToken)) return accessToken;

  // Refresh the access token if it is expired
  refreshAuthLogic();
  accessToken = await SecureStore.getItemAsync("access_token"); // Retrieve new access token from SecureStore
  if (accessToken && isTokenValid(accessToken)) return accessToken; // Return new access token if valid

  return null; // Return null if no valid token is found
};

// Function to check if the user is logged in
const isLoggedIn = async (): Promise<boolean> => {
  const token = await getAuthToken(); // Get the authentication token
  return token !== null && isTokenValid(token) === true; // Return true if a valid token is found, false otherwise
};

export { setTokens, clearTokens, getAuthToken, isTokenValid, isLoggedIn };
