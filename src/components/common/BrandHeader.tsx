import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { elevation, palette, radii, spacing } from '@/src/constants/theme';
import { BrandArt } from '@/src/components/common/BrandArt';

type BrandHeaderProps = {
  compact?: boolean;
  subtitle?: string;
  variant?: 'long' | 'full';
  artAlign?: 'left' | 'center';
  artHeight?: number;
  artWidth?: number;
  artStyle?: StyleProp<ViewStyle>;
  shellStyle?: StyleProp<ViewStyle>;
};

export function BrandHeader({
  compact = false,
  subtitle,
  variant = 'long',
  artAlign,
  artHeight,
  artWidth,
  artStyle,
  shellStyle,
}: BrandHeaderProps) {
  const resolvedAlign = artAlign ?? (variant === 'full' ? 'center' : 'left');
  const resolvedHeight = artHeight ?? (compact ? (variant === 'full' ? 132 : 82) : variant === 'full' ? 156 : 96);
  const resolvedWidth = artWidth ?? (compact ? (variant === 'full' ? 210 : 250) : variant === 'full' ? 240 : 292);

  return (
    <View style={[styles.shell, compact ? styles.shellCompact : undefined, elevation.floating, shellStyle]}>
      <BrandArt
        align={resolvedAlign}
        height={resolvedHeight}
        style={[variant === 'long' && resolvedAlign === 'left' ? styles.longArt : undefined, artStyle]}
        variant={variant}
        width={resolvedWidth}
      />
      {subtitle ? <Text style={[styles.subtitle, compact ? styles.subtitleCompact : undefined]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: palette.backgroundCard,
    borderColor: palette.borderStrong,
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
    padding: spacing.lg,
    position: 'relative',
  },
  shellCompact: {
    padding: spacing.md,
  },
  longArt: {
    marginLeft: -spacing.sm,
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  subtitleCompact: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: spacing.xs,
  },
});
