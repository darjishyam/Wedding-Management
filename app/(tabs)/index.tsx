import DashboardCard from "@/components/DashboardCard";
import StatBox from "@/components/StatBox";
import { useAuth } from "@/contexts/AuthContext";
import { useExpense } from "@/contexts/ExpenseContext";
import { useGuest } from "@/contexts/GuestContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useShagun } from "@/contexts/ShagunContext";
import { useWedding } from "@/contexts/WeddingContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Dimensions, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
        <Text style={styles.title}>{t("shagun")}</Text>

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



function WeddingDashboard({ weddingData, onSwitch }: { weddingData: { groomName: string; brideName: string; date: Date, totalBudget: number, startStatistics?: { guestCount: number, totalSpent: number }, _id?: string }, onSwitch: () => void }) {
  const router = useRouter();
  const { guests } = useGuest();
  const { totalAmount } = useExpense();
  const { updateBudget } = useWedding();
  const { shagunEntries } = useShagun();
  const { t } = useLanguage();

  const totalChandlo = shagunEntries.reduce((sum, entry) => {
    const val = parseInt(entry.amount.replace(/[₹,\s]/g, "")) || 0;
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
  // const remainingBudget = totalBudget - totalSpent; 

  // Wait, user asked to remove "remaining" logic in a previous step? 
  // Checking previous task.md or summary... 
  // "Context: Refine Budget Display - When budget is set, display Total Budget and Spent, removing Remaining".
  // So yes, I will stick to that logic here.

  const handleSaveBudget = async () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val)) {
      await updateBudget(val);
    }
    setShowBudgetModal(false);
  };

  return (
    <SafeAreaView style={styles.dashboardContainer}>
      {/* Header Area */}
      <View style={styles.headerArea}>
        <Text style={styles.headerTitle}>{t("shagun")}</Text>

        {/* Names Row */}
        <View style={styles.namesRowHeader}>
          <View style={styles.profileImagesContainer}>
            <Image
              source={require("../../assets/images/bride.jpg")}
              style={[styles.profileImage, styles.brideImage]}
            />
            <Image
              source={require("../../assets/images/groom.jpg")}
              style={[styles.profileImage, styles.groomImage]}
            />
          </View>

          <View style={styles.nameDateContainer}>
            <View style={styles.namesRow}>
              <Text style={styles.brideName}>{weddingData.brideName}</Text>
              <Image
                source={require("../../assets/images/mdi_ring.png")}
                style={{ width: 20, height: 20, marginHorizontal: 8, resizeMode: "contain" }}
              />
              <Text style={styles.groomName}>{weddingData.groomName}</Text>
            </View>
            <Text style={styles.eventDate}>{formatDate(weddingData.date)}</Text>
          </View>

          <TouchableOpacity style={styles.dropdownButton} onPress={onSwitch}>
            <Ionicons name="chevron-down" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* White Content Container */}
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
              setBudgetInput("0");
              setShowBudgetModal(true);
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
              <TouchableOpacity onPress={() => { setBudgetInput(totalBudget.toString()); setShowBudgetModal(true); }} style={{ padding: 4 }}>
                <Ionicons name="pencil" size={18} color="#000" />
              </TouchableOpacity>
            }
            style={{ backgroundColor: "#FADADD" }}
          >
            <StatBox
              label={t("total_budget")}
              value={`₹ ${totalBudget.toLocaleString()}`}
              imageSource={require("../../assets/images/dollar-circle.png")}
              style={{ backgroundColor: "rgba(242, 198, 206, 0.6)" }}
            />
            <StatBox
              label={t("spent")}
              value={`₹ ${totalSpent.toLocaleString()}`}
              imageSource={require("../../assets/images/money-send.png")}
              style={{ backgroundColor: "rgba(242, 198, 206, 0.6)" }}
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
            value={guests.filter(g => g.isInvited).length}
            imageSource={require("../../assets/images/direct-send.png")}
            style={{ backgroundColor: "rgba(203, 230, 248, 0.6)" }}
          />
          <StatBox
            label={t("total_guest")}
            value={guests.reduce((sum, guest) => sum + (guest.familyCount || 1), 0)}
            imageSource={require("../../assets/images/empty_guest.png")}
            style={{ backgroundColor: "rgba(203, 230, 248, 0.6)" }}
          />
        </DashboardCard>

      </ScrollView>

      {/* Budget Modal */}
      <Modal
        visible={showBudgetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBudgetModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { padding: 20 }]}>
              <Text style={[styles.modalTitle, { marginBottom: 15 }]}>{t("set_budget")}</Text>
              <TextInput
                value={budgetInput}
                onChangeText={setBudgetInput}
                keyboardType="numeric"
                style={{
                  borderWidth: 1, borderColor: '#DDD', borderRadius: 8,
                  padding: 12, fontSize: 18, marginBottom: 20
                }}
                placeholder={t("enter_budget_amount")}
              />
              <TouchableOpacity
                onPress={handleSaveBudget}
                style={{ backgroundColor: '#000', padding: 15, borderRadius: 10, alignItems: 'center' }}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{t("save_budget")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowBudgetModal(false)}
                style={{ marginTop: 15, alignItems: 'center' }}
              >
                <Text style={{ color: '#666' }}>{t("cancel")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
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
