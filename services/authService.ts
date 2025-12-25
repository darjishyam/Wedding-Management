// import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

// TODO: User must replace this with their actual Web Client ID from Firebase Console
const WEB_CLIENT_ID = 'PLACEHOLDER_WEB_CLIENT_ID_FROM_FIREBASE_CONSOLE';

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
        try {
            // const { GoogleSignin } = require('@react-native-google-signin/google-signin');
            // GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
            console.log("Google Signin configuration skipped");
        } catch (error) {
            console.warn("GoogleSignin not available");
        }
    }

    async signInWithGoogle(): Promise<any> {
        console.log("Google Sign-in skipped in Expo Go");
        return null;
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
