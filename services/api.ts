import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

// Use localhost for web/iOS simulator, dynamic IP for Android device, fallback to 10.0.2.2 for Android emulator
const getBaseUrl = () => {
  if (Platform.OS === 'web') return 'http://localhost:5000/api';
  
  // For Android emulator, use 10.0.2.2
  // For physical device, debuggerHost provides the computer's IP
  const debuggerHost = Constants.expoConfig?.hostUri;
  let localhost = debuggerHost?.split(":")[0];
  
  // If localhost is 127.0.0.1 or localhost, it won't work on Android emulator/device
  // We must use your machine IP for the phone (APK) to reach the host machine
  // Current Machine IP: 10.178.190.131
  if (Platform.OS === 'android' && (!localhost || localhost === '127.0.0.1' || localhost === 'localhost')) {
    localhost = '10.178.190.131'; // fallback to your laptop's Wi-Fi IP
  }
  
  const finalUrl = `http://${localhost}:5000/api`;
  console.log('--- API URL Connection ---');
  console.log(`Platform: ${Platform.OS}`);
  console.log(`Debugger Host: ${debuggerHost || 'None'}`);
  console.log(`Using Base URL: ${finalUrl}`);
  console.log('--------------------------');
  
  return finalUrl;
};

// const BASE_URL = getBaseUrl();
const BASE_URL = 'https://wedding-management-dqr8.onrender.com/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
