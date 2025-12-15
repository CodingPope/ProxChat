import ngeohash from 'ngeohash';
import { CHANNEL_PREFIX, GEOHASH_PRECISION } from './constants';

/**
 * Encode latitude and longitude to a geohash string
 */
export const encodeGeohash = (latitude: number, longitude: number): string => {
  return ngeohash.encode(latitude, longitude, GEOHASH_PRECISION);
};

/**
 * Decode a geohash string to latitude and longitude
 */
export const decodeGeohash = (
  geohash: string
): { latitude: number; longitude: number } => {
  const decoded = ngeohash.decode(geohash);
  return {
    latitude: decoded.latitude,
    longitude: decoded.longitude,
  };
};

/**
 * Get neighboring geohashes for a given geohash
 * Useful for finding users in adjacent cells
 */
export const getNeighbors = (geohash: string): string[] => {
  return ngeohash.neighbors(geohash);
};

/**
 * Get the bounding box for a geohash
 */
export const getGeohashBounds = (
  geohash: string
): {
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
} => {
  const bounds = ngeohash.decode_bbox(geohash);
  return {
    minLat: bounds[0],
    minLon: bounds[1],
    maxLat: bounds[2],
    maxLon: bounds[3],
  };
};

/**
 * Calculate approximate distance between two coordinates in meters
 * Uses Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Check if a location is within a circular zone
 */
export const isLocationInZone = (
  lat: number,
  lon: number,
  zoneCenterLat: number,
  zoneCenterLon: number,
  radiusMeters: number
): boolean => {
  const distance = calculateDistance(lat, lon, zoneCenterLat, zoneCenterLon);
  return distance <= radiusMeters;
};

/**
 * Generate channel name from geohash
 */
export const getChannelNameFromGeohash = (geohash: string): string => {
  return `${CHANNEL_PREFIX}${geohash}`;
};

/**
 * Extract geohash from channel name
 */
export const getGeohashFromChannelName = (
  channelName: string
): string | null => {
  if (channelName.startsWith(CHANNEL_PREFIX)) {
    return channelName.replace(CHANNEL_PREFIX, '');
  }
  return null;
};

/**
 * Check if two geohashes represent the same zone
 */
export const isSameZone = (
  geohash1: string | null,
  geohash2: string | null
): boolean => {
  if (!geohash1 || !geohash2) return false;
  return geohash1 === geohash2;
};

/**
 * Get human-readable zone name from geohash
 * For MVP, just shows "General" with abbreviated geohash
 */
export const getZoneDisplayName = (geohash: string | null): string => {
  if (!geohash) return 'Connecting...';
  return `General`;
};

/**
 * Get geohash approximation size in meters based on precision
 * Precision 7 = ~150m x 150m
 */
export const getGeohashSizeMeters = (
  precision: number
): { width: number; height: number } => {
  const sizes: Record<number, { width: number; height: number }> = {
    1: { width: 5000000, height: 5000000 },
    2: { width: 1250000, height: 625000 },
    3: { width: 156000, height: 156000 },
    4: { width: 39100, height: 19500 },
    5: { width: 4890, height: 4890 },
    6: { width: 1220, height: 610 },
    7: { width: 153, height: 153 },
    8: { width: 38, height: 19 },
    9: { width: 4.8, height: 4.8 },
  };
  return sizes[precision] || { width: 0, height: 0 };
};
