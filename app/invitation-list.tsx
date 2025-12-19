import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useGuest } from "@/contexts/GuestContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function InvitationListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { guests, isLoading } = useGuest();
  const { t } = useLanguage();

  const handleAddGuest = () => {
    if (!user) {
      if (Platform.OS === 'web') {
        if (window.confirm("Login Required\n\nYou need to login to add a guest.")) router.push("/login");
      } else {
        Alert.alert("Login Required", "You need to login to add a guest.", [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => router.push("/login") }
        ]);
      }
      return;
    }
    router.push("/add-guest");
  };

  // If no guests, show empty state
  if (!isLoading && guests.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{t("invitation_list")}</Text>
          <View style={styles.placeholder} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.emptyContent}>
            <View style={styles.iconContainer}>
              <Image source={require("../assets/images/empty_guest.png")} style={{ width: 240, height: 240, resizeMode: "contain" }} />
            </View>
            <Text style={styles.primaryText}>{t("no_guests_added")}</Text>
            <Text style={styles.secondaryText}>{t("start_preparing_guest_list")}</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddGuest}>
              <Text style={styles.addButtonText}>{t("add_new_guest")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t("invitation_list")} ({guests.length})</Text>
        <TouchableOpacity style={styles.addButtonSmall} onPress={handleAddGuest}>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {guests.map((guest, index) => (
          <View key={guest._id || index} style={styles.guestCard}>
            <View style={styles.guestInfo}>
              <Text style={styles.guestName}>{guest.name}</Text>
              <Text style={styles.guestDetails}>{guest.cityVillage} • {guest.familyCount} Family Members</Text>
            </View>
            {/* Placeholder for invite status */}
            <View style={styles.inviteStatus}>
              <Text style={styles.inviteText}>{t("pending")}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Action Button for easy addition */}
      <TouchableOpacity style={styles.fab} onPress={handleAddGuest}>
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
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
  emptyContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 64,
  },
  iconContainer: {
    marginBottom: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  secondaryText: {
    fontSize: 14,
    color: "#999",
    marginBottom: 32,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#000",
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 30,
    minWidth: 180,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  guestCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  guestDetails: {
    fontSize: 13,
    color: "#666",
  },
  inviteStatus: {
    backgroundColor: "#EEE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inviteText: {
    fontSize: 12,
    color: "#666",
  },
  addButtonSmall: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#000',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});

