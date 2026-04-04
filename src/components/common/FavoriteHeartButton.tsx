import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { palette, radii } from '@/src/constants/theme';
import { useFavorites } from '@/src/providers/FavoritesProvider';

export function FavoriteHeartButton({
  restaurantId,
  style,
}: {
  restaurantId: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(restaurantId);

  return (
    <Pressable
      accessibilityLabel={favorite ? 'Remove from favorites' : 'Save to favorites'}
      accessibilityRole="button"
      onPress={() => toggleFavorite(restaurantId)}
      style={({ pressed }) => [styles.button, pressed ? styles.pressed : undefined, style]}>
      <Ionicons
        color={favorite ? palette.highlight : palette.textMuted}
        name={favorite ? 'heart' : 'heart-outline'}
        size={20}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: palette.backgroundSoft,
    borderColor: palette.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  pressed: {
    opacity: 0.84,
  },
});
