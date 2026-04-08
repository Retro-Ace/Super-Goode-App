import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, spacing, typography } from '@/src/constants/theme';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  copy?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  compact?: boolean;
};

export function SectionHeader({
  eyebrow,
  title,
  copy,
  actionLabel,
  onActionPress,
  compact = false,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, compact ? styles.containerCompact : undefined]}>
      <View style={[styles.copyBlock, compact ? styles.copyBlockCompact : undefined]}>
        {eyebrow ? <Text style={[styles.eyebrow, compact ? styles.eyebrowCompact : undefined]}>{eyebrow}</Text> : null}
        <Text style={[styles.title, compact ? styles.titleCompact : undefined]}>{title}</Text>
        {copy ? <Text style={[styles.copy, compact ? styles.copyCompact : undefined]}>{copy}</Text> : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          style={({ pressed }) => [styles.action, compact ? styles.actionCompact : undefined, pressed && styles.pressed]}>
          <Text style={[styles.actionLabel, compact ? styles.actionLabelCompact : undefined]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  containerCompact: {
    gap: spacing.sm,
  },
  copyBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  copyBlockCompact: {
    gap: spacing.xxs,
  },
  eyebrow: {
    color: palette.highlightSoft,
    fontFamily: typography.brand,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  eyebrowCompact: {
    fontSize: 11,
    letterSpacing: 1,
  },
  title: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 24,
    letterSpacing: -0.7,
  },
  titleCompact: {
    fontSize: 20,
    lineHeight: 22,
  },
  copy: {
    color: palette.textDim,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  copyCompact: {
    fontSize: 13,
    lineHeight: 18,
  },
  action: {
    paddingVertical: spacing.xs,
  },
  actionCompact: {
    paddingVertical: 0,
  },
  actionLabel: {
    color: palette.highlight,
    fontFamily: typography.label,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  actionLabelCompact: {
    fontSize: 11,
  },
  pressed: {
    opacity: 0.74,
  },
});
