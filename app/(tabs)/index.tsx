import { useWedding } from "@/contexts/WeddingContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function MyWeddingScreen() {
  const router = useRouter();
  const { hasWedding, weddingData } = useWedding();

  if (!hasWedding || !weddingData) {
    return (
      <View style={styles.emptyContainer}>
        {/* App Title */}
        <Text style={styles.title}>Shagun</Text>

        {/* Illustration */}
        <Image
          source={require("../../assets/images/screen4.png")}
          style={styles.illustration}
        />

        {/* Heading */}
        <Text style={styles.heading}>No Wedding Created</Text>

        {/* Subtext */}
        <Text style={styles.subtext}>
          Let's Start Your Wedding Planing Now
        </Text>

        {/* Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/create-wedding")}
        >
          <Text style={styles.buttonText}>Create Wedding</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <WeddingDashboard weddingData={weddingData} />;
}

function WeddingDashboard({ weddingData }: { weddingData: { groomName: string; brideName: string; date: Date } }) {
  const router = useRouter();

  const formatDate = (date: Date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  return (
    <SafeAreaView style={styles.dashboardContainer}>
      {/* Header Area */}
      <View style={styles.headerArea}>
        <Text style={styles.headerTitle}>Shagun</Text>

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
              <Ionicons name="heart" size={14} color="#000" style={styles.ringIcon} />
              <Text style={styles.groomName}>{weddingData.groomName}</Text>
            </View>
            <Text style={styles.eventDate}>{formatDate(weddingData.date)}</Text>
          </View>

          <TouchableOpacity style={styles.dropdownButton}>
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
        <TouchableOpacity
          style={[styles.card, styles.shagunBookCard]}
          onPress={() => router.push("/(tabs)/chandla")}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="book" size={18} color="#000" />
            </View>
            <Text style={styles.cardTitle}>Shagun Book</Text>
          </View>
          <View style={styles.cardInternalRow}>
            <View style={[styles.statBox, styles.shagunStatBox]}>
              <Ionicons name="person-outline" size={20} color="#000" style={styles.statIcon} />
              <Text style={styles.statLabel}>People</Text>
              <Text style={styles.statValue}>20</Text>
            </View>
            <View style={[styles.statBox, styles.shagunStatBox]}>
              <Ionicons name="cash-outline" size={20} color="#000" style={styles.statIcon} />
              <Text style={styles.statLabel}>Total Chandlo</Text>
              <Text style={styles.statValue}>₹ 2,000</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Expense Card */}
        <TouchableOpacity
          style={[styles.card, styles.expenseCard]}
          onPress={() => router.push("/expenses")}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="wallet" size={18} color="#000" />
            </View>
            <Text style={styles.cardTitle}>Expense</Text>
          </View>
          <View style={styles.cardInternalRow}>
            <View style={[styles.statBox, styles.expenseStatBox]}>
              <Ionicons name="cash-outline" size={20} color="#000" style={styles.statIcon} />
              <Text style={styles.statLabel}>Total Budget</Text>
              <Text style={styles.statValue}>20</Text>
            </View>
            <View style={[styles.statBox, styles.expenseStatBox]}>
              <Ionicons name="refresh-outline" size={20} color="#000" style={styles.statIcon} />
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={styles.statValue}>₹ 2,000</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Invitation Card */}
        <TouchableOpacity
          style={[styles.card, styles.invitationCard]}
          onPress={() => router.push("/invitation-list")}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="paper-plane" size={18} color="#000" />
            </View>
            <Text style={styles.cardTitle}>Invitation</Text>
          </View>
          <View style={styles.cardInternalRow}>
            <View style={[styles.statBox, styles.invitationStatBox]}>
              <Ionicons name="send-outline" size={20} color="#000" style={styles.statIcon} />
              <Text style={styles.statLabel}>Invitation Sent</Text>
              <Text style={styles.statValue}>20</Text>
            </View>
            <View style={[styles.statBox, styles.invitationStatBox]}>
              <Ionicons name="people-outline" size={20} color="#000" style={styles.statIcon} />
              <Text style={styles.statLabel}>Total Guest</Text>
              <Text style={styles.statValue}>₹ 2,000</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 110 : 100,
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

  // Card Styles
  card: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
  },
  shagunBookCard: {
    backgroundColor: "#FCE9B0",
  },
  expenseCard: {
    backgroundColor: "#FADADD",
  },
  invitationCard: {
    backgroundColor: "#DFF1FF",
    // Remove extra margin bottom as scrollview padding handles clearance
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  // Internal Row
  cardInternalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    height: 110,
    justifyContent: "space-between",
  },
  shagunStatBox: {
    backgroundColor: "rgba(244, 222, 156, 0.6)", // #F4DE9C darker yellow
  },
  expenseStatBox: {
    backgroundColor: "rgba(242, 198, 206, 0.6)", // #F2C6CE darker pink
  },
  invitationStatBox: {
    backgroundColor: "rgba(203, 230, 248, 0.6)", // #CBE6F8 darker blue
  },
  statIcon: {
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
});
