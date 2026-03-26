import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';

type BrandHeaderProps = {
  compact?: boolean;
  subtitle: string;
  notificationCount?: number;
};

export function BrandHeader({ compact = false, subtitle, notificationCount = 0 }: BrandHeaderProps) {
  return (
    <View style={[styles.shell, compact ? styles.shellCompact : undefined, elevation.floating]}>
      <View style={styles.glow} />
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={[styles.avatarWrap, compact ? styles.avatarWrapCompact : undefined]}>
            <Ionicons color={palette.logoOrange} name="fast-food" size={compact ? 18 : 22} />
          </View>
          <View>
            <Text style={[styles.superTitle, compact ? styles.superTitleCompact : undefined]}>SUPER GOODE</Text>
            <Text style={[styles.mapTitle, compact ? styles.mapTitleCompact : undefined]}>MAP</Text>
          </View>
        </View>

        <View style={styles.bellWrap}>
          <Ionicons color={palette.white} name="notifications" size={18} />
          {notificationCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
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
  glow: {
    backgroundColor: 'rgba(160, 109, 255, 0.2)',
    borderRadius: 200,
    height: 220,
    position: 'absolute',
    right: -70,
    top: -110,
    width: 220,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatarWrap: {
    alignItems: 'center',
    backgroundColor: palette.backgroundSoft,
    borderColor: palette.borderStrong,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  avatarWrapCompact: {
    height: 38,
    width: 38,
  },
  superTitle: {
    color: palette.logoOrange,
    fontFamily: typography.brand,
    fontSize: 26,
    letterSpacing: -0.8,
    lineHeight: 30,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  superTitleCompact: {
    fontSize: 20,
    lineHeight: 24,
  },
  mapTitle: {
    color: palette.logoTeal,
    fontFamily: typography.brand,
    fontSize: 30,
    letterSpacing: -1,
    lineHeight: 32,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  mapTitleCompact: {
    fontSize: 22,
    lineHeight: 24,
  },
  bellWrap: {
    alignItems: 'center',
    backgroundColor: palette.backgroundSoft,
    borderColor: palette.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    position: 'relative',
    width: 40,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: '#FF5E73',
    borderRadius: radii.pill,
    height: 18,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    top: -2,
    width: 18,
  },
  badgeText: {
    color: palette.white,
    fontSize: 10,
    fontWeight: '800',
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
