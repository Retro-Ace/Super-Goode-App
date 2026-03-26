import type { Theme } from '@react-navigation/native';

export const palette = {
  background: '#080512',
  backgroundElevated: '#110A20',
  backgroundCard: '#17102F',
  backgroundSoft: '#24184A',
  backgroundMuted: '#2F225C',
  border: 'rgba(150, 124, 255, 0.22)',
  borderStrong: 'rgba(242, 201, 76, 0.34)',
  text: '#F7F2FF',
  textMuted: '#C9C0DE',
  textDim: '#988FB3',
  accent: '#A06DFF',
  accentStrong: '#C28FFF',
  accentSoft: 'rgba(160, 109, 255, 0.16)',
  highlight: '#F2C94C',
  highlightSoft: '#F7DB7A',
  logoOrange: '#FFB52E',
  logoTeal: '#67E8D5',
  warning: '#FFB36B',
  success: '#7DD6A1',
  shadow: '#03020A',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
} as const;

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  pill: 999,
} as const;

export const typography = {
  brand: 'SpaceMono',
  body: 'System',
} as const;

export const elevation = {
  card: {
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.32,
    shadowRadius: 28,
    elevation: 10,
  },
  floating: {
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.42,
    shadowRadius: 34,
    elevation: 16,
  },
  accentGlow: {
    shadowColor: palette.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
  },
  highlightGlow: {
    shadowColor: palette.highlight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
  },
} as const;

export const navigationTheme: Theme = {
  dark: true,
  colors: {
    primary: palette.highlight,
    background: palette.background,
    card: palette.backgroundElevated,
    text: palette.text,
    border: palette.border,
    notification: palette.highlight,
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700',
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '800',
    },
  },
};
