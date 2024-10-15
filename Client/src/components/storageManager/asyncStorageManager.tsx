// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import AsyncStorage from "@react-native-async-storage/async-storage";

// ====================================================== //
// ====================== Functions ===================== //
// ====================================================== //
// Function to save data to AsyncStorage
const asyncSaveData = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (err) {
    console.error("Error saving credentials", err);
  }
};

// Function to load data from AsyncStorage
const asyncLoadData = async (key: string): Promise<any | null> => {
  try {
    const value = await AsyncStorage.getItem(key);

    if (value !== null) {
      // If value exists
      return value;
    } else {
      // If value does not exists
      return null;
    }
  } catch (err) {
    console.error("Error loading data from AsyncStorage", err);
    return null;
  }
};

const asyncRemoveData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.error("Error removing data from AsyncStorage", err);
  }
};

export { asyncSaveData, asyncLoadData, asyncRemoveData };
