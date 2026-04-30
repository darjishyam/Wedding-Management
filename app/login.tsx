import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import CustomInput from "@/components/CustomInput";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import FirebaseService from "@/services/FirebaseService";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { login, signInWithGoogle } = useAuth();
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

  // We use the Web Client ID for all platforms when using the Auth Proxy (ID Token flow)
  // This avoids potential issues where Google expects a native Android client ID but gets a web one.
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '571332592140-gbibcqolk9m3sfbqplc1abqf4mkbkinc.apps.googleusercontent.com',
    responseType: 'id_token',
    redirectUri: 'https://auth.expo.io/@professor_fan/helloworld',
  });

  useEffect(() => {
    if (request) {
      console.log("Current Redirect URI:", request.redirectUri);
    }
  }, [request]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      // setLoading(true); // Optional: manage loading state if desired
      await signInWithGoogle(idToken);
      
      // Register for notifications after successful Google login
      if (Platform.OS !== 'web') {
        await FirebaseService.registerForPushNotifications();
      }
      
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      showToast(error.message || "Google login failed", "error");
    }
  };

  const handleLogin = async () => {
    // Email validation
    if (!email) {
      showToast("Please enter your email address", "warning");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    if (!password) {
      showToast("Please enter your password", "warning");
      return;
    }

    setLoading(true);
    try {
      console.log(`[Login] Sending request to backend for: ${email}`);
      const userData = await login(email, password);
      console.log(`[Login] Backend Response SUCCESS:`, JSON.stringify(userData));
      
      // Check role directly from response or user object
      if (userData?.role === 'admin') {
        showToast("Welcome Admin!", "success");
        router.replace("/admin/dashboard" as any);
      } else {
        showToast("Login successful!", "success");
        
        // Register for notifications after successful manual login
        if (Platform.OS !== 'web') {
          await FirebaseService.registerForPushNotifications();
        }
        
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      console.log(`--- Login Error Details ---`);
      console.log(`Message: ${error.message}`);
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log(`Data:`, JSON.stringify(error.response.data));
      } else if (error.request) {
        console.log(`Request was made but no response received`);
      } else {
        console.log(`Error setting up request: ${error.message}`);
      }
      console.log(`---------------------------`);

      const errorMessage = error.response?.data?.message || error.message || "Invalid credentials";

      // Specific handling for user not found
      if (errorMessage.toLowerCase().includes('user not found') ||
        errorMessage.toLowerCase().includes('invalid email')) {
        showToast("Account not found. Please sign up first!", "error", 4000);
      } else if (errorMessage.toLowerCase().includes('not verified')) {
        showToast("Please verify your account via OTP first", "warning", 4000);
      } else {
        showToast(errorMessage, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // NATIVE FLOW: Preferred for APK/Android
      if (Platform.OS !== 'web') {
        try {
          // Attempt native sign in (authService handles play services check)
          const { GoogleSignin } = require('@react-native-google-signin/google-signin');
          if (GoogleSignin) {
            await GoogleSignin.hasPlayServices();
            await signInWithGoogle();
            router.replace("/(tabs)");
            return;
          }
        } catch (nativeError: any) {
          console.log("Native Sign-In failed", nativeError);
          // If native fails (e.g. config error), we can alert or fall back. 
          // user prefers native-only usually, but let's keep it robust.
          Alert.alert("Login Failed", "Could not sign in with Google. Please try again.");
          return;
        }
      }

      // Fallback to Auth Session (Expo Go / Web)
      await promptAsync();
    } catch (e) {
      console.log("Auth Session or Fallback Error", e);
    }
  };

  return (
    <ScreenWrapper>
      <CustomHeader />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in to access your account
        </Text>

        <CustomInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="Ex: jhondoe@gmail.com"
          keyboardType="email-address"
        />

        <CustomInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry={!showPassword}
          onRightIconPress={() => setShowPassword(!showPassword)}
          rightIcon={showPassword ? "eye-off" : "eye"}
          style={{ marginBottom: 4 }}
        />

        {/* Admin Toggle (Visual only, Logic handles redirection based on DB role) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#666" style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 14, color: '#666' }}>
            Admin account? Just log in normally.
          </Text>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotPassword} onPress={() => router.push("/forgot-password")}>
          <Text style={styles.forgotPasswordText}>Forget Password?</Text>
        </TouchableOpacity>

        {/* Action Button */}
        <CustomButton
          title={loading ? "Logging In..." : "Log In"}
          onPress={handleLogin}
          loading={loading}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>New Member? </Text>
          <Link href="/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.signupText}>Register now</Text>
            </TouchableOpacity>
          </Link>
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

// @ts-ignore
const styles = StyleSheet.create({
  scrollContent: {
    padding: 24,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
    color: "#000",
  },
  subtitle: {
    color: "#6F6F6F",
    fontSize: 16,
    marginBottom: 30,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: "#000",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  footerText: {
    color: "#6F6F6F",
    fontSize: 16,
  },
  signupText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },
});


