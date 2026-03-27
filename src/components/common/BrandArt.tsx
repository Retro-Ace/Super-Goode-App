import { Image, StyleSheet, View } from 'react-native';
import type { ImageStyle, StyleProp, ViewStyle } from 'react-native';

const brandArtSources = {
  full: require('../../../assets/images/branding/super-goode-full.png'),
  long: require('../../../assets/images/branding/super-goode-long.png'),
} as const;

type BrandArtProps = {
  variant: keyof typeof brandArtSources;
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
  return (
    <View style={[styles.wrap, align === 'center' ? styles.center : styles.left, style]}>
      <Image
        resizeMode="contain"
        source={brandArtSources[variant]}
        style={[styles.image, { height, width }, imageStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  left: {
    alignItems: 'flex-start',
  },
  center: {
    alignItems: 'center',
  },
  image: {
    maxWidth: '100%',
  },
});
