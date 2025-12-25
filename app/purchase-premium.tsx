import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image as RNImage, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PurchasePremiumScreen() {
  const router = useRouter();
  const { user, login, isDemo, reloadUser } = useAuth(); // We might need to refresh user data, but login overwrites it. 
  // Better to add a 'refreshUser' or similar, but for now we can just manual call api or relogin.
  // Actually, easiest way to refresh 'user' in context is to update the state manually or have a 'reloadUser' method.
  // User context update is tricky without a dedicated method. I will use a simple workaround: logout/login or just alert success.
  // Wait, I can't easily refresh user context without a method.
  // I'll add `refreshProfile` to AuthContext later. For now, I'll just call the API and alert.

  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to purchase premium.");
      router.push("/login"); // Or however you navigate
      return;
    }

    setIsProcessing(true);
    try {
      // Mocking payment delay
      setTimeout(async () => {
        // Here we would call the backend to upgrade

        if (isDemo) {
          console.log("DEMO MODE: Simulating Purchase Success");
          Alert.alert("Success", "You are now a Premium Member! (Demo Mode)", [
            { text: "OK", onPress: () => router.back() }
          ]);
          setIsProcessing(false);
          return;
        }

        try {
          // await authService.upgradeUser(); // Need to implement this
          // For now, I will assume successful "payment" and call the upgrade endpoint 
          // We need to import api not authService for backend calls if authService is only firebase.
          // Looking at project structure, 'services/api.ts' is axios instance.

          const response = await require("@/services/api").default.post('/auth/upgrade');

          Alert.alert("Success", "You are now a Premium Member!", [
            { text: "OK", onPress: () => router.back() }
          ]);

          if (reloadUser) {
            await reloadUser();
          }

        } catch (err) {
          Alert.alert("Error", "Upgrade failed. Please try again.");
          console.error(err);
        }
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      Alert.alert("Error", "Payment failed");
      setIsProcessing(false);
    }
  };

  const isPremium = user?.isPremium;

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Purchase Premium</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Premium Card */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <RNImage
                source={require("../assets/images/crown.png")}
                style={{ width: 28, height: 28, resizeMode: 'contain' }}
              />
            </View>
            <Text style={styles.cardTitle}>Shagun</Text>
          </View>

          {/* Features List */}
          <View style={styles.featuresList}>
            {/* Feature 1 */}
            <View style={styles.featureRow}>
              <View style={styles.checkIcon}>
                <Ionicons name="checkmark" size={12} color="#000" />
              </View>
              <Text style={styles.featureText}>Ads Free</Text>
            </View>

            {/* Feature 2 */}
            <View style={styles.featureRow}>
              <View style={styles.checkIcon}>
                <Ionicons name="checkmark" size={12} color="#000" />
              </View>
              <Text style={styles.featureText}>Export Shagun Book to PDF</Text>
            </View>

            {/* Feature 3 */}
            <View style={styles.featureRow}>
              <View style={styles.checkIcon}>
                <Ionicons name="checkmark" size={12} color="#000" />
              </View>
              <Text style={styles.featureText}>Export Gust List k to PDF</Text>
            </View>

            {/* Feature 4 */}
            <View style={styles.featureRow}>
              <View style={styles.checkIcon}>
                <Ionicons name="checkmark" size={12} color="#000" />
              </View>
              <Text style={styles.featureText}>Export Expense Book to PDF</Text>
            </View>

            {/* Feature 5 */}
            <View style={styles.featureRow}>
              <View style={styles.checkIcon}>
                <Ionicons name="checkmark" size={12} color="#000" />
              </View>
              <Text style={styles.featureText}>Support</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹120 <Text style={styles.pricePeriod}>/month</Text></Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Save 25%</Text>
            </View>
          </View>

          {/* Pay Button */}
          {isPremium ? (
            <TouchableOpacity style={[styles.payButton, { backgroundColor: '#4CAF50' }]} disabled={true}>
              <Text style={styles.payButtonText}>Premium Active</Text>
              <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.payButton} onPress={handlePurchase} disabled={isProcessing}>
              <Text style={styles.payButtonText}>{isProcessing ? "Processing..." : "Upgrade to Premium (₹120)"}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FAFAFA",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFD700", // Goldish background from screen
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#8A0030", // Matches Shagun text red/pink
  },
  featuresList: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  price: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginRight: 12,
  },
  pricePeriod: {
    fontSize: 16,
    fontWeight: "400",
    color: "#666",
  },
  badge: {
    backgroundColor: "#FCEDA6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000",
  },
  payButton: {
    backgroundColor: "#000",
    height: 56,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
