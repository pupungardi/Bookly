'use client';

import { Book, Review, UserState } from '@/types/book';

export const USER_STATE_STORAGE_KEY = 'bookly_user_state';
export const USER_STATE_EVENT = 'bookly_user_state_changed';

export interface DeleteBookDataOptions {
  deleteDownloads?: boolean;
  deleteBookmarks?: boolean;
  deleteReadingHistory?: boolean;
  deleteReviews?: boolean;
}

export const DEFAULT_USER_STATE: UserState = {
  bookmarks: [],
  downloads: [],
  lastRead: {},
  fontSize: 18,
  reviews: {},
};

/**
 * Get current user state from localStorage with fallback to default.
 */
export function getStoredUserState(): UserState {
  if (typeof window === 'undefined') return DEFAULT_USER_STATE;
  try {
    const raw = localStorage.getItem(USER_STATE_STORAGE_KEY);
    if (!raw) return DEFAULT_USER_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_USER_STATE,
      ...parsed,
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
      downloads: Array.isArray(parsed.downloads) ? parsed.downloads : [],
      lastRead: typeof parsed.lastRead === 'object' && parsed.lastRead !== null ? parsed.lastRead : {},
      reviews: typeof parsed.reviews === 'object' && parsed.reviews !== null ? parsed.reviews : {},
    };
  } catch (err) {
    console.error('Failed to parse user state from storage', err);
    return DEFAULT_USER_STATE;
  }
}

/**
 * Save user state to localStorage and notify all listeners across the app.
 */
export function saveStoredUserState(state: UserState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_STATE_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(USER_STATE_EVENT, { detail: state }));
  } catch (err) {
    console.error('Failed to save user state to storage', err);
  }
}

/**
 * Perform login and save profile
 */
export function loginUserAccount(username: string, email: string): UserState {
  const current = getStoredUserState();
  const updated: UserState = {
    ...current,
    username: username.trim(),
    email: email.trim().toLowerCase(),
  };
  saveStoredUserState(updated);
  return updated;
}

/**
 * Perform registration and save profile
 */
export function registerUserAccount(username: string, email: string): UserState {
  const current = getStoredUserState();
  const updated: UserState = {
    ...current,
    username: username.trim(),
    email: email.trim().toLowerCase(),
  };
  saveStoredUserState(updated);
  return updated;
}

/**
 * Perform logout and clear profile info while retaining public preferences if desired
 */
export function logoutUserAccount(): UserState {
  const current = getStoredUserState();
  const updated: UserState = {
    ...current,
    username: undefined,
    email: undefined,
  };
  saveStoredUserState(updated);
  return updated;
}

/**
 * Delete specified book data securely and return updated state
 */
export function deleteBookData(options: DeleteBookDataOptions): {
  updatedState: UserState;
  deletedCounts: {
    downloads: number;
    bookmarks: number;
    readingHistory: number;
    reviews: number;
  };
} {
  const current = getStoredUserState();
  
  const deletedCounts = {
    downloads: options.deleteDownloads ? (current.downloads?.length || 0) : 0,
    bookmarks: options.deleteBookmarks ? (current.bookmarks?.length || 0) : 0,
    readingHistory: options.deleteReadingHistory ? Object.keys(current.lastRead || {}).length : 0,
    reviews: options.deleteReviews ? Object.keys(current.reviews || {}).length : 0,
  };

  const updated: UserState = {
    ...current,
    downloads: options.deleteDownloads ? [] : (current.downloads || []),
    bookmarks: options.deleteBookmarks ? [] : (current.bookmarks || []),
    lastRead: options.deleteReadingHistory ? {} : (current.lastRead || {}),
    lastReadBookId: options.deleteReadingHistory ? undefined : current.lastReadBookId,
    reviews: options.deleteReviews ? {} : (current.reviews || {}),
  };

  saveStoredUserState(updated);
  return { updatedState: updated, deletedCounts };
}
