import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "@/services/api";

export default function GuestRSVPScreen() {
  const { token } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [guest, setGuest] = useState<any>(null);
  const [status, setStatus] = useState<"Confirmed" | "Declined">("Confirmed");
  const [attendanceCount, setAttendanceCount] = useState(1);
  const [foodPreference, setFoodPreference] = useState("Veg");

  useEffect(() => {
    fetchGuestDetails();
  }, [token]);

  const fetchGuestDetails = async () => {
    try {
      const response = await api.get(`/guests/rsvp/${token}`);
      setGuest(response.data);
      setAttendanceCount(response.data.familyCount || 1);
      setFoodPreference(response.data.foodPreference || "Veg");
      if (response.data.status === "Confirmed" || response.data.status === "Declined") {
        setStatus(response.data.status);
      }
    } catch (error: any) {
      Alert.alert("Error", "Invalid or expired RSVP link.");
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async () => {
    setSubmitting(true);
    try {
      await api.post(`/guests/rsvp/${token}`, {
        status,
        attendanceCount,
        foodPreference,
      });
      Alert.alert("Success", "Your RSVP has been submitted. Thank you!");
    } catch (error: any) {
      Alert.alert("Error", "Failed to submit RSVP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8A0030" />
      </View>
    );
  }

  if (!guest) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Invalid Invitation Link</Text>
      </View>
    );
  }

  const { wedding } = guest;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Wedding Header Card */}
        <View style={styles.weddingCard}>
          <Text style={styles.inviteText}>You're Invited to the Wedding of</Text>
          <View style={styles.namesRow}>
            <Text style={styles.brideName}>{wedding.brideName}</Text>
            <Ionicons name="heart" size={24} color="#8A0030" style={{ marginHorizontal: 10 }} />
            <Text style={styles.groomName}>{wedding.groomName}</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.dateText}>
            {new Date(wedding.date).toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <Text style={styles.locationText}>{wedding.location || wedding.venue}</Text>
        </View>

        {/* RSVP Form */}
        <View style={styles.formCard}>
          <Text style={styles.greeting}>Namaste, {guest.name}!</Text>
          <Text style={styles.subGreeting}>Please confirm your presence</Text>

          {/* Status Selection */}
          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[styles.statusBtn, status === "Confirmed" && styles.statusBtnActive]}
              onPress={() => setStatus("Confirmed")}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={status === "Confirmed" ? "#FFF" : "#8A0030"}
              />
              <Text style={[styles.statusBtnText, status === "Confirmed" && styles.statusBtnTextActive]}>
                Attending
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusBtn, status === "Declined" && styles.statusBtnActive]}
              onPress={() => setStatus("Declined")}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={status === "Declined" ? "#FFF" : "#8A0030"}
              />
              <Text style={[styles.statusBtnText, status === "Declined" && styles.statusBtnTextActive]}>
                Declined
              </Text>
            </TouchableOpacity>
          </View>

          {status === "Confirmed" && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.label}>Number of Guests</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setAttendanceCount(Math.max(1, attendanceCount - 1))}
                >
                  <Ionicons name="remove" size={24} color="#8A0030" />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{attendanceCount}</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setAttendanceCount(attendanceCount + 1)}
                >
                  <Ionicons name="add" size={24} color="#8A0030" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Food Preference</Text>
              <View style={styles.foodRow}>
                {["Veg", "Jain", "Non-Veg"].map((pref) => (
                  <TouchableOpacity
                    key={pref}
                    style={[styles.foodChip, foodPreference === pref && styles.foodChipActive]}
                    onPress={() => setFoodPreference(pref)}
                  >
                    <Text style={[styles.foodChipText, foodPreference === pref && styles.foodChipTextActive]}>
                      {pref}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleRSVP}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>Submit RSVP</Text>
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
    backgroundColor: "#FFF9E3", // Premium Cream
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF9E3",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  weddingCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#D4AF37", // Royal Gold
    marginBottom: 20,
    shadowColor: "#8A0030",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  inviteText: {
    fontSize: 14,
    color: "#D4AF37",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 15,
  },
  namesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  brideName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#8A0030",
    fontFamily: "serif",
  },
  groomName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#8A0030",
    fontFamily: "serif",
  },
  divider: {
    height: 1,
    backgroundColor: "#D4AF37",
    width: "60%",
    marginVertical: 15,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    marginBottom: 5,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(138, 0, 48, 0.1)",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1A1A",
    textAlign: "center",
  },
  subGreeting: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  optionRow: {
    flexDirection: "row",
    gap: 15,
  },
  statusBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#8A0030",
    gap: 8,
  },
  statusBtnActive: {
    backgroundColor: "#8A0030",
  },
  statusBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8A0030",
  },
  statusBtnTextActive: {
    color: "#FFF",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 15,
    padding: 5,
    alignSelf: "flex-start",
  },
  counterBtn: {
    padding: 10,
    backgroundColor: "#FFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  counterValue: {
    fontSize: 20,
    fontWeight: "800",
    paddingHorizontal: 20,
    color: "#1A1A1A",
  },
  foodRow: {
    flexDirection: "row",
    gap: 10,
  },
  foodChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  foodChipActive: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  foodChipText: {
    fontWeight: "600",
    color: "#666",
  },
  foodChipTextActive: {
    color: "#FFF",
  },
  submitBtn: {
    backgroundColor: "#8A0030",
    borderRadius: 15,
    padding: 18,
    alignItems: "center",
    marginTop: 35,
    shadowColor: "#8A0030",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  submitBtnText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  },
  errorText: {
    fontSize: 18,
    color: "#8A0030",
    fontWeight: "700",
  },
});
