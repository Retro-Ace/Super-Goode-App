import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { elevation, palette, radii, spacing, typography } from '@/src/constants/theme';

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  compact?: boolean;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search by name, city, or dish',
  compact = false,
}: SearchBarProps) {
  return (
    <View style={[styles.container, compact ? styles.containerCompact : undefined, elevation.card]}>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.textDim}
        selectionColor={palette.highlight}
        style={[styles.input, compact ? styles.inputCompact : undefined]}
        value={value}
      />
      <Pressable
        accessibilityLabel={value ? 'Clear search' : 'Search'}
        onPress={value ? () => onChangeText('') : undefined}
        style={({ pressed }) => [
          styles.iconButton,
          compact ? styles.iconButtonCompact : undefined,
          pressed && styles.pressed,
        ]}>
        <Ionicons color={palette.white} name={value ? 'close' : 'search'} size={compact ? 16 : 18} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: palette.backgroundElevated,
    borderColor: palette.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 54,
    paddingHorizontal: spacing.md,
  },
  containerCompact: {
    gap: spacing.xs,
    minHeight: 46,
    paddingHorizontal: spacing.sm,
  },
  input: {
    color: palette.text,
    flex: 1,
    fontFamily: typography.body,
    fontSize: 16,
    paddingVertical: spacing.sm,
  },
  inputCompact: {
    fontSize: 15,
    paddingVertical: spacing.xs,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: palette.accent,
    borderRadius: radii.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  iconButtonCompact: {
    height: 30,
    width: 30,
  },
  pressed: {
    opacity: 0.82,
  },
});
