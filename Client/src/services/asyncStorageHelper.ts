import AsyncStorage from "@react-native-async-storage/async-storage";

const storeData = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.log("Error storing data", e);
  }
};

const getData = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    console.log("Error retrieving data", e);
    return null;
  }
};

const removeData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.log("Error removing data", e);
  }
};

export { storeData, getData, removeData };
