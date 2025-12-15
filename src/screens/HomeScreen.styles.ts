import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../shared';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCountContainer: {
    marginBottom: SPACING.xl,
  },
  connectingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginTop: SPACING.md,
  },
  connectingText: {
    color: COLORS.warning,
    fontSize: FONTS.sizes.sm,
    marginLeft: SPACING.sm,
  },
  speakingUsersContainer: {
    width: '100%',
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  speakingUsersLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  speakingUsersList: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  speakingUserName: {
    backgroundColor: COLORS.surfaceLight,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 999,
    fontSize: FONTS.sizes.xs,
    maxWidth: 120,
    marginHorizontal: SPACING.xs,
    marginVertical: SPACING.xs / 2,
  },
  speakingIndicator: {
    backgroundColor: COLORS.speaking,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginTop: SPACING.md,
  },
  speakingText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
  },
  pttContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  openMicLabel: {
    color: COLORS.success,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    marginTop: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  settingsButton: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  settingsIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  settingsLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    marginTop: SPACING.md,
  },
  blockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  blockedEmoji: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  blockedTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  blockedMessage: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
