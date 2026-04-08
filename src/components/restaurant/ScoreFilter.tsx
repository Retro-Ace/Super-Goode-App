import { ScrollView, Pressable, StyleSheet, Text } from 'react-native';

import { palette, radii, spacing, typography } from '@/src/constants/theme';
import { scoreFilterOptions } from '@/src/utils/restaurants';

type ScoreFilterProps = {
  selectedScore: number | null;
  onChange: (value: number | null) => void;
  compact?: boolean;
};

export function ScoreFilter({ selectedScore, onChange, compact = false }: ScoreFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.content, compact ? styles.contentCompact : undefined]}>
      {scoreFilterOptions.map((option) => {
        const isSelected = option.minimumScore === selectedScore;

        return (
          <Pressable
            key={option.label}
            onPress={() => onChange(option.minimumScore)}
            style={({ pressed }) => [
              styles.chip,
              compact ? styles.chipCompact : undefined,
              isSelected ? styles.selectedChip : undefined,
              pressed ? styles.pressed : undefined,
            ]}>
            <Text style={[styles.label, compact ? styles.labelCompact : undefined, isSelected ? styles.selectedLabel : undefined]}>
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
  contentCompact: {
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  chip: {
    backgroundColor: palette.backgroundSoft,
    borderColor: palette.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipCompact: {
    paddingHorizontal: 12,
    paddingVertical: spacing.xxs,
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
    fontFamily: typography.label,
    fontSize: 13,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  labelCompact: {
    fontSize: 12,
  },
  selectedLabel: {
    color: palette.white,
  },
});
