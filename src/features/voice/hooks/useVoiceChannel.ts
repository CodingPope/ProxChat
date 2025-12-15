import { useEffect, useCallback, useRef, useState } from 'react';
import { useAppStore } from '../../../app/state/store';
import { createLogger } from '../../../shared/logging';
import { getChannelNameFromGeohash } from '../../../shared';
import { voiceService } from '../services';
import { nearbyService } from '../../nearby/services';
import { createP2PTransport } from '../services/p2pTransport';
import type { MediaStream } from 'react-native-webrtc';
import type {
  ConnectionStateType,
  ConnectionChangedReasonType,
} from 'react-native-agora';

// Connection state constants (to avoid importing from react-native-agora directly)
const CONNECTION_STATE_DISCONNECTED = 1;

const log = createLogger('useVoiceChannel');

/**
 * Hook for managing voice channel
 */
export const useVoiceChannel = () => {
  const {
    user,
    currentChannel,
    currentGeohash,
    currentLocation,
    isInChannel,
    isSpeaking,
    micMode,
    transportMode,
    setChannel,
    setInChannel,
    setSpeaking,
  } = useAppStore();

  const isInitialized = useRef(false);
  const agoraUidRef = useRef<number>(0);
  const p2pRef = useRef<ReturnType<typeof createP2PTransport> | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerStates, setPeerStates] = useState<Record<string, string>>({});

  // Initialize Agora on mount
  useEffect(() => {
    const initAgora = async () => {
      if (isInitialized.current) return;

      try {
        await voiceService.initializeAgora();
        isInitialized.current = true;

        // Set up callbacks
        voiceService.setVoiceCallbacks({
          onJoinChannelSuccess: (channel, uid) => {
            agoraUidRef.current = uid;
            setChannel(channel);
            setInChannel(true);
          },
          onLeaveChannel: () => {
            setChannel(null);
            setInChannel(false);
            setSpeaking(false);
          },
          onUserJoined: (uid) => {
            // Check if user should be muted
            // This is handled in nearbyUsers subscription
          },
          onUserOffline: (uid) => {
            // User left channel
          },
          onError: (code, message) => {
            log.error('Agora error', { code, message });
          },
          onConnectionStateChanged: (state, reason) => {
            // ConnectionStateDisconnected = 1
            if (state === CONNECTION_STATE_DISCONNECTED) {
              setInChannel(false);
            }
          },
        });
      } catch (error) {
        log.error('Failed to initialize Agora', { error });
      }
    };

    initAgora();

    return () => {
      voiceService.destroyAgora();
      isInitialized.current = false;
      p2pRef.current?.leave();
      p2pRef.current = null;
    };
  }, [setChannel, setInChannel, setSpeaking]);

  // Handle geohash changes - switch channels
  useEffect(() => {
    if (
      !user ||
      !currentGeohash ||
      !currentLocation ||
      !isInitialized.current
    ) {
      return;
    }

    const targetChannel = getChannelNameFromGeohash(currentGeohash);

    if (isInChannel && currentChannel === targetChannel) {
      // Already in the correct channel, no need to reconnect
      return;
    }

    const handleChannelSwitch = async () => {
      try {
        // Leave current channel if in one
        if (isInChannel) {
          await voiceService.leaveChannel();
          await nearbyService.leaveProximityChannel(user.id);
          await p2pRef.current?.leave();
          setRemoteStream(null);
          setPeerStates({});
        }

        // Join new channel based on geohash
        const newChannel = await nearbyService.joinProximityChannel(
          user.id,
          user.username,
          currentLocation,
          currentGeohash,
          agoraUidRef.current || Math.floor(Math.random() * 100000)
        );

        if (transportMode === 'p2p') {
          if (!p2pRef.current) {
            p2pRef.current = createP2PTransport(
              ({ connectionState, iceConnectionState, peerId }) => {
                const state = connectionState || iceConnectionState;
                if (peerId && state) {
                  setPeerStates((prev) => ({ ...prev, [peerId]: state }));
                }
                if (
                  state &&
                  ['failed', 'disconnected', 'closed'].includes(state)
                ) {
                  setInChannel(false);
                  setSpeaking(false);
                }
              },
              (stream) => {
                setRemoteStream(stream);
              }
            );
          }
          await p2pRef.current.join(newChannel, user.id);
          setInChannel(true);
          setChannel(newChannel);
        } else {
          await voiceService.joinChannel(newChannel, user.id);
        }
      } catch (error) {
        log.error('Failed to switch channel', { error });
      }
    };

    handleChannelSwitch();
  }, [
    currentGeohash,
    currentChannel,
    currentLocation,
    isInChannel,
    user,
    transportMode,
  ]);

  // Handle PTT
  const startSpeaking = useCallback(async () => {
    if (!user || !isInChannel) return;

    if (transportMode === 'p2p') {
      await p2pRef.current?.muteLocal(false);
    } else {
      voiceService.muteLocalMic(false);
    }
    setSpeaking(true);

    try {
      await nearbyService.updateSpeakingStatus(user.id, true);
    } catch (error) {
      log.error('Failed to update speaking status', { error });
    }
  }, [user, isInChannel, setSpeaking]);

  const stopSpeaking = useCallback(async () => {
    if (!user) return;

    if (transportMode === 'p2p') {
      await p2pRef.current?.muteLocal(true);
    } else {
      voiceService.muteLocalMic(true);
    }
    setSpeaking(false);

    try {
      await nearbyService.updateSpeakingStatus(user.id, false);
    } catch (error) {
      log.error('Failed to update speaking status', { error });
    }
  }, [user, setSpeaking]);

  // Handle open mic mode
  useEffect(() => {
    if (!isInChannel) return;

    const mute = micMode === 'ptt' && !isSpeaking;

    if (transportMode === 'p2p') {
      p2pRef.current?.muteLocal(mute);
    } else {
      voiceService.muteLocalMic(!mute ? false : true);
    }
  }, [micMode, isInChannel, isSpeaking, transportMode]);

  // Leave channel on unmount
  useEffect(() => {
    return () => {
      if (user && isInChannel) {
        voiceService.leaveChannel();
        nearbyService.leaveProximityChannel(user.id);
        p2pRef.current?.leave();
        setRemoteStream(null);
        setPeerStates({});
      }
    };
  }, []);

  return {
    currentChannel,
    isInChannel,
    isSpeaking,
    micMode,
    startSpeaking,
    stopSpeaking,
    remoteStream,
    peerStates,
  };
};

export default useVoiceChannel;
