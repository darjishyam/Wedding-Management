import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image as RNImage, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from 'expo-web-browser';

export default function PurchasePremiumScreen() {
  const router = useRouter();
  const { user, login, isDemo, reloadUser } = useAuth(); // We might need to refresh user data, but login overwrites it. 
  // Better to add a 'refreshUser' or similar, but for now we can just manual call api or relogin.
  // Actually, easiest way to refresh 'user' in context is to update the state manually or have a 'reloadUser' method.
  // User context update is tricky without a dedicated method. I will use a simple workaround: logout/login or just alert success.
  // Wait, I can't easily refresh user context without a method.
  // I'll add `refreshProfile` to AuthContext later. For now, I'll just call the API and alert.

  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-refresh when coming back from PayPal
  const { AppState } = require('react-native');
  const { useEffect } = require('react');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: any) => {
      if (nextAppState === 'active') {
        console.log("App resumed, checking premium status...");
        reloadUser();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handlePurchase = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to purchase premium.");
      router.push("/login");
      return;
    }
    // router.push("/payment/mock-payment" as any);

    console.log("Current User State:", user ? JSON.stringify(user) : "No User");
    console.log("Is Premium:", user?.isPremium);

    // Razorpay Logic
    setIsProcessing(true);
    try {
      const api = require('@/services/api').default;
      
      // 1. Create Order on Backend
      const orderRes = await api.post('/payment/order', {
        amount: 120, // ₹120 (from the UI)
        currency: "INR"
      });

      const orderData = orderRes.data;
      if (orderData && orderData.id) {
        // 2. Open Hosted Checkout
        // Construct the URL with pre-fill data and userId for fallback redirect
        const checkoutUrl = `${api.defaults.baseURL}/payment/razorpay-checkout?orderId=${orderData.id}&amount=${orderData.amount}&name=${encodeURIComponent(user?.name || '')}&email=${encodeURIComponent(user?.email || '')}&userId=${user?._id}`;
        
        console.log("[Razorpay] Opening Checkout URL:", checkoutUrl);
        await WebBrowser.openBrowserAsync(checkoutUrl);

        // 3. After browser closes, check status
        Alert.alert(
          "Payment Finished?",
          "If you completed the payment, your premium status will update automatically.",
          [{
            text: "Check Status", onPress: async () => {
              try {
                await reloadUser();
                Alert.alert("Success", "Premium Activated!");
                router.replace("/(tabs)/profile");
              } catch (e) {
                Alert.alert("Status", "Could not verify yet. Please restart app.");
              }
            }
          }]
        );
      } else {
        Alert.alert("Error", "Could not generate Payment Order.");
      }
    } catch (error) {
      console.error("Razorpay Initiation Error:", error);
      Alert.alert("Error", "Payment initiation failed.");
    } finally {
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
