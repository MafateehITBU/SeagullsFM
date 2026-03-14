import 'react-native-gesture-handler';
import React, { useState, useEffect, useRef } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Constants from 'expo-constants';
import { StaticInfoProvider } from './context/StaticInfoContext';
import { AuthProvider } from './context/AuthContext';
import { LiveStreamProvider } from './context/LiveStreamContext';
import RootNavigator from './navigation/RootNavigator';
import CustomSplashScreen from './components/SplashScreen';

SplashScreen.preventAutoHideAsync();

function isNewerVersion(remote, local) {
  const toNums = (v) => v.split('.').map((n) => parseInt(n, 10) || 0);
  const [ra, la] = [toNums(remote), toNums(local)];
  const len = Math.max(ra.length, la.length);
  for (let i = 0; i < len; i += 1) {
    const r = ra[i] ?? 0;
    const l = la[i] ?? 0;
    if (r > l) return true;
    if (r < l) return false;
  }
  return false;
}

export default function App() {
  const [isSplashDone, setIsSplashDone] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('Home');
  const navigationRef = useRef(null);

  const [fontsLoaded, fontError] = useFonts({
    Fractul: require('../assets/fonts/fractual/fonnts.com-fractul-regular.otf'),
    'Fractul-Bold': require('../assets/fonts/fractual/fonnts.com-fractul-bold.otf'),
    Gobold: require('../assets/fonts/gobold/Gobold-Regular.otf'),
    'Gobold-Bold': require('../assets/fonts/gobold/Gobold-Bold.otf'),
  });

  useEffect(() => {
    if (fontError) console.warn('Font loading error:', fontError);
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (!fontsLoaded || !isSplashDone || Platform.OS !== 'ios') return;
    const checkUpdate = async () => {
      try {
        const bundleId = Constants.expoConfig?.ios?.bundleIdentifier || 'com.MOOdFM92.www.MoodFM92';
        const localVersion =
          Constants.expoConfig?.version || Constants.manifest?.version || '0.0.0';
        const res = await fetch(
          `https://itunes.apple.com/lookup?bundleId=${encodeURIComponent(bundleId)}`
        );
        const json = await res.json();
        const remoteVersion = json?.results?.[0]?.version;
        if (remoteVersion && isNewerVersion(remoteVersion, localVersion)) {
          Alert.alert(
            'Update available',
            'A newer version of Mood FM is available. Please update to continue.',
            [
              {
                text: 'Update',
                onPress: () =>
                  Linking.openURL(
                    json.results[0].trackViewUrl ||
                      'https://apps.apple.com/app/idYOUR_APP_ID'
                  ),
              },
            ],
            { cancelable: false }
          );
        }
      } catch (e) {
        // Silent fail: do not block app if check fails
      }
    };
    checkUpdate();
  }, [fontsLoaded, isSplashDone]);

  useEffect(() => {
    if (!fontsLoaded || !isSplashDone || Platform.OS !== 'android') return;
    const MIN_SUPPORTED_VERSION = '7.6.3';
    const localVersion =
      Constants.expoConfig?.version || Constants.manifest?.version || '0.0.0';
    if (!isNewerVersion(MIN_SUPPORTED_VERSION, localVersion)) return;

    const playStoreUrl = 'https://play.google.com/store/apps/details?id=ac.radio.Beatfm';
    const marketUrl = 'market://details?id=ac.radio.Beatfm';

    Alert.alert(
      'Update available',
      'A newer version of Beat FM is available. Please update to continue.',
      [
        {
          text: 'Update',
          onPress: async () => {
            try {
              const supported = await Linking.canOpenURL(marketUrl);
              if (supported) {
                Linking.openURL(marketUrl);
              } else {
                Linking.openURL(playStoreUrl);
              }
            } catch {
              Linking.openURL(playStoreUrl);
            }
          },
        },
      ],
      { cancelable: false }
    );
  }, [fontsLoaded, isSplashDone]);

  if (!fontsLoaded || !isSplashDone) {
    return (
      <CustomSplashScreen
        onFinish={() => {
          setIsSplashDone(true);
        }}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <StaticInfoProvider>
        <AuthProvider>
          <LiveStreamProvider>
            <NavigationContainer
              ref={navigationRef}
              onReady={() => {
                const route = navigationRef.current?.getCurrentRoute();
                if (route?.name) setCurrentRoute(route.name);
              }}
              onStateChange={() => {
                const route = navigationRef.current?.getCurrentRoute();
                setCurrentRoute(route?.name ?? 'Home');
              }}
            >
              <RootNavigator currentRoute={currentRoute} />
            </NavigationContainer>
          </LiveStreamProvider>
        </AuthProvider>
      </StaticInfoProvider>
    </SafeAreaProvider>
  );
}

