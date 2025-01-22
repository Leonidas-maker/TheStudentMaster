// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import * as SecureStore from "expo-secure-store";

// ====================================================== //
// ====================== Functions ===================== //
// ====================================================== //
// Function to save data to AsyncStorage
const secureSaveData = async (key: string, value: any) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (err) {
    console.error("Error saving credentials", err);
  }
};

const secureLoadData = async (key: string): Promise<any | null> => {
  try {
    const value = await SecureStore.getItemAsync(key);

    if (value !== null) {
      // If value exists
      return value;
    } else {
      // If value does not exists
      return null;
    }
  } catch (err) {
    console.error("Error loading data from SecureStore", err);
    return null;
  }
};

const secureRemoveData = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (err) {
    console.error("Error removing data from SecureStore", err);
  }
};

export { secureSaveData, secureLoadData, secureRemoveData };
