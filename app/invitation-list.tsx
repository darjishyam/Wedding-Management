import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useGuest } from "@/contexts/GuestContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { PDFService } from "@/services/PDFService";
import { useWedding } from "@/contexts/WeddingContext";
import { useState } from "react";
import { Modal, TextInput, ActivityIndicator } from "react-native";

export default function InvitationListScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };
  const { guests, isLoading, updateGuestStatus, updateGuest, deleteGuest } = useGuest();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Edit State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingGuest, setEditingGuest] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editCount, setEditCount] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editCategory, setEditCategory] = useState("Other");
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleExportPDF = async () => {
    if (!user?.isPremium) {
      Alert.alert(
        "Premium Feature",
        "Exporting to PDF is a premium feature. Upgrade to unlock!",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Upgrade", onPress: () => router.push("/purchase-premium") }
        ]
      );
      return;
    }

    const html = PDFService.generateGuestListHTML(guests, guests.length);
    await PDFService.generateAndSharePDF(html, "GuestList");
  };

  const handleShareRSVP = async (guest: any) => {
    try {
      // In a real app, this would be your production URL
      const rsvpLink = `exp://localhost:8081/guests/rsvp/${guest.rsvpToken}`;
      const message = `Namaste ${guest.name}! 🙏\n\nWe are delighted to invite you to our wedding. Please confirm your presence via this link:\n${rsvpLink}\n\nWaiting to see you there! ❤️`;
      
      await Share.share({
        message,
        url: rsvpLink, // iOS specific
        title: 'RSVP Invitation'
      });
    } catch (error: any) {
      Alert.alert("Error", "Could not share the RSVP link.");
    }
  };

  const handleEditPress = (guest: any) => {
    setEditingGuest(guest);
    setEditName(guest.name);
    setEditCount(guest.familyCount.toString());
    setEditCity(guest.cityVillage);
    setEditCategory(guest.category || 'Other');
    setEditModalVisible(true);
  };

  const handleUpdateGuest = async () => {
    if (!editName || !editCount || !editCity) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    setIsUpdating(true);
    try {
      await updateGuest(editingGuest._id, {
        name: editName,
        familyCount: parseInt(editCount),
        cityVillage: editCity,
        category: editCategory
      });
      setEditModalVisible(false);
      Alert.alert("Success", "Guest updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update guest");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteGuest = (id: string) => {
    Alert.alert(
      "Delete Guest",
      "Are you sure you want to remove this guest?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGuest(id);
            } catch (error: any) {
              Alert.alert("Error", "Failed to delete guest");
            }
          }
        }
      ]
    );
  };

  // If no guests, show empty state
  if (!isLoading && guests.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
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


  const filteredGuests = guests.filter(guest => {
    if (selectedCategory === "All") return true;
    return guest.category === selectedCategory;
  });

  // ... (handleAddGuest and handleExportPDF remain same)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t("invitation_list")} ({filteredGuests.length})</Text>
        <TouchableOpacity style={styles.addButtonSmall} onPress={handleAddGuest}>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButtonSmall} onPress={handleExportPDF}>
          <Ionicons name="document-text-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={{ height: 60 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center', gap: 8 }}>
          {['All', 'Groom Family', 'Bride Family', 'Friend', 'Work', 'Other'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                selectedCategory === cat && styles.filterChipSelected
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextSelected]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredGuests.map((guest, index) => (
          <View key={guest._id || index} style={styles.guestCard}>
            <View style={styles.guestInfo}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={styles.guestName}>{guest.name}</Text>
                <Text style={styles.categoryBadge}>{guest.category || 'Other'}</Text>
              </View>
              <Text style={styles.guestDetails}>{guest.cityVillage} • {guest.familyCount} Family Members</Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={[styles.statusText, { color: guest.status === 'Invited' || guest.status === 'Confirmed' ? 'green' : '#666' }]}>
                    {guest.status || 'Not Invited'}
                  </Text>
                  
                  {/* Edit/Delete Actions */}
                  <TouchableOpacity onPress={() => handleEditPress(guest)}>
                    <Ionicons name="create-outline" size={18} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteGuest(guest._id)}>
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>

                {/* Invite Action Button */}
                {guest.status !== 'Invited' && guest.status !== 'Confirmed' ? (
                  <TouchableOpacity
                    style={styles.inviteBtn}
                    onPress={() => updateGuestStatus(guest._id, true, 'Invited')}
                  >
                    <Text style={styles.inviteBtnText}>Send Invite</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="checkmark-done" size={16} color="green" />
                    <Text style={{ color: 'green', fontSize: 12, marginLeft: 4 }}>Sent</Text>
                  </View>
                )}

                {/* RSVP Link Action */}
                <TouchableOpacity
                  style={styles.rsvpLinkBtn}
                  onPress={() => handleShareRSVP(guest)}
                >
                  <Ionicons name="share-social-outline" size={14} color="#8A0030" />
                  <Text style={styles.rsvpLinkBtnText}>RSVP Link</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Edit Guest Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Guest</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.inputLabel}>FullName</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Guest Name"
              />

              <Text style={styles.inputLabel}>Family Count</Text>
              <TextInput
                style={styles.input}
                value={editCount}
                onChangeText={setEditCount}
                placeholder="Number of members"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>City / Village Name</Text>
              <TextInput
                style={styles.input}
                value={editCity}
                onChangeText={setEditCity}
                placeholder="Location"
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryContainer}>
                {['Groom Family', 'Bride Family', 'Friend', 'Work', 'Other'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      editCategory === cat && styles.categoryChipSelected
                    ]}
                    onPress={() => setEditCategory(cat)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      editCategory === cat && styles.categoryChipTextSelected
                    ]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdateGuest}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button for easy addition */}
      <TouchableOpacity style={styles.fab} onPress={handleAddGuest}>
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView >
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
    marginRight: 8,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#8A0030", // Deep Maroon
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
    backgroundColor: '#8A0030', // Deep Maroon
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#8A0030',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  inviteStatusSent: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
    borderWidth: 1,
  },
  inviteTextSent: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#000',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
  },
  filterChipTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  categoryBadge: {
    fontSize: 10,
    backgroundColor: '#E3F2FD',
    color: '#1565C0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500'
  },
  inviteBtn: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  inviteBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  categoryChipSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#666',
  },
  categoryChipTextSelected: {
    color: '#FFF',
  },
  saveButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  rsvpLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(138, 0, 48, 0.2)',
    backgroundColor: 'rgba(138, 0, 48, 0.05)',
  },
  rsvpLinkBtnText: {
    color: '#8A0030',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  }
});

