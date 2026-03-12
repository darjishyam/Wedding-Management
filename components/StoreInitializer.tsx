import { useEffect } from 'react';
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
    }, [dispatch]);

    // User Logged In -> Fetch Weddings
    useEffect(() => {
        if (user) {
            dispatch(refreshWeddingData());
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
