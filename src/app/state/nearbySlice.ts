import { StateCreator } from 'zustand';
import { NearbyUser } from '../../types';

export type NearbySlice = {
  nearbyUsers: NearbyUser[];
  nearbyCount: number;
  setNearbyUsers: (users: NearbyUser[]) => void;
};

export const createNearbySlice: StateCreator<NearbySlice, [], [], NearbySlice> =
  (set) => ({
    nearbyUsers: [],
    nearbyCount: 0,
    setNearbyUsers: (nearbyUsers) =>
      set({
        nearbyUsers,
        nearbyCount: nearbyUsers.length,
      }),
  });
