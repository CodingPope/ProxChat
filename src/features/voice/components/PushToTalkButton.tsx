import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Vibration,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { COLORS, FONTS, SPACING } from '../../../shared';
import { PushToTalkButtonProps } from '../../../types';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const PushToTalkButton: React.FC<PushToTalkButtonProps> = ({
  onPressIn,
  onPressOut,
  isActive,
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation when active
  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive, pulseAnim]);

  const handlePressIn = () => {
    if (disabled) return;

    // Haptic feedback (guard if native module is unavailable)
    try {
      ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
    } catch (e) {
      // Ignore if haptics module is not linked in this build
    }

    // Scale animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();

    onPressIn();
  };

  const handlePressOut = () => {
    if (disabled) return;

    // Haptic feedback (guard if native module is unavailable)
    try {
      ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    } catch (e) {
      // Ignore if haptics module is not linked in this build
    }

    // Reset animations
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();

    onPressOut();
  };

  const backgroundColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.pttDefault, COLORS.pttActive],
  });

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.pttBorder, COLORS.speaking],
  });

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.glowEffect,
          {
            opacity: glowAnim,
            shadowOpacity,
          },
        ]}
      />
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={({ pressed }) => [styles.pressable, disabled && styles.disabled]}
      >
        <Animated.View
          style={[
            styles.button,
            {
              backgroundColor,
              borderColor,
            },
          ]}
        >
          <Text style={[styles.text, isActive && styles.textActive]}>
            {isActive ? 'SPEAKING' : 'HOLD TO\nTALK'}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowEffect: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
  },
  pressable: {
    width: '100%',
    height: '100%',
  },
  button: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.pttDefault,
  },
  text: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
  },
  textActive: {
    color: COLORS.background,
    fontSize: FONTS.sizes.lg,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default PushToTalkButton;
