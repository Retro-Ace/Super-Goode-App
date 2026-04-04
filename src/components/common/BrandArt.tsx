import { Image, StyleSheet, View } from 'react-native';
import type { ImageStyle, StyleProp, ViewStyle } from 'react-native';

import { palette, spacing } from '@/src/constants/theme';

const brandArtSources = {
  headshot: require('../../../assets/images/branding/super-goode-headshot.jpg'),
  mapLogo: require('../../../assets/images/branding/super-goode-map-logo.png'),
} as const;

type BrandArtVariant = 'full' | 'long';

type BrandArtProps = {
  variant: BrandArtVariant;
  width: number;
  height: number;
  align?: 'left' | 'center';
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

export function BrandArt({
  variant,
  width,
  height,
  align = 'left',
  style,
  imageStyle,
}: BrandArtProps) {
  const isFull = variant === 'full';
  const avatarSize = isFull ? Math.min(height * 0.54, width * 0.36) : Math.min(height * 0.82, width * 0.26);
  const haloSize = avatarSize + (isFull ? 10 : 8);
  const logoWidth = isFull ? Math.min(width * 0.9, 168) : Math.max(width - haloSize - spacing.sm, 116);
  const logoHeight = isFull ? Math.min(height * 0.36, 42) : Math.min(height * 0.56, 48);

  return (
    <View style={[styles.wrap, align === 'center' ? styles.center : styles.left, style]}>
      <View style={[styles.lockup, isFull ? styles.lockupFull : styles.lockupLong, { height, width }]}>
        <View
          style={[
            styles.avatarHalo,
            isFull ? styles.avatarHaloFull : styles.avatarHaloLong,
            { borderRadius: haloSize / 2, height: haloSize, width: haloSize },
          ]}>
          <View
            style={[
              styles.avatarFrame,
              { borderRadius: avatarSize / 2, height: avatarSize, width: avatarSize },
            ]}>
            <Image source={brandArtSources.headshot} style={styles.avatarImage} />
          </View>
        </View>
        <Image
          resizeMode="contain"
          source={brandArtSources.mapLogo}
          style={[
            styles.logo,
            isFull ? styles.logoFull : styles.logoLong,
            { height: logoHeight, width: logoWidth },
            imageStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'visible',
    width: '100%',
  },
  left: {
    alignItems: 'flex-start',
  },
  center: {
    alignItems: 'center',
  },
  lockup: {
    overflow: 'visible',
  },
  lockupLong: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  lockupFull: {
    alignItems: 'center',
    gap: spacing.xxs,
    justifyContent: 'center',
  },
  avatarHalo: {
    alignItems: 'center',
    backgroundColor: 'rgba(142, 86, 255, 0.22)',
    borderColor: 'rgba(247, 213, 98, 0.28)',
    borderWidth: 1,
    justifyContent: 'center',
    shadowColor: '#8E56FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
  },
  avatarHaloLong: {
    marginRight: -spacing.xs,
  },
  avatarHaloFull: {
    marginBottom: 2,
  },
  avatarFrame: {
    backgroundColor: palette.backgroundCard,
    borderColor: 'rgba(255, 255, 255, 0.34)',
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  logo: {
    flexShrink: 1,
    maxWidth: '100%',
  },
  logoLong: {
    marginBottom: -spacing.xs,
    marginTop: -spacing.xxs,
  },
  logoFull: {
    marginBottom: -spacing.xs,
  },
});
