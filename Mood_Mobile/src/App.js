import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { StaticInfoProvider } from './context/StaticInfoContext';
import { AuthProvider } from './context/AuthContext';
import RootNavigator from './navigation/RootNavigator';
import CustomSplashScreen from './components/SplashScreen';

export default function App() {
  const [isSplashReady, setIsSplashReady] = useState(false);
  
  // Load fonts using useFonts hook
  // Paths are relative to src/App.js: ../ goes to project root, then assets/fonts/
  const [fontsLoaded, fontError] = useFonts({
    'Fractul': require('../assets/fonts/fractual/fonnts.com-fractul-regular.otf'),
    'Fractul-Bold': require('../assets/fonts/fractual/fonnts.com-fractul-regular.otf'),
    'Gobold': require('../assets/fonts/gobold/Gobold-Regular.otf'),
    'Gobold-Bold': require('../assets/fonts/gobold/Gobold-Bold.otf'),
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
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </StaticInfoProvider>
    </SafeAreaProvider>
  );
}

