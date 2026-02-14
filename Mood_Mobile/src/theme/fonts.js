// Font configuration – matches website (moodfm-web)
// Fractul = titles/headings, Gobold = body. Loaded in App.js via expo-font.
import { Platform } from 'react-native';

export const fonts = {
  // Primary: titles and headings (Fractul – same as web)
  primary: Platform.select({
    ios: 'Fractul',
    android: 'Fractul',
    default: 'System',
  }),
  // Secondary: body text (Gobold – same as web)
  secondary: Platform.select({
    ios: 'Gobold',
    android: 'Gobold',
    default: 'System',
  }),
  // Bold variants (loaded as separate families in RN)
  primaryBold: 'Fractul-Bold',
  secondaryBold: 'Gobold-Bold',
  // Optional web-like variants
  goboldThinLight: 'GoboldThinLight',
  goboldLowplus: 'GoboldLowplus',
  // Use for & - _ ' " etc. so they don't show as demo/box (custom fonts often lack these)
  systemFont: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }),
};

// Font weights (also in typography.js for sizes+weights together)
export const fontWeights = {
  light: '200',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '900',
};

// Helper: get font family (matches web usage)
export const getFontFamily = (fontType = 'secondary', weight = 'regular') => {
  if (weight === 'bold' && fontType === 'primary') return fonts.primaryBold;
  if (weight === 'bold' && fontType === 'secondary') return fonts.secondaryBold;
  return fonts[fontType] || fonts.secondary;
};
