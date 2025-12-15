import { StateCreator } from 'zustand';
import { User } from '../../types';

export type AuthSlice = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsUsernameSetup: boolean;
  pendingAuthUser: { uid: string; email: string | null } | null;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setPendingAuthUser: (
    pendingAuthUser: { uid: string; email: string | null } | null
  ) => void;
};

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (
  set
) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  needsUsernameSetup: false,
  pendingAuthUser: null,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      needsUsernameSetup: false,
      pendingAuthUser: null,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setPendingAuthUser: (pendingAuthUser) =>
    set({
      pendingAuthUser,
      needsUsernameSetup: !!pendingAuthUser,
    }),
});
