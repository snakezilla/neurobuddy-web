import { openDB, type IDBPDatabase } from 'idb';
import type { ChildProfile, ParentSettings } from '@/types';

const DB_NAME = 'neurobuddy';
const DB_VERSION = 1;

interface NeuroBuddyDB {
  profile: {
    key: string;
    value: ChildProfile;
  };
  settings: {
    key: string;
    value: ParentSettings;
  };
}

let dbPromise: Promise<IDBPDatabase<NeuroBuddyDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<NeuroBuddyDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}

// Simple hash function for PIN (not cryptographically secure, just obfuscation)
export function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export function verifyPin(pin: string, hash: string): boolean {
  return hashPin(pin) === hash;
}

// Profile operations
export async function saveProfile(profile: ChildProfile): Promise<void> {
  const db = await getDB();
  await db.put('profile', profile);
}

export async function getProfile(): Promise<ChildProfile | null> {
  const db = await getDB();
  const profiles = await db.getAll('profile');
  return profiles[0] || null;
}

export async function deleteProfile(): Promise<void> {
  const db = await getDB();
  const profiles = await db.getAll('profile');
  for (const profile of profiles) {
    await db.delete('profile', profile.id);
  }
}

// Settings operations
export async function saveSettings(settings: ParentSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings, 'main');
}

export async function getSettings(): Promise<ParentSettings | null> {
  const db = await getDB();
  return (await db.get('settings', 'main')) || null;
}

// Check if setup is complete
export async function isSetupComplete(): Promise<boolean> {
  const profile = await getProfile();
  const settings = await getSettings();
  return profile !== null && settings !== null;
}

// Clear all data (factory reset)
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear('profile');
  await db.clear('settings');
}
