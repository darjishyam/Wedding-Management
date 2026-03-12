import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
// @ts-ignore
import { getAuth, getReactNativePersistence, GoogleAuthProvider, initializeAuth, signInWithCredential as signInWithCredentialJS } from 'firebase/auth';
import { Platform } from 'react-native';
import api from './api'; // Import our configured API instance

// --- Configuration ---
const WEB_CLIENT_ID = '571332592140-gbibcqolk9m3sfbqplc1abqf4mkbkinc.apps.googleusercontent.com';

const firebaseConfig = {
    apiKey: "AIzaSyCFgcmJvqL5XFDZvBWeg0o1sv26GIm_mSo",
    authDomain: "weddingapp-d55a7.firebaseapp.com",
    projectId: "weddingapp-d55a7",
    storageBucket: "weddingapp-d55a7.firebasestorage.app",
    messagingSenderId: "571332592140",
    appId: "1:571332592140:android:a75c6dd1f5eacab8d7e429",
    measurementId: "" // Optional
};

// --- Firebase JS SDK Initialization (Web & Fallback) ---
let jsAuth: any;
try {
    const app = initializeApp(firebaseConfig);
    // Use initializeAuth with persistence for React Native
    if (Platform.OS !== 'web') {
        jsAuth = initializeAuth(app, {
            persistence: getReactNativePersistence(ReactNativeAsyncStorage)
        });
    } else {
        jsAuth = getAuth(app);
    }
} catch (error) {
    console.warn("Firebase JS Initialization skipped or failed:", error);
}

// --- Native Module Safe Access ---
// Metro bundler requires static string literals in require().
let nativeAuth: any = null;
try {
    nativeAuth = require('@react-native-firebase/auth').default || require('@react-native-firebase/auth');
} catch (e) {
    // console.warn("Native Firebase Auth not available");
}

let GoogleSignin: any = null;
try {
    const googleSigninModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = googleSigninModule.GoogleSignin;
} catch (e) {
    // console.warn("Native Google Sign-In not available");
}

class AuthService {
    constructor() {
        this.configureGoogleSignIn();
    }

    private isNativeAvailable() {
        return !!nativeAuth && !!GoogleSignin;
    }

    configureGoogleSignIn() {
        if (Platform.OS === 'web' || !this.isNativeAvailable()) return;

        try {
            GoogleSignin.configure({
                webClientId: WEB_CLIENT_ID,
            });
        } catch (error) {
            console.warn("GoogleSignin configuration failed", error);
        }
    }

    async signInWithGoogle(): Promise<any> {
        // Native Flow (Development Build)
        if (this.isNativeAvailable()) {
            try {
                await GoogleSignin.hasPlayServices();
                const response = await GoogleSignin.signIn();
                const { idToken } = response.data || {};

                if (!idToken) throw new Error("No ID token found");

                const googleCredential = nativeAuth.GoogleAuthProvider.credential(idToken);
                return nativeAuth().signInWithCredential(googleCredential);
            } catch (error) {
                console.error("Native Google Sign-In Error", error);
                throw error;
            }
        }

        // Return a mock user for testing purposes if native not found and no specific token provided
        console.warn("Native Google Sign-In not available. Use signInWithGoogleCredential(token) for Auth Session.");
        return {
            user: {
                uid: 'expo-go-test-user',
                email: 'test@expogo.com',
                displayName: 'Test User',
                photoURL: 'https://via.placeholder.com/150',
                emailVerified: true
            }
        };
    }

    async signInWithPhoneNumber(phoneNumber: string): Promise<any> {
        console.warn("Phone Auth skipped in Expo Go");
        return null;
    }

    async confirmCode(code: string): Promise<any> {
        console.warn("Confirm code skipped in Expo Go");
        return { user: { uid: 'dummy-uid', email: 'test@example.com' } };
    }

    async signOut() {
        try {
            if (Platform.OS === 'web' && jsAuth) {
                await jsAuth.signOut();
            } else if (this.isNativeAvailable()) {
                // Sign out from Firebase
                await nativeAuth().signOut();

                // ALSO Sign out from Google to force account chooser next time
                try {
                    await GoogleSignin.signOut();
                    // Optional: await GoogleSignin.revokeAccess(); // If you want to completely disconnect
                } catch (e) {
                    console.warn("Google SignOut error:", e);
                }
            } else {
                console.log("Mock Sign Out");
            }
        } catch (error) {
            console.error("Sign Out Error:", error);
        }
    }

    // New method for Expo Auth Session flow
    async signInWithGoogleCredential(idToken: string): Promise<any> {
        try {
            // Create a Firebase credential from the Google ID token
            const credential = GoogleAuthProvider.credential(idToken);

            // Sign in to Firebase with the credential
            if (Platform.OS === 'web' && jsAuth) {
                return signInWithCredentialJS(jsAuth, credential);
            } else if (this.isNativeAvailable()) {
                return nativeAuth().signInWithCredential(credential);
            } else if (jsAuth) {
                // Fallback for Expo Go using JS SDK
                return signInWithCredentialJS(jsAuth, credential);
            }
            throw new Error("No compatible Firebase Auth instance found for Expo Go");
        } catch (error) {
            console.error("Error signing in with credential:", error);
            throw error;
        }
    }

    getCurrentUser() {
        if (Platform.OS === 'web') return jsAuth?.currentUser;
        if (this.isNativeAvailable()) return nativeAuth().currentUser;
        return null;
    }

    async forgotPassword(email: string): Promise<any> {
        try {
            // Use api instance which has the correct BASE_URL
            const response = await api.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error: any) {
            console.error("Forgot Password Error:", error);
            throw error.response?.data || error;
        }
    }

    async resetPassword(email: string, otp: string, newPassword: string): Promise<any> {
        try {
            const response = await api.post('/auth/reset-password', {
                email,
                otp,
                newPassword
            });
            return response.data;
        } catch (error: any) {
            console.error("Reset Password Error:", error);
            throw error.response?.data || error;
        }
    }
}

export const authService = new AuthService();
