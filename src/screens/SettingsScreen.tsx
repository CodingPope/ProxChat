import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { MainStackParamList, TransportMode, User } from '../types';
import { useAppStore } from '../app/providers/useAppStore';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';
import { COLORS, FONTS, SPACING } from '../shared';
import styles from './SettingsScreen.styles';

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'Settings'
>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const {
    user,
    blockedUsers,
    micMode,
    backgroundLocationEnabled,
    transportMode,
  } = useAppStore();
  const { signOut, updateUsername } = useAuth();
  const {
    toggleMicMode,
    setBackgroundLocationEnabled,
    unblockUser,
    setTransportMode,
  } = useAppStore();

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSaveUsername = async () => {
    if (!newUsername.trim() || newUsername === user?.username) {
      setIsEditingUsername(false);
      return;
    }

    try {
      setIsLoading(true);
      await updateUsername(newUsername.trim());
      setIsEditingUsername(false);
      Alert.alert('Success', 'Username updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const handleUnblockUser = async (userId: string) => {
    if (!user) return;

    try {
      await userService.unblockUser(user.id, userId);
      unblockUser(userId);
    } catch (error) {
      Alert.alert('Error', 'Failed to unblock user');
    }
  };

  const handleToggleBackgroundLocation = (value: boolean) => {
    setBackgroundLocationEnabled(value);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Username</Text>
            {isEditingUsername ? (
              <View style={styles.editUsernameContainer}>
                <TextInput
                  style={styles.usernameInput}
                  value={newUsername}
                  onChangeText={setNewUsername}
                  autoCapitalize='none'
                  autoFocus
                  maxLength={20}
                />
                <Pressable
                  style={styles.saveButton}
                  onPress={handleSaveUsername}
                  disabled={isLoading}
                >
                  <Text style={styles.saveButtonText}>
                    {isLoading ? '...' : 'Save'}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setIsEditingUsername(true)}>
                <Text style={styles.settingValue}>
                  @{user?.username || 'unknown'} ✏️
                </Text>
              </Pressable>
            )}
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Email</Text>
            <Text style={styles.settingValueMuted}>{user?.email || 'N/A'}</Text>
          </View>
        </View>

        {/* Voice Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Settings</Text>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Mic Mode</Text>
              <Text style={styles.settingDescription}>
                {micMode === 'ptt'
                  ? 'Press and hold to talk'
                  : 'Always transmitting'}
              </Text>
            </View>
            <Pressable style={styles.modeToggle} onPress={toggleMicMode}>
              <Text style={styles.modeToggleText}>
                {micMode === 'ptt' ? 'Push to Talk' : 'Open Mic'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.settingItemColumn}>
            <Text style={styles.settingLabel}>Connection Mode</Text>
            <Text style={styles.settingDescription}>
              Choose how voice connects: cloud (Agora), local-only P2P, or auto
            </Text>
            <View style={styles.segmentRow}>
              {(['auto', 'cloud', 'p2p'] as TransportMode[]).map((mode) => {
                const isActive = transportMode === mode;
                const label =
                  mode === 'auto'
                    ? 'Auto'
                    : mode === 'cloud'
                    ? 'Cloud'
                    : 'Local P2P';
                return (
                  <Pressable
                    key={mode}
                    style={[
                      styles.segmentButton,
                      isActive && styles.segmentButtonActive,
                    ]}
                    onPress={() => setTransportMode(mode)}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        isActive && styles.segmentTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {transportMode === 'p2p' && (
              <Text style={styles.helperText}>
                Local P2P fallback UI enabled; native P2P transport pending.
              </Text>
            )}
          </View>
        </View>

        {/* Location Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Background Location</Text>
              <Text style={styles.settingDescription}>
                Stay connected while using other apps
              </Text>
            </View>
            <Switch
              value={backgroundLocationEnabled}
              onValueChange={handleToggleBackgroundLocation}
              trackColor={{ false: COLORS.divider, true: COLORS.primary }}
              thumbColor={COLORS.textPrimary}
            />
          </View>
        </View>

        {/* Admin */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin</Text>
          <Pressable
            style={styles.adminButton}
            onPress={() => navigation.navigate('AdminPortal')}
          >
            <Text style={styles.adminButtonText}>Admin Portal</Text>
          </Pressable>
        </View>

        {/* Blocked Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blocked Users</Text>

          {blockedUsers.length === 0 ? (
            <Text style={styles.emptyText}>No blocked users</Text>
          ) : (
            blockedUsers.map((userId: string) => (
              <View key={userId} style={styles.blockedUserItem}>
                <Text style={styles.blockedUsername}>
                  User ID: {userId.slice(0, 8)}...
                </Text>
                <Pressable onPress={() => handleUnblockUser(userId)}>
                  <Text style={styles.unblockText}>Unblock</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <Pressable style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>ProxChat v1.0.0</Text>
          <Text style={styles.appInfoText}>Made with ❤️</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
