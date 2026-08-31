import { Platform } from 'react-native';

const API_PORT = 5001;
const PRODUCTION_API_BASE = 'https://mood.fm/api';
const USE_PRODUCTION_API = true;
const COMPUTER_IP = '192.168.1.12';

const getBaseURL = () => {
  if (USE_PRODUCTION_API) {
    return PRODUCTION_API_BASE;
  }
  if (__DEV__ && Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}/api`;
  }
  return `http://${COMPUTER_IP}:${API_PORT}/api`;
};

export const BEAT_FM_CHANNEL_NAME = 'BeatFM';

export const API_CONFIG = {
  baseURL: getBaseURL(),
};

if (__DEV__) {
  console.log('[Beat API] Using baseURL:', API_CONFIG.baseURL);
}
