import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAppStore } from '../../../app/state/store';
import { createLogger } from '../../../shared/logging';
import { locationService } from '../services';
import { isInBlockedZone } from '../../../services/geofenceService';
import { LocationData } from '../../../types';

const log = createLogger('useLocationTracking');

/**
 * Hook for managing location tracking
 */
export const useLocationTracking = () => {
  const {
    currentLocation,
    currentGeohash,
    isInBlockedZone: inBlockedZone,
    backgroundLocationEnabled,
    setLocation,
    setGeohash,
    setInBlockedZone,
  } = useAppStore();

  const isTracking = useRef(false);
  const appState = useRef(AppState.currentState);

  const handleLocationUpdate = useCallback(
    async (location: LocationData, geohash: string) => {
      setLocation(location);

      // Check if geohash changed (zone boundary crossed)
      if (geohash !== currentGeohash) {
        setGeohash(geohash);
      }

      // Check if in blocked zone
      const blockedZone = await isInBlockedZone(location);
      setInBlockedZone(!!blockedZone);
    },
    [currentGeohash, setLocation, setGeohash, setInBlockedZone]
  );

  const handleLocationError = useCallback((error: Error) => {
    log.error('Location tracking error', { error });
  }, []);

  const startTracking = useCallback(() => {
    if (isTracking.current) return;

    isTracking.current = true;
    locationService.startLocationTracking(
      handleLocationUpdate,
      handleLocationError
    );
  }, [handleLocationUpdate, handleLocationError]);

  const stopTracking = useCallback(() => {
    if (!isTracking.current) return;

    isTracking.current = false;
    locationService.stopLocationTracking();
  }, []);

  // Handle app state changes for background tracking
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          // App came to foreground
          if (isTracking.current) {
            startTracking();
          }
        } else if (
          appState.current === 'active' &&
          nextAppState.match(/inactive|background/)
        ) {
          // App went to background
          if (!backgroundLocationEnabled) {
            stopTracking();
          }
        }

        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [backgroundLocationEnabled, startTracking, stopTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    currentLocation,
    currentGeohash,
    isInBlockedZone: inBlockedZone,
    startTracking,
    stopTracking,
    isTracking: isTracking.current,
  };
};

export default useLocationTracking;
