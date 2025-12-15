import { getAgoraConfig } from '../../../app/config/agora';
import { createVoiceService } from './createVoiceService';

const { appId, tokenServerUrl } = getAgoraConfig();

export const voiceService = createVoiceService({
  agoraAppId: appId,
  tokenServerUrl,
});

export type { VoiceService } from './createVoiceService';
