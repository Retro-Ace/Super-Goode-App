import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { brandArtSources } from '@/src/components/common/BrandArt';
import { palette, spacing, typography } from '@/src/constants/theme';

type AppStartupScreenProps = {
  onReady?: () => void;
};

export function AppStartupScreen({ onReady }: AppStartupScreenProps) {
  const [showSpinner, setShowSpinner] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const didReportReady = useRef(false);

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

  const handleLayout = () => {
    if (didReportReady.current) {
      return;
    }

    didReportReady.current = true;
    onReady?.();
  };

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={[styles.ambientShape, styles.ambientShapeTop]} />
      <View pointerEvents="none" style={[styles.ambientShape, styles.ambientShapeBottom]} />
      <View pointerEvents="none" style={[styles.ambientGlow, styles.ambientGlowPrimary]} />
      <View pointerEvents="none" style={[styles.ambientGlow, styles.ambientGlowHighlight]} />

      <SafeAreaView onLayout={handleLayout} style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.brandLockup,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}>
            <View style={styles.avatarFrame}>
              <Image source={brandArtSources.headshot} style={styles.avatarImage} />
            </View>
            <View style={styles.logoWrap}>
              <Image
                resizeMode="contain"
                source={brandArtSources.mapLogo}
                style={styles.logo}
              />
            </View>
          </Animated.View>

          <View style={styles.copyBlock}>
            <Text style={styles.title}>Opening Super Goode</Text>
            <Text style={styles.copy}>Finding the best spots near you</Text>
          </View>

          <View style={styles.spinnerSlot}>
            {showSpinner ? (
              <View style={styles.spinnerRow}>
                <ActivityIndicator color={palette.highlight} size="small" />
                <Text style={styles.spinnerLabel}>Loading the latest reviews</Text>
              </View>
            ) : null}
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  brandLockup: {
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 380,
    width: '100%',
  },
  avatarFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.backgroundCard,
    borderColor: 'rgba(255, 255, 255, 0.34)',
    borderRadius: 90,
    borderWidth: 2,
    height: 180,
    overflow: 'hidden',
    shadowColor: '#8E56FF',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.26,
    shadowRadius: 18,
    width: 180,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  logoWrap: {
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    height: 132,
    width: '100%',
  },
  copyBlock: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  title: {
    color: palette.text,
    fontFamily: typography.display,
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
  },
  copy: {
    color: palette.textMuted,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  spinnerSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
    paddingTop: spacing.lg,
    width: '100%',
  },
  spinnerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  spinnerLabel: {
    color: palette.highlightSoft,
    fontFamily: typography.label,
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
    height: 220,
    left: -130,
    top: -40,
    width: 220,
  },
  ambientShapeBottom: {
    backgroundColor: '#1B1238',
    borderTopLeftRadius: 250,
    bottom: -120,
    height: 240,
    right: -110,
    width: 240,
  },
  ambientGlow: {
    borderRadius: 999,
    position: 'absolute',
  },
  ambientGlowPrimary: {
    backgroundColor: 'rgba(160, 109, 255, 0.14)',
    height: 280,
    left: -80,
    top: 200,
    width: 280,
  },
  ambientGlowHighlight: {
    backgroundColor: 'rgba(242, 201, 76, 0.08)',
    bottom: 200,
    height: 180,
    right: -50,
    width: 180,
  },
});
