import AsyncStorage from '@react-native-async-storage/async-storage';
import { COIN } from '../types/COIN';

const COIN_LIST_KEY = 'coin_list';
const COIN_KEY_PREFIX = 'coin_';

// Simple UUID v4 generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Get device ID for user context (Phase 1)
function getDeviceUserId(): string {
  // In Phase 1, we use a simple device identifier
  // In a real app, you might use expo-application or expo-device
  return 'device-user';
}

export class COINRepository {
  /**
   * Get all COINs sorted by last modified date (newest first)
   */
  static async getAllCOINs(): Promise<COIN[]> {
    try {
      const listJson = await AsyncStorage.getItem(COIN_LIST_KEY);
      if (!listJson) {
        return [];
      }

      const coinIds: string[] = JSON.parse(listJson);
      const coins: COIN[] = [];

      for (const id of coinIds) {
        const coinJson = await AsyncStorage.getItem(`${COIN_KEY_PREFIX}${id}`);
        if (coinJson) {
          coins.push(JSON.parse(coinJson));
        }
      }

      // Sort by lastModifiedAt (newest first)
      return coins.sort((a, b) =>
        new Date(b.lastModifiedAt).getTime() - new Date(a.lastModifiedAt).getTime()
      );
    } catch (error) {
      console.error('Error loading COINs:', error);
      return [];
    }
  }

  /**
   * Create a new COIN with the given name
   * @throws Error if name is empty or duplicate (case-insensitive)
   */
  static async createCOIN(name: string): Promise<COIN> {
    // Validate name
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Please enter a COIN name');
    }

    // Check for duplicate name (case-insensitive)
    const existingCoins = await this.getAllCOINs();
    const duplicate = existingCoins.find(
      c => c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicate) {
      throw new Error('A COIN with this name already exists');
    }

    // Create new COIN
    const now = new Date().toISOString();
    const userId = getDeviceUserId();

    const coin: COIN = {
      id: generateUUID(),
      name: trimmedName,
      version: 1,
      createdAt: now,
      createdBy: userId,
      lastModifiedBy: userId,
      lastModifiedAt: now,
      syncStatus: 'local',
    };

    // Save COIN
    await AsyncStorage.setItem(
      `${COIN_KEY_PREFIX}${coin.id}`,
      JSON.stringify(coin)
    );

    // Update index
    const coinIds = existingCoins.map(c => c.id);
    coinIds.push(coin.id);
    await AsyncStorage.setItem(COIN_LIST_KEY, JSON.stringify(coinIds));

    return coin;
  }

  /**
   * Get a single COIN by ID
   */
  static async getCOIN(id: string): Promise<COIN | null> {
    try {
      const coinJson = await AsyncStorage.getItem(`${COIN_KEY_PREFIX}${id}`);
      return coinJson ? JSON.parse(coinJson) : null;
    } catch (error) {
      console.error('Error loading COIN:', error);
      return null;
    }
  }

  /**
   * Clear all COINs (useful for testing)
   */
  static async clearAll(): Promise<void> {
    try {
      const coins = await this.getAllCOINs();
      for (const coin of coins) {
        await AsyncStorage.removeItem(`${COIN_KEY_PREFIX}${coin.id}`);
      }
      await AsyncStorage.removeItem(COIN_LIST_KEY);
    } catch (error) {
      console.error('Error clearing COINs:', error);
    }
  }
}
