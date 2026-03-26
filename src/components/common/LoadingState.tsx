import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { palette, radii, spacing } from '@/src/constants/theme';

type LoadingStateProps = {
  title: string;
  copy?: string;
};

export function LoadingState({ title, copy }: LoadingStateProps) {
  return (
    <View style={styles.card}>
      <ActivityIndicator color={palette.highlight} />
      <Text style={styles.title}>{title}</Text>
      {copy ? <Text style={styles.copy}>{copy}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: palette.backgroundCard,
    borderColor: palette.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  title: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  copy: {
    color: palette.textDim,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});

