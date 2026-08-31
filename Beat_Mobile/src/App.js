import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StaticInfoProvider } from './context/StaticInfoContext';
import { AuthProvider } from './context/AuthContext';
import { LiveStreamProvider } from './context/LiveStreamContext';
import RootNavigator from './navigation/RootNavigator';
import CustomSplashScreen from './components/SplashScreen';

export default function App() {
  const [isSplashDone, setIsSplashDone] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('Home');

  const [fontsLoaded, fontError] = useFonts({
    Gotham: require('../assets/fonts/GothamBook.ttf'),
    'Gotham-Light': require('../assets/fonts/Gotham-Light.otf'),
    'Gotham-Medium': require('../assets/fonts/GothamMedium.ttf'),
    'Gotham-Bold': require('../assets/fonts/Gotham-Bold.otf'),
    'Gotham-Black': require('../assets/fonts/Gotham-Black.otf'),
    Museo: require('../assets/fonts/museo300-regular.otf'),
    'Museo-Bold': require('../assets/fonts/museo700-regular.otf'),
  });

  if (fontError) {
    console.warn('Font loading error:', fontError);
  }

  if (!fontsLoaded || !isSplashDone) {
    return <CustomSplashScreen onFinish={() => setIsSplashDone(true)} />;
  }

  return (
    <SafeAreaProvider>
      <StaticInfoProvider>
        <AuthProvider>
          <LiveStreamProvider>
            <NavigationContainer
              onStateChange={(state) => {
                const route = state?.routes?.[state.index];
                if (route?.name) setCurrentRoute(route.name);
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
