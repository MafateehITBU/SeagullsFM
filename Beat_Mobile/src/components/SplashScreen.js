import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '../theme/colors';

SplashScreen.preventAutoHideAsync();

export default function CustomSplashScreen({ onFinish }) {
  useEffect(() => {
    const prepare = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2500));
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
        if (onFinish) onFinish();
      }
    };
    prepare();
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/img/Logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Image
        source={require('../../assets/img/Frequency.png')}
        style={styles.frequency}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    height: 72,
    width: 180,
  },
  frequency: {
    height: 56,
    width: 160,
  },
});
