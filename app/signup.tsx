import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import CustomInput from "@/components/CustomInput";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function SignupScreen() {
  const router = useRouter();
  const { register, signInWithGoogle } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      WebBrowser.warmUpAsync();
    }
    return () => {
      if (Platform.OS !== 'web') {
        WebBrowser.coolDownAsync();
      }
    };
  }, []);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '571332592140-gbibcqolk9m3sfbqplc1abqf4mkbkinc.apps.googleusercontent.com',
    androidClientId: '571332592140-gbibcqolk9m3sfbqplc1abqf4mkbkinc.apps.googleusercontent.com',
    responseType: 'id_token',
    redirectUri: Platform.select({
      web: undefined,
      default: 'https://auth.expo.io/@professor_fan/helloworld',
    }),
  });

  useEffect(() => {
    if (request) {
      console.log("Generated Redirect URI:", request.redirectUri);
    }
  }, [request]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);



  // Listen for Google Auth response
  useEffect(() => {
    console.log("Auth Session Response:", JSON.stringify(response));
    if (response?.type === 'success') {
      const { id_token } = response.params;
      console.log("Google Sign-In Success! Token:", id_token ? "Found" : "Missing");
      handleGoogleSignInProcess(id_token);
    } else if (response?.type === 'error') {
      console.error("Google Sign-In Error Response:", response.error);
      showToast("Authentication error occurred", "error");
    }
  }, [response]);

  const handleGoogleSignInProcess = async (idToken: string) => {
    try {
      setLoading(true);
      await signInWithGoogle(idToken);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      showToast(error.message || "Google login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    // Name validation
    if (!name || name.trim().length < 2) {
      showToast("Please enter a valid name (at least 2 characters)", "warning");
      return;
    }

    // Validate name contains only letters and spaces (no numbers or special characters)
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name.trim())) {
      showToast("Name can only contain letters and spaces (no numbers or special characters)", "error", 4000);
      return;
    }

    // Email validation
    if (!email) {
      showToast("Please enter your email address", "warning");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    // Smart Check for common typos
    if (email.toLowerCase().endsWith("@gmail.co")) {
      showToast("Did you mean @gmail.com? Please check your email", "warning", 4000);
      return;
    }

    // Mobile validation
    if (!mobile) {
      showToast("Please enter your mobile number", "warning");
      return;
    }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
      showToast("Mobile number must be exactly 10 digits", "error");
      return;
    }

    // Password validation
    if (!password) {
      showToast("Please enter a password", "warning");
      return;
    }

    if (!confirmPassword) {
      showToast("Please confirm your password", "warning");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    // Password Validation: Min 8 chars, 1 letter, 1 number, 1 special char
    const trimmedPassword = password.trim();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    if (!passwordRegex.test(trimmedPassword)) {
      showToast(
        "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character",
        "error",
        5000
      );
      return;
    }

    setLoading(true);
    try {
      // BACKEND OTP FLOW
      await register(name, email, mobile, password); // Calls backend /auth/signup (generates OTP)

      showToast("OTP sent to your email!", "success");

      // Navigate to OTP screen
      router.push({
        pathname: "/otp",
        params: { name, email, mobile, password }
      });

    } catch (error: any) {
      console.error("Signup Error Details:", error);
      const errorMessage = error.response?.data?.message || error.message || t("error");

      // Specific error handling
      if (errorMessage.toLowerCase().includes('already exists')) {
        showToast("This email or mobile is already registered. Please login!", "error", 4000);
      } else {
        showToast(errorMessage, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // NATIVE FLOW: We use the authService which uses @react-native-google-signin/google-signin
    // This gives the native "bottom sheet" popup.
    if (Platform.OS !== 'web') {
      try {
        // Check native module status
        // const { GoogleSignin } = require('@react-native-google-signin/google-signin');
        // await GoogleSignin.hasPlayServices(); // Optional check if needed here, but authService handles it.

        // Call the NATIVE service
        await signInWithGoogle();

        // If we get here, it worked!
        router.replace("/(tabs)");
        return;

      } catch (error: any) {
        console.error("Native Google Login Error:", error);
        Alert.alert("Login Failed", "Could not sign in with Google. Please try again.");
        return;
      }
    }

    // Web Fallback (Only for actual Web Browser)
    try {
      await promptAsync();
    } catch (e) {
      console.log("Auth Session Prompt Error", e);
    }
  };

  return (
    <ScreenWrapper>
      <CustomHeader />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Titles */}
        <Text style={styles.title}>{t("create_account") || "Create Account"}</Text>
        <Text style={styles.subtitle}>{t("fill_details") || "Fill your details or continue with social media"}</Text>

        {/* Inputs */}
        <CustomInput
          label={t("name") || "Your Name"}
          placeholder="Ex: Jhon Doe"
          value={name}
          onChangeText={setName}
        />

        <CustomInput
          label={t("email_address") || "Email Address"}
          placeholder="Ex: jhondoe@gmail.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <CustomInput
          label={t("phone_number") || "Mobile Number"}
          placeholder="9999999999"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
          maxLength={10}
          prefix="+91"
        />

        <CustomInput
          label={t("password") || "Password"}
          placeholder="********"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          rightIcon={showPassword ? "eye" : "eye-off"}
          onRightIconPress={() => setShowPassword(!showPassword)}
        />

        <CustomInput
          label={t("confirm_password") || "Confirm Password"}
          placeholder="********"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          rightIcon={showConfirmPassword ? "eye" : "eye-off"}
          onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={{ marginBottom: 4 }}
        />

        {/* Sign Up Button */}
        <CustomButton
          title={loading ? t("signing_up") || "Creating Account..." : t("sign_up") || "Sign Up"}
          onPress={handleSignup}
          loading={loading}
        />

        {/* Divider */}
        <Text style={styles.divider}>OR</Text>

        {/* Apple */}
        <TouchableOpacity style={styles.socialButton} onPress={() => showToast("Apple Sign-In coming soon!", "info")}>
          <FontAwesome name="apple" size={22} color="black" style={{ marginRight: 10 }} />
          <Text style={styles.socialText}>{t("continue_apple") || "Continue with Apple"}</Text>
        </TouchableOpacity>

        {/* Google */}
        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
          <FontAwesome name="google" size={22} color="#DB4437" style={{ marginRight: 10 }} />
          <Text style={styles.socialText}>{t("continue_google") || "Continue with Google"}</Text>
        </TouchableOpacity>

        {/* Facebook */}
        <TouchableOpacity style={styles.socialButton} onPress={() => showToast("Facebook Sign-In coming soon!", "info")}>
          <View style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: "#1877F2",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 10
          }}>
            <FontAwesome
              name="facebook"
              size={16}
              color="#FFF"
            />
          </View>
          <Text style={styles.socialText}>{t("continue_facebook") || "Continue with Facebook"}</Text>
        </TouchableOpacity>

        {/* Bottom Link */}
        <Text style={styles.bottomText}>
          {t("already_have_account") || "Already have an account?"}{" "}
          <Text
            style={styles.link}
            onPress={() => router.push("/login")}
          >
            {t("login") || "Log In"}
          </Text>
        </Text>
      </ScrollView>
    </ScreenWrapper>
  );
}

// @ts-ignore
const styles = StyleSheet.create({
  scrollContainer: {
    padding: 24,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 5,
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#6F6F6F",
    marginBottom: 25,
  },
  divider: {
    textAlign: "center",
    marginVertical: 20,
    color: "#6F6F6F",
    fontSize: 16,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 30,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  socialText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "600",
  },
  bottomText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#6F6F6F",
    marginBottom: 40,
  },
  link: {
    color: "#000",
    fontWeight: "700",
  },
});


