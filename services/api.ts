import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

// Use localhost for iOS simulator, dynamic IP for Android (device/emulator), fallback to 10.0.2.2
const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(":")[0];

// Define BASE_URL
const BASE_URL = Platform.OS === 'web'
    ? `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5000/api`
    : `http://${localhost || '10.0.2.2'}:5000/api`;
// Note: If you want to test on Production, uncomment the line below and comment out the above line
// : 'https://marriage-repo.onrender.com/api';

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
