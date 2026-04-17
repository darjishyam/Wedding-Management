import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useWedding } from "@/contexts/WeddingContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, reloadUser } = useAuth();
  const { resetOnboarding } = useOnboarding();
  const { language, setLanguage, t } = useLanguage();
  const { weddingData, updateWedding, addCollaborator, removeCollaborator } = useWedding();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [collabEmail, setCollabEmail] = useState("");
  const [isCollabLoading, setIsCollabLoading] = useState(false);
  const [tempStatus, setTempStatus] = useState(weddingData?.status || "Planned");

  const handleUpdateStatus = async () => {
    if (!weddingData?._id) return;
    try {
      await updateWedding(weddingData._id, { status: tempStatus });
      setShowStatusModal(false);
      Alert.alert("Success", "Wedding status updated!");
    } catch (e) {
      Alert.alert("Error", "Failed to update status");
    }
  };

  const handleAddCollaborator = async () => {
    if (!collabEmail.trim()) return;
    setIsCollabLoading(true);
    try {
      await addCollaborator(collabEmail.trim());
      setCollabEmail("");
      Alert.alert(t("success"), "Collaborator added successfully!");
    } catch (e: any) {
      Alert.alert(t("error"), e.message || "Failed to add collaborator");
    } finally {
      setIsCollabLoading(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    Alert.alert(
      "Remove Collaborator",
      "Are you sure you want to remove this person?",
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("remove"),
          style: "destructive",
          onPress: async () => {
            try {
              await removeCollaborator(userId);
            } catch (e: any) {
              Alert.alert(t("error"), e.message || "Failed to remove collaborator");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hi, {user?.name || "Guest"} 👋</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Details */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={async () => {
            if (!user) return;
            const { launchImageLibraryAsync, MediaTypeOptions } = require('expo-image-picker');
            const result = await launchImageLibraryAsync({
              mediaTypes: MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
              base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
              const uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
              try {
                // Update User Profile
                const api = require('@/services/api').default;
                // We need an endpoint to update user. userController?
                // Assuming POST /auth/update-profile or similar.
                // Let's assume we can use the same update logic if we had one.
                // I'll assume we can call a generic update.
                // Actually, let's create a route for it if it doesn't exist, or just use a generic 'update' if available.
                // I'll create a new function in authController called updateProfile.
                await api.put('/auth/profile', { profileImage: uri });

                // Reload user
                await reloadUser();
              } catch (e) {
                console.error("Failed to update profile image", e);
              }
            }
          }}>
            <Image
              source={
                user?.profileImage
                  ? { uri: user.profileImage }
                  : require("../../assets/images/empty_guest.png")
              }
              style={styles.profileImage}
            />
            <View style={{ position: 'absolute', bottom: 0, right: 10, backgroundColor: '#000', borderRadius: 12, padding: 4 }}>
              <Ionicons name="camera" size={12} color="#FFF" />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || "Guest"}</Text>
            <Text style={styles.profileEmail}>{user?.email || "Sign in to save your data"}</Text>
          </View>
          {user && (
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>{t("edit")}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {/* Purchase Premium */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/purchase-premium")}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: "#FFD700" }]}>
                <Image
                  source={require("../../assets/images/crown.png")}
                  style={{ width: 24, height: 24, resizeMode: 'contain' }}
                />
              </View>
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemText}>{t("purchase_premium")}</Text>
                <Text style={styles.menuItemSubtext}>{t("export_data_pdf")}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          {/* Change Language */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: "#F5F5F5" }]}>
                <Ionicons name="globe-outline" size={20} color="#000" />
              </View>
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemText}>{t("change_language")}</Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.changeButtonText}>{t("change")}</Text>
            </View>
          </TouchableOpacity>

          {/* Collaborators */}
          {user && weddingData && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowCollabModal(true)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#F5F5F5" }]}>
                  <Ionicons name="people-outline" size={20} color="#000" />
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemText}>{t("collaborators")}</Text>
                  <Text style={styles.menuItemSubtext}>{t("manage_collaborators")}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          )}

          {/* Terms of Service */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/terms-of-service")}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: "#F5F5F5" }]}>
                <Ionicons name="document-text-outline" size={20} color="#000" />
              </View>
              <Text style={styles.menuItemText}>{t("terms_of_service")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          {/* Delete Account */}
          {user && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/delete-account")}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#F5F5F5" }]}>
                  <Ionicons name="trash-outline" size={20} color="#000" />
                </View>
                <Text style={styles.menuItemText}>{t("delete_account")}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          )}

          {/* Contact Us */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/contact-us")}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: "#F5F5F5" }]}>
                <Ionicons name="mail-outline" size={20} color="#000" />
              </View>
              <Text style={styles.menuItemText}>{t("contact_us")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          {/* Connect on Instagram */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: "#F5F5F5" }]}>
                <Ionicons name="logo-instagram" size={20} color="#000" />
              </View>
              <Text style={styles.menuItemText}>{t("connect_instagram")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          {/* Log out / Log in */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={async () => {
              if (user) {
                await logout();
                await resetOnboarding();
                router.replace('/');
              } else {
                router.push('/login');
              }
            }}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: "#F5F5F5" }]}>
                <Ionicons name={user ? "log-out-outline" : "log-in-outline"} size={20} color="#000" />
              </View>
              <Text style={styles.menuItemText}>{user ? t("log_out") : "Log In"}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>


        </View>
      </ScrollView>

      {/* Change Language Modal - Kept same */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowLanguageModal(false)}
          />
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("change_language")}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Language Options */}
            <View style={styles.languageOptions}>
              <TouchableOpacity
                style={styles.languageOption}
                onPress={() => setLanguage("English")}
              >
                <View style={styles.radioButton}>
                  {language === "English" && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.languageOptionText}>English</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.languageOption}
                onPress={() => setLanguage("Gujrati")}
              >
                <View style={styles.radioButton}>
                  {language === "Gujrati" && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.languageOptionText}>ગુજરાતી</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowLanguageModal(false)}
              >
                <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => setShowLanguageModal(false)}
              >
                <Text style={styles.saveButtonText}>{t("save")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Status Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowStatusModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Wedding Status</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.languageOptions}>
              {['Planned', 'Ongoing', 'Completed', 'Archived'].map((stat) => (
                <TouchableOpacity
                  key={stat}
                  style={styles.languageOption}
                  onPress={() => setTempStatus(stat)}
                >
                  <View style={styles.radioButton}>
                    {tempStatus === stat && <View style={styles.radioButtonSelected} />}
                  </View>
                  <Text style={styles.languageOptionText}>{stat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowStatusModal(false)}
              >
                <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdateStatus}
              >
                <Text style={styles.saveButtonText}>{t("save")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Collaborators Modal */}
      <Modal
        visible={showCollabModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCollabModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowCollabModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("collaborators")}</Text>
              <TouchableOpacity onPress={() => setShowCollabModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400, paddingHorizontal: 20 }}>
              {/* Add Input */}
              <View style={{ marginTop: 20, marginBottom: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>{t("invite_partner")}</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput
                    style={{
                      flex: 1,
                      height: 50,
                      borderWidth: 1,
                      borderColor: '#E6E6E6',
                      borderRadius: 12,
                      paddingHorizontal: 15,
                    }}
                    placeholder={t("enter_partner_email")}
                    value={collabEmail}
                    onChangeText={setCollabEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#000',
                      paddingHorizontal: 20,
                      borderRadius: 12,
                      justifyContent: 'center',
                      opacity: isCollabLoading ? 0.7 : 1
                    }}
                    onPress={handleAddCollaborator}
                    disabled={isCollabLoading}
                  >
                    {isCollabLoading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{t("save")}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* List */}
              <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 15 }}>Current Collaborators</Text>
                {weddingData?.collaborators && weddingData.collaborators.length > 0 ? (
                  weddingData.collaborators.map((collab: any) => (
                    <View key={collab._id} style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: '#F0F0F0'
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                          source={collab.profileImage ? { uri: collab.profileImage } : require("../../assets/images/empty_guest.png")}
                          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                        />
                        <View>
                          <Text style={{ fontWeight: '600' }}>{collab.name}</Text>
                          <Text style={{ fontSize: 12, color: '#666' }}>{collab.email}</Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveCollaborator(collab._id)}>
                        <Text style={{ color: '#FF3B30', fontWeight: '600' }}>{t("remove")}</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: '#999', textAlign: 'center', marginTop: 10 }}>{t("no_collaborators")}</Text>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCollabModal(false)}
              >
                <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
              </TouchableOpacity>
            </View>
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
    paddingBottom: 110,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
    flexGrow: 1,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 32,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: "#999",
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  menuContainer: {
    paddingHorizontal: 20,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16, // Increased padding
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  menuItemSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF3B30", // Red color
  },
  lastMenuItem: {
    marginBottom: 0,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: Platform.OS === "web" ? "center" : "flex-end",
    alignItems: Platform.OS === "web" ? "center" : undefined,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: Platform.OS === "web" ? 20 : 0,
    borderBottomRightRadius: Platform.OS === "web" ? 20 : 0,
    width: Platform.OS === "web" ? "90%" : "100%",
    maxWidth: Platform.OS === "web" ? 400 : undefined,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  languageOptions: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#000",
  },
  languageOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  saveButton: {
    flex: 1,
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
