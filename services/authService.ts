import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Platform } from 'react-native';

const WEB_CLIENT_ID = '1062141548138-b076dv3d3c08qk5h137goo3dpb7jhf59.apps.googleusercontent.com';

const firebaseConfig = {
    apiKey: "AIzaSyCrjlul6pQXox1Z886vqykNhipzufcEbok",
    authDomain: "helloworld-e2247.firebaseapp.com",
    projectId: "helloworld-e2247",
    storageBucket: "helloworld-e2247.firebasestorage.app",
    messagingSenderId: "1062141548138",
    appId: "MISSING_WEB_APP_ID" // User provided this placeholer
};

// Initialize Firebase for Web
let webAuth: any;
if (Platform.OS === 'web') {
    try {
        const app = initializeApp(firebaseConfig);
        webAuth = getAuth(app);
    } catch (error) {
        console.error("Firebase Web Initialization Failed:", error);
        console.warn("Check your firebaseConfig, specifically the apiKey and appId.");
    }
}

class AuthService {
    private confirmation: any = null;

    async signInWithPhoneNumber(phoneNumber: string): Promise<any> {
        console.warn("Firebase Auth skipped in Expo Go");
        return null;
    }

    constructor() {
        this.configureGoogleSignIn();
    }

    configureGoogleSignIn() {
        if (Platform.OS === 'web') return;

        try {
            GoogleSignin.configure({
                webClientId: WEB_CLIENT_ID,
            });
        } catch (error) {
            console.warn("GoogleSignin configuration failed", error);
        }
    }

    async signInWithGoogle(): Promise<any> {
        if (Platform.OS === 'web') {
            try {
                const provider = new GoogleAuthProvider();
                const result = await signInWithPopup(webAuth, provider);
                return result; // Returns the UserCredential
            } catch (error) {
                console.error("Web Google Sign-In Error", error);
                throw error;
            }
        } else {
            try {
                await GoogleSignin.hasPlayServices();
                const response = await GoogleSignin.signIn();
                const { idToken } = response.data || {};

                if (!idToken) {
                    throw new Error("No ID token found");
                }

                const googleCredential = auth.GoogleAuthProvider.credential(idToken);
                return auth().signInWithCredential(googleCredential);
            } catch (error) {
                console.error("Google Sign-In Error", error);
                throw error;
            }
        }
    }

    async confirmCode(code: string): Promise<any> {
        console.warn("Confirm code skipped in Expo Go");
        return { user: { uid: 'dummy-uid', email: 'test@example.com' } };
    }

    async signOut() {
        console.log("Sign out skipped");
    }

    getCurrentUser() {
        return null;
    }
}

export const authService = new AuthService();
