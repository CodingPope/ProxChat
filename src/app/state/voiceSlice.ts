import { StateCreator } from 'zustand';
import { MicMode, TransportMode } from '../../types';

export type VoiceSlice = {
  currentChannel: string | null;
  isInChannel: boolean;
  isSpeaking: boolean;
  micMode: MicMode;
  transportMode: TransportMode;
  setChannel: (channel: string | null) => void;
  setInChannel: (inChannel: boolean) => void;
  setSpeaking: (isSpeaking: boolean) => void;
  setMicMode: (micMode: MicMode) => void;
  toggleMicMode: () => void;
  setTransportMode: (mode: TransportMode) => void;
};

export const createVoiceSlice: StateCreator<VoiceSlice, [], [], VoiceSlice> = (
  set
) => ({
  currentChannel: null,
  isInChannel: false,
  isSpeaking: false,
  micMode: 'ptt',
  transportMode: 'auto',
  setChannel: (currentChannel) => set({ currentChannel }),
  setInChannel: (isInChannel) => set({ isInChannel }),
  setSpeaking: (isSpeaking) => set({ isSpeaking }),
  setMicMode: (micMode) => set({ micMode }),
  toggleMicMode: () =>
    set((state) => ({
      micMode: state.micMode === 'ptt' ? 'open' : 'ptt',
    })),
  setTransportMode: (mode: TransportMode) => set({ transportMode: mode }),
});
