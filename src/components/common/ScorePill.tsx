import { StyleSheet, Text, View } from 'react-native';

import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';
import { formatScore } from '@/src/utils/restaurants';

export function ScorePill({ score }: { score: number }) {
  return (
    <View style={[styles.container, elevation.highlightGlow]}>
      <Text style={styles.value}>{formatScore(score)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: palette.highlight,
    borderColor: '#f7df93',
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  value: {
    color: '#201605',
    fontFamily: typography.bodyBold,
    fontSize: 20,
  },
});
