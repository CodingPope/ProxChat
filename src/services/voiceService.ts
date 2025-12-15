// Dynamic import to avoid ts-interface-checker issues at module load time
let createAgoraRtcEngine: any;
let ChannelProfileType: any;
let ClientRoleType: any;
let AudioProfileType: any;
let AudioScenarioType: any;
let ConnectionStateType: any;
let ConnectionChangedReasonType: any;

// Flag to track if Agora module is loaded
let agoraModuleLoaded = false;
let agoraModuleError: Error | null = null;
// Load Agora module dynamically
const loadAgoraModule = async () => {
  if (agoraModuleLoaded) return true;
  if (agoraModuleError) return false;

  try {
    const agoraModule = require('react-native-agora');
    createAgoraRtcEngine = agoraModule.default;
    ChannelProfileType = agoraModule.ChannelProfileType;
    ClientRoleType = agoraModule.ClientRoleType;
    AudioProfileType = agoraModule.AudioProfileType;
    AudioScenarioType = agoraModule.AudioScenarioType;
    ConnectionStateType = agoraModule.ConnectionStateType;
    ConnectionChangedReasonType = agoraModule.ConnectionChangedReasonType;
    agoraModuleLoaded = true;
    return true;
  } catch (error) {
    console.error('Failed to load Agora module:', error);
    agoraModuleError = error as Error;
    return false;
  }
};

import type {
  IRtcEngine,
  RtcConnection,
  IRtcEngineEventHandler,
} from 'react-native-agora';
import {
  AGORA_APP_ID,
  TOKEN_SERVER_URL,
  AUDIO_SETTINGS,
} from '../config/agora';
import { AgoraTokenRequest, AgoraTokenResponse } from '../types';

// Agora engine instance
let agoraEngine: IRtcEngine | null = null;
let currentChannel: string | null = null;
let currentUid: number = 0;
let eventHandler: IRtcEngineEventHandler | null = null;

// Event callbacks
type VoiceEventCallbacks = {
  onJoinChannelSuccess?: (channel: string, uid: number) => void;
  onLeaveChannel?: () => void;
  onUserJoined?: (uid: number) => void;
  onUserOffline?: (uid: number) => void;
  onError?: (code: number, message: string) => void;
  onConnectionStateChanged?: (
    state: ConnectionStateType,
    reason: ConnectionChangedReasonType
  ) => void;
};

let callbacks: VoiceEventCallbacks = {};

/**
 * Initialize Agora RTC Engine
 */
export const initializeAgora = async (): Promise<void> => {
  if (agoraEngine) {
    console.warn('Agora engine already initialized');
    return;
  }

  if (!AGORA_APP_ID) {
    throw new Error(
      'AGORA_APP_ID is missing. Set EXPO_PUBLIC_AGORA_APP_ID in your .env'
    );
  }

  // Load Agora module dynamically
  const loaded = await loadAgoraModule();
  if (!loaded) {
    throw new Error(
      'Failed to load Agora module: ' +
        (agoraModuleError?.message || 'Unknown error')
    );
  }

  try {
    agoraEngine = createAgoraRtcEngine();

    agoraEngine.initialize({
      appId: AGORA_APP_ID,
      channelProfile: ChannelProfileType.ChannelProfileCommunication,
    });

    // Set audio profile for voice chat
    agoraEngine.setAudioProfile(
      AudioProfileType.AudioProfileSpeechStandard,
      AudioScenarioType.AudioScenarioChatroom
    );

    // Enable audio
    agoraEngine.enableAudio();

    // Set client role to broadcaster (can send and receive audio)
    agoraEngine.setClientRole(ClientRoleType.ClientRoleBroadcaster);

    // Register event handler
    eventHandler = {
      onJoinChannelSuccess: (connection: RtcConnection, elapsed: number) => {
        console.log('Joined channel:', connection.channelId);
        currentChannel = connection.channelId || null;
        currentUid = connection.localUid || 0;
        callbacks.onJoinChannelSuccess?.(
          connection.channelId || '',
          connection.localUid || 0
        );
      },
      onLeaveChannel: (connection: RtcConnection, stats: any) => {
        console.log('Left channel:', connection.channelId);
        currentChannel = null;
        callbacks.onLeaveChannel?.();
      },
      onUserJoined: (
        connection: RtcConnection,
        remoteUid: number,
        elapsed: number
      ) => {
        console.log('User joined:', remoteUid);
        callbacks.onUserJoined?.(remoteUid);
      },
      onUserOffline: (
        connection: RtcConnection,
        remoteUid: number,
        reason: number
      ) => {
        console.log('User offline:', remoteUid);
        callbacks.onUserOffline?.(remoteUid);
      },
      onError: (err: number, msg: string) => {
        console.error('Agora error:', err, msg);
        callbacks.onError?.(err, msg);
      },
      onConnectionStateChanged: (
        connection: RtcConnection,
        state: ConnectionStateType,
        reason: ConnectionChangedReasonType
      ) => {
        callbacks.onConnectionStateChanged?.(state, reason);
      },
    };

    agoraEngine.registerEventHandler(eventHandler);

    console.log('Agora engine initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Agora engine:', error);
    if (error instanceof Error && error.stack) {
      console.error('Agora init stack:', error.stack);
    }
    throw error;
  }
};

