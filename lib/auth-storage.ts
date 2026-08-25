'use client';

import { Book, Review, UserState, UserRole, Permission } from '@/types/book';
import { generateRoleToken, getPermissionsForRole, hasPermission, isAdmin } from './rbac';

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
  role: 'user',
  permissions: ['books:read'],
};

/**
 * Sync cookie for Next.js middleware and server-side route awareness
 */
function syncAuthCookies(role: UserRole | undefined, token: string | undefined): void {
  if (typeof document === 'undefined') return;
  try {
    if (role && token) {
      document.cookie = `bookly_auth_role=${role}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `bookly_token=${token}; path=/; max-age=604800; SameSite=Lax`;
    } else {
      document.cookie = 'bookly_auth_role=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'bookly_token=; path=/; max-age=0; SameSite=Lax';
    }
  } catch (e) {
    // Non-blocking cookie error
  }
}

/**
 * Get current user state from localStorage with fallback to default.
 */
export function getStoredUserState(): UserState {
  if (typeof window === 'undefined') return DEFAULT_USER_STATE;
  try {
    const raw = localStorage.getItem(USER_STATE_STORAGE_KEY);
    if (!raw) return DEFAULT_USER_STATE;
    const parsed = JSON.parse(raw);
    const role: UserRole = parsed.role || 'user';
    const permissions: Permission[] = parsed.permissions || getPermissionsForRole(role);

    return {
      ...DEFAULT_USER_STATE,
      ...parsed,
      role,
      permissions,
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
    syncAuthCookies(state.role, state.token);
    window.dispatchEvent(new CustomEvent(USER_STATE_EVENT, { detail: state }));
  } catch (err) {
    console.error('Failed to save user state to storage', err);
  }
}

/**
 * Perform login and assign appropriate role and secure token
 */
export function loginUserAccount(
  username: string, 
  email: string, 
  forcedRole?: UserRole
): UserState {
  const current = getStoredUserState();
  const trimmedName = username.trim();
  const trimmedEmail = email.trim().toLowerCase();

  // Determine role: if explicit role provided, use it; otherwise detect admin pattern or default to user
  let assignedRole: UserRole = forcedRole || 'user';
  if (!forcedRole) {
    const isAdminEmail = trimmedEmail.startsWith('admin@') || trimmedEmail === 'admin@bookly.id';
    const isAdminUser = trimmedName.toLowerCase() === 'admin' || trimmedName.toLowerCase().includes('administrator');
    if (isAdminEmail || isAdminUser) {
      assignedRole = 'admin';
    }
  }

  const token = generateRoleToken(trimmedName, assignedRole);
  const permissions = getPermissionsForRole(assignedRole);

  const updated: UserState = {
    ...current,
    username: trimmedName,
    email: trimmedEmail,
    role: assignedRole,
    token,
    permissions,
    roleAssignedAt: new Date().toISOString(),
  };

  saveStoredUserState(updated);
  return updated;
}

/**
 * Perform registration with role and token
 */
export function registerUserAccount(
  username: string, 
  email: string, 
  role: UserRole = 'user'
): UserState {
  const current = getStoredUserState();
  const trimmedName = username.trim();
  const trimmedEmail = email.trim().toLowerCase();

  // If email matches admin pattern, allocate admin
  const assignedRole: UserRole = (trimmedEmail.startsWith('admin@') || trimmedEmail === 'admin@bookly.id') 
    ? 'admin' 
    : role;

  const token = generateRoleToken(trimmedName, assignedRole);
  const permissions = getPermissionsForRole(assignedRole);

  const updated: UserState = {
    ...current,
    username: trimmedName,
    email: trimmedEmail,
    role: assignedRole,
    token,
    permissions,
    roleAssignedAt: new Date().toISOString(),
  };

  saveStoredUserState(updated);
  return updated;
}

/**
 * Switch role for testing and demonstrative RBAC simulation
 */
export function switchUserRole(newRole: UserRole): UserState {
  const current = getStoredUserState();
  const username = current.username || (newRole === 'admin' ? 'Admin Bookly' : 'Pembaca Setia');
  const email = current.email || (newRole === 'admin' ? 'admin@bookly.id' : 'pembaca@bookly.id');
  const token = generateRoleToken(username, newRole);
  const permissions = getPermissionsForRole(newRole);

  const updated: UserState = {
    ...current,
    username,
    email,
    role: newRole,
    token,
    permissions,
    roleAssignedAt: new Date().toISOString(),
  };

  saveStoredUserState(updated);
  return updated;
}

/**
 * Perform logout and clear profile & tokens while retaining local bookmarks/downloads
 */
export function logoutUserAccount(): UserState {
  const current = getStoredUserState();
  const updated: UserState = {
    ...current,
    username: undefined,
    email: undefined,
    role: 'guest',
    token: undefined,
    permissions: getPermissionsForRole('guest'),
    roleAssignedAt: undefined,
  };
  saveStoredUserState(updated);
  return updated;
}

/**
 * Check if the currently stored user has admin privileges
 */
export function isCurrentAdmin(): boolean {
  const state = getStoredUserState();
  return isAdmin(state);
}

/**
 * Check if the current user has a specific permission
 */
export function checkCurrentPermission(permission: Permission): boolean {
  const state = getStoredUserState();
  return hasPermission(state, permission);
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
