import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

// TODO: User must replace this with their actual Web Client ID from Firebase Console
const WEB_CLIENT_ID = 'PLACEHOLDER_WEB_CLIENT_ID_FROM_FIREBASE_CONSOLE';
// Example: '123456789-abcdefg.apps.googleusercontent.com'

class AuthService {
    private confirmation: FirebaseAuthTypes.ConfirmationResult | null = null;

    /**
     * Sends an OTP to the provided phone number.
     * @param phoneNumber The phone number in E.164 format (e.g., +15555555555).
     * @returns A promise that resolves to the confirmation object.
     */
    async signInWithPhoneNumber(phoneNumber: string): Promise<FirebaseAuthTypes.ConfirmationResult> {
        try {
            const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
            this.confirmation = confirmation;
            return confirmation;
        } catch (error) {
            console.error("Error sending OTP:", error);
            throw error;
        }
    }

    constructor() {
        this.configureGoogleSignIn();
    }

    configureGoogleSignIn() {
        try {
            const { GoogleSignin } = require('@react-native-google-signin/google-signin');
            GoogleSignin.configure({
                webClientId: WEB_CLIENT_ID,
            });
        } catch (error) {
            console.warn("GoogleSignin not available (likely running in Expo Go)");
        }
    }

    async signInWithGoogle() {
        try {
            const { GoogleSignin, statusCodes } = require('@react-native-google-signin/google-signin');

            // Check if your device supports Google Play
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Get the users ID token
            const response = await GoogleSignin.signIn();
            const { idToken, user } = (response as any).data || response; // Handle v13+ (response.data) or older

            if (!idToken) {
                throw new Error('No ID token found');
            }

            // Create a Google credential with the token
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);

            // Sign-in the user with the credential
            await auth().signInWithCredential(googleCredential);

            return user;
        } catch (error: any) {
            const { statusCodes } = require('@react-native-google-signin/google-signin') || {};
            if (statusCodes && error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
                console.log('Google Sign-In Cancelled');
                return null;
            } else if (statusCodes && error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
                console.log('Google Sign-In In Progress');
                throw error;
            } else if (statusCodes && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available or outdated
                console.log('Play Services Not Available');
                throw error;
            } else {
                // some other error happened
                console.error('Google Sign-In Error:', error);
                throw error;
            }
        }
    }

    /**
     * Confirms the OTP code.
     * @param code The OTP code entered by the user.
     * @returns A promise that resolves to the user credential.
     */
    async confirmCode(code: string): Promise<FirebaseAuthTypes.UserCredential> {
        try {
            if (!this.confirmation) {
                throw new Error('No confirmation result found');
            }
            const userCredential = await this.confirmation.confirm(code);
            if (!userCredential) {
                throw new Error('Failed to confirm code: User credential is null');
            }
            return userCredential;
        } catch (error) {
            console.error("Error confirming OTP:", error);
            throw error;
        }
    }

    /**
     * Signs out the current user.
     */
    async signOut() {
        try {
            await auth().signOut();
        } catch (error) {
            console.error("Error signing out:", error);
            throw error;
        }
    }

    /**
     * Gets the currently signed-in user.
     */
    getCurrentUser() {
        return auth().currentUser;
    }
}

export const authService = new AuthService();
