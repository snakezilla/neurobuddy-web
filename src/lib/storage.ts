import { openDB, type IDBPDatabase } from 'idb';
import type { ChildProfile, ParentSettings } from '@/types';

const DB_NAME = 'neurobuddy';
const DB_VERSION = 2; // Bumped for analytics store

// Analytics types
export interface RoutineLog {
  id: string;
  routineId: string;
  routineName: string;
  routineIcon: string;
  startedAt: number;
  completedAt?: number;
  stepsCompleted: number;
  totalSteps: number;
}

export interface AnalyticsSummary {
  routines: {
    started: number;
    completed: number;
  };
  totalEngagementMinutes: number;
  dailyActivity: { label: string; count: number }[];
  favoriteRoutine?: {
    name: string;
    icon: string;
    completionCount: number;
  };
}

interface NeuroBuddyDB {
  profile: {
    key: string;
    value: ChildProfile;
  };
  settings: {
    key: string;
    value: ParentSettings;
  };
  analytics: {
    key: string;
    value: RoutineLog;
    indexes: { 'by-date': number };
  };
}

let dbPromise: Promise<IDBPDatabase<NeuroBuddyDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<NeuroBuddyDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        // New analytics store (added in v2)
        if (oldVersion < 2 && !db.objectStoreNames.contains('analytics')) {
          const analyticsStore = db.createObjectStore('analytics', { keyPath: 'id' });
          analyticsStore.createIndex('by-date', 'startedAt');
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
  await db.clear('analytics');
}

// ========================================
// ANALYTICS FUNCTIONS
// All data stored locally, never transmitted
// ========================================

export async function logRoutineStart(
  routineId: string,
  routineName: string,
  routineIcon: string,
  totalSteps: number
): Promise<string> {
  const db = await getDB();
  const id = crypto.randomUUID();
  const log: RoutineLog = {
    id,
    routineId,
    routineName,
    routineIcon,
    startedAt: Date.now(),
    stepsCompleted: 0,
    totalSteps,
  };
  await db.put('analytics', log);
  return id;
}

export async function logRoutineProgress(logId: string, stepsCompleted: number): Promise<void> {
  const db = await getDB();
  const log = await db.get('analytics', logId);
  if (log) {
    log.stepsCompleted = stepsCompleted;
    await db.put('analytics', log);
  }
}

export async function logRoutineComplete(logId: string): Promise<void> {
  const db = await getDB();
  const log = await db.get('analytics', logId);
  if (log) {
    log.completedAt = Date.now();
    log.stepsCompleted = log.totalSteps;
    await db.put('analytics', log);
  }
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const db = await getDB();
  const logs = await db.getAll('analytics');

  // Filter to last 30 days
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentLogs = logs.filter((l) => l.startedAt > thirtyDaysAgo);

  // Calculate completion rates
  const started = recentLogs.length;
  const completed = recentLogs.filter((l) => l.completedAt).length;

  // Calculate engagement time (in minutes)
  let totalMs = 0;
  for (const log of recentLogs) {
    const endTime = log.completedAt || log.startedAt + 5 * 60 * 1000; // Assume 5min if not completed
    totalMs += endTime - log.startedAt;
  }
  const totalEngagementMinutes = totalMs / 1000 / 60;

  // Daily activity for last 7 days
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekLogs = recentLogs.filter((l) => l.startedAt > sevenDaysAgo);
  const dailyActivity: { label: string; count: number }[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const count = weekLogs.filter((l) => l.startedAt >= dayStart && l.startedAt < dayEnd).length;
    dailyActivity.push({ label: dayNames[date.getDay()], count });
  }

  // Find favorite routine
  const routineCounts: Record<string, { name: string; icon: string; count: number }> = {};
  for (const log of recentLogs.filter((l) => l.completedAt)) {
    if (!routineCounts[log.routineId]) {
      routineCounts[log.routineId] = { name: log.routineName, icon: log.routineIcon, count: 0 };
    }
    routineCounts[log.routineId].count++;
  }
  const favorite = Object.values(routineCounts).sort((a, b) => b.count - a.count)[0];

  return {
    routines: { started, completed },
    totalEngagementMinutes,
    dailyActivity,
    favoriteRoutine: favorite
      ? { name: favorite.name, icon: favorite.icon, completionCount: favorite.count }
      : undefined,
  };
}

