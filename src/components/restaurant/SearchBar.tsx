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
      <Ionicons color={palette.textMuted} name="search" size={18} />
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
      {value ? (
        <Pressable
          accessibilityLabel="Clear search"
          onPress={() => onChangeText('')}
          style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}>
          <Ionicons color={palette.textDim} name="close-circle" size={18} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: palette.backgroundElevated,
    borderColor: palette.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.md,
  },
  input: {
    color: palette.text,
    flex: 1,
    fontSize: 16,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
