import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';
import type { Restaurant } from '@/src/types/restaurant';
import { getReviewProvider, getReviewProviderLabel, normalizeReviewUrl } from '@/src/utils/reviews';

export function ReviewPreviewCard({
  restaurant,
  onPress,
}: {
  restaurant: Pick<Restaurant, 'name' | 'reviewUrl' | 'subtitle'>;
  onPress: () => void;
}) {
  const reviewUrl = normalizeReviewUrl(restaurant.reviewUrl);
  const provider = getReviewProvider(reviewUrl);
  const providerLabel = getReviewProviderLabel(provider);
  const hasReview = Boolean(reviewUrl);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        elevation.card,
        pressed ? styles.pressed : undefined,
        !hasReview ? styles.cardDisabled : undefined,
      ]}>
      <View style={styles.glowPrimary} />
      <View style={styles.glowAccent} />
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Ionicons color={palette.background} name="play" size={18} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>{providerLabel}</Text>
          <Text style={styles.title}>{hasReview ? "Watch Phil's review in app" : 'Review link not available yet'}</Text>
          <Text numberOfLines={2} style={styles.body}>
            {hasReview
              ? restaurant.subtitle
              : 'This restaurant does not have a linked review yet. The viewer will stay gracefully unavailable until one is added.'}
          </Text>
        </View>
      </View>

      <View style={styles.ctaRow}>
        <Text style={[styles.ctaText, !hasReview ? styles.ctaTextMuted : undefined]}>
          {hasReview ? 'Watch Review' : 'View Review Status'}
        </Text>
        <Ionicons color={hasReview ? palette.highlight : palette.textDim} name="arrow-forward" size={16} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.backgroundCard,
    borderColor: palette.borderStrong,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    position: 'relative',
  },
  cardDisabled: {
    borderColor: palette.border,
  },
  glowPrimary: {
    backgroundColor: 'rgba(160, 109, 255, 0.16)',
    borderRadius: 180,
    height: 180,
    left: -60,
    position: 'absolute',
    top: -80,
    width: 180,
  },
  glowAccent: {
    backgroundColor: 'rgba(242, 201, 76, 0.12)',
    borderRadius: 140,
    height: 140,
    position: 'absolute',
    right: -10,
    top: 30,
    width: 140,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: palette.highlight,
    borderRadius: radii.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    color: palette.highlightSoft,
    fontFamily: typography.brand,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  body: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  ctaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-between',
  },
  ctaText: {
    color: palette.highlight,
    fontFamily: typography.brand,
    fontSize: 13,
    textTransform: 'uppercase',
  },
  ctaTextMuted: {
    color: palette.textDim,
  },
  pressed: {
    opacity: 0.86,
  },
});
