// App Constants

// Location Settings
export const LOCATION_UPDATE_INTERVAL = 5000; // 5 seconds
export const GEOHASH_PRECISION = 7; // ~150m cells
export const PROXIMITY_RADIUS_METERS = 100;
export const CHANNEL_PREFIX = 'general_';

// Firebase Collections
export const COLLECTIONS = {
  USERS: 'users',
  ACTIVE_USERS: 'activeUsers',
  REPORTS: 'reports',
  BLOCKED_ZONES: 'blockedZones',
  CHANNELS: 'channels',
} as const;

// Report Threshold
export const AUTO_MUTE_REPORT_THRESHOLD = 5;

// Token Expiry
export const AGORA_TOKEN_EXPIRY_SECONDS = 86400; // 24 hours

// Onboarding Content
export const ONBOARDING_SLIDES = [
  {
    id: '1',
    title: 'Chat with people nearby',
    description:
      'Connect with anyone within 100 meters of you in real-time voice chat.',
    icon: '📍',
  },
  {
    id: '2',
    title: 'Auto-connect as you move',
    description:
      'Walk around and automatically join new proximity zones. No setup needed.',
    icon: '🚶',
  },
  {
    id: '3',
    title: 'Push-to-talk or open mic',
    description:
      'Hold to talk like a walkie-talkie, or enable open mic for hands-free chat.',
    icon: '🎙️',
  },
] as const;
