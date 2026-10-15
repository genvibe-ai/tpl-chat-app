/**
 * Where Chirpline keeps your messages, reactions and settings: AsyncStorage
 * (native storage on iPhone and Android, localStorage on the web). Every call
 * is guarded, so a full disk or a private browser window never breaks a chat;
 * the app simply runs without saving.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StateStorage } from "zustand/middleware";

export const safeStorage: StateStorage = {
  getItem: async (key) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Keep chatting; the next change tries again.
    }
  },
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Nothing to remove.
    }
  },
};
