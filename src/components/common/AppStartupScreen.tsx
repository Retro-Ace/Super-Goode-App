import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandArt } from '@/src/components/common/BrandArt';
import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';

export function AppStartupScreen() {
  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={[styles.ambientShape, styles.ambientShapeTop]} />
      <View pointerEvents="none" style={[styles.ambientShape, styles.ambientShapeBottom]} />
      <View pointerEvents="none" style={[styles.ambientGlow, styles.ambientGlowPrimary]} />
      <View pointerEvents="none" style={[styles.ambientGlow, styles.ambientGlowHighlight]} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={[styles.brandCard, elevation.floating]}>
            <BrandArt align="center" brand="map" height={124} variant="full" width={320} />
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Opening Super Goode</Text>
              </View>
            </View>
          </View>

          <View style={[styles.statusCard, elevation.card]}>
            <ActivityIndicator color={palette.highlight} size="small" />
            <Text style={styles.title}>Loading the map, reviews, and saved spots</Text>
            <Text style={styles.copy}>
              Pulling the current feed into the app shell and restoring your favorites for a clean first view.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: palette.background,
    flex: 1,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  brandCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(23, 16, 47, 0.94)',
    borderColor: 'rgba(242, 201, 76, 0.28)',
    borderRadius: 30,
    borderWidth: 1,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  badgeRow: {
    alignItems: 'center',
    width: '100%',
  },
  badge: {
    backgroundColor: 'rgba(242, 201, 76, 0.14)',
    borderColor: 'rgba(242, 201, 76, 0.28)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    color: palette.highlightSoft,
    fontFamily: typography.brand,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statusCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 10, 32, 0.78)',
    borderColor: palette.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  title: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    textAlign: 'center',
  },
  copy: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 320,
    textAlign: 'center',
  },
  ambientShape: {
    backgroundColor: palette.backgroundSoft,
    opacity: 0.84,
    position: 'absolute',
  },
  ambientShapeTop: {
    borderBottomRightRadius: 220,
    height: 260,
    left: -110,
    top: -24,
    width: 260,
  },
  ambientShapeBottom: {
    backgroundColor: '#1B1238',
    borderTopLeftRadius: 250,
    bottom: -94,
    height: 280,
    right: -120,
    width: 280,
  },
  ambientGlow: {
    borderRadius: 999,
    position: 'absolute',
  },
  ambientGlowPrimary: {
    backgroundColor: 'rgba(160, 109, 255, 0.14)',
    height: 320,
    left: -60,
    top: 180,
    width: 320,
  },
  ambientGlowHighlight: {
    backgroundColor: 'rgba(242, 201, 76, 0.08)',
    bottom: 180,
    height: 220,
    right: -40,
    width: 220,
  },
});
