import { StateCreator } from 'zustand';

export type OnboardingSlice = {
  hasCompletedOnboarding: boolean;
  hasGrantedPermissions: boolean;
  setOnboardingComplete: (complete: boolean) => void;
  setPermissionsGranted: (granted: boolean) => void;
};

export const createOnboardingSlice: StateCreator<
  OnboardingSlice,
  [],
  [],
  OnboardingSlice
> = (set) => ({
  hasCompletedOnboarding: false,
  hasGrantedPermissions: false,
  setOnboardingComplete: (hasCompletedOnboarding) =>
    set({ hasCompletedOnboarding }),
  setPermissionsGranted: (hasGrantedPermissions) =>
    set({ hasGrantedPermissions }),
});
