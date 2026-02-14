import 'react-native-gesture-handler';
import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { StaticInfoProvider } from './context/StaticInfoContext';
import { AuthProvider } from './context/AuthContext';
import { LiveStreamProvider } from './context/LiveStreamContext';
import RootNavigator from './navigation/RootNavigator';
import CustomSplashScreen from './components/SplashScreen';

export default function App() {
  const [isSplashReady, setIsSplashReady] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('Home');
  const navigationRef = useRef(null);
  
  // Load fonts to match website (Fractul = titles, Gobold = body)
  const [fontsLoaded, fontError] = useFonts({
    'Fractul': require('../assets/fonts/fractual/fonnts.com-fractul-regular.otf'),
    'Fractul-Bold': require('../assets/fonts/fractual/fonnts.com-fractul-bold.otf'),
    'Gobold': require('../assets/fonts/gobold/Gobold-Regular.otf'),
    'Gobold-Bold': require('../assets/fonts/gobold/Gobold-Bold.otf'),
    // Optional (uncomment when files are in gobold folder):
    // 'GoboldThinLight': require('../assets/fonts/gobold/Gobold Thin.otf'),
    // 'GoboldLowplus': require('../assets/fonts/gobold/Gobold Lowplus.otf'),
  });

  useEffect(() => {
    if (fontError) {
      console.warn('Font loading error:', fontError);
    }
    if (fontsLoaded) {
      console.log('✅ Fonts loaded successfully');
    }
  }, [fontsLoaded, fontError]);

  if (!isSplashReady || !fontsLoaded) {
    return <CustomSplashScreen onFinish={() => setIsSplashReady(true)} />;
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

