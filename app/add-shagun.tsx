import { useLanguage } from "@/contexts/LanguageContext";
import { useShagun } from "@/contexts/ShagunContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddShagunScreen() {
  const router = useRouter();
  const { addShagun } = useShagun();
  const { t } = useLanguage();
  const [name, setName] = useState("Moon");
  const [shagunAmount, setShagunAmount] = useState("₹ 2000");
  const [city, setCity] = useState("Surat");
  const [gift1, setGift1] = useState("Gift");
  const [contact, setContact] = useState("9999999999");
  const [wishes, setWishes] = useState("Best wishes");

  const handleSave = () => {
    // Validation
    if (!name.trim() || !shagunAmount.trim() || !city.trim() || !gift1.trim() || !contact.trim() || !wishes.trim()) {
      Alert.alert(t("error"), t("all_fields_mandatory"));
      return;
    }

    // Contact Number Validation (10 digits)
    const cleanedContact = contact.replace(/\D/g, ""); // Remove non-digits
    // Allow +91 or just 10 digits. If +91 is there, length might be 12. If just 10, length 10.
    // User said "mobile number must have 10 digit". I'll assume standard 10 digit Indian mobile.
    // If user enters +91 9999999999 -> cleaned is 919999999999 (12 digits).
    // If user enters 9999999999 -> cleaned is 9999999999 (10 digits).
    // Let's check if the *last* 10 digits are valid, or strictly 10.
    // Usually "10 digit mobile" validation checks for exactly 10 digits if no country code, or 10 digits after country code.
    // Simple robust check: extract last 10. But if they type 11 digits?
    // Let's enforce: Extract all digits. If length < 10, fail. If > 10, ensure it starts with country code? 
    // Propose: Check if it contains at least 10 digits.
    // "mobile number must have 10 digit" implies stricter equal to 10.
    // Let's try: Clean non-digits. If length is 10, good. If length is 12 and starts with 91, good.
    const digits = cleanedContact.slice(-10);
    if (cleanedContact.length < 10 || digits.length !== 10) {
      Alert.alert(t("error"), t("mobile_invalid"));
      return;
    }

    addShagun({
      name: name,
      date: new Date().toISOString(),
      amount: shagunAmount,
      city: city,
      contact: contact,
      gift: gift1,
      wishes: wishes,
    });
    router.back();
  };

  const handleSaveAndAddAnother = () => {
    handleSave();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{t("add_new_shagun")}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Form Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("name")}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Moon"
              placeholderTextColor="#999"
            />
          </View>

          {/* Shagun Amount Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("shagun_amount")}</Text>
            <TextInput
              style={styles.input}
              value={shagunAmount}
              onChangeText={setShagunAmount}
              placeholder="₹ 2000"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          {/* City/Village Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("city_village")}</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Surat"
              placeholderTextColor="#999"
            />
          </View>

          {/* Gift Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("gift")}</Text>
            <TextInput
              style={styles.input}
              value={gift1}
              onChangeText={setGift1}
              placeholder={t("gift")}
              placeholderTextColor="#999"
            />
          </View>

          {/* Contact Number Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("contact_number")}</Text>
            <View style={styles.phoneInputContainer}>
              <Text style={styles.phonePrefix}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                value={contact}
                onChangeText={setContact}
                placeholder="99999 99999"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>

          {/* Wishes Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("wishes_message")}</Text>
            <TextInput
              style={styles.input}
              value={wishes}
              onChangeText={setWishes}
              placeholder="Best wishes for your marriage!"
              placeholderTextColor="#999"
              multiline
            />
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveAndAddButton}
            onPress={handleSaveAndAddAnother}
          >
            <Text style={styles.saveAndAddButtonText}>{t("save_and_add_another")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>{t("save")}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#FFFFFF",
    fontWeight: "600",
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  phonePrefix: {
    fontSize: 16,
    color: "#000",
    marginRight: 10,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: "#000",
    fontWeight: "600",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  saveAndAddButton: {
    backgroundColor: "#FFFFFF",
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 12,
  },
  saveAndAddButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#000",
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
