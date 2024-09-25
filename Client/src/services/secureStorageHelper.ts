// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //

import * as SecureStore from "expo-secure-store";

// ====================================================== //
// ======================== Main ======================== //
// ====================================================== //
const getSecret = async (key: string) => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.log("Error retrieving secret:", error);
    return null;
  }
};

const storeSecret = async (key: string, value: string) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.log("Error storing secret:", error);
  }
};

const removeSecret = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.log("Error removing secret:", error);
  }
};

// ====================================================== //
// ====================== Specific ====================== //
// ====================================================== //
const getMailServerCredentials = async () => {
  try {
    const username = await SecureStore.getItemAsync("mailServerUsername");
    const password = await SecureStore.getItemAsync("mailServerPassword");
    return { username, password };
  } catch (error) {
    console.log("Error retrieving mailserver credentials:", error);
    return { username: null, password: null };
  }
};

const storeMailServerCredentials = async (
  username: string,
  password: string,
) => {
  try {
    await SecureStore.setItemAsync("mailServerUsername", username);
    await SecureStore.setItemAsync("mailServerPassword", password);
  } catch (error) {
    console.log("Error storing mailserver credentials:", error);
  }
};

export {
  getSecret,
  storeSecret,
  removeSecret,
  getMailServerCredentials,
  storeMailServerCredentials,
};
