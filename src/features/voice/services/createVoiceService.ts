import type {
  IRtcEngine,
  RtcConnection,
  IRtcEngineEventHandler,
  ChannelProfileType as ChannelProfileTypeEnum,
  ClientRoleType as ClientRoleTypeEnum,
  AudioProfileType as AudioProfileTypeEnum,
  AudioScenarioType as AudioScenarioTypeEnum,
  ConnectionStateType as ConnectionStateTypeEnum,
  ConnectionChangedReasonType as ConnectionChangedReasonTypeEnum,
} from 'react-native-agora';
import { createLogger } from '../../../shared/logging';
import { AgoraTokenRequest, AgoraTokenResponse } from '../../../types';

type VoiceModule = typeof import('react-native-agora');

export type VoiceServiceDeps = {
  agoraAppId: string;
  tokenServerUrl: string;
  loadAgoraModule?: () => Promise<VoiceModule>;
  fetchImpl?: typeof fetch;
};

type VoiceEventCallbacks = {
  onJoinChannelSuccess?: (channel: string, uid: number) => void;
  onLeaveChannel?: () => void;
  onUserJoined?: (uid: number) => void;
  onUserOffline?: (uid: number) => void;
  onError?: (code: number, message: string) => void;
  onConnectionStateChanged?: (
    state: ConnectionStateTypeEnum,
    reason: ConnectionChangedReasonTypeEnum
  ) => void;
};

const log = createLogger('VoiceService');

