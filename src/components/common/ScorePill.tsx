import { StyleSheet, Text, View } from 'react-native';

import {
  getScoreTier,
  scoreTierPalette,
  radii,
  spacing,
  typography,
} from '@/src/constants/theme';
import { formatScore } from '@/src/utils/restaurants';

export function ScorePill({ score }: { score: number }) {
  const tier = getScoreTier(score);
  const colors = scoreTierPalette[tier];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.pillBackground,
          borderColor: colors.pillBorder,
          shadowColor: colors.pillBackground,
        },
      ]}>
      <Text style={[styles.value, { color: colors.pillText }]}>{formatScore(score)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  value: {
    fontFamily: typography.bodyBold,
    fontSize: 20,
  },
});
