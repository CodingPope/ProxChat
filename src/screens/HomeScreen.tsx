import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { MainStackParamList, NearbyUser } from '../types';
import { useAppStore } from '../app/providers/useAppStore';
import { useLocationTracking } from '../features/location/hooks';
import { useVoiceChannel } from '../features/voice/hooks';
import { useNearbyUsers } from '../features/nearby/hooks';
import {
  PushToTalkButton,
  MicModeToggle,
  ChannelIndicator,
  P2PAudioSink,
} from '../features/voice/components';
import { UserCountBadge } from '../features/nearby/components';
import { BlockReportModal } from '../features/moderation/components';
import useModerationActions from '../features/moderation/hooks/useModerationActions';
import { COLORS, getZoneDisplayName } from '../shared';
import styles from './HomeScreen.styles';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'Home'
>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, isInBlockedZone, micMode, toggleMicMode } = useAppStore();
  const { blockRemoteUser, muteRemoteUser, reportRemoteUser } =
    useModerationActions();

  const { currentGeohash, startTracking, stopTracking } = useLocationTracking();
  const {
    currentChannel,
    isInChannel,
    isSpeaking,
    startSpeaking,
    stopSpeaking,
    remoteStream,
    peerStates,
  } = useVoiceChannel();
  const { nearbyUsers, nearbyCount, totalUsersInChannel } = useNearbyUsers();

  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);
  const [showBlockReportModal, setShowBlockReportModal] = useState(false);

  // Start location tracking on mount
  useEffect(() => {
    startTracking();

    return () => {
      stopTracking();
    };
  }, []);

  const handlePTTPress = () => {
    if (micMode === 'ptt') {
      startSpeaking();
    }
  };

  const handlePTTRelease = () => {
    if (micMode === 'ptt') {
      stopSpeaking();
    }
  };

  const handleMicModeToggle = () => {
    toggleMicMode();
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handleBlockUser = async () => {
    if (!selectedUser || !user) return;
    try {
      await blockRemoteUser(user.id, selectedUser.odcumentId);
      setShowBlockReportModal(false);
    } catch (error) {
      console.error('Failed to block user:', error);
    }
  };

  const handleMuteUser = async () => {
    if (!selectedUser || !user) return;
    try {
      await muteRemoteUser(user.id, selectedUser.odcumentId);
      setShowBlockReportModal(false);
    } catch (error) {
      console.error('Failed to mute user:', error);
    }
  };

  const handleReportUser = async (reason: string) => {
    if (!selectedUser || !user || !currentChannel) return;
    try {
      await reportRemoteUser(
        selectedUser.odcumentId,
        user.id,
        currentChannel,
        reason
      );
      setShowBlockReportModal(false);
    } catch (error) {
      console.error('Failed to report user:', error);
    }
  };

  // Show blocked zone message
  if (isInBlockedZone) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.blockedContainer}>
          <Text style={styles.blockedEmoji}>🚫</Text>
          <Text style={styles.blockedTitle}>ProxChat Unavailable</Text>
          <Text style={styles.blockedMessage}>
            ProxChat is not available in this area. Please move to a different
            location.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading state
  if (!currentGeohash) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={COLORS.primary} />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ChannelIndicator channelName={getZoneDisplayName(currentGeohash)} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* User Count */}
        <View style={styles.userCountContainer}>
          <UserCountBadge count={totalUsersInChannel} />
        </View>

        {/* Speaking Users */}
        {nearbyUsers.some((nearbyUser) => nearbyUser.isSpeaking) && (
          <View style={styles.speakingUsersContainer}>
            <Text style={styles.speakingUsersLabel}>Speaking now</Text>
            <View style={styles.speakingUsersList}>
              {nearbyUsers
                .filter((nearbyUser) => nearbyUser.isSpeaking)
                .slice(0, 4)
                .map((nearbyUser) => (
                  <Text
                    key={nearbyUser.id}
                    numberOfLines={1}
                    style={styles.speakingUserName}
                  >
                    {nearbyUser.username}
                  </Text>
                ))}
            </View>
          </View>
        )}

        {/* Connection Status */}
        {!isInChannel && (
          <View style={styles.connectingBadge}>
            <ActivityIndicator size='small' color={COLORS.warning} />
            <Text style={styles.connectingText}>Connecting to channel...</Text>
          </View>
        )}

        {/* P2P health */}
        {Object.values(peerStates).some((state) =>
          ['failed', 'disconnected', 'closed'].includes(state)
        ) && (
          <View style={styles.connectingBadge}>
            <ActivityIndicator size='small' color={COLORS.warning} />
            <Text style={styles.connectingText}>
              Peer connection degraded, consider switching to Cloud.
            </Text>
          </View>
        )}

        {/* Speaking Indicator */}
        {isSpeaking && (
          <View style={styles.speakingIndicator}>
            <Text style={styles.speakingText}>🎙️ You're speaking</Text>
          </View>
        )}
      </View>

      {/* PTT Button */}
      <View style={styles.pttContainer}>
        <PushToTalkButton
          onPressIn={handlePTTPress}
          onPressOut={handlePTTRelease}
          isActive={isSpeaking}
          disabled={!isInChannel || micMode === 'open'}
        />

        {micMode === 'open' && (
          <Text style={styles.openMicLabel}>Open Mic Active</Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <MicModeToggle mode={micMode} onToggle={handleMicModeToggle} />

        <Pressable style={styles.settingsButton} onPress={handleSettingsPress}>
          <Text style={styles.settingsIcon}>⚙️</Text>
          <Text style={styles.settingsLabel}>Settings</Text>
        </Pressable>
      </View>

      {/* P2P Audio Sink */}
      <P2PAudioSink stream={remoteStream} />

      {/* Block/Report Modal */}
      {selectedUser && (
        <BlockReportModal
          visible={showBlockReportModal}
          userId={selectedUser.odcumentId}
          username={selectedUser.username}
          onClose={() => setShowBlockReportModal(false)}
          onBlock={handleBlockUser}
          onMute={handleMuteUser}
          onReport={handleReportUser}
        />
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;
