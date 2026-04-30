const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin with the service account JSON
// Note: This filename is exactly what was provided in project config
const serviceAccountPath = path.join(__dirname, '../config/wedding-management-syste-17c85-firebase-adminsdk-fbsvc-1aade787e2.json');

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
    });
    console.log('🔥 Firebase Admin SDK initialized successfully');
} catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
}

/**
 * Sends a push notification to a specific device token
 * @param {string} token - The user's FCM token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional additional data
 */
const sendNotification = async (token, title, body, data = {}) => {
    if (!token) {
        console.warn('⚠️ Cannot send notification: No token provided');
        return;
    }

    const message = {
        notification: {
            title,
            body,
        },
        data: {
            ...data,
            click_action: 'FLUTTER_NOTIFICATION_CLICK', // Standard requirement for some mobile setups
        },
        token: token,
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('✅ Successfully sent message:', response);
        return response;
    } catch (error) {
        console.error('❌ Error sending notification:', error);
        // If the token is invalid or expired, we might want to handle it (e.g., remove from DB)
        if (error.code === 'messaging/registration-token-not-registered') {
             console.warn('🗑️ Token is no longer valid. Should consider removing it from User model.');
        }
    }
};

/**
 * Sends a push notification to all wedding stakeholders EXCEPT the sender
 * @param {string} weddingId - ID of the wedding
 * @param {string} senderId - ID of the user performing the action (to exclude)
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional additional data
 */
const notifyWeddingStakeholders = async (weddingId, senderId, title, body, data = {}) => {
    try {
        // Import models here to avoid potential circular dependencies
        const Wedding = require('../models/Wedding');
        const User = require('../models/User');

        const wedding = await Wedding.findById(weddingId).populate('user collaborators');
        if (!wedding) {
            console.warn('⚠️ Cannot notify stakeholders: Wedding not found');
            return;
        }

        // Collect all potential recipients (Owner + Collaborators)
        const recipients = [wedding.user, ...wedding.collaborators];
        
        // Filter out the sender and ensure they have a token
        const tokensToNotify = recipients
            .filter(user => user && user._id.toString() !== senderId.toString() && user.fcmToken)
            .map(user => user.fcmToken);

        if (tokensToNotify.length === 0) {
            console.log('ℹ️ No other stakeholders with FCM tokens to notify.');
            return;
        }

        console.log(`[FCM] Sending notifications to ${tokensToNotify.length} stakeholders...`);

        // Send to each token
        const results = await Promise.all(
            tokensToNotify.map(token => sendNotification(token, title, body, data))
        );

        return results;
    } catch (error) {
        console.error('❌ Error in notifyWeddingStakeholders:', error.message);
    }
};

module.exports = {
    sendNotification,
    notifyWeddingStakeholders,
};
