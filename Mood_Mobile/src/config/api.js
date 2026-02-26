// API configuration for SeagullsFM backend
// Update the baseURL depending on your environment.
import { Platform } from 'react-native';

// Backend port (must match your backend server)
const API_PORT = 5001;

// --- Use production server (phone works anywhere, no same WiFi needed) ---
const PRODUCTION_API_BASE = 'https://mood.fm/api'; // deployed backend
const USE_PRODUCTION_API = true; // set to false to use local backend (same WiFi required)

// Your computer's IP (only used when USE_PRODUCTION_API is false)
// Find your IP: macOS: run `ipconfig getifaddr en0` or check System Settings > Network
const COMPUTER_IP = '192.168.1.12'; // ← UPDATE THIS if your IP changes

// Helper function to get the correct base URL
const getBaseURL = () => {
  if (USE_PRODUCTION_API) {
    return PRODUCTION_API_BASE;
  }
  // For iOS Simulator - use localhost
  if (__DEV__ && Platform.OS === 'ios') {
    // return `http://localhost:${API_PORT}/api`; // uncomment for simulator only
  }
  // For Android Emulator - use 10.0.2.2
  if (__DEV__ && Platform.OS === 'android') {
    // return `http://10.0.2.2:${API_PORT}/api`; // uncomment for emulator only
  }
  // For physical devices (Expo Go) - use your computer's IP (same WiFi required)
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

