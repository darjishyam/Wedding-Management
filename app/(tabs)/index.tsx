import DashboardCard from "@/components/DashboardCard";
import { useAuth } from "@/contexts/AuthContext";
import { useExpense } from "@/contexts/ExpenseContext";
import { useGuest } from "@/contexts/GuestContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useShagun } from "@/contexts/ShagunContext";
import { useWedding } from "@/contexts/WeddingContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Dimensions, Image, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function MyWeddingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasWedding, weddingData, weddings, switchWedding, createWedding } = useWedding();
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const { t } = useLanguage();
  // removed useGuest from here

  if (!hasWedding || !weddingData) {
    return (
      <View style={styles.emptyContainer}>
        {/* App Title - stays at top */}
        <Text style={styles.title}>{t("shagun") || "Wedding MS"}</Text>

        {/* Centered Content Wrapper */}
        <View style={styles.emptyContentWrapper}>
          {/* Illustration */}
          <Image
            source={require("../../assets/images/screen4.png")}
            style={styles.illustration}
          />

          {/* Heading */}
          <Text style={styles.heading}>{t("no_wedding_created")}</Text>

          {/* Subtext */}
          <Text style={styles.subtext}>
            {t("start_planning")}
          </Text>

          {/* Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (!user) {
                if (Platform.OS === 'web') {
                  const choice = window.confirm("Login Required\n\nYou need to login to create a wedding.");
                  if (choice) {
                    router.push("/login");
                  }
                } else {
                  Alert.alert(
                    "Login Required",
                    "You need to login to create a wedding.",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Login", onPress: () => router.push("/login") }
                    ]
                  );
                }
                return;
              }
              router.push("/create-wedding");
            }}
          >
            <Text style={styles.buttonText}>{t("create_wedding")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <WeddingDashboard
        weddingData={weddingData}
        onSwitch={() => setShowSwitchModal(true)}
      />

      {/* Switch Wedding Modal */}
      <Modal
        visible={showSwitchModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSwitchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowSwitchModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Switch Wedding</Text>
              <TouchableOpacity onPress={() => setShowSwitchModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* List of Weddings */}
            <ScrollView style={styles.weddingList} contentContainerStyle={{ paddingBottom: 20 }}>
              {weddings.map((w: any) => (
                <TouchableOpacity
                  key={w._id}
                  style={[
                    styles.weddingItem,
                    weddingData?._id === w._id && styles.weddingItemSelected
                  ]}
                  onPress={() => {
                    switchWedding(w._id);
                    setShowSwitchModal(false);
                  }}
                >
                  <View style={styles.weddingInfo}>
                    <Text style={[styles.weddingName, weddingData?._id === w._id && styles.selectedText]}>
                      {w.brideName} & {w.groomName}
                    </Text>
                    <Text style={styles.weddingDate}>
                      {new Date(w.date).toLocaleDateString()}
                    </Text>
                  </View>
                  {weddingData?._id === w._id && (
                    <Ionicons name="checkmark-circle" size={24} color="#000" />
                  )}
                </TouchableOpacity>
              ))}

              {/* Create New Button */}
              <TouchableOpacity
                style={styles.createNewButton}
                onPress={() => {
                  setShowSwitchModal(false);
                  router.push("/create-wedding");
                }}
              >
                <View style={styles.createNewIcon}>
                  <Ionicons name="add" size={20} color="#FFF" />
                </View>
                <Text style={styles.createNewText}>{t("create_wedding")}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}



// ... existing code ...

function WeddingDashboard({ weddingData, onSwitch }: { weddingData: { groomName: string; brideName: string; date: Date, totalBudget: number, startStatistics?: { guestCount: number, totalSpent: number }, _id?: string, brideImage?: string, groomImage?: string, location?: string, type?: string }, onSwitch: () => void }) {
  const router = useRouter();
  const { guests } = useGuest();
  const { totalAmount } = useExpense();
  const { updateBudget, updateWedding } = useWedding();
  const { shagunEntries } = useShagun();
  const { t } = useLanguage();

  const handleUpdateImage = async (isGroom: boolean) => {
    if (!weddingData?._id) return;
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
        await updateWedding(weddingData._id, isGroom ? { groomImage: uri } : { brideImage: uri });
      } catch (e) {
        console.error("Failed to update image", e);
      }
    }
  };

  const totalChandlo = shagunEntries.reduce((sum, entry) => {
    let val = 0;
    if (typeof entry.amount === 'number') {
      val = entry.amount;
    } else if (typeof entry.amount === 'string') {
      val = parseInt(entry.amount.replace(/[₹,\s]/g, "")) || 0;
    }
    return sum + val;
  }, 0);

  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState(weddingData.totalBudget?.toString() || "0");

  const formatDate = (date: Date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const totalSpent = totalAmount || weddingData.startStatistics?.totalSpent || 0;
  const totalBudget = weddingData.totalBudget || 0;

  const handleSaveBudget = async () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val)) {
      await updateBudget(val);
    }
    setShowBudgetModal(false);
  };

  // AI Advisor Logic
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiAdvice, setAiAdvice] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  const handleGetAdvice = async () => {
    setLoadingAi(true);
    setShowAiModal(true); // Open modal immediately to show loader
    try {
      const api = require('@/services/api').default; // dynamic import to avoid potential cycle or just lazy load
      const response = await api.post('/ai/advice', { weddingId: weddingData._id });
      setAiAdvice(response.data.advice);
    } catch (error: any) {
      setAiAdvice("Sorry, I couldn't generate advice right now. Please try again later.");
      Alert.alert("AI Error", error.response?.data?.message || error.message);
    } finally {
      setLoadingAi(false);
    }
  };




  return (
    <SafeAreaView style={styles.dashboardContainer}>
      {/* ... existing Modals ... */}

      <View style={styles.headerArea}>
        <View style={styles.headerArea}>
          <Text style={styles.headerTitle}>Wedding MS</Text>

          <View style={styles.namesRowHeader}>
            <View style={styles.profileImagesContainer}>
              <TouchableOpacity onPress={() => handleUpdateImage(false)} activeOpacity={0.8}>
                <Image
                  source={weddingData.brideImage ? { uri: weddingData.brideImage } : require('../../assets/images/empty_guest.png')}
                  style={[styles.profileImage, styles.brideImage]}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleUpdateImage(true)} activeOpacity={0.8}>
                <Image
                  source={weddingData.groomImage ? { uri: weddingData.groomImage } : require('../../assets/images/empty_guest.png')}
                  style={[styles.profileImage, styles.groomImage]}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.nameDateContainer}>
              <View style={styles.namesRow}>
                <Text style={styles.brideName}>{weddingData.brideName}</Text>
                <Ionicons name="heart-outline" size={16} color="#000" style={styles.ringIcon} />
                <Text style={styles.groomName}>{weddingData.groomName}</Text>
                <TouchableOpacity onPress={onSwitch} style={styles.dropdownButton}>
                  <Ionicons name="chevron-down" size={20} color="#000" />
                </TouchableOpacity>
              </View>
              <Text style={styles.eventDate}>
                {formatDate(new Date(weddingData.date))} • {weddingData.type || 'Traditional'}
              </Text>
              {weddingData.location ? (
                <Text style={styles.eventLocation}>
                  <Ionicons name="location-outline" size={12} color="#888" /> {weddingData.location}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.whiteContainer}
        contentContainerStyle={styles.whiteContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Shagun Book Card */}
        <DashboardCard
          title={t("shagun_book")}
          icon="book"
          onPress={() => router.push("/(tabs)/chandla")}
          style={{ backgroundColor: "#FCE9B0" }}
        >
          <StatBox
            label={t("people")}
            value={shagunEntries.length}
            icon="person"
            style={{ backgroundColor: "rgba(244, 222, 156, 0.6)" }}
          />
          <StatBox
            label={t("total_chandlo")}
            value={`₹ ${totalChandlo.toLocaleString()}`}
            icon="cash"
            style={{ backgroundColor: "rgba(244, 222, 156, 0.6)" }}
          />
        </DashboardCard>

        {/* Expense Card */}
        {totalBudget === 0 ? (
          <DashboardCard
            title={t("expense")}
            icon="wallet"
            onPress={() => {
              // Navigate to Budget Planner instead of simple modal
              router.push("/expenses/budget-planner" as any);
            }}
            style={{ backgroundColor: "#FADADD" }}
          >
            <View style={[styles.emptyContentCentered, { width: '100%' }]}>
              <View style={styles.addIconCircle}>
                <Ionicons name="add" size={30} color="#000" />
              </View>
              <Text style={styles.emptyActionText}>{t("set_budget")}</Text>
            </View>
          </DashboardCard>
        ) : (
          <DashboardCard
            title={t("expense")}
            icon="wallet"
            onPress={() => router.push("/expenses")}
            rightElement={
              <TouchableOpacity onPress={() => router.push("/expenses/budget-planner" as any)} style={{ padding: 4 }}>
                <Ionicons name="settings-outline" size={18} color="#000" />
              </TouchableOpacity>
            }
            style={{ backgroundColor: "#FADADD" }}
          >
            <StatBox
              label={t("total_budget")}
              value={`₹ ${totalBudget.toLocaleString()}`}
              imageSource={require("../../assets/images/dollar-circle.png")}
              style={{ backgroundColor: "hsla(349, 63%, 86%, 0.60)" }}
              imageStyle={{ width: 35, height: 35, tintColor: '#000' }}
            />
            <StatBox
              label={t("spent")}
              value={`₹ ${totalSpent.toLocaleString()}`}
              imageSource={require("../../assets/images/money-send.png")}
              style={{ backgroundColor: "rgba(242, 198, 206, 0.6)" }}
              imageStyle={{ width: 35, height: 35, tintColor: '#000' }}
            />
          </DashboardCard>
        )}


        {/* Guest List Card */}
        <DashboardCard
          title={t("invitation") || "Invitation"}
          icon="paper-plane"
          onPress={() => router.push("/invitation-list")}
          style={{ backgroundColor: "#DFF1FF" }}
        >
          <StatBox
            label={t("invitation_sent")}
            value={guests.filter((g: any) => g.status === 'Invited' || g.status === 'Confirmed').length}
            imageSource={require("../../assets/images/direct-send.png")}
            style={{ backgroundColor: "rgba(203, 230, 248, 0.6)" }}
          />
          <StatBox
            label={t("total_guest")}
            value={guests.reduce((sum: any, guest: any) => sum + (guest.familyCount || 1), 0)}
            imageSource={require("../../assets/images/empty_guest.png")}
            style={{ backgroundColor: "rgba(203, 230, 248, 0.6)" }}
            imageStyle={{ width: 35, height: 35, tintColor: '#000' }}
          />
        </DashboardCard>

        {/* Digital Invitations Card */}
        <DashboardCard
          title={t("digital_invite") || "Digital Invitations"}
          icon="color-palette"
          onPress={() => router.push("/invitations" as any)}
          style={{ backgroundColor: "#FCEAFF" }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#6A1B9A' }}>Create e-Cards</Text>
              <Text style={{ fontSize: 12, color: '#8E24AA', marginTop: 4 }}>Traditional, Modern & More</Text>
            </View>
            <Ionicons name="card" size={32} color="rgba(106, 27, 154, 0.3)" />
          </View>
        </DashboardCard>

        {/* Events Card */}
        <DashboardCard
          title="Events"
          icon="calendar"
          onPress={() => router.push("/events" as any)}
          style={{ backgroundColor: "#E1BEE7" }}
          rightElement={
            <TouchableOpacity onPress={() => router.push("/events/add-event" as any)} style={{ padding: 4 }}>
              <Ionicons name="add-circle" size={22} color="#4A148C" />
            </TouchableOpacity>
          }
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#4A148C' }}>Manage Ceremonies</Text>
              <Text style={{ fontSize: 12, color: '#6A1B9A', marginTop: 4 }}>Haldi, Sangeet, Wedding...</Text>
            </View>
            <Ionicons name="musical-notes" size={32} color="rgba(74, 20, 140, 0.3)" />
          </View>
        </DashboardCard>

        {/* Vendors Card */}
        <DashboardCard
          title="Vendors"
          icon="briefcase"
          onPress={() => router.push("/vendors" as any)}
          style={{ backgroundColor: "#FFE0B2" }}
          rightElement={
            <TouchableOpacity onPress={() => router.push("/vendors/add-vendor" as any)} style={{ padding: 4 }}>
              <Ionicons name="add-circle" size={22} color="#E65100" />
            </TouchableOpacity>
          }
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#E65100' }}>Manage Services</Text>
              <Text style={{ fontSize: 12, color: '#EF6C00', marginTop: 4 }}>Catering, Decor, Photo...</Text>
            </View>
            <Ionicons name="camera" size={32} color="rgba(230, 81, 0, 0.3)" />
          </View>
        </DashboardCard>
        <DashboardCard
          title={t("wedding_ai") || "AI Wedding Advisor"}
          icon="sparkles"
          onPress={() => router.push('/ai-chat' as any)}
          style={{ backgroundColor: "#E0F7FA" }}
          rightElement={
            <Ionicons name="logo-google" size={18} color="#00796B" style={{ opacity: 0.6 }} />
          }
        >
          {/* ... existing AI Content ... */}
          <View style={{ padding: 10 }}>
            <Text style={{ fontSize: 14, color: '#006064', lineHeight: 20 }}>
              {t("ai_desc") || "Get personalized budget tips and timeline advice powered by Gemini AI."}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/ai-chat' as any)}
              style={{
                marginTop: 12,
                backgroundColor: '#00796B',
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <Ionicons name="chatbubbles" size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{t("start_chat") || "Start Chat"}</Text>
            </TouchableOpacity>
          </View>
        </DashboardCard>



      </ScrollView>

      {/* ... existing Budget Modal ... */}
    </SafeAreaView >
  );
}

// Add new styles at the bottom
// const styles = StyleSheet.create({ ... existing ...
//    packageCard: { width: 220, backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#EEE' },
//    packageImage: { width: '100%', height: 120 },
//    packageContent: { padding: 12 },
//    pkgName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
//    pkgPrice: { fontSize: 14, color: '#2E7D32', fontWeight: '700', marginTop: 4 },
//    pkgLoc: { fontSize: 12, color: '#666', marginTop: 2 },
//    addButton: { marginTop: 12, backgroundColor: '#000', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
//    addButtonText: { color: '#FFF', fontSize: 12, fontWeight: '600' }
// });



function StatBox({ label, value, icon, imageSource, style, imageStyle }: { label: string, value: string | number, icon?: any, imageSource?: any, style?: any, imageStyle?: any }) {
  return (
    <View style={[{
      flex: 1,
      backgroundColor: "rgba(255,255,255,0.5)",
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 10,
      marginRight: 10,
      justifyContent: "space-between"
    }, style]}>
      {/* Icon or Image */}
      <View style={{ marginBottom: 8 }}>
        {icon ? (
          <Ionicons name={icon} size={20} color="#000" />
        ) : (
          <Image
            source={imageSource}
            style={[{ width: 36, height: 36, resizeMode: 'contain' }, imageStyle]}
          />
        )}
      </View>
      <View>
        <Text style={{ fontSize: 12, color: "#555", marginBottom: 2 }}>{label}</Text>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#000" }}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  emptyContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 60, // Push title down from safe area
  },
  emptyContentWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 60, // Balance the visual center against the title
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#8A0030",
    alignSelf: "flex-start",
  },
  illustration: {
    width: 120,
    height: 120,
    marginTop: 40,
    marginBottom: 20,
    resizeMode: "contain",
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
  },
  subtext: {
    color: "#777",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 14,
    paddingHorizontal: 45,
    borderRadius: 30,
    marginTop: 25,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Dashboard Styles
  dashboardContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5", // Light grey background for top part
  },
  headerArea: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#8A0030",
    marginBottom: 20,
  },
  namesRowHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImagesContainer: {
    flexDirection: "row",
    marginRight: 10,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  brideImage: {
    zIndex: 2,
  },
  groomImage: {
    marginLeft: -15, // Overlap
    zIndex: 1,
  },
  nameDateContainer: {
    flex: 1,
    justifyContent: "center",
  },
  namesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  brideName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  ringIcon: {
    marginHorizontal: 8,
  },
  groomName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  eventDate: {
    fontSize: 13,
    color: "#888",
  },
  eventLocation: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  dropdownButton: {
    padding: 4,
  },

  // White Container for Cards
  whiteContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 24,
  },
  whiteContent: {
    paddingHorizontal: 20,
    paddingBottom: 110, // Clearance for Footer
  },

  // Replaced styling for card internals
  // emptyContentCentered used for "Set Budget" state
  emptyContentCentered: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  addIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  // Modal Styles
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
    maxHeight: "60%",
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
  weddingList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  weddingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  weddingItemSelected: {
    backgroundColor: "#FAFAFA",
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  weddingInfo: {
    flex: 1,
  },
  weddingName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  selectedText: {
    color: "#8A0030",
    fontWeight: "700",
  },
  weddingDate: {
    fontSize: 13,
    color: "#888",
  },
  createNewButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 12,
  },
  createNewIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  createNewText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});
