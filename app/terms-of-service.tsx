import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLanguage } from "@/contexts/LanguageContext";

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t("terms_of_service")}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Last Updated */}
        <Text style={styles.lastUpdated}>{t("last_updated")}</Text>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>{t("terms_1_title")}</Text>
          <Text style={styles.sectionText}>{t("terms_1_text")}</Text>

          <Text style={styles.sectionTitle}>{t("terms_2_title")}</Text>
          <Text style={styles.sectionText}>{t("terms_2_text")}</Text>

          <Text style={styles.sectionTitle}>{t("terms_3_title")}</Text>
          <Text style={styles.sectionText}>{t("terms_3_text")}</Text>

          <Text style={styles.sectionTitle}>{t("terms_4_title")}</Text>
          <Text style={styles.sectionText}>{t("terms_4_text")}</Text>

          <Text style={styles.sectionTitle}>{t("terms_5_title")}</Text>
          <Text style={styles.sectionText}>{t("terms_5_text")}</Text>

          <Text style={styles.sectionTitle}>{t("terms_6_title")}</Text>
          <Text style={styles.sectionText}>{t("terms_6_text")}</Text>

          <Text style={styles.sectionTitle}>{t("terms_7_title")}</Text>
          <Text style={styles.sectionText}>{t("terms_7_text")}</Text>

          <Text style={styles.sectionTitle}>{t("terms_8_title")}</Text>
          <Text style={styles.sectionText}>{t("terms_8_text")}</Text>

          <Text style={styles.sectionTitle}>{t("terms_9_title")}</Text>
          <Text style={styles.sectionText}>{t("terms_9_text")}</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 12,
    color: "#999",
    marginBottom: 24,
  },
  content: {
    gap: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginBottom: 16,
  },
});

