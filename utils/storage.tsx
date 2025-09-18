import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const storeItem = async (key: string, value: string) => {
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      console.log(`storage - Stored ${key} in localStorage:`, value); // Debug log
    } else {
      await SecureStore.setItemAsync(key, value);
      console.log(`storage - Stored ${key} in SecureStore:`, value); // Debug log
    }
  } catch (error) {
    console.error(`storage - Error storing ${key}:`, error);
  }
};

export const getItem = async (key: string) => {
  try {
    if (Platform.OS === "web") {
      const value = localStorage.getItem(key);
      console.log(`storage - Retrieved ${key} from localStorage:`, value); // Debug log
      return value;
    } else {
      const value = await SecureStore.getItemAsync(key);
      console.log(`storage - Retrieved ${key} from SecureStore:`, value); // Debug log
      return value;
    }
  } catch (error) {
    console.error(`storage - Error retrieving ${key}:`, error);
    return null;
  }
};

export const removeItem = async (key: string) => {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      console.log(`storage - Removed ${key} from localStorage`);
    } else {
      await SecureStore.deleteItemAsync(key);
      console.log(`storage - Removed ${key} from SecureStore`);
    }
  } catch (error) {
    console.error(`storage - Error removing ${key}:`, error);
  }
};

