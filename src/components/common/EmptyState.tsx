import { StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/src/components/common/ActionButton';
import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';

type EmptyStateProps = {
  title: string;
  copy: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function EmptyState({ title, copy, actionLabel, onActionPress }: EmptyStateProps) {
  return (
    <View style={[styles.card, elevation.card]}>
      <Text style={styles.eyebrow}>No matches</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.copy}>{copy}</Text>
      {actionLabel && onActionPress ? (
        <ActionButton label={actionLabel} onPress={onActionPress} variant="ghost" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: palette.backgroundCard,
    borderColor: palette.border,
    borderRadius: radii.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  eyebrow: {
    color: palette.highlightSoft,
    fontFamily: typography.brand,
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 21,
    textAlign: 'center',
  },
  copy: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
