import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import Constants from 'expo-constants';

// Use localhost for iOS simulator, dynamic IP for Android (device/emulator), fallback to 10.0.2.2
const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(":")[0];

// Define BASE_URL
const BASE_URL = 'https://wedding-management-dqr8.onrender.com/api';
// const BASE_URL = Platform.OS === 'web'
//     ? `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5000/api`
//     : `http://10.31.255.131:5000/api`;

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
