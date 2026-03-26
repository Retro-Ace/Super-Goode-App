import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { elevation, palette, radii, spacing } from '@/src/constants/theme';

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search by name, city, or dish',
}: SearchBarProps) {
  return (
    <View style={[styles.container, elevation.card]}>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.textDim}
        selectionColor={palette.highlight}
        style={styles.input}
        value={value}
      />
      <Pressable
        accessibilityLabel={value ? 'Clear search' : 'Search'}
        onPress={value ? () => onChangeText('') : undefined}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
        <Ionicons color={palette.white} name={value ? 'close' : 'search'} size={18} />
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
  input: {
    color: palette.text,
    flex: 1,
    fontSize: 16,
    paddingVertical: spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: palette.accent,
    borderRadius: radii.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  pressed: {
    opacity: 0.82,
  },
});
