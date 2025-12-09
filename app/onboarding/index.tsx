import { Redirect } from "expo-router";

export default function OnboardingIndex() {
  // Redirect to first onboarding screen
  return <Redirect href="/onboarding/screen1" />;
}

