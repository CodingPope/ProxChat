import { firestore } from '../app/providers/firebase';
import {
  collection,
  getDocs,
  onSnapshot,
  QuerySnapshot,
} from 'firebase/firestore';
import { BlockedZone, LocationData } from '../types';
import { COLLECTIONS } from '../shared';
import { isLocationInZone } from '../shared';
import { createLogger } from '../shared/logging';

// Cache blocked zones to avoid repeated Firestore reads
let cachedBlockedZones: BlockedZone[] = [];
let lastFetchTime: number = 0;
const CACHE_DURATION = 60000; // 1 minute cache

const log = createLogger('GeofenceService');

/**
 * Fetch blocked zones from Firestore
 */
export const fetchBlockedZones = async (): Promise<BlockedZone[]> => {
  const now = Date.now();

  // Return cached if still valid
  if (cachedBlockedZones.length > 0 && now - lastFetchTime < CACHE_DURATION) {
    return cachedBlockedZones;
  }

  const q = collection(firestore, COLLECTIONS.BLOCKED_ZONES);
  const snapshot = await getDocs(q);

  cachedBlockedZones = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    name: docSnap.data().name,
    center: docSnap.data().center,
    radiusMeters: docSnap.data().radiusMeters,
  }));

  lastFetchTime = now;
  return cachedBlockedZones;
};

/**
 * Check if a location is inside any blocked zone
 */
export const isInBlockedZone = async (
  location: LocationData
): Promise<BlockedZone | null> => {
  const blockedZones = await fetchBlockedZones();

  for (const zone of blockedZones) {
    const inside = isLocationInZone(
      location.latitude,
      location.longitude,
      zone.center.latitude,
      zone.center.longitude,
      zone.radiusMeters
    );

    if (inside) {
      return zone;
    }
  }

  return null;
};

/**
 * Clear blocked zones cache (call when zones might have changed)
 */
export const clearBlockedZonesCache = (): void => {
  cachedBlockedZones = [];
  lastFetchTime = 0;
};

/**
 * Subscribe to blocked zones updates
 */
export const subscribeToBlockedZones = (
  onUpdate: (zones: BlockedZone[]) => void
): (() => void) => {
  const q = collection(firestore, COLLECTIONS.BLOCKED_ZONES);
  return onSnapshot(
    q,
    (snapshot: QuerySnapshot) => {
      const zones = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        name: docSnap.data().name,
        center: docSnap.data().center,
        radiusMeters: docSnap.data().radiusMeters,
      }));

      cachedBlockedZones = zones;
      lastFetchTime = Date.now();
      onUpdate(zones);
    },
    (error: Error) => {
      log.error('Blocked zones listener error', { error });
    }
  );
};

export default {
  fetchBlockedZones,
  isInBlockedZone,
  clearBlockedZonesCache,
  subscribeToBlockedZones,
};
