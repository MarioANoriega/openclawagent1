import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// SecureStore is unavailable on web, so the browser build falls back to
// localStorage. Native platforms keep the OS keychain/keystore.
export const tokenStorage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return typeof localStorage === "undefined" ? null : localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },

  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async remove(key: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
