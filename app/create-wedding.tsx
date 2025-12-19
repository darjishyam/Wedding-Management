import { CalendarPicker } from "@/components/CalendarPicker";
import { useWedding } from "@/contexts/WeddingContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLanguage } from "@/contexts/LanguageContext";

export default function CreateWeddingScreen() {
  const router = useRouter();
  const { createWedding } = useWedding();
  const { t } = useLanguage();
  const [groomName, setGroomName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [marriageDate, setMarriageDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDatePress = () => {
    setShowDatePicker(true);
  };

  const handleDateSelect = (date: Date) => {
    setMarriageDate(date);
    setShowDatePicker(false);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (groomName.trim() && brideName.trim()) {
      setIsSaving(true);
      try {
        await createWedding({
          groomName: groomName.trim(),
          brideName: brideName.trim(),
          date: marriageDate,
        });
        // Navigate back to My Wedding tab
        router.replace("/(tabs)");
      } catch (error: any) {
        console.error("Create wedding error full object:", error);
        const errorMessage = error.response?.data?.message || error.message || "Unknown error";
        alert(`${t("failed_create_wedding")}: ${errorMessage}`);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("add_new_wedding")}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Form Content */}
        <ScrollView
          style={styles.formContainer}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Groom's Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("groom_name")}</Text>
            <TextInput
              style={styles.input}
              placeholder="Mirror"
              placeholderTextColor="#999"
              value={groomName}
              onChangeText={setGroomName}
            />
          </View>

          {/* Bride's Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("bride_name")}</Text>
            <TextInput
              style={styles.input}
              placeholder="Moon"
              placeholderTextColor="#999"
              value={brideName}
              onChangeText={setBrideName}
            />
          </View>

          {/* Marriage Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("marriage_date")}</Text>
            <TouchableOpacity
              style={styles.dateInputContainer}
              onPress={handleDatePress}
            >
              <Text style={styles.dateInputText}>
                {formatDate(marriageDate)}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#999" style={styles.calendarIcon} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>{isSaving ? t("saving") : t("save")}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("select_date")}</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <CalendarPicker
              selectedDate={marriageDate}
              onDateSelect={handleDateSelect}
              onClose={() => setShowDatePicker(false)}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  placeholder: {
    width: 40,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
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
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 55,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  dateInputText: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    height: "100%",
    textAlignVertical: "center",
  },
  calendarIcon: {
    marginLeft: 10,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: Platform.OS === "web" ? "center" : "flex-end",
    alignItems: Platform.OS === "web" ? "center" : undefined,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: Platform.OS === "web" ? 20 : 0,
    borderBottomRightRadius: Platform.OS === "web" ? 20 : 0,
    paddingTop: 20,
    maxHeight: "80%",
    width: Platform.OS === "web" ? "90%" : "100%",
    maxWidth: Platform.OS === "web" ? 400 : undefined,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E6E6E6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
});
