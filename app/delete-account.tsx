import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { deleteAccount } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm(`${t("delete_account")}\n\n${t("delete_account_warning")}`)) {
        performDelete();
      }
    } else {
      Alert.alert(
        t("delete_account"),
        t("delete_account_warning"),
        [
          { text: t("cancel"), style: "cancel" },
          {
            text: t("delete_account"),
            style: "destructive",
            onPress: performDelete
          }
        ]
      );
    }
  };

  const performDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      router.replace("/onboarding");
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert(`${t("error")}: ${t("failed_delete_account") || "Failed to delete account"}`);
      } else {
        Alert.alert(t("error"), t("failed_delete_account") || "Failed to delete account");
      }
    } finally {
      setIsDeleting(false);
    }
  };

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
        <Text style={styles.navTitle}>Delete Account</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Main Content - Scrollable */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Trash Icon with Decorative Elements */}
          <View style={styles.iconContainer}>
            {/* Decorative dots */}
            <View style={[styles.decorativeDot, { top: 30, left: 50 }]} />
            <View style={[styles.decorativeDot, { top: 70, right: 60 }]} />
            <View style={[styles.decorativeDot, { bottom: 50, left: 40 }]} />
            <View style={[styles.decorativeDot, { bottom: 70, right: 50 }]} />
            <View style={[styles.decorativeDot, { top: 50, left: 20 }]} />
            <View style={[styles.decorativeDot, { top: 90, right: 30 }]} />

            {/* Decorative circles */}
            <View style={[styles.decorativeCircle, { top: 40, right: 40 }]} />
            <View style={[styles.decorativeCircle, { bottom: 60, left: 60 }]} />
            <View style={[styles.decorativeCircle, { top: 20, right: 20 }]} />

            {/* Decorative stars */}
            <View style={[styles.decorativeStar, { top: 60, left: 30 }]} />
            <View style={[styles.decorativeStar, { bottom: 40, right: 30 }]} />

            {/* Trash icon */}
            <Ionicons name="trash-outline" size={140} color="#E0E0E0" />
          </View>

          {/* Heading */}
          <Text style={styles.heading}>{t("delete_account")}</Text>

          {/* Warning Text */}
          <Text style={styles.warningText}>
            {t("delete_account_warning")}
          </Text>

          {/* Delete Button */}
          <TouchableOpacity
            style={[styles.deleteButton, isDeleting && { opacity: 0.7 }]}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.deleteButtonText}>{t("delete_account")}</Text>
            )}
          </TouchableOpacity>
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
    borderBottomWidth: 0,
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
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 64,
  },
  iconContainer: {
    position: "relative",
    marginBottom: 48,
    alignItems: "center",
    justifyContent: "center",
    width: 240,
    height: 240,
  },
  decorativeDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E0E0E0",
  },
  decorativeCircle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },
  decorativeStar: {
    position: "absolute",
    width: 10,
    height: 10,
    backgroundColor: "#D0D0D0",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
    textAlign: "center",
  },
  warningText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  deleteButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    minWidth: 200,
  },
  deleteButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

