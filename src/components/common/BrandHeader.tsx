import { StyleSheet, Text, View } from 'react-native';

import { elevation, palette, radii, spacing } from '@/src/constants/theme';
import { BrandArt } from '@/src/components/common/BrandArt';

type BrandHeaderProps = {
  compact?: boolean;
  subtitle: string;
  variant?: 'long' | 'full';
};

export function BrandHeader({ compact = false, subtitle, variant = 'long' }: BrandHeaderProps) {
  return (
    <View style={[styles.shell, compact ? styles.shellCompact : undefined, elevation.floating]}>
      <BrandArt
        align={variant === 'full' ? 'center' : 'left'}
        height={compact ? (variant === 'full' ? 132 : 82) : variant === 'full' ? 156 : 96}
        variant={variant}
        width={compact ? (variant === 'full' ? 210 : 250) : variant === 'full' ? 240 : 292}
      />
      <Text style={[styles.subtitle, compact ? styles.subtitleCompact : undefined]}>{subtitle}</Text>
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
