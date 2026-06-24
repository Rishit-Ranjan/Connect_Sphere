/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Seed state intentionally starts empty to remove curated/demo placeholder data
// and force the app to rely on user-created content stored in localStorage.
export const INITIAL_USERS = [];
export const INITIAL_POSTS = [];
export const INITIAL_NOTICES = [];
export const INITIAL_RESOURCES = [];
export const INITIAL_ROOMS = [];
export const INITIAL_ROOM_MESSAGES = [];
export const INITIAL_DIRECT_MESSAGES = [];

// Helper to interact with localStorage safely in client-side React
export function getSavedState(key, initialValue) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error('Error reading localStorage for key', key, error);
    return initialValue;
  }
}

export function saveState(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing localStorage for key', key, error);
  }
}

