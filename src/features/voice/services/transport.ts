import { TransportMode } from '../../../types';
import { createLogger } from '../../../shared/logging';

const log = createLogger('Transport');

export type TransportState = {
  mode: TransportMode;
  // Future: metrics like rtt, loss, peer count
};

export interface VoiceTransport {
  mode: TransportMode;
  join: (channel: string, userId: string) => Promise<void>;
  leave: () => Promise<void>;
  muteLocal: (mute: boolean) => Promise<void>;
}

/**
 * Placeholder transport that defers to Agora (cloud) until P2P is implemented.
 */
export const createStubTransport = (): VoiceTransport => {
  return {
    mode: 'p2p',
    async join() {
      log.warn('P2P transport not implemented; staying on cloud path');
    },
    async leave() {
      // no-op for stub
    },
    async muteLocal() {
      // no-op for stub
    },
  };
};
