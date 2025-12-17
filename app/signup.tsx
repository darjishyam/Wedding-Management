import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper for cross-platform alerts
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const googleUser = await authService.signInWithGoogle();
      if (googleUser) {
        if (googleUser.displayName) setName(googleUser.displayName);
        if (googleUser.email) setEmail(googleUser.email);
        setPassword("GoogleAuth123!"); // Dummy password for backend requirement

        // Auto-verify if possible, or just prompt for mobile
        showAlert("Google Sign-In Successful", "Please enter your mobile number to complete registration.");
      }
    } catch (error: any) {
      console.error("Google Login Error:", error);
      showAlert("Google Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !mobile || !password) {
      showAlert("Error", "Please fill in all fields");
      return;
    }

    // Name Validation: Alphabets and spaces only
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
      showAlert("Invalid Name", "Name must contain only alphabets");
      return;
    }

    // Email Validation: Stricter format check
    // Requires at least 2 characters for TLD (e.g., .com, .in, .co)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      showAlert("Invalid Email", "Please enter a valid email address");
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
      showAlert("Invalid Mobile", "Mobile number must be exactly 10 digits");
      return;
    }

    // Password Validation: Min 8 chars, 1 letter, 1 number, 1 special char
    const trimmedPassword = password.trim();
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    console.log("DEBUG: Validation checking password:", trimmedPassword, "length:", trimmedPassword.length, "result:", passwordRegex.test(trimmedPassword));

    if (!passwordRegex.test(trimmedPassword)) {
      showAlert("Weak Password", "Password must be at least 8 characters long and include a letter, a number, and a special character.");
      return;
    }

    setLoading(true);
    try {
      // BACKEND OTP FLOW
      console.log("BACKEND FLOW ACTIVE: Attempting signup with:", { name, email, mobile });
      await register(name, email, mobile, password); // Calls backend /auth/signup (generates OTP)

      // Navigate to OTP screen
      router.push({
        pathname: "/otp",
        params: { name, email, mobile, password }
      });

    } catch (error: any) {
      console.error("Signup Error Details:", error);
      const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
      showAlert("Signup Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Arrow */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          </View>

          {/* Titles */}
          <Text style={styles.title}>Create a New Account</Text>
          <Text style={styles.subtitle}>Fill full all the details.</Text>

          {/* Inputs */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            placeholder="Moon"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            placeholder="moon@gmail.com"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            placeholder="9999999999"
            style={styles.input}
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={setMobile}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="********"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Signing Up..." : "Sign Up"}</Text>
          </TouchableOpacity>

          {/* Divider */}
          <Text style={styles.divider}>OR</Text>

          {/* Apple */}
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-apple" size={22} color="black" style={{ marginRight: 10 }} />
            <Text style={styles.socialText}>Continue with Apple</Text>
          </TouchableOpacity>

          {/* Google */}
          {/* Google */}
          <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert("Coming Soon", "Google Sign-In will be available soon!")}>
            <RNImage
              source={require("../assets/images/Google.png")}
              style={{ width: 22, height: 22, marginRight: 10, resizeMode: 'contain' }}
            />
            <Text style={styles.socialText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Facebook */}
          <TouchableOpacity style={styles.socialButton}>
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
            <Text style={styles.socialText}>Continue with Facebook</Text>
          </TouchableOpacity>

          {/* Bottom Link */}
          <Text style={styles.bottomText}>
            Already have an account?{" "}
            <Text
              style={styles.link}
              onPress={() => router.push("/login")}
            >
              Login
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 8,
    marginLeft: -8, // Align with text visually
  },
  backArrow: {
    fontSize: 26,
    color: "#000",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#6F6F6F",
    marginBottom: 20,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: "#6F6F6F",
    marginBottom: 6,
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#F9F9F9", // Slight bg for inputs
    color: "#000", // Ensure text is visible
  },
  button: {
    backgroundColor: "#000",
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
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
    height: 55,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  socialText: {
    fontSize: 16,
    color: "#000",
  },
  bottomText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    color: "#6F6F6F",
  },
  link: {
    color: "#000",
    fontWeight: "700",
  },
});
