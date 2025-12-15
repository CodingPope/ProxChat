import { Platform } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
  Permission,
} from 'react-native-permissions';
import { PermissionStatus, PermissionsState } from '../types';

/**
 * Convert react-native-permissions result to our PermissionStatus type
 */
const mapPermissionResult = (result: string): PermissionStatus => {
  switch (result) {
    case RESULTS.GRANTED:
      return 'granted';
    case RESULTS.DENIED:
      return 'denied';
    case RESULTS.BLOCKED:
      return 'blocked';
    case RESULTS.LIMITED:
      return 'limited';
    case RESULTS.UNAVAILABLE:
    default:
      return 'unavailable';
  }
};

/**
 * Get platform-specific location permission
 */
const getLocationPermission = (): Permission => {
  return Platform.OS === 'ios'
    ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
    : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
};

/**
 * Get platform-specific "always" location permission
 */
const getLocationAlwaysPermission = (): Permission => {
  return Platform.OS === 'ios'
    ? PERMISSIONS.IOS.LOCATION_ALWAYS
    : PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION;
};

/**
 * Get platform-specific microphone permission
 */
const getMicrophonePermission = (): Permission => {
  return Platform.OS === 'ios'
    ? PERMISSIONS.IOS.MICROPHONE
    : PERMISSIONS.ANDROID.RECORD_AUDIO;
};

/**
 * Check location permission status
 */
export const checkLocationPermission = async (): Promise<PermissionStatus> => {
  const result = await check(getLocationPermission());
  return mapPermissionResult(result);
};

/**
 * Check "always" location permission status
 */
export const checkLocationAlwaysPermission =
  async (): Promise<PermissionStatus> => {
    const result = await check(getLocationAlwaysPermission());
    return mapPermissionResult(result);
  };

/**
 * Check microphone permission status
 */
export const checkMicrophonePermission =
  async (): Promise<PermissionStatus> => {
    const result = await check(getMicrophonePermission());
    return mapPermissionResult(result);
  };

/**
 * Request location permission
 */
export const requestLocationPermission =
  async (): Promise<PermissionStatus> => {
    const result = await request(getLocationPermission());
    return mapPermissionResult(result);
  };

/**
 * Request "always" location permission
 */
export const requestLocationAlwaysPermission =
  async (): Promise<PermissionStatus> => {
    // On iOS, we need to request WHEN_IN_USE first, then ALWAYS
    if (Platform.OS === 'ios') {
      const whenInUseResult = await request(
        PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      );
      if (whenInUseResult === RESULTS.GRANTED) {
        const alwaysResult = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
        return mapPermissionResult(alwaysResult);
      }
      return mapPermissionResult(whenInUseResult);
    }

    // On Android 10+, we need to request FINE_LOCATION first, then BACKGROUND_LOCATION
    const fineResult = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    if (fineResult === RESULTS.GRANTED) {
      const backgroundResult = await request(
        PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION
      );
      return mapPermissionResult(backgroundResult);
    }
    return mapPermissionResult(fineResult);
  };

/**
 * Request microphone permission
 */
export const requestMicrophonePermission =
  async (): Promise<PermissionStatus> => {
    const result = await request(getMicrophonePermission());
    return mapPermissionResult(result);
  };

/**
 * Check all required permissions
 */
export const checkAllPermissions = async (): Promise<PermissionsState> => {
  const [location, locationAlways, microphone] = await Promise.all([
    checkLocationPermission(),
    checkLocationAlwaysPermission(),
    checkMicrophonePermission(),
  ]);

  return {
    location,
    locationAlways,
    microphone,
  };
};

/**
 * Request all required permissions
 */
export const requestAllPermissions = async (): Promise<PermissionsState> => {
  // Request permissions sequentially to avoid UI conflicts
  const microphone = await requestMicrophonePermission();
  const location = await requestLocationPermission();

  // Request background location after basic location is granted
  let locationAlways: PermissionStatus = 'denied';
  if (location === 'granted') {
    locationAlways = await requestLocationAlwaysPermission();
  }

  return {
    location,
    locationAlways,
    microphone,
  };
};

/**
 * Check if all required permissions are granted
 */
export const areAllPermissionsGranted = (
  permissions: PermissionsState
): boolean => {
  // Location and microphone are required
  // Background location is optional but preferred
  return (
    permissions.location === 'granted' && permissions.microphone === 'granted'
  );
};

/**
 * Check if any permission is blocked (requires settings)
 */
export const isAnyPermissionBlocked = (
  permissions: PermissionsState
): boolean => {
  return (
    permissions.location === 'blocked' || permissions.microphone === 'blocked'
  );
};

/**
 * Open device settings
 */
export const openAppSettings = async (): Promise<void> => {
  await openSettings();
};

/**
 * Get user-friendly message for permission status
 */
export const getPermissionMessage = (
  permission: 'location' | 'microphone',
  status: PermissionStatus
): string => {
  const messages = {
    location: {
      denied: 'ProxChat needs your location to connect you with people nearby.',
      blocked: 'Location access is blocked. Please enable it in Settings.',
      unavailable: 'Location services are not available on this device.',
    },
    microphone: {
      denied:
        'ProxChat needs microphone access so you can talk with people nearby.',
      blocked: 'Microphone access is blocked. Please enable it in Settings.',
      unavailable: 'Microphone is not available on this device.',
    },
  };

  return messages[permission][status as keyof typeof messages.location] || '';
};
