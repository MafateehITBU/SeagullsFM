import { Platform } from 'react-native';

export const fonts = {
  gotham: Platform.select({ ios: 'Gotham', android: 'Gotham', default: 'System' }),
  gothamLight: 'Gotham-Light',
  gothamMedium: 'Gotham-Medium',
  gothamBold: 'Gotham-Bold',
  gothamBlack: 'Gotham-Black',
  museo: Platform.select({ ios: 'Museo', android: 'Museo', default: 'System' }),
  museoBold: 'Museo-Bold',
  systemFont: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
};
