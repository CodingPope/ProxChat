import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  MainStackParamList,
  Channel,
  ChannelMember,
  ChannelRole,
} from '../types';
import { useAppStore } from '../app/providers/useAppStore';
import channelService from '../services/channelService';
import { COLORS, FONTS, SPACING } from '../shared';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const AdminPortalScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { user } = useAppStore();

  const [channelName, setChannelName] = useState('');
  const [channelPasscode, setChannelPasscode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [memberLookup, setMemberLookup] = useState<
    Record<string, ChannelMember[]>
  >({});
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState<ChannelRole>('member');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        setLoadingChannels(true);
        const result = await channelService.listChannelsByOwner(user.id);
        setChannels(result);
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to load channels');
      } finally {
        setLoadingChannels(false);
      }
    };

    load();
  }, [user]);

  const handleCreateChannel = async () => {
    if (!user) return;
    if (!channelName.trim() || !channelPasscode.trim()) {
      Alert.alert('Missing info', 'Enter a channel name and passcode');
      return;
    }
    try {
      setIsCreating(true);
      await channelService.createChannel(
        channelName.trim(),
        channelPasscode.trim(),
        user.id
      );
      setChannelName('');
      setChannelPasscode('');
      const result = await channelService.listChannelsByOwner(user.id);
      setChannels(result);
      Alert.alert(
        'Channel created',
        'Channel is ready with passcode protection'
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create channel');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLoadMembers = async (channelId: string) => {
    try {
      const members = await channelService.listChannelMembers(channelId);
      setMemberLookup((prev) => ({ ...prev, [channelId]: members }));
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load members');
    }
  };

  const handleInvite = async (channelId: string) => {
    if (!inviteUserId.trim()) {
      Alert.alert('Missing user ID', 'Enter the user ID to invite');
      return;
    }
    try {
      await channelService.addMemberAsAdmin(
        channelId,
        inviteUserId.trim(),
        inviteRole
      );
      setInviteUserId('');
      await handleLoadMembers(channelId);
      Alert.alert('Invite added', 'User added to channel with specified role');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add member');
    }
  };

  const renderChannelCard = (channel: Channel) => {
    const members = memberLookup[channel.id] || [];
    return (
      <View key={channel.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{channel.name}</Text>
            <Text style={styles.cardSub}>ID: {channel.id.slice(0, 8)}…</Text>
          </View>
          <Pressable
            style={styles.refreshButton}
            onPress={() => handleLoadMembers(channel.id)}
          >
            <Text style={styles.refreshText}>Load members</Text>
          </Pressable>
        </View>

        {members.length > 0 && (
          <View style={styles.memberList}>
            {members.map((m) => (
              <View key={m.id} style={styles.memberRow}>
                <Text style={styles.memberName}>{m.id}</Text>
                <Text style={styles.memberRole}>{m.role}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.inviteRow}>
          <TextInput
            placeholder='User ID to invite'
            placeholderTextColor={COLORS.textSecondary}
            value={inviteUserId}
            onChangeText={setInviteUserId}
            style={styles.input}
            autoCapitalize='none'
          />
          <Pressable
            style={[
              styles.roleToggle,
              inviteRole === 'admin' && styles.roleToggleActive,
            ]}
            onPress={() =>
              setInviteRole(inviteRole === 'admin' ? 'member' : 'admin')
            }
          >
            <Text style={styles.roleToggleText}>{inviteRole}</Text>
          </Pressable>
          <Pressable
            style={styles.inviteButton}
            onPress={() => handleInvite(channel.id)}
          >
            <Text style={styles.inviteButtonText}>Add</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.infoText}>Sign in to manage channels.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Admin Portal</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create channel</Text>
          <TextInput
            placeholder='Channel name'
            placeholderTextColor={COLORS.textSecondary}
            value={channelName}
            onChangeText={setChannelName}
            style={styles.input}
          />
          <TextInput
            placeholder='Passcode'
            placeholderTextColor={COLORS.textSecondary}
            value={channelPasscode}
            onChangeText={setChannelPasscode}
            secureTextEntry
            style={styles.input}
          />
          <Pressable
            style={[styles.primaryButton, isCreating && styles.disabledButton]}
            onPress={handleCreateChannel}
            disabled={isCreating}
          >
            {isCreating ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <Text style={styles.primaryButtonText}>Create</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your channels</Text>
            {loadingChannels && (
              <ActivityIndicator size='small' color={COLORS.primary} />
            )}
          </View>
          {channels.length === 0 && !loadingChannels ? (
            <Text style={styles.infoText}>
              No channels yet. Create one to get started.
            </Text>
          ) : (
            channels.map(renderChannelCard)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backButton: { padding: SPACING.sm },
  backText: { color: COLORS.textPrimary, fontSize: FONTS.sizes.md },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    color: COLORS.textPrimary,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: { opacity: 0.7 },
  primaryButtonText: {
    color: COLORS.background,
    fontWeight: FONTS.weights.bold,
    fontSize: FONTS.sizes.md,
  },
  infoText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
  card: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  cardSub: { color: COLORS.textSecondary, fontSize: FONTS.sizes.xs },
  refreshButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  refreshText: { color: COLORS.primary, fontSize: FONTS.sizes.xs },
  memberList: { marginTop: SPACING.sm },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  memberName: { color: COLORS.textPrimary, fontSize: FONTS.sizes.sm },
  memberRole: { color: COLORS.textSecondary, fontSize: FONTS.sizes.xs },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  roleToggle: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.xs,
  },
  roleToggleActive: { backgroundColor: COLORS.primary + '22' },
  roleToggleText: { color: COLORS.textPrimary, fontSize: FONTS.sizes.sm },
  inviteButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  inviteButtonText: {
    color: COLORS.background,
    fontWeight: FONTS.weights.bold,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
});

export default AdminPortalScreen;
