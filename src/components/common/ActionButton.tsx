import { Pressable, StyleSheet, Text } from 'react-native';

import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  compact?: boolean;
};

export function ActionButton({
  label,
  onPress,
  variant = 'secondary',
  compact = false,
}: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact ? styles.compactButton : undefined,
        variant === 'primary' ? styles.primaryButton : undefined,
        variant === 'secondary' ? styles.secondaryButton : undefined,
        variant === 'ghost' ? styles.ghostButton : undefined,
        variant === 'primary' ? elevation.accentGlow : undefined,
        pressed ? styles.pressed : undefined,
      ]}>
      <Text
        style={[
          styles.label,
          variant === 'primary' ? styles.primaryLabel : undefined,
          variant === 'secondary' ? styles.secondaryLabel : undefined,
          variant === 'ghost' ? styles.ghostLabel : undefined,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.pill,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  compactButton: {
    minHeight: 36,
    paddingHorizontal: spacing.sm,
  },
  primaryButton: {
    backgroundColor: palette.accent,
    borderColor: palette.accentStrong,
  },
  secondaryButton: {
    backgroundColor: '#121D35',
    borderColor: 'rgba(61, 73, 111, 0.92)',
  },
  ghostButton: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: palette.border,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ translateY: 1 }],
  },
  label: {
    fontFamily: typography.bodyBold,
    fontSize: 12,
    letterSpacing: 0,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  primaryLabel: {
    color: palette.white,
  },
  secondaryLabel: {
    color: palette.text,
  },
  ghostLabel: {
    color: palette.highlightSoft,
  },
});
