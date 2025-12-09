import { Redirect } from "expo-router";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function Index() {
  const { hasCompletedOnboarding, isLoading } = useOnboarding();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // If onboarding is not completed, show onboarding
  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  // If onboarding is completed, go to login
  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
