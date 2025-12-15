import { StateCreator } from 'zustand';

export type ModerationSlice = {
  blockedUsers: string[];
  mutedUsers: string[];
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  muteUser: (userId: string) => void;
  unmuteUser: (userId: string) => void;
};

export const createModerationSlice: StateCreator<
  ModerationSlice,
  [],
  [],
  ModerationSlice
> = (set) => ({
  blockedUsers: [],
  mutedUsers: [],
  blockUser: (userId) =>
    set((state) => ({
      blockedUsers: [...state.blockedUsers, userId],
    })),
  unblockUser: (userId) =>
    set((state) => ({
      blockedUsers: state.blockedUsers.filter((id) => id !== userId),
    })),
  muteUser: (userId) =>
    set((state) => ({
      mutedUsers: [...state.mutedUsers, userId],
    })),
  unmuteUser: (userId) =>
    set((state) => ({
      mutedUsers: state.mutedUsers.filter((id) => id !== userId),
    })),
});
