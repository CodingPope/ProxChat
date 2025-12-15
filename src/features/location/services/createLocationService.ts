import type GeolocationType from 'react-native-geolocation-service';
import type {
  GeoPosition,
  GeoError,
  GeoOptions,
} from 'react-native-geolocation-service';
import { Platform } from 'react-native';
import { createLogger } from '../../../shared/logging';
import { LocationData } from '../../../types';

export type LocationServiceDeps = {
  geolocation: typeof GeolocationType;
  encodeGeohash: (lat: number, lon: number) => string;
  updateIntervalMs: number;
  locationOptions?: GeoOptions;
};

export const createLocationService = ({
  geolocation,
  encodeGeohash,
  updateIntervalMs,
  locationOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 10000,
    distanceFilter: 0,
    forceRequestLocation: true,
    forceLocationManager: false,
    showLocationDialog: true,
  },
}: LocationServiceDeps) => {
  let watchId: number | null = null;
  let locationUpdateInterval: NodeJS.Timeout | null = null;
  const log = createLogger('LocationService');

  const getCurrentPosition = () =>
    new Promise<LocationData>((resolve, reject) => {
      geolocation.getCurrentPosition(
        (position: GeoPosition) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error: GeoError) => {
          reject(new Error(`Location error: ${error.message} (${error.code})`));
        },
        locationOptions
      );
    });

  const watchPosition = (
    onLocation: (location: LocationData) => void,
    onError: (error: Error) => void
  ) =>
    geolocation.watchPosition(
      (position: GeoPosition) => {
        onLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error: GeoError) => {
        onError(new Error(`Location watch error: ${error.message}`));
      },
      {
        ...locationOptions,
        interval: updateIntervalMs,
        fastestInterval: updateIntervalMs,
      }
    );

  const clearWatch = (id: number) => geolocation.clearWatch(id);

  const startLocationTracking = (
    onLocation: (location: LocationData, geohash: string) => void,
    onError: (error: Error) => void
  ) => {
    stopLocationTracking();

    watchId = watchPosition((location) => {
      const geohashValue = encodeGeohash(
        location.latitude,
        location.longitude
      );
      onLocation(location, geohashValue);
    }, onError);

    locationUpdateInterval = setInterval(async () => {
      try {
        const location = await getCurrentPosition();
        const geohashValue = encodeGeohash(
          location.latitude,
          location.longitude
        );
        onLocation(location, geohashValue);
      } catch (error) {
        log.warn('Interval location update failed', { error });
      }
    }, updateIntervalMs);
  };

  const stopLocationTracking = () => {
    if (watchId !== null) {
      clearWatch(watchId);
      watchId = null;
    }

    if (locationUpdateInterval !== null) {
      clearInterval(locationUpdateInterval);
      locationUpdateInterval = null;
    }
  };

  const checkLocationServices = async () => {
    if (Platform.OS === 'android') {
      return new Promise<boolean>((resolve) => {
        geolocation.getCurrentPosition(
          () => resolve(true),
          (error) => {
            if (error.code === 2) {
              resolve(false);
            } else {
              resolve(true);
            }
          },
          { timeout: 5000, maximumAge: 0 }
        );
      });
    }

    return true;
  };

  return {
    getCurrentPosition,
    startLocationTracking,
    stopLocationTracking,
    checkLocationServices,
  };
};

export type LocationService = ReturnType<typeof createLocationService>;
