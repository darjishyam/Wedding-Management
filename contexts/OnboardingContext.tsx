import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  completeOnboarding as completeAction,
  resetOnboarding as resetAction
} from '../store/slices/onboardingSlice';

export function useOnboarding() {
  const dispatch = useAppDispatch();
  const { hasCompletedOnboarding, isLoading } = useAppSelector(state => state.onboarding);

  const completeOnboarding = async () => {
    await dispatch(completeAction()).unwrap();
  };

  const resetOnboarding = async () => {
    await dispatch(resetAction()).unwrap();
  };

  return {
    hasCompletedOnboarding,
    completeOnboarding,
    resetOnboarding,
    isLoading
  };
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
