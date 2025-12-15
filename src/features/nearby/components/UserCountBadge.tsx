import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../../shared';
import { UserCountBadgeProps } from '../../../types';

const UserCountBadge: React.FC<UserCountBadgeProps> = ({
  count,
  isAnimating = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(count);

  // Animate on count change
  useEffect(() => {
    if (count !== prevCount.current) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();

      prevCount.current = count;
    }
  }, [count, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.countContainer, { transform: [{ scale: scaleAnim }] }]}
      >
        <Text style={styles.count}>{count}</Text>
      </Animated.View>
      <Text style={styles.label}>
        {count === 1 ? 'person nearby' : 'people nearby'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  countContainer: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 20,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  count: {
    fontSize: FONTS.sizes.giant,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});

export default UserCountBadge;
