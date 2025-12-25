import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import CustomInput from "@/components/CustomInput";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const { login, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Invalid credentials";
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      Alert.alert("Google Login Failed", error.message);
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

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forget Password?</Text>
        </TouchableOpacity>

        {/* Action Button */}
        <CustomButton
          title={loading ? "Logging In..." : "Log In"}
          onPress={handleLogin}
          loading={loading}
        />

        {/* Footer */}
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E6E6E6',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#6F6F6F',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 30,
    marginBottom: 20,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
});
