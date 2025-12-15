import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../../shared';
import { BlockReportModalProps } from '../../../types';

const REPORT_REASONS = [
  'Harassment or bullying',
  'Hate speech',
  'Spam or advertising',
  'Inappropriate content',
  'Other',
];

const BlockReportModal: React.FC<BlockReportModalProps> = ({
  visible,
  userId,
  username,
  onClose,
  onBlock,
  onMute,
  onReport,
}) => {
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');

  const handleReport = () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    if (reason) {
      onReport(reason);
      handleClose();
    }
  };

  const handleClose = () => {
    setShowReportForm(false);
    setSelectedReason(null);
    setCustomReason('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View style={styles.container}>
          <View style={styles.handle} />

          <Text style={styles.title}>
            {showReportForm ? 'Report User' : username}
          </Text>

          {!showReportForm ? (
            <>
              <Pressable style={styles.option} onPress={onMute}>
                <Text style={styles.optionIcon}>🔇</Text>
                <View style={styles.optionContent}>
                  <Text style={styles.optionText}>Mute</Text>
                  <Text style={styles.optionDescription}>
                    You won't hear this user for this session
                  </Text>
                </View>
              </Pressable>

              <Pressable style={styles.option} onPress={onBlock}>
                <Text style={styles.optionIcon}>🚫</Text>
                <View style={styles.optionContent}>
                  <Text style={styles.optionText}>Block</Text>
                  <Text style={styles.optionDescription}>
                    You won't hear this user in any channel
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={[styles.option, styles.reportOption]}
                onPress={() => setShowReportForm(true)}
              >
                <Text style={styles.optionIcon}>⚠️</Text>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionText, styles.reportText]}>
                    Report
                  </Text>
                  <Text style={styles.optionDescription}>
                    Report this user for violating guidelines
                  </Text>
                </View>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>Select a reason:</Text>

              {REPORT_REASONS.map((reason) => (
                <Pressable
                  key={reason}
                  style={[
                    styles.reasonOption,
                    selectedReason === reason && styles.reasonSelected,
                  ]}
                  onPress={() => setSelectedReason(reason)}
                >
                  <Text
                    style={[
                      styles.reasonText,
                      selectedReason === reason && styles.reasonTextSelected,
                    ]}
                  >
                    {reason}
                  </Text>
                </Pressable>
              ))}

              {selectedReason === 'Other' && (
                <TextInput
                  style={styles.customInput}
                  placeholder='Please describe the issue...'
                  placeholderTextColor={COLORS.textMuted}
                  value={customReason}
                  onChangeText={setCustomReason}
                  multiline
                  maxLength={200}
                />
              )}

              <View style={styles.buttonRow}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setShowReportForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Back</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.submitButton,
                    !selectedReason && styles.submitButtonDisabled,
                  ]}
                  onPress={handleReport}
                  disabled={!selectedReason}
                >
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                </Pressable>
              </View>
            </>
          )}

          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.md,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.divider,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  reportOption: {
    marginTop: SPACING.sm,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
  optionDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  reportText: {
    color: COLORS.warning,
  },
  reasonOption: {
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reasonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.backgroundTertiary,
  },
  reasonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  reasonTextSelected: {
    color: COLORS.textPrimary,
  },
  customInput: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundSecondary,
    marginRight: SPACING.sm,
  },
  cancelButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  submitButton: {
    flex: 2,
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.error,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
  },
  closeButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default BlockReportModal;
