import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/src/constants/theme';

export function Screen({
  children,
  includeBottomInset = false,
}: {
  children: React.ReactNode;
  includeBottomInset?: boolean;
}) {
  return (
    <SafeAreaView
      edges={includeBottomInset ? ['top', 'left', 'right', 'bottom'] : ['top', 'left', 'right']}
      style={styles.safeArea}>
      <View style={styles.root}>
        <View pointerEvents="none" style={styles.topGlow} />
        <View pointerEvents="none" style={styles.sideGlow} />
        <View pointerEvents="none" style={styles.bottomGlow} />
        <View style={styles.content}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.background,
    flex: 1,
  },
  root: {
    backgroundColor: palette.background,
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  topGlow: {
    backgroundColor: 'rgba(160, 109, 255, 0.16)',
    borderRadius: 280,
    height: 280,
    left: -80,
    position: 'absolute',
    top: -130,
    width: 280,
  },
  sideGlow: {
    backgroundColor: 'rgba(242, 201, 76, 0.08)',
    borderRadius: 220,
    height: 220,
    position: 'absolute',
    right: -70,
    top: 180,
    width: 220,
  },
  bottomGlow: {
    backgroundColor: 'rgba(160, 109, 255, 0.1)',
    borderRadius: 320,
    bottom: -190,
    height: 320,
    left: -40,
    position: 'absolute',
    width: 320,
  },
});
