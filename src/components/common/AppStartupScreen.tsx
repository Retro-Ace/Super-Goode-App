import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandArt } from '@/src/components/common/BrandArt';
import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';

export function AppStartupScreen() {
  const [showSpinner, setShowSpinner] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    const spinnerTimer = setTimeout(() => {
      setShowSpinner(true);
    }, 500);

    return () => {
      animation.stop();
      clearTimeout(spinnerTimer);
    };
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={[styles.ambientShape, styles.ambientShapeTop]} />
      <View pointerEvents="none" style={[styles.ambientShape, styles.ambientShapeBottom]} />
      <View pointerEvents="none" style={[styles.ambientGlow, styles.ambientGlowPrimary]} />
      <View pointerEvents="none" style={[styles.ambientGlow, styles.ambientGlowHighlight]} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={[styles.heroCard, elevation.floating]}>
            <Animated.View
              style={[
                styles.brandLockup,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}>
              <BrandArt align="center" brand="map" height={124} variant="full" width={320} />
            </Animated.View>

            <Text style={styles.title}>Opening Super Goode</Text>
            <Text style={styles.copy}>Finding the best spots near you</Text>

            <View style={styles.spinnerSlot}>
              {showSpinner ? (
                <View style={styles.spinnerRow}>
                  <ActivityIndicator color={palette.highlight} size="small" />
                  <Text style={styles.spinnerLabel}>Loading the latest reviews</Text>
                </View>
              ) : null}
            </View>
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
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(23, 16, 47, 0.94)',
    borderColor: 'rgba(242, 201, 76, 0.28)',
    borderRadius: 30,
    borderWidth: 1,
    gap: spacing.sm,
    maxWidth: 360,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    width: '100%',
  },
  brandLockup: {
    alignItems: 'center',
    marginBottom: spacing.xs,
    width: '100%',
  },
  title: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    textAlign: 'center',
  },
  copy: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  spinnerSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 26,
    paddingTop: spacing.xs,
    width: '100%',
  },
  spinnerRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(242, 201, 76, 0.08)',
    borderColor: 'rgba(242, 201, 76, 0.16)',
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  spinnerLabel: {
    color: palette.highlightSoft,
    fontFamily: typography.brand,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
