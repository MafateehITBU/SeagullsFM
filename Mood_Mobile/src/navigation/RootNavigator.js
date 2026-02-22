import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home';
import AboutScreen from '../screens/About';
import NewsScreen from '../screens/News';
import NewsDetailScreen from '../screens/News/NewsDetailScreen';
// import EventsScreen from '../screens/Events';
// import EventDetailScreen from '../screens/Events/EventDetailScreen';
import PresentersScreen from '../screens/Presenters';
import LoginScreen from '../screens/Login';
import ForgotPasswordScreen from '../screens/ForgotPassword';
import SignUpScreen from '../screens/SignUp';
import ProfileScreen from '../screens/Profile';
import GetDiscoveredScreen from '../screens/GetDiscovered';
import ShowYourTalentScreen from '../screens/ShowYourTalent';
import AdWithUsScreen from '../screens/AdWithUs';
import ProgramDetailScreen from '../screens/ProgramDetails';
import FloatingStreamButton from '../components/FloatingStreamButton';

const Stack = createNativeStackNavigator();

export default function RootNavigator({ currentRoute }) {
  return (
    <View style={styles.container}>
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // We're using custom Navbar instead
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      {/* News routes – re-enabled; Events still commented out */}
      <Stack.Screen name="News" component={NewsScreen} />
      <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
      {/* <Stack.Screen name="Events" component={EventsScreen} /> */}
      {/* <Stack.Screen name="EventDetail" component={EventDetailScreen} /> */}
      <Stack.Screen name="Presenters" component={PresentersScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="GetDiscovered" component={GetDiscoveredScreen} />
      <Stack.Screen name="ShowYourTalent" component={ShowYourTalentScreen} />
      <Stack.Screen name="AdWithUs" component={AdWithUsScreen} />
      <Stack.Screen name="ProgramDetail" component={ProgramDetailScreen} />
    </Stack.Navigator>
    <FloatingStreamButton currentRoute={currentRoute} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

