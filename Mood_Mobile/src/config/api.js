// API configuration for SeagullsFM backend
// Update the baseURL depending on your environment.
import { Platform } from 'react-native';

// Backend port (must match your backend server)
const API_PORT = 5001;

// Your computer's IP address (for physical device / Expo Go)
// Find your IP: macOS: run `ipconfig getifaddr en0` or check System Settings > Network
// Windows: run `ipconfig` and look for IPv4 under your Wi-Fi adapter
// Phone and computer must be on the SAME Wi-Fi network
const COMPUTER_IP = '192.168.1.12'; // ← UPDATE THIS if your IP changes (run: ipconfig getifaddr en0)

// Helper function to get the correct base URL
const getBaseURL = () => {
  // For iOS Simulator - use localhost
  if (__DEV__ && Platform.OS === 'ios') {
    // Uncomment next line when testing on iOS Simulator only:
    // return `http://localhost:${API_PORT}/api`;
  }
  // For Android Emulator - use 10.0.2.2
  if (__DEV__ && Platform.OS === 'android') {
    // Uncomment next line when testing on Android Emulator only:
    // return `http://10.0.2.2:${API_PORT}/api`;
  }
  // For physical devices (Expo Go) - use your computer's IP
  return `http://${COMPUTER_IP}:${API_PORT}/api`;
};

// Mood FM channel ID – sent automatically on register
export const MOOD_FM_CHANNEL_ID = '69469e661912b412192aa247';

export const API_CONFIG = {
  baseURL: getBaseURL(),
};

// Log in dev so you can verify the URL (check Metro/Expo console)
if (__DEV__) {
  console.log('[API] Using baseURL:', API_CONFIG.baseURL);
}

