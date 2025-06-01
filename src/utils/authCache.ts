
import { User } from '@/types';

// Enhanced cache with offline support
const userProfileCache = new Map<string, User>();
const CACHE_KEY = 'signal_vault_user_cache';

// Utility functions for offline support
export const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('💾 Failed to save to localStorage:', error);
  }
};

export const loadFromLocalStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('💾 Failed to load from localStorage:', error);
    return null;
  }
};

export const getCachedUser = (uid: string): User | undefined => {
  return userProfileCache.get(uid);
};

export const setCachedUser = (uid: string, user: User) => {
  userProfileCache.set(uid, user);
  saveToLocalStorage(CACHE_KEY, user);
};

export const clearUserCache = () => {
  userProfileCache.clear();
  localStorage.removeItem(CACHE_KEY);
};

export const loadCachedUserData = (): User | null => {
  return loadFromLocalStorage(CACHE_KEY);
};
