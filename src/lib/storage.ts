import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * A wrapper for AsyncStorage that provides a similar API to AsyncStorage.
 * All methods are asynchronous and return Promises.
 */
export const storage = {
  /**
   * Sets a string value for a key.
   * @param key The key to set.
   * @param value The string value to store.
   */
  async set(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Failed to set item in AsyncStorage for key: ${key}`, error);
    }
  },

  /**
   * Gets a string value for a key.
   * @param key The key to get.
   * @returns A Promise that resolves to the string value, or null if not found.
   */
  async getString(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to get string from AsyncStorage for key: ${key}`, error);
      return null;
    }
  },

  /**
   * Deletes a key-value pair.
   * @param key The key to delete.
   */
  async delete(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to delete item from AsyncStorage for key: ${key}`, error);
    }
  },

  /**
   * Sets an object value for a key by JSON-serializing it.
   * @param key The key to set.
   * @param value The object value to store.
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Failed to set item in AsyncStorage for key: ${key}`, error);
    }
  },

  /**
   * Gets an object value for a key by JSON-parsing it.
   * @param key The key to get.
   * @returns A Promise that resolves to the object value, or null if not found or on error.
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to get item from AsyncStorage for key: ${key}`, error);
      return null;
    }
  },
};
