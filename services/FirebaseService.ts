/**
 * FirebaseService.ts (Web/Default)
 * This file is used on Web platforms or as a fallback.
 * Native firebase modules are not compatible with the browser.
 */

class FirebaseService {
    async registerForPushNotifications() {
        // Not supported on Web
        return null;
    }

    async updateServerToken(fcmToken: string) {
        // Not supported on Web
    }

    setupForegroundHandler() {
        // Not supported on Web
        return () => {};
    }

    async handleInitialNotification() {
        // Not supported on Web
    }
}

export default new FirebaseService();
