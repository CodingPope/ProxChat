export const COLORS = {
  primary: '#00D9FF',
  primaryDark: '#00A3CC',
  primaryLight: '#66E8FF',
  background: '#0A0A0F',
  backgroundSecondary: '#14141F',
  backgroundTertiary: '#1E1E2E',
  surface: '#1E1E2E',
  surfaceLight: '#2A2A3E',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textMuted: '#606070',
  success: '#00FF88',
  warning: '#FFB800',
  error: '#FF4444',
  speaking: '#00FF88',
  pttDefault: '#1E1E2E',
  pttActive: '#00D9FF',
  pttBorder: '#00D9FF',
  overlay: 'rgba(0, 0, 0, 0.7)',
  divider: '#2A2A3E',
} as const;

export const FONTS = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 48,
    giant: 72,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;
