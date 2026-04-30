import { useEffect } from 'react';
import { Platform } from 'react-native';
import FirebaseService from '../services/FirebaseService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadUser } from '../store/slices/authSlice';
import { clearExpenses, fetchExpenses } from '../store/slices/expenseSlice';
import { clearGuests, fetchGuests } from '../store/slices/guestSlice';
import { checkOnboardingStatus } from '../store/slices/onboardingSlice';
import { clearShaguns, fetchShaguns } from '../store/slices/shagunSlice';
import { refreshWeddingData, resetWeddingState } from '../store/slices/weddingSlice';

export default function StoreInitializer() {
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.auth.user);
    const { weddingData } = useAppSelector(state => state.wedding);
    const hasWedding = !!weddingData;

    // Initial Load
    useEffect(() => {
        dispatch(loadUser());
        dispatch(checkOnboardingStatus());
        
        // Setup notification listeners once on mount
        if (Platform.OS !== 'web') {
            const unsubscribe = FirebaseService.setupForegroundHandler();
            FirebaseService.handleInitialNotification();
            return () => unsubscribe();
        }
    }, [dispatch]);

    // User Logged In -> Fetch Weddings & Register Push Notifications
    useEffect(() => {
        if (user) {
            dispatch(refreshWeddingData());
            
            // Trigger FCM token update every time app starts for logged-in user
            if (Platform.OS !== 'web') {
                FirebaseService.registerForPushNotifications();
            }
        } else {
            // Clear data if logged out
            dispatch(resetWeddingState());
        }
    }, [user, dispatch]);

    // Wedding Active -> Fetch Related Data
    useEffect(() => {
        if (hasWedding && weddingData?._id) {
            dispatch(fetchGuests(weddingData._id));
            dispatch(fetchShaguns(weddingData._id));
            dispatch(fetchExpenses(weddingData._id));
        } else if (!hasWedding) {
            dispatch(clearGuests());
            dispatch(clearShaguns());
            dispatch(clearExpenses());
        }
    }, [hasWedding, weddingData, dispatch]);

    return null;
}
