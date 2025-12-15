import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../shared';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
  },
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  section: {
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  settingDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  settingValue: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
  },
  settingValueMuted: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
  },
  editUsernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernameInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    width: 120,
    marginRight: SPACING.sm,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  saveButtonText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
  },
  modeToggle: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  modeToggleText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  settingItemColumn: {
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  segmentButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
    backgroundColor: COLORS.surface,
  },
  segmentButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceLight,
  },
  segmentText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  segmentTextActive: {
    color: COLORS.primary,
  },
  helperText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  blockedUserItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundSecondary,
  },
  blockedUsername: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
  },
  unblockText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    fontWeight: FONTS.weights.medium,
  },
  adminButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  adminButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.background,
  },
  signOutButton: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  appInfoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginVertical: 2,
  },
});
