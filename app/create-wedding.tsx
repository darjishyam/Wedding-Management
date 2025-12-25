import { CalendarPicker } from "@/components/CalendarPicker";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import CustomInput from "@/components/CustomInput";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWedding } from "@/contexts/WeddingContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

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
    <ScreenWrapper>
      <CustomHeader title={t("add_new_wedding")} />

      {/* Form Content */}
      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <CustomInput
          label={t("groom_name")}
          placeholder="Mirror"
          value={groomName}
          onChangeText={setGroomName}
        />

        <CustomInput
          label={t("bride_name")}
          placeholder="Moon"
          value={brideName}
          onChangeText={setBrideName}
        />

        {/* Marriage Date - Custom handled since it's a date picker */}
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
        <CustomButton
          title={isSaving ? t("saving") : t("save")}
          onPress={handleSave}
          loading={isSaving}
        />
      </View>

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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  inputGroup: {
    marginBottom: 24, // Keep this for the date picker wrapper
  },
  label: {
    fontSize: 14,
    color: "#6F6F6F",
    marginBottom: 6,
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 55,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F9F9F9", // Match CustomInput bg
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
