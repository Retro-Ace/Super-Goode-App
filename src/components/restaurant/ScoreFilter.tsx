import { ScrollView, Pressable, StyleSheet, Text } from 'react-native';

import { palette, radii, spacing, typography } from '@/src/constants/theme';
import { scoreFilterOptions } from '@/src/utils/restaurants';

type ScoreFilterProps = {
  selectedScore: number | null;
  onChange: (value: number | null) => void;
};

export function ScoreFilter({ selectedScore, onChange }: ScoreFilterProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
      {scoreFilterOptions.map((option) => {
        const isSelected = option.minimumScore === selectedScore;

        return (
          <Pressable
            key={option.label}
            onPress={() => onChange(option.minimumScore)}
            style={({ pressed }) => [
              styles.chip,
              isSelected ? styles.selectedChip : undefined,
              pressed ? styles.pressed : undefined,
            ]}>
            <Text style={[styles.label, isSelected ? styles.selectedLabel : undefined]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  chip: {
    backgroundColor: palette.backgroundSoft,
    borderColor: palette.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  selectedChip: {
    backgroundColor: palette.accent,
    borderColor: palette.accentStrong,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    color: palette.textMuted,
    fontFamily: typography.brand,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  selectedLabel: {
    color: palette.white,
  },
});
