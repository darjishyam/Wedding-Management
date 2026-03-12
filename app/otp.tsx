import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OtpScreen() {
  const router = useRouter();
  const { mobile, name, email, password } = useLocalSearchParams<{ mobile: string, name: string, email: string, password: string }>();
  const { verifyOtp, register, logout } = useAuth();
  const { showToast } = useToast();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp) {
      showToast("Please enter OTP", "warning");
      return;
    }
    if (otp.length !== 6) {
      showToast("OTP must be 6 digits", "error");
      return;
    }
    setLoading(true);
    try {
      // mobile comes from params
      if (!mobile) {
        throw new Error("Mobile number missing");
      }

      /* FIREBASE VERIFICATION - COMMENTED OUT
      const { authService } = require('@/services/authService');

      // 1. Verify OTP with Firebase
      await authService.confirmCode(otp);

      // 2. Register with Backend (skip backend OTP)
      // name, email, password are already available from the top-level hook
      if (!name || !email || !password) {
        throw new Error("Registration details missing");
      }

      await register(name, email, mobile, password, true); // true = firebaseVerified
      */

      // BACKEND VERIFICATION FLOW
      // Verify OTP with backend (which also logs user in and returns token)
      await verifyOtp(mobile, otp);

      // MENTOR REQUEST: Redirect to login page instead of auto-login
      // We call logout to clear the automatic session created by the backend
      await logout();

      showToast("Account created successfully! Please login.", "success");
      router.replace('/login');
    } catch (error: any) {
      console.error("Verification Error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Invalid or expired OTP";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>
            Please check your email ({email}) to see the verification code.
          </Text>

          <View style={styles.otpContainer}>
            <TextInput
              style={styles.otpBox}
              keyboardType="number-pad"
              placeholder="Ex: 123456"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleVerify}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Verifying..." : "Verify"}</Text>
          </TouchableOpacity>

          <Text style={styles.resend}>Resend Code In 29 Sec</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  scrollContent: { padding: 24, flexGrow: 1 },
  backArrow: { fontSize: 26, marginBottom: 20, color: '#000' },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 10, color: '#000' },
  subtitle: { color: "#6F6F6F", fontSize: 16, marginBottom: 30 },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
    width: "100%",
  },
  otpBox: {
    width: 200,
    height: 60,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#E6E6E6",
    textAlign: "center",
    fontSize: 24,
    color: '#000',
    backgroundColor: '#F9F9F9',
    letterSpacing: 8,
  },
  button: {
    backgroundColor: "#000",
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "#FFF", fontSize: 18, fontWeight: "600" },
  resend: { marginTop: 20, textDecorationLine: "underline", color: "#6F6F6F", textAlign: 'center' },
});
