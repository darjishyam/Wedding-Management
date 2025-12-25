import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const ONBOARDING_KEY = "@has_completed_onboarding";

interface OnboardingState {
    hasCompletedOnboarding: boolean;
    isLoading: boolean;
}

const initialState: OnboardingState = {
    hasCompletedOnboarding: false,
    isLoading: true,
};

export const checkOnboardingStatus = createAsyncThunk('onboarding/checkStatus', async () => {
    try {
        // TEMP: Reset onboarding for dev visualization as requested (Copied from Context)
        await AsyncStorage.removeItem(ONBOARDING_KEY);

        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        return value === "true";
    } catch (error) {
        return false;
    }
});

export const completeOnboarding = createAsyncThunk('onboarding/complete', async () => {
    try {
        await AsyncStorage.setItem(ONBOARDING_KEY, "true");
        // We do not return true here to update state immediately if we want to mimic Context 'Do NOT set state here' comment?
        // Context said: "Do NOT set state here... preventing app/index.tsx from reacting... to Login"
        // If we want to replicate that, we should NOT update state 'hasCompletedOnboarding' to true here.
        // We just return.
    } catch (error) {
        console.error("Error saving onboarding status:", error);
    }
});

export const resetOnboarding = createAsyncThunk('onboarding/reset', async () => {
    try {
        await AsyncStorage.removeItem(ONBOARDING_KEY);
        return false;
    } catch (error) {
        console.error("Error resetting onboarding status:", error);
        throw error;
    }
});

const onboardingSlice = createSlice({
    name: 'onboarding',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(checkOnboardingStatus.fulfilled, (state, action) => {
                state.hasCompletedOnboarding = action.payload;
                state.isLoading = false;
            })
            .addCase(checkOnboardingStatus.rejected, (state) => {
                state.hasCompletedOnboarding = false;
                state.isLoading = false;
            })
            .addCase(resetOnboarding.fulfilled, (state) => {
                state.hasCompletedOnboarding = false;
            });
        // We do not handle completeOnboarding.fulfilled to update state, per original logic.
    },
});

export default onboardingSlice.reducer;
