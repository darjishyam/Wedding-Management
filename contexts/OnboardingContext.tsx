import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
  isLoading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_KEY = "@has_completed_onboarding";

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      setHasCompletedOnboarding(value === "true");
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  return (
    <OnboardingContext.Provider value={{ hasCompletedOnboarding, completeOnboarding, isLoading }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}

