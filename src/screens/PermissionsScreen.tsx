import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { MainStackParamList, PermissionsState } from '../types';
import { useAppStore } from '../app/providers/useAppStore';
import {
  checkAllPermissions,
  requestAllPermissions,
  areAllPermissionsGranted,
  isAnyPermissionBlocked,
  openAppSettings,
  getPermissionMessage,
} from '../shared';
import { COLORS, FONTS, SPACING } from '../shared';

type PermissionsScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'Permissions'
>;

const PermissionsScreen: React.FC = () => {
  const navigation = useNavigation<PermissionsScreenNavigationProp>();
  const { setPermissionsGranted, hasCompletedOnboarding } = useAppStore();

  const [permissions, setPermissions] = useState<PermissionsState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    setIsLoading(true);
    const perms = await checkAllPermissions();
    setPermissions(perms);
    setIsLoading(false);

    // If all permissions are already granted, proceed
    if (areAllPermissionsGranted(perms)) {
      handlePermissionsGranted();
    }
  };

  const handleRequestPermissions = async () => {
    setIsRequesting(true);
    const perms = await requestAllPermissions();
    setPermissions(perms);
    setIsRequesting(false);

    if (areAllPermissionsGranted(perms)) {
      handlePermissionsGranted();
    } else if (isAnyPermissionBlocked(perms)) {
      Alert.alert(
        'Permissions Required',
        'Some permissions are blocked. Please enable them in Settings to use ProxChat.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openAppSettings },
        ]
      );
    }
  };

  const handlePermissionsGranted = () => {
    setPermissionsGranted(true);

    if (hasCompletedOnboarding) {
      navigation.replace('Home');
    } else {
      navigation.replace('Onboarding');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'granted':
        return '✅';
      case 'denied':
        return '❌';
      case 'blocked':
        return '🚫';
      default:
        return '⚪';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🔐</Text>
        <Text style={styles.title}>Permissions Required</Text>
        <Text style={styles.subtitle}>
          ProxChat needs access to your location and microphone to connect you
          with people nearby
        </Text>

        <View style={styles.permissionsList}>
          <View style={styles.permissionItem}>
            <Text style={styles.permissionIcon}>
              {permissions ? getStatusIcon(permissions.location) : '⚪'}
            </Text>
            <View style={styles.permissionText}>
              <Text style={styles.permissionTitle}>📍 Location</Text>
              <Text style={styles.permissionDesc}>To find people near you</Text>
            </View>
          </View>

          <View style={styles.permissionItem}>
            <Text style={styles.permissionIcon}>
              {permissions ? getStatusIcon(permissions.microphone) : '⚪'}
            </Text>
            <View style={styles.permissionText}>
              <Text style={styles.permissionTitle}>🎙️ Microphone</Text>
              <Text style={styles.permissionDesc}>
                To talk with people nearby
              </Text>
            </View>
          </View>

          <View style={styles.permissionItem}>
            <Text style={styles.permissionIcon}>
              {permissions ? getStatusIcon(permissions.locationAlways) : '⚪'}
            </Text>
            <View style={styles.permissionText}>
              <Text style={styles.permissionTitle}>🔄 Background Location</Text>
              <Text style={styles.permissionDesc}>
                To stay connected while using other apps (optional)
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.button}
          onPress={handleRequestPermissions}
          disabled={isRequesting}
        >
          {isRequesting ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.buttonText}>Grant Permissions</Text>
          )}
        </Pressable>

        {permissions && isAnyPermissionBlocked(permissions) && (
          <Pressable style={styles.settingsButton} onPress={openAppSettings}>
            <Text style={styles.settingsButtonText}>Open Settings</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 60,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.md,
  },
  permissionsList: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  permissionIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  permissionDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  footer: {
    paddingBottom: SPACING.xl,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.background,
  },
  settingsButton: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.primary,
  },
});

export default PermissionsScreen;
