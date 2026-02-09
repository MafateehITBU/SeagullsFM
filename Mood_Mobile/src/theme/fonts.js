// Font configuration
// Use Platform to provide fallbacks
import { Platform } from 'react-native';

export const fonts = {
  // Primary font for titles and headings (Fractul)
  primary: Platform.select({
    ios: 'Fractul',
    android: 'Fractul',
    default: 'System',
  }),
  // Secondary font for body text (Gobold)
  secondary: Platform.select({
    ios: 'Gobold',
    android: 'Gobold',
    default: 'System',
  }),
};

// Font weights
export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// Helper function to get font family with fallback
export const getFontFamily = (fontType = 'secondary', weight = 'regular') => {
  const baseFont = fonts[fontType] || fonts.secondary;
  
  // If custom fonts are loaded, use them with weight suffix
  if (weight === 'bold' && fontType === 'primary') {
    return 'Fractul-Bold';
  }
  if (weight === 'bold' && fontType === 'secondary') {
    return 'Gobold-Bold';
  }
  
  return baseFont;
};
