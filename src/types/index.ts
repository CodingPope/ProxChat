import { Timestamp, GeoPoint } from 'firebase/firestore';

// ==================== User Types ====================

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Timestamp;
  blockedUsers: string[];
  mutedUsers: string[];
  reportCount: number;
  isAutoMuted: boolean;
}

export interface CreateUserData {
  id: string;
  username: string;
  email: string;
}

// ==================== Active User Types ====================

export interface ActiveUser {
  id: string;
  username: string;
  location: GeoPoint;
  geohash: string;
  proximityChannel: string;
  agoraUid: number;
  isSpeaking: boolean;
  lastUpdated: Timestamp;
}

export interface NearbyUser {
  id: string;
  username: string;
  isSpeaking: boolean;
  agoraUid: number;
}

// ==================== Report Types ====================

export type ReportStatus = 'pending' | 'reviewed';

export interface Report {
  id?: string;
  reportedUserId: string;
  reporterUserId: string;
  channel: string;
  reason: string;
  timestamp: Timestamp;
  status: ReportStatus;
}

export interface CreateReportData {
  reportedUserId: string;
  reporterUserId: string;
  channel: string;
  reason: string;
}

// ==================== Blocked Zone Types ====================

export interface BlockedZone {
  id: string;
  name: string;
  center: GeoPoint;
  radiusMeters: number;
}

// ==================== Channel Types ====================

export type ChannelRole = 'admin' | 'member';

export interface Channel {
  id: string;
  name: string;
  passcodeHash: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface ChannelMember {
  id: string;
  role: ChannelRole;
  joinedAt: Timestamp;
  passcodeHash?: string; // stored for rules verification
}

// ==================== Location Types ====================

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

// ==================== Voice Chat Types ====================

export type MicMode = 'ptt' | 'open';
export type TransportMode = 'auto' | 'cloud' | 'p2p';

export interface VoiceState {
  isInChannel: boolean;
  currentChannel: string | null;
  isSpeaking: boolean;
  isMuted: boolean;
  micMode: MicMode;
  transportMode?: TransportMode;
}

// ==================== Auth Types ====================

export type AuthProvider = 'email' | 'google' | 'apple';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ==================== Navigation Types ====================

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: { initialRouteName?: string };
  Login: undefined;
  Signup: undefined;
  Username: { userId: string; email: string };
  Permissions: undefined;
  Onboarding: undefined;
  Home: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  Username: { userId: string; email: string };
};

export type MainStackParamList = {
  Permissions: undefined;
  Onboarding: undefined;
  Home: undefined;
  Settings: undefined;
  AdminPortal: undefined;
};

// ==================== Store Types ====================

export interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsUsernameSetup: boolean;
  pendingAuthUser: { uid: string; email: string | null } | null;

  // Location
  currentLocation: LocationData | null;
  currentGeohash: string | null;
  isInBlockedZone: boolean;
  backgroundLocationEnabled: boolean;

  // Voice
  currentChannel: string | null;
  isInChannel: boolean;
  isSpeaking: boolean;
  micMode: MicMode;
  transportMode: TransportMode;

  // Nearby Users
  nearbyUsers: NearbyUser[];
  nearbyCount: number;

  // Moderation
  blockedUsers: string[];
  mutedUsers: string[];

  // Onboarding
  hasCompletedOnboarding: boolean;
  hasGrantedPermissions: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setPendingAuthUser: (
    pendingAuthUser: { uid: string; email: string | null } | null
  ) => void;
  setLocation: (location: LocationData | null) => void;
  setGeohash: (geohash: string | null) => void;
  setInBlockedZone: (inBlockedZone: boolean) => void;
  setBackgroundLocationEnabled: (enabled: boolean) => void;
  setChannel: (channel: string | null) => void;
  setInChannel: (inChannel: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
  setMicMode: (mode: MicMode) => void;
  toggleMicMode: () => void;
  setNearbyUsers: (users: NearbyUser[]) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  muteUser: (userId: string) => void;
  unmuteUser: (userId: string) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setPermissionsGranted: (granted: boolean) => void;
  reset: () => void;
}

// ==================== Permission Types ====================

export type PermissionStatus =
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable'
  | 'limited';

export interface PermissionsState {
  location: PermissionStatus;
  locationAlways: PermissionStatus;
  microphone: PermissionStatus;
}

// ==================== Error Types ====================

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

// ==================== API Types ====================

export interface AgoraTokenRequest {
  userId: string;
  channelName: string;
}

export interface AgoraTokenResponse {
  token: string;
}

// ==================== Component Props ====================

export interface PushToTalkButtonProps {
  onPressIn: () => void;
  onPressOut: () => void;
  isActive: boolean;
  disabled?: boolean;
}

export interface UserCountBadgeProps {
  count: number;
  isAnimating?: boolean;
}

export interface ChannelIndicatorProps {
  channelName: string;
}

export interface MicModeToggleProps {
  mode: MicMode;
  onToggle: () => void;
}

export interface BlockReportModalProps {
  visible: boolean;
  userId: string;
  username: string;
  onClose: () => void;
  onBlock: () => void;
  onMute: () => void;
  onReport: (reason: string) => void;
}
