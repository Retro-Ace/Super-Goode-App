import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, spacing, typography } from '@/src/constants/theme';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  copy?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function SectionHeader({
  eyebrow,
  title,
  copy,
  actionLabel,
  onActionPress,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copyBlock}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {copy ? <Text style={styles.copy}>{copy}</Text> : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
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
  copyBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    color: palette.highlightSoft,
    fontFamily: typography.brand,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  copy: {
    color: palette.textDim,
    fontSize: 14,
    lineHeight: 20,
  },
  action: {
    paddingVertical: spacing.xs,
  },
  actionLabel: {
    color: palette.highlight,
    fontFamily: typography.brand,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  pressed: {
    opacity: 0.74,
  },
});

