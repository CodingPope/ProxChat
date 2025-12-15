import Geolocation from 'react-native-geolocation-service';
import { encodeGeohash, LOCATION_UPDATE_INTERVAL } from '../../../shared';
import { createLocationService } from './createLocationService';

export const locationService = createLocationService({
  geolocation: Geolocation,
  encodeGeohash,
  updateIntervalMs: LOCATION_UPDATE_INTERVAL,
});

export type { LocationService } from './createLocationService';
