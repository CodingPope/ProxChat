import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAuthSlice, AuthSlice } from './authSlice';
import { createLocationSlice, LocationSlice } from './locationSlice';
import { createVoiceSlice, VoiceSlice } from './voiceSlice';
import { createNearbySlice, NearbySlice } from './nearbySlice';
import { createModerationSlice, ModerationSlice } from './moderationSlice';
import { createOnboardingSlice, OnboardingSlice } from './onboardingSlice';

export type AppStore = AuthSlice &
  LocationSlice &
  VoiceSlice &
  NearbySlice &
  ModerationSlice &
  OnboardingSlice & {
    reset: () => void;
  };

const slices = (set: any, get: any) => {
  const auth = createAuthSlice(set, get);
  const location = createLocationSlice(set, get);
  const voice = createVoiceSlice(set, get);
  const nearby = createNearbySlice(set, get);
  const moderation = createModerationSlice(set, get);
  const onboarding = createOnboardingSlice(set, get);

  return {
    ...auth,
    ...location,
    ...voice,
    ...nearby,
    ...moderation,
    ...onboarding,
    reset: () =>
      set(() => ({
        ...auth,
        ...location,
        ...voice,
        ...nearby,
        ...moderation,
        ...onboarding,
      })),
  };
};

export const useAppStore = create<AppStore>()(
  persist(slices, {
    name: 'proxchat-storage',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (state) => ({
      hasCompletedOnboarding: state.hasCompletedOnboarding,
      hasGrantedPermissions: state.hasGrantedPermissions,
      backgroundLocationEnabled: state.backgroundLocationEnabled,
      micMode: state.micMode,
      transportMode: state.transportMode,
    }),
  })
);
