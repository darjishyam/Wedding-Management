import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import expenseReducer from './slices/expenseSlice';
import guestReducer from './slices/guestSlice';
import languageReducer from './slices/languageSlice';
import onboardingReducer from './slices/onboardingSlice';
import shagunReducer from './slices/shagunSlice';
import weddingReducer from './slices/weddingSlice';

// We will add reducers here as we create slices
export const store = configureStore({
    reducer: {
        auth: authReducer,
        guest: guestReducer,
        wedding: weddingReducer,
        shagun: shagunReducer,
        expense: expenseReducer,
        language: languageReducer,
        onboarding: onboardingReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
