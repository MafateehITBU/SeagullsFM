import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '../theme/colors';

SplashScreen.preventAutoHideAsync();

export default function CustomSplashScreen({ onFinish }) {
  useEffect(() => {
    const prepare = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
        if (onFinish) onFinish();
      }
    };
    prepare();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <Image
          source={require('../../assets/img/Logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Image
          source={require('../../assets/img/Frequency.png')}
          style={styles.frequencyImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navbarBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    height: 80,
    width: 190,
    marginRight: 8,
  },
  frequencyImage: {
    height: 80,
    width: 190,
  },
});
