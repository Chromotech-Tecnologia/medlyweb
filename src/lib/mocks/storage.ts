import type { BaseEntity, AuditLog } from './types';
import {
  mockUsers,
  mockRoleProfiles,
  mockLocations,
  mockSpecialties,
  mockScaleTypes,
  mockScales,
  mockAuditLogs,
  mockNotifications,
} from './data';

const STORAGE_PREFIX = 'medly_';

// Storage keys
export const STORAGE_KEYS = {
  USERS: `${STORAGE_PREFIX}users`,
  ROLE_PROFILES: `${STORAGE_PREFIX}role_profiles`,
  LOCATIONS: `${STORAGE_PREFIX}locations`,
  SPECIALTIES: `${STORAGE_PREFIX}specialties`,
  SCALE_TYPES: `${STORAGE_PREFIX}scale_types`,
  SCALES: `${STORAGE_PREFIX}scales`,
  CANDIDATURES: `${STORAGE_PREFIX}candidatures`,
  DOCUMENTS: `${STORAGE_PREFIX}documents`,
  RATINGS: `${STORAGE_PREFIX}ratings`,
  PAYMENTS: `${STORAGE_PREFIX}payments`,
  AUDIT_LOGS: `${STORAGE_PREFIX}audit_logs`,
  NOTIFICATIONS: `${STORAGE_PREFIX}notifications`,
  CURRENT_USER: `${STORAGE_PREFIX}current_user`,
  AUTH_TOKEN: `${STORAGE_PREFIX}auth_token`,
} as const;

// Initialize storage with mock data if empty
export function initializeStorage() {
  const DATA_VERSION_KEY = `${STORAGE_PREFIX}data_version`;
  const CURRENT_VERSION = '4'; // Bump this to force re-initialization

  const initIfEmpty = <T>(key: string, data: T[]) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  // Force reset if data version changed
  if (localStorage.getItem(DATA_VERSION_KEY) !== CURRENT_VERSION) {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    localStorage.setItem(DATA_VERSION_KEY, CURRENT_VERSION);
  }

  initIfEmpty(STORAGE_KEYS.USERS, mockUsers);
  initIfEmpty(STORAGE_KEYS.ROLE_PROFILES, mockRoleProfiles);
  initIfEmpty(STORAGE_KEYS.LOCATIONS, mockLocations);
  initIfEmpty(STORAGE_KEYS.SPECIALTIES, mockSpecialties);
  initIfEmpty(STORAGE_KEYS.SCALE_TYPES, mockScaleTypes);
  initIfEmpty(STORAGE_KEYS.SCALES, mockScales);
  initIfEmpty(STORAGE_KEYS.CANDIDATURES, []);
  initIfEmpty(STORAGE_KEYS.DOCUMENTS, []);
  initIfEmpty(STORAGE_KEYS.RATINGS, []);
  initIfEmpty(STORAGE_KEYS.PAYMENTS, []);
  initIfEmpty(STORAGE_KEYS.AUDIT_LOGS, mockAuditLogs);
  initIfEmpty(STORAGE_KEYS.NOTIFICATIONS, mockNotifications);
}

// Reset storage to initial mock data
export function resetStorage() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  initializeStorage();
}

// Generic storage operations
export function getFromStorage<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function setToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getById<T extends BaseEntity>(key: string, id: string): T | undefined {
  const items = getFromStorage<T>(key);
  return items.find(item => item.id === id && !item.deletedAt);
}

export function getAll<T extends BaseEntity>(key: string, includeDeleted = false): T[] {
  const items = getFromStorage<T>(key);
  return includeDeleted ? items : items.filter(item => !item.deletedAt);
}

export function create<T extends BaseEntity>(key: string, item: Record<string, unknown>): T {
  const items = getFromStorage<T>(key);
  const now = new Date().toISOString();
  const newItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  } as T;
  items.push(newItem);
  setToStorage(key, items);
  return newItem;
}

export function update<T extends BaseEntity>(key: string, id: string, updates: Record<string, unknown>): T | undefined {
  const items = getFromStorage<T>(key);
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return undefined;

  const updatedItem = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  } as T;
  items[index] = updatedItem;
  setToStorage(key, items);
  return updatedItem;
}

export function softDelete<T extends BaseEntity>(key: string, id: string): boolean {
  const items = getFromStorage<T>(key);
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return false;

  items[index] = {
    ...items[index],
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  setToStorage(key, items);
  return true;
}

export function hardDelete<T extends BaseEntity>(key: string, id: string): boolean {
  const items = getFromStorage<T>(key);
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return false;

  items.splice(index, 1);
  setToStorage(key, items);
  return true;
}

// Audit logging
export function logAudit(
  userId: string,
  userName: string,
  action: string,
  entity: string,
  entityId: string,
  details?: Record<string, unknown>
): void {
  const logs = getFromStorage<AuditLog>(STORAGE_KEYS.AUDIT_LOGS);
  const newLog: AuditLog = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    userId,
    userName,
    action,
    entity,
    entityId,
    details,
  };
  logs.unshift(newLog); // Add to beginning
  // Keep only last 1000 logs
  if (logs.length > 1000) {
    logs.pop();
  }
  setToStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
}

// Simulate API latency
export function simulateLatency(minMs = 100, maxMs = 500): Promise<void> {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Session management (mock)
export function setCurrentUser(userId: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, `mock_token_${userId}_${Date.now()}`);
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}

export function isAuthenticated(): boolean {
  return !!getCurrentUserId() && !!getAuthToken();
}
