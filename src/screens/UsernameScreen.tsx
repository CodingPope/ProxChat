import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { AuthStackParamList } from '../types';
import { useAuth } from '../hooks/useAuth';
import { COLORS, FONTS, SPACING } from '../shared';

type UsernameScreenRouteProp = RouteProp<AuthStackParamList, 'Username'>;

const UsernameScreen: React.FC = () => {
  const route = useRoute<UsernameScreenRouteProp>();
  const { setUsername, isLoading } = useAuth();

  const [username, setUsernameValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateUsername = (value: string): boolean => {
    if (value.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }

    if (value.length > 20) {
      setError('Username must be 20 characters or less');
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSetUsername = async () => {
    const trimmedUsername = username.trim();

    if (!validateUsername(trimmedUsername)) {
      return;
    }

    try {
      const { userId, email } = route.params;
      await setUsername(userId, trimmedUsername, email);
      // Navigation will happen automatically through auth state change
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsernameValue(value);
    if (error) {
      validateUsername(value);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>👋</Text>
          <Text style={styles.title}>Choose a username</Text>
          <Text style={styles.subtitle}>
            This is how other users will see you in proximity chats
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.atSymbol}>@</Text>
            <TextInput
              style={styles.input}
              placeholder='username'
              placeholderTextColor={COLORS.textMuted}
              value={username}
              onChangeText={handleUsernameChange}
              autoCapitalize='none'
              autoCorrect={false}
              maxLength={20}
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Text style={styles.hintText}>
            3-20 characters, letters, numbers, and underscores only
          </Text>

          <Pressable
            style={[
              styles.button,
              (!username.trim() || !!error) && styles.buttonDisabled,
            ]}
            onPress={handleSetUsername}
            disabled={isLoading || !username.trim() || !!error}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  emoji: {
    fontSize: 60,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    paddingHorizontal: SPACING.md,
  },
  atSymbol: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textMuted,
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.lg,
    color: COLORS.textPrimary,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.sizes.sm,
    marginTop: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  hintText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    marginTop: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.background,
  },
});

export default UsernameScreen;
