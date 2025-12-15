import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../app/providers/useAppStore';
import { voiceService } from '../features/voice/services';
import { nearbyService } from '../features/nearby/services';
import type {
  ConnectionStateType,
  ConnectionChangedReasonType,
} from 'react-native-agora';

// Connection state constants (to avoid importing from react-native-agora directly)
const CONNECTION_STATE_DISCONNECTED = 1;

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
    setChannel,
    setInChannel,
    setSpeaking,
  } = useAppStore();

  const isInitialized = useRef(false);
  const agoraUidRef = useRef<number>(0);

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
            console.error('Agora error:', code, message);
          },
          onConnectionStateChanged: (state, reason) => {
            // ConnectionStateDisconnected = 1
            if (state === CONNECTION_STATE_DISCONNECTED) {
              setInChannel(false);
            }
          },
        });
      } catch (error) {
        console.error('Failed to initialize Agora:', error);
      }
    };

    initAgora();

    return () => {
      voiceService.destroyAgora();
      isInitialized.current = false;
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

    const handleChannelSwitch = async () => {
      try {
        // Leave current channel if in one
        if (isInChannel) {
          await voiceService.leaveChannel();
          await nearbyService.leaveProximityChannel(user.id);
        }

        // Join new channel based on geohash
        const newChannel = await nearbyService.joinProximityChannel(
          user.id,
          user.username,
          currentLocation,
          currentGeohash,
          agoraUidRef.current || Math.floor(Math.random() * 100000)
        );

        await voiceService.joinChannel(newChannel, user.id);
      } catch (error) {
        console.error('Failed to switch channel:', error);
      }
    };

    handleChannelSwitch();
  }, [currentGeohash, user, currentLocation]);

  // Handle PTT
  const startSpeaking = useCallback(async () => {
    if (!user || !isInChannel) return;

    voiceService.muteLocalMic(false);
    setSpeaking(true);

    try {
      await nearbyService.updateSpeakingStatus(user.id, true);
    } catch (error) {
      console.error('Failed to update speaking status:', error);
    }
  }, [user, isInChannel, setSpeaking]);

  const stopSpeaking = useCallback(async () => {
    if (!user) return;

    voiceService.muteLocalMic(true);
    setSpeaking(false);

    try {
      await nearbyService.updateSpeakingStatus(user.id, false);
    } catch (error) {
      console.error('Failed to update speaking status:', error);
    }
  }, [user, setSpeaking]);

  // Handle open mic mode
  useEffect(() => {
    if (micMode === 'open' && isInChannel) {
      voiceService.muteLocalMic(false);
    } else if (micMode === 'ptt' && isInChannel && !isSpeaking) {
      voiceService.muteLocalMic(true);
    }
  }, [micMode, isInChannel, isSpeaking]);

  // Leave channel on unmount
  useEffect(() => {
    return () => {
      if (user && isInChannel) {
        voiceService.leaveChannel();
        nearbyService.leaveProximityChannel(user.id);
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
  };
};

export default useVoiceChannel;
