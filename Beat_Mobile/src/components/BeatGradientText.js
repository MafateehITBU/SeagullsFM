import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { fonts } from '../theme/fonts';
import { colors } from '../theme/colors';

export default function BeatGradientText({ children, style, ...rest }) {
  return (
    <Text style={[styles.text, style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.gothamBlack,
    color: colors.accentCyan,
    letterSpacing: -1,
  },
});
