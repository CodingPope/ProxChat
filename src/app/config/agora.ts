import { CHANNEL_PREFIX } from '../../shared/utils/constants';
import { createLogger } from '../../shared/logging';

const log = createLogger('AgoraConfig');

type AgoraEnv = {
  appId?: string | null;
  tokenServerUrl?: string | null;
  channelPrefix?: string | null;
};

export type AgoraConfig = {
  appId: string;
  tokenServerUrl: string;
  channelPrefix: string;
};

const readEnv = (): AgoraEnv => ({
  appId: process.env.EXPO_PUBLIC_AGORA_APP_ID ?? null,
  tokenServerUrl: process.env.EXPO_PUBLIC_TOKEN_SERVER_URL ?? null,
  channelPrefix: process.env.EXPO_PUBLIC_AGORA_CHANNEL_PREFIX ?? null,
});

const normalizeConfig = (env: AgoraEnv): AgoraConfig => {
  const appId = env.appId?.trim();
  if (!appId) {
    const message =
      'Missing EXPO_PUBLIC_AGORA_APP_ID. Set it in your .env or app.config.';
    log.error(message);
    throw new Error(message);
  }

  const tokenServerUrl = env.tokenServerUrl?.trim();
  if (!tokenServerUrl) {
    log.warn(
      'EXPO_PUBLIC_TOKEN_SERVER_URL is not defined; Agora tokens will default to empty strings.'
    );
  }

  const channelPrefix =
    env.channelPrefix?.trim() || CHANNEL_PREFIX || 'general_';

  return {
    appId,
    tokenServerUrl: tokenServerUrl ?? '',
    channelPrefix,
  };
};

let cachedConfig: AgoraConfig | null = null;

export const getAgoraConfig = (): AgoraConfig => {
  if (!cachedConfig) {
    cachedConfig = normalizeConfig(readEnv());
  }
  return cachedConfig;
};
