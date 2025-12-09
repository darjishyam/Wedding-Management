import { LanguageProvider } from "@/contexts/LanguageContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { ShagunProvider } from "@/contexts/ShagunContext";
import { WeddingProvider } from "@/contexts/WeddingContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <OnboardingProvider>
      <WeddingProvider>
        <ShagunProvider>
          <LanguageProvider>
            <Stack 
              screenOptions={{ headerShown: false }}
              initialRouteName="index"
            >
            <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="shagun-book" />
        <Stack.Screen name="add-shagun" />
        <Stack.Screen name="expenses" />
        <Stack.Screen name="add-expense" />
        <Stack.Screen name="invitation-list" />
        <Stack.Screen name="add-guest" />
        <Stack.Screen name="purchase-premium" />
        <Stack.Screen name="terms-of-service" />
        <Stack.Screen name="delete-account" />

        {/* Tabs - Home page */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
          </LanguageProvider>
        </ShagunProvider>
      </WeddingProvider>
    </OnboardingProvider>
  );
}
