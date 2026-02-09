import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '../theme/colors';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function CustomSplashScreen({ onFinish }) {
  useEffect(() => {
    // Hide splash screen after a short delay or when app is ready
    const prepare = async () => {
      try {
        // Simulate loading time (you can replace this with actual app initialization)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Hide the splash screen
        await SplashScreen.hideAsync();
        if (onFinish) {
          onFinish();
        }
      }
    };

    prepare();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
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
      <Text style={styles.seagullsText}>SeagullsFM</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navbarBg, // Yellow background
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  logoImage: {
    height: 100,
    width: 220,
  },
  frequencyImage: {
    height: 100,
    width: 220,
  },
  seagullsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.navbarText,
    marginTop: 20,
  },
});
