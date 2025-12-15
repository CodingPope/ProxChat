import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../../shared';
import { MicModeToggleProps } from '../../../types';

const MicModeToggle: React.FC<MicModeToggleProps> = ({ mode, onToggle }) => {
  return (
    <Pressable onPress={onToggle} style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{mode === 'ptt' ? '🎙️' : '📢'}</Text>
      </View>
      <Text style={styles.label}>
        {mode === 'ptt' ? 'Push to Talk' : 'Open Mic'}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
});

export default MicModeToggle;
