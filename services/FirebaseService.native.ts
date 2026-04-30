import messaging, { 
    getMessaging, 
    getToken, 
    requestPermission, 
    onMessage, 
    getInitialNotification,
    AuthorizationStatus 
} from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import api from './api';

class FirebaseService {
    /**
     * Request permissions and retrieve the FCM token
     */
    async registerForPushNotifications() {
        try {
            const auth = getMessaging();
            // 1. Check/Request Permissions (Firebase)
            const authStatus = await requestPermission(auth);
            const enabled =
                authStatus === AuthorizationStatus.AUTHORIZED ||
                authStatus === AuthorizationStatus.PROVISIONAL;

            if (!enabled) {
                console.log('🚫 Push notification permission denied');
                return null;
            }

            // 2. Check/Request Permissions (Expo Notifications - needed for local scheduling on Android 13+)
            const { status: expoStatus } = await Notifications.getPermissionsAsync();
            if (expoStatus !== 'granted') {
                await Notifications.requestPermissionsAsync();
            }

            // 3. Get a fresh FCM Token
            const fcmToken = await getToken(auth);
            
            if (fcmToken) {
                console.log('📱 NEW FCM Token retrieved:', fcmToken.substring(0, 10) + '...');
                await this.updateServerToken(fcmToken);
                return fcmToken;
            } else {
                console.warn('⚠️ No FCM token returned from Firebase');
                return null;
            }
        } catch (error: any) {
            console.error('❌ Error in registerForPushNotifications:', error);
            return null;
        }
    }

    /**
     * Send the token to the backend
     */
    async updateServerToken(fcmToken: string) {
        try {
            await api.put('/auth/fcm-token', { fcmToken });
            console.log('✅ FCM Token registered on server');
        } catch (error: any) {
            const msg = error?.response?.data?.message || error.message;
            console.error('❌ Failed to register token on server:', msg);
        }
    }

    /**
     * Setup foreground message handler
     */
    setupForegroundHandler() {
        return onMessage(getMessaging(), async (remoteMessage: any) => {
            console.log('🔔 Foreground message received:', JSON.stringify(remoteMessage));
            
            if (Platform.OS === 'android') {
                // Ensure channel exists
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'Default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#8A0030',
                });

                // Manually schedule local notification for foreground visibility
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: remoteMessage.notification?.title || '💰 Transaction Alert',
                        body: remoteMessage.notification?.body || 'New entry received',
                        data: remoteMessage.data,
                        channelId: 'default', // Link to the channel
                        sound: true,
                        priority: Notifications.AndroidNotificationPriority.MAX,
                    },
                    trigger: null,
                });
                console.log('🚀 Local notification scheduled for foreground');
            } else {
                Alert.alert(
                    remoteMessage.notification?.title || 'Notification',
                    remoteMessage.notification?.body || ''
                );
            }
        });
    }

    /**
     * Handle initial notification if the app was opened from a quit state
     */
    async handleInitialNotification() {
        const remoteMessage = await getInitialNotification(getMessaging());
        if (remoteMessage) {
            console.log('🚀 App opened from quit state via notification:', remoteMessage);
        }
    }
}

export default new FirebaseService();
