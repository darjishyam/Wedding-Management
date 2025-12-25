import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import CustomInput from "@/components/CustomInput";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useLanguage } from "@/contexts/LanguageContext";
import { useShagun } from "@/contexts/ShagunContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";

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
      type: 'received',
    });
    router.back();
  };

  const handleSaveAndAddAnother = () => {
    handleSave();
  };

  return (
    <ScreenWrapper>
      <CustomHeader title={t("add_new_shagun")} />

      {/* Form Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CustomInput
          label={t("name")}
          value={name}
          onChangeText={setName}
          placeholder="Moon"
        />

        <CustomInput
          label={t("shagun_amount")}
          value={shagunAmount}
          onChangeText={setShagunAmount}
          placeholder="₹ 2000"
          keyboardType="numeric"
        />

        <CustomInput
          label={t("city_village")}
          value={city}
          onChangeText={setCity}
          placeholder="Surat"
        />

        <CustomInput
          label={t("gift")}
          value={gift1}
          onChangeText={setGift1}
          placeholder={t("gift")}
        />

        <CustomInput
          label={t("contact_number")}
          value={contact}
          onChangeText={setContact}
          placeholder="99999 99999"
          keyboardType="phone-pad"
          maxLength={10}
          prefix="+91"
        />

        <CustomInput
          label={t("wishes_message")}
          value={wishes}
          onChangeText={setWishes}
          placeholder="Best wishes for your marriage!"
          multiline
        />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <CustomButton
          title={t("save_and_add_another")}
          onPress={handleSaveAndAddAnother}
          variant="outline"
          style={{ marginBottom: 12 }}
        />
        <CustomButton
          title={t("save")}
          onPress={handleSave}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
});
