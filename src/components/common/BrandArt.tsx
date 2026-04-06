import { Image, StyleSheet, View } from 'react-native';
import type { ImageStyle, StyleProp, ViewStyle } from 'react-native';

import { palette, spacing } from '@/src/constants/theme';

export const brandArtSources = {
  headshot: require('../../../assets/images/branding/super-goode-headshot.jpg'),
  mapLogo: require('../../../assets/images/branding/super-goode-map-logo.png'),
  wordmark: require('../../../assets/images/branding/super-goode-wordmark.png'),
} as const;

type BrandArtVariant = 'full' | 'long';
type BrandArtLogo = 'map' | 'wordmark';

type BrandArtProps = {
  variant: BrandArtVariant;
  brand?: BrandArtLogo;
  width: number;
  height: number;
  align?: 'left' | 'center';
  avatarOffsetX?: number;
  lockupGap?: number;
  logoOffsetX?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

export const TAB_WORDMARK_BRAND_ART = {
  align: 'center' as const,
  brand: 'wordmark' as const,
  height: 110,
  variant: 'full' as const,
  width: 308,
};

export const HERO_WORDMARK_BRAND_ART = {
  align: 'center' as const,
  brand: 'wordmark' as const,
  height: 124,
  lockupGap: spacing.sm,
  variant: 'full' as const,
  width: 342,
};

export function BrandArt({
  variant,
  brand,
  width,
  height,
  align = 'left',
  avatarOffsetX = 0,
  lockupGap,
  logoOffsetX = 0,
  style,
  imageStyle,
}: BrandArtProps) {
  const isFull = variant === 'full';
  const resolvedBrand = brand ?? (isFull ? 'wordmark' : 'map');
  const isMapLogo = resolvedBrand === 'map';
  const avatarSize = Math.min(height * (isFull ? 0.76 : 0.74), width * (isFull ? 0.26 : 0.22));
  const haloSize = avatarSize + (isFull ? 10 : 8);
  const gap = lockupGap ?? (isFull ? spacing.sm : spacing.xs);
  const logoWidth = Math.max(width - haloSize - gap, isMapLogo ? 132 : 148);
  const logoHeight = Math.min(height * (isFull ? 0.58 : 0.62), isMapLogo ? 66 : 72);
  const logoSource = resolvedBrand === 'map' ? brandArtSources.mapLogo : brandArtSources.wordmark;

  return (
    <View style={[styles.wrap, align === 'center' ? styles.center : styles.left, style]}>
      <View
        style={[
          styles.lockup,
          styles.lockupRow,
          isFull ? styles.lockupFull : styles.lockupLong,
          { height, width },
        ]}>
        <View
          style={[
            styles.avatarHalo,
            isFull ? styles.avatarHaloFull : styles.avatarHaloLong,
            { borderRadius: haloSize / 2, height: haloSize, width: haloSize },
            avatarOffsetX ? { transform: [{ translateX: avatarOffsetX }] } : undefined,
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
          source={logoSource}
          style={[
            styles.logo,
            isMapLogo ? styles.logoMap : styles.logoWordmark,
            isFull ? styles.logoFull : styles.logoLong,
            { height: logoHeight, width: logoWidth },
            logoOffsetX ? { marginLeft: logoOffsetX } : undefined,
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
  lockupRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  lockupLong: {
    gap: spacing.sm,
  },
  lockupFull: {
    gap: spacing.md,
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
    marginTop: 1,
  },
  avatarHaloFull: {
    marginTop: 1,
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
  logoMap: {
    marginTop: 1,
  },
  logoWordmark: {
    marginBottom: -spacing.xxs,
  },
  logoLong: {
    marginBottom: -spacing.xxs,
  },
  logoFull: {
    marginBottom: -spacing.xs,
  },
});
