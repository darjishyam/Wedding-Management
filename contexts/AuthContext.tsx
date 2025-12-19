import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import api from '../services/api';

interface User {
    _id: string;
    name: string;
    email: string;
    mobile: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, mobile: string, password: string, firebaseVerified?: boolean) => Promise<any>;
    verifyOtp: (mobile: string, otp: string) => Promise<void>;
    logout: () => Promise<void>;
    deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const userInfo = await AsyncStorage.getItem('userInfo');

            if (token && userInfo) {
                setUser(JSON.parse(userInfo));
            }
        } catch (e) {
            console.log('Failed to load user info');
        }
        setIsLoading(false);
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, ...userData } = response.data;

            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
            setUser(userData);
        } catch (error: any) {
            console.error("Login failed", error.response?.data);
            throw error;
        }
    };

    const register = async (name: string, email: string, mobile: string, password: string, firebaseVerified: boolean = false) => {
        try {
            const response = await api.post('/auth/signup', { name, email, mobile, password, firebaseVerified });

            // If firebaseVerified is true, backend returns token and user data immediately
            if (firebaseVerified && response.data.token) {
                const { token, ...userData } = response.data;
                await AsyncStorage.setItem('userToken', token);
                await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
                setUser(userData);
            }

            return response.data;
        } catch (error: any) {
            console.error("Registration failed", error.response?.data);
            throw error;
        }
    };

    const verifyOtp = async (mobile: string, otp: string) => {
        try {
            const response = await api.post('/auth/verify-otp', { mobile, otp });
            const { token, ...userData } = response.data;

            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
            setUser(userData);
        } catch (error: any) {
            console.error("OTP verification failed", error.response?.data);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userInfo');
            setUser(null);
        } catch (e) {
            console.error(e);
        }
    };

    const deleteAccount = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            await api.delete('/auth/delete-account', {
                headers: { Authorization: `Bearer ${token}` }
            });
            await logout();
        } catch (error: any) {
            console.error("Delete account failed", error.response?.data);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, verifyOtp, logout, deleteAccount }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