/**
 * Set event callbacks
 */
export const setVoiceCallbacks = (newCallbacks: VoiceEventCallbacks): void => {
  callbacks = { ...callbacks, ...newCallbacks };
};

/**
 * Fetch Agora token from backend server
 */
export const fetchAgoraToken = async (
  userId: string,
  channelName: string
): Promise<string> => {
  try {
    if (!TOKEN_SERVER_URL) {
      throw new Error(
        'TOKEN_SERVER_URL is missing. Set EXPO_PUBLIC_TOKEN_SERVER_URL in your .env'
      );
    }

    const response = await fetch(TOKEN_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        channelName,
      } as AgoraTokenRequest),
    });

    if (!response.ok) {
      throw new Error(`Token server error: ${response.status}`);
    }

    const data: AgoraTokenResponse = await response.json();
    return data.token;
  } catch (error) {
    console.error('Failed to fetch Agora token:', error);
    // For development, return empty string (Agora allows this for testing)
    console.warn('Using empty token for development');
    return '';
  }
};

/**
 * Join a voice channel
 */
export const joinChannel = async (
  channelName: string,
  userId: string,
  uid?: number
): Promise<void> => {
  if (!agoraEngine) {
    throw new Error('Agora engine not initialized');
  }

  if (currentChannel) {
    console.log('Already in a channel, leaving first...');
    await leaveChannel();
  }

  try {
    // Fetch token from backend
    const token = await fetchAgoraToken(userId, channelName);

    // Generate UID if not provided
    const agoraUid = uid || Math.floor(Math.random() * 100000);

    // Join channel
    agoraEngine.joinChannel(token, channelName, agoraUid, {
      channelProfile: ChannelProfileType.ChannelProfileCommunication,
      clientRoleType: ClientRoleType.ClientRoleBroadcaster,
    });

    // Start with mic muted (for PTT mode)
    agoraEngine.muteLocalAudioStream(true);

    console.log(`Joining channel: ${channelName} with UID: ${agoraUid}`);
  } catch (error) {
    console.error('Failed to join channel:', error);
    throw error;
  }
};

/**
 * Leave current voice channel
 */
export const leaveChannel = async (): Promise<void> => {
  if (!agoraEngine) {
    console.warn('Agora engine not initialized');
    return;
  }

  if (!currentChannel) {
    console.warn('Not in a channel');
    return;
  }

  try {
    agoraEngine.leaveChannel();
    currentChannel = null;
    console.log('Left channel');
  } catch (error) {
    console.error('Failed to leave channel:', error);
    throw error;
  }
};

/**
 * Mute/unmute local microphone
 */
export const muteLocalMic = (mute: boolean): void => {
  if (!agoraEngine) {
    console.warn('Agora engine not initialized');
    return;
  }

  agoraEngine.muteLocalAudioStream(mute);
  console.log(`Local mic ${mute ? 'muted' : 'unmuted'}`);
};

/**
 * Mute/unmute a remote user's audio
 */
export const muteRemoteUser = (uid: number, mute: boolean): void => {
  if (!agoraEngine) {
    console.warn('Agora engine not initialized');
    return;
  }

  agoraEngine.muteRemoteAudioStream(uid, mute);
  console.log(`Remote user ${uid} ${mute ? 'muted' : 'unmuted'}`);
};

/**
 * Mute all remote users
 */
export const muteAllRemoteUsers = (mute: boolean): void => {
  if (!agoraEngine) {
    console.warn('Agora engine not initialized');
    return;
  }

  agoraEngine.muteAllRemoteAudioStreams(mute);
  console.log(`All remote users ${mute ? 'muted' : 'unmuted'}`);
};

/**
 * Enable/disable audio (for app background/foreground)
 */
export const enableAudio = (enable: boolean): void => {
  if (!agoraEngine) {
    console.warn('Agora engine not initialized');
    return;
  }

  if (enable) {
    agoraEngine.enableAudio();
  } else {
    agoraEngine.disableAudio();
  }
  console.log(`Audio ${enable ? 'enabled' : 'disabled'}`);
};

/**
 * Get current channel name
 */
export const getCurrentChannel = (): string | null => {
  return currentChannel;
};

/**
 * Get current UID
 */
export const getCurrentUid = (): number => {
  return currentUid;
};

/**
 * Check if in a channel
 */
export const isInChannel = (): boolean => {
  return currentChannel !== null;
};

/**
 * Destroy Agora engine (call on app termination)
 */
export const destroyAgora = (): void => {
  if (agoraEngine) {
    if (eventHandler) {
      agoraEngine.unregisterEventHandler(eventHandler);
      eventHandler = null;
    }
    agoraEngine.release();
    agoraEngine = null;
    currentChannel = null;
    currentUid = 0;
    console.log('Agora engine destroyed');
  }
};

export default {
  initializeAgora,
  setVoiceCallbacks,
  fetchAgoraToken,
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
