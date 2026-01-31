/**
 * Root entry file for Mood_mobile Expo app.
 * Import gesture handler at the very top - required for drawer navigation
 */
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './src/App';

// Register the main application component with Expo
registerRootComponent(App);

