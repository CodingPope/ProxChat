import { StateCreator } from 'zustand';
import { LocationData } from '../../types';

export type LocationSlice = {
  currentLocation: LocationData | null;
  currentGeohash: string | null;
  isInBlockedZone: boolean;
  backgroundLocationEnabled: boolean;
  setLocation: (location: LocationData | null) => void;
  setGeohash: (geohash: string | null) => void;
  setInBlockedZone: (isInBlockedZone: boolean) => void;
  setBackgroundLocationEnabled: (enabled: boolean) => void;
};

export const createLocationSlice: StateCreator<
  LocationSlice,
  [],
  [],
  LocationSlice
> = (set) => ({
  currentLocation: null,
  currentGeohash: null,
  isInBlockedZone: false,
  backgroundLocationEnabled: true,
  setLocation: (currentLocation) => set({ currentLocation }),
  setGeohash: (currentGeohash) => set({ currentGeohash }),
  setInBlockedZone: (isInBlockedZone) => set({ isInBlockedZone }),
  setBackgroundLocationEnabled: (backgroundLocationEnabled) =>
    set({ backgroundLocationEnabled }),
});