export const createVoiceService = ({
  agoraAppId,
  tokenServerUrl,
  loadAgoraModule = async () => require('react-native-agora'),
  fetchImpl = fetch,
}: VoiceServiceDeps) => {
  let createAgoraRtcEngine: VoiceModule['default'] | null = null;
  let ChannelProfileType: typeof ChannelProfileTypeEnum;
  let ClientRoleType: typeof ClientRoleTypeEnum;
  let AudioProfileType: typeof AudioProfileTypeEnum;
  let AudioScenarioType: typeof AudioScenarioTypeEnum;
  let ConnectionStateType: typeof ConnectionStateTypeEnum;
  let ConnectionChangedReasonType: typeof ConnectionChangedReasonTypeEnum;

  let moduleLoaded = false;
  let moduleError: Error | null = null;

  const loadModule = async () => {
    if (moduleLoaded) return true;
    if (moduleError) return false;

    try {
      const agoraModule = await loadAgoraModule();
      createAgoraRtcEngine = agoraModule.default;
      ChannelProfileType = agoraModule.ChannelProfileType;
      ClientRoleType = agoraModule.ClientRoleType;
      AudioProfileType = agoraModule.AudioProfileType;
      AudioScenarioType = agoraModule.AudioScenarioType;
      ConnectionStateType = agoraModule.ConnectionStateType;
      ConnectionChangedReasonType = agoraModule.ConnectionChangedReasonType;
      moduleLoaded = true;
      return true;
    } catch (error) {
      moduleError = error as Error;
      log.error('Failed to load Agora module', { error });
      return false;
    }
  };

  let agoraEngine: IRtcEngine | null = null;
  let currentChannel: string | null = null;
  let currentUid = 0;
  let eventHandler: IRtcEngineEventHandler | null = null;
  let callbacks: VoiceEventCallbacks = {};
  let tokenWarningShown = false;

  const initializeAgora = async () => {
    if (agoraEngine) {
      log.warn('Agora engine already initialized');
      return;
    }

    if (!agoraAppId) {
      throw new Error('AGORA_APP_ID is missing');
    }

    const loaded = await loadModule();
    if (!loaded || !createAgoraRtcEngine) {
      throw new Error(
        'Failed to load Agora module: ' +
          (moduleError?.message || 'Unknown error')
      );
    }

    if (typeof createAgoraRtcEngine !== 'function') {
      throw new Error(
        `createAgoraRtcEngine is not a function (type=${typeof createAgoraRtcEngine})`
      );
    }

    agoraEngine = createAgoraRtcEngine();

    if (!agoraEngine || typeof agoraEngine.initialize !== 'function') {
      const availableKeys = agoraEngine
        ? Object.keys(agoraEngine as Record<string, unknown>)
        : [];
      throw new Error(
        `Agora engine missing initialize. Keys=${availableKeys.join(',')}`
      );
    }

    try {
      agoraEngine.initialize({
        appId: agoraAppId,
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
      });
    } catch (error) {
      log.error(
        `Agora engine initialize() threw: ${
          error instanceof Error ? error.message : String(error)
        }`,
        {
          error,
          errorStack: error instanceof Error ? error.stack : undefined,
        }
      );
      throw error;
    }

    agoraEngine.setAudioProfile(
      AudioProfileType.AudioProfileSpeechStandard,
      AudioScenarioType.AudioScenarioChatroom
    );

    agoraEngine.enableAudio();
    agoraEngine.setClientRole(ClientRoleType.ClientRoleBroadcaster);

    eventHandler = {
      onJoinChannelSuccess: (connection: RtcConnection) => {
        currentChannel = connection.channelId || null;
        currentUid = connection.localUid || 0;
        callbacks.onJoinChannelSuccess?.(
          connection.channelId || '',
          connection.localUid || 0
        );
      },
      onLeaveChannel: () => {
        currentChannel = null;
        callbacks.onLeaveChannel?.();
      },
      onUserJoined: (_, remoteUid) => {
        callbacks.onUserJoined?.(remoteUid);
      },
      onUserOffline: (_, remoteUid) => {
        callbacks.onUserOffline?.(remoteUid);
      },
      onError: (err, msg) => {
        callbacks.onError?.(err, msg);
      },
      onConnectionStateChanged: (_, state, reason) => {
        callbacks.onConnectionStateChanged?.(state, reason);
      },
    };

    agoraEngine.registerEventHandler(eventHandler);
  };

  const fetchAgoraToken = async (userId: string, channelName: string) => {
    if (!tokenServerUrl) {
      if (!tokenWarningShown) {
        log.warn('TOKEN_SERVER_URL missing, using empty token');
        tokenWarningShown = true;
      }
      return '';
    }

    const response = await fetchImpl(tokenServerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, channelName } as AgoraTokenRequest),
    });

    if (!response.ok) {
      throw new Error(`Token server error: ${response.status}`);
    }

    const data: AgoraTokenResponse = await response.json();
    return data.token;
  };

  const joinChannel = async (
    channelName: string,
    userId: string,
    uid?: number
  ) => {
    if (!agoraEngine) {
      throw new Error('Agora engine not initialized');
    }

    if (currentChannel) {
      await leaveChannel();
    }

    const token = await fetchAgoraToken(userId, channelName);
    const agoraUid = uid || Math.floor(Math.random() * 100000);

    agoraEngine.joinChannel(token, channelName, agoraUid, {
      channelProfile: ChannelProfileType.ChannelProfileCommunication,
      clientRoleType: ClientRoleType.ClientRoleBroadcaster,
    });

    agoraEngine.muteLocalAudioStream(true);
  };

  const leaveChannel = async () => {
    if (!agoraEngine || !currentChannel) {
      return;
    }

    agoraEngine.leaveChannel();
    currentChannel = null;
  };

  const setVoiceCallbacks = (newCallbacks: VoiceEventCallbacks) => {
    callbacks = { ...callbacks, ...newCallbacks };
  };

  const muteLocalMic = (mute: boolean) => {
    agoraEngine?.muteLocalAudioStream(mute);
  };

  const muteRemoteUser = (uid: number, mute: boolean) => {
    agoraEngine?.muteRemoteAudioStream(uid, mute);
  };

  const muteAllRemoteUsers = (mute: boolean) => {
    agoraEngine?.muteAllRemoteAudioStreams(mute);
  };

  const enableAudio = (enable: boolean) => {
    if (!agoraEngine) return;
    if (enable) {
      agoraEngine.enableAudio();
    } else {
      agoraEngine.disableAudio();
    }
  };

  const destroyAgora = () => {
    if (!agoraEngine) return;
    if (eventHandler) {
      agoraEngine.unregisterEventHandler(eventHandler);
      eventHandler = null;
    }
    agoraEngine.release();
    agoraEngine = null;
    currentChannel = null;
    currentUid = 0;
  };

  const getCurrentChannel = () => currentChannel;
  const getCurrentUid = () => currentUid;
  const isInChannel = () => currentChannel !== null;

  return {
    initializeAgora,
    setVoiceCallbacks,
    joinChannel,
    leaveChannel,
    muteLocalMic,
    muteRemoteUser,
    muteAllRemoteUsers,
    enableAudio,
    getCurrentChannel,
    getCurrentUid,
    isInChannel,
    destroyAgora,
  };
};

export type VoiceService = ReturnType<typeof createVoiceService>;
