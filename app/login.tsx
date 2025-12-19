import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Basic Validation before API call
    if (!email || !password) {
      Alert.alert(t("error"), t("enter_email_password"));
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t("invalid_email"), t("invalid_email"));
      return;
    }

    if (email.toLowerCase().endsWith("@gmail.co")) {
      Alert.alert("Did you mean @gmail.com?", "It looks like you typed '@gmail.co' instead of '@gmail.com'.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      setLoading(false);
      router.replace('/(tabs)');
    } catch (error: any) {
      if (!error.response) {
        Alert.alert("Connection Error", "Cannot reach the server. Please check your internet connection.");
      } else {
        Alert.alert(t("login_failed"), error.response?.data?.message || t("invalid_credentials"));
      }
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
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  // Fallback for web if no history, or if landed directly on login
                  router.replace("/onboarding");
                }
              }}
              style={styles.backButton}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{t("log_in")}</Text>
          <Text style={styles.subtitle}>{t("log_in_subtitle")}</Text>

          <Text style={styles.label}>{t("email_address")}</Text>
          <TextInput
            placeholder="moon@gmail.com"
            placeholderTextColor="#666"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />


          <Text style={styles.label}>{t("password")}</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="********"
              placeholderTextColor="#666"
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye" : "eye-off"} size={24} color="gray" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? t("logging_in") : t("log_in")}</Text>
          </TouchableOpacity>

          <Text style={styles.bottomText}>
            {t("dont_have_account")}{" "}
            <Text style={styles.link} onPress={() => router.push("/signup")}>
              {t("sign_up")}
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
    backgroundColor: "#FFFFFF",
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
    marginLeft: -8,
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
    marginTop: 4,
    marginBottom: 20,
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
    marginBottom: 20,
    backgroundColor: "#F9F9F9",
    color: "#000000",
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#F9F9F9",
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: "#000000",
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    backgroundColor: "#000",
    height: 55,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
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
