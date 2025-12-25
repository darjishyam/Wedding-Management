import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import CustomInput from "@/components/CustomInput";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SignupScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Helper for cross-platform alerts
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !mobile || !password || !confirmPassword) {
      showAlert(t("error"), t("all_fields_mandatory") || "All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      showAlert(t("error"), t("passwords_do_not_match") || "Passwords do not match");
      return;
    }

    // Smart Check for common typos
    if (email.toLowerCase().endsWith("@gmail.co")) {
      showAlert("Did you mean @gmail.com?", "It looks like you typed '@gmail.co' instead of '@gmail.com'.");
      return;
    }

    // Mobile Validation: Exactly 10 digits
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
      showAlert(t("invalid_mobile"), t("mobile_10_digits") || "Mobile number must be 10 digits");
      return;
    }

    // Password Validation: Min 8 chars, 1 letter, 1 number, 1 special char
    const trimmedPassword = password.trim();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    if (!passwordRegex.test(trimmedPassword)) {
      showAlert(t("weak_password"), t("password_requirements") || "Password must be at least 8 characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special char.");
      return;
    }

    setLoading(true);
    try {
      // BACKEND OTP FLOW
      await register(name, email, mobile, password); // Calls backend /auth/signup (generates OTP)

      // Navigate to OTP screen
      router.push({
        pathname: "/otp",
        params: { name, email, mobile, password }
      });

    } catch (error: any) {
      console.error("Signup Error Details:", error);
      const errorMessage = error.response?.data?.message || error.message || t("error");
      showAlert(t("signup_failed"), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    showAlert("Coming Soon", "Google Sign-In will be available soon!");
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
        <TouchableOpacity style={styles.socialButton} onPress={() => showAlert("Coming Soon", "Apple Sign-In will be available soon!")}>
          <FontAwesome name="apple" size={22} color="black" style={{ marginRight: 10 }} />
          <Text style={styles.socialText}>{t("continue_apple") || "Continue with Apple"}</Text>
        </TouchableOpacity>

        {/* Google */}
        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
          <FontAwesome name="google" size={22} color="#DB4437" style={{ marginRight: 10 }} />
          <Text style={styles.socialText}>{t("continue_google") || "Continue with Google"}</Text>
        </TouchableOpacity>

        {/* Facebook */}
        <TouchableOpacity style={styles.socialButton} onPress={() => showAlert("Coming Soon", "Facebook Sign-In will be available soon!")}>
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
    paddingVertical: 12, // Reduced height a bit to match design usually
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 30, // Rounded full
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
    fontSize: 16, // Matched other screens
    color: "#6F6F6F",
    marginBottom: 40,
  },
  link: {
    color: "#000",
    fontWeight: "700",
  },
});
