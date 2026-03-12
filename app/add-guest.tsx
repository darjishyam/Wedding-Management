
import { useGuest } from "@/contexts/GuestContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddGuestScreen() {
  const router = useRouter();
  const { addGuest } = useGuest();
  const { t } = useLanguage();

  const [name, setName] = useState("");
  const [totalFamilyCount, setTotalFamilyCount] = useState("");
  const [cityVillage, setCityVillage] = useState("");
  const [category, setCategory] = useState("Other");
  const [status, setStatus] = useState("Not Invited");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setTotalFamilyCount("");
    setCityVillage("");
    setCategory("Other");
    setStatus("Not Invited");
  };

  // Fetch events
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);

  useEffect(() => {
    // Load events
    const loadEvents = async () => {
      try {
        const api = require('@/services/api').default;
        const res = await api.get('/events');
        setEvents(res.data);
      } catch (e) {
        console.log("Failed to load events", e);
      }
    };
    loadEvents();
  }, []);

  const toggleEvent = (eventId: string) => {
    if (selectedEventIds.includes(eventId)) {
      setSelectedEventIds(prev => prev.filter(id => id !== eventId));
    } else {
      setSelectedEventIds(prev => [...prev, eventId]);
    }
  };

  const handleSaveCommon = async (shouldGoBack: boolean) => {
    if (!name.trim() || !totalFamilyCount.trim() || !cityVillage.trim()) {
      Alert.alert(t("error"), t("all_fields_mandatory"));
      return;
    }

    setLoading(true);
    try {
      // Map selected IDs to object structure expected by backend
      const assignedEvents = selectedEventIds.map(id => ({
        event: id,
        status: 'Pending'
      }));

      await addGuest(name, parseInt(totalFamilyCount), cityVillage, category, status, assignedEvents);
      Alert.alert(t("success"), t("guest_added_success"));
      if (shouldGoBack) {
        // Redirect to Home Page as requested
        router.navigate("/(tabs)");
      } else {
        resetForm();
        setSelectedEventIds([]);
      }
    } catch (error: any) {
      Alert.alert(t("error"), t("failed_add_guest"));
    } finally {
      setLoading(false);
    }
  }

  const handleSaveAndAddAnother = () => handleSaveCommon(false);
  const handleSave = () => handleSaveCommon(true);

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
          <Text style={styles.navTitle}>{t("add_new_guest")}</Text>
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

          {/* Total family Count Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("total_family_count")}</Text>
            <TextInput
              style={styles.input}
              value={totalFamilyCount}
              onChangeText={setTotalFamilyCount}
              placeholder="5"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          {/* City/Village Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("city_village")}</Text>
            <TextInput
              style={styles.input}
              value={cityVillage}
              onChangeText={setCityVillage}
              placeholder="Surat"
              placeholderTextColor="#999"
            />
          </View>

          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 8 }}>
              {['Groom Family', 'Bride Family', 'Friend', 'Work', 'Other'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    category === cat && styles.chipSelected
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextSelected]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Events Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Invited to Events</Text>
            {events.length === 0 ? (
              <Text style={{ color: '#999', fontSize: 13 }}>No events created yet.</Text>
            ) : (
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {events.map((evt) => (
                  <TouchableOpacity
                    key={evt._id}
                    style={[
                      styles.chip,
                      selectedEventIds.includes(evt._id) && styles.chipSelected
                    ]}
                    onPress={() => toggleEvent(evt._id)}
                  >
                    <Text style={[styles.chipText, selectedEventIds.includes(evt._id) && styles.chipTextSelected]}>
                      {evt.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Status Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Invitation Status</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {['Not Invited', 'Invited', 'Confirmed', 'Declined'].map((stat) => (
                <TouchableOpacity
                  key={stat}
                  style={[
                    styles.chip,
                    status === stat && styles.chipSelected
                  ]}
                  onPress={() => setStatus(stat)}
                >
                  <Text style={[styles.chipText, status === stat && styles.chipTextSelected]}>{stat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveAndAddButton, loading && { opacity: 0.7 }]}
            onPress={handleSaveAndAddAnother}
            disabled={loading}
          >
            <Text style={styles.saveAndAddButtonText}>{t("save_and_add_another")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, loading && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>{loading ? "Saving..." : t("save")}</Text>
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
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
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
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  chipSelected: {
    backgroundColor: '#FFF0F5',
    borderColor: '#E40046',
  },
  chipText: {
    color: '#666',
    fontSize: 14,
  },
  chipTextSelected: {
    color: '#E40046',
    fontWeight: 'bold',
  },
});

