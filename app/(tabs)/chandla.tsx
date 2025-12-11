import { RangeSlider } from "@/components/RangeSlider";
import { useShagun } from "@/contexts/ShagunContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyChandlaScreen() {
  const router = useRouter();
  const { shagunEntries } = useShagun();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortName, setSortName] = useState("");
  const [shagunLow, setShagunLow] = useState(0);
  const [shagunHigh, setShagunHigh] = useState(10000);

  const formatDate = (dateString: string) => {
    // Format: "14-02-2025" -> "01-04-2025" style
    if (!dateString) return "";
    const date = new Date(dateString);
    // Check if valid date
    if (isNaN(date.getTime())) return dateString; // Fallback if already formatted string

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const extractAmount = (amountString: string): number => {
    const numericValue = amountString.replace(/[₹,\s]/g, "");
    return parseInt(numericValue) || 0;
  };

  const filteredEntries = useMemo(() => {
    let filtered = shagunEntries.filter((entry) => {
      const matchesSearch =
        entry.brideName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.groomName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesName = !sortName ||
        entry.brideName.toLowerCase().includes(sortName.toLowerCase()) ||
        entry.groomName.toLowerCase().includes(sortName.toLowerCase());

      const amount = extractAmount(entry.amount);
      const matchesAmount = amount >= shagunLow && amount <= shagunHigh;

      return matchesSearch && matchesName && matchesAmount;
    });

    return filtered;
  }, [shagunEntries, searchQuery, sortName, shagunLow, shagunHigh]);

  const handleReset = () => {
    setSortName("");
    setShagunLow(0);
    setShagunHigh(10000);
  };

  const handleNext = () => {
    setShowSortModal(false);
  };

  // Empty state handling remains if needed, but for now focusing on list view implementation
  // You can wrap the empty check if you want to preserve the empty state view when 0 entries

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Shagun</Text>
      </View>

      {shagunEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            {/* Decorative Elements */}
            <View style={[styles.decorativeDot, { top: 30, left: 50 }]} />
            <View style={[styles.decorativeDot, { top: 70, right: 60 }]} />
            <View style={[styles.decorativeDot, { bottom: 50, left: 40 }]} />
            <View style={[styles.decorativeDot, { bottom: 70, right: 50 }]} />

            {/* Main Icon */}
            <Ionicons name="book-outline" size={100} color="#E0E0E0" />
          </View>
          <Text style={styles.emptyTitle}>No Chandla Added</Text>
          <Text style={styles.emptySubtext}>Add your chandla</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push("/add-shagun")}
          >
            <Text style={styles.emptyButtonText}>Add Shagun</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={24} color="#000" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Sort Row */}
          <View style={styles.sortRow}>
            <Text style={styles.countText}>{filteredEntries.length} Shagun</Text>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowSortModal(true)}
            >
              <Ionicons name="swap-vertical-outline" size={18} color="#000" />
              <Text style={styles.sortButtonText}>Sort</Text>
            </TouchableOpacity>
          </View>

          {/* List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredEntries.map((entry) => (
              <View key={entry.id} style={styles.card}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.iconCircle}>
                      <Ionicons name="heart" size={16} color="#000" />
                    </View>
                    <Text style={styles.cardTitle}>
                      {entry.brideName} {entry.groomName ? `Weds ${entry.groomName}` : ""}
                    </Text>
                  </View>
                  <TouchableOpacity>
                    <Ionicons name="ellipsis-vertical" size={20} color="#000" />
                  </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                  {/* Marriage Date */}
                  <View style={styles.statBox}>
                    <View style={styles.statLabelRow}>
                      <Ionicons name="calendar-outline" size={16} color="#000" />
                      <Text style={styles.statLabel}>Marriage Date</Text>
                    </View>
                    <Text style={styles.statValue}>{formatDate(entry.date)}</Text>
                  </View>

                  {/* Total Chandlo */}
                  <View style={styles.statBox}>
                    <View style={styles.statLabelRow}>
                      <Ionicons name="cash-outline" size={16} color="#000" />
                      <Text style={styles.statLabel}>Total Chandlo</Text>
                    </View>
                    <Text style={styles.statValue}>{entry.amount}</Text>
                  </View>
                </View>

                {/* Wishes Box */}
                <View style={styles.wishesBox}>
                  <Text style={styles.wishesLabel}>Wishes</Text>
                  <Text style={styles.wishesValue}>{entry.wishes || "happy marriage life"}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Bottom Footer Area (for navigation spacing) */}
          <View style={{ height: 80 }} />

          {/* Floating Action Button */}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push("/add-shagun")}
          >
            <Ionicons name="add" size={30} color="#FFF" />
          </TouchableOpacity>
        </>
      )}

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowSortModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.sortOption}>
                <Text style={styles.sortOptionLabel}>Name</Text>
                <TextInput
                  style={styles.sortInput}
                  placeholder="Name"
                  placeholderTextColor="#999"
                  value={sortName}
                  onChangeText={setSortName}
                />
              </View>

              <View style={styles.sortOption}>
                <Text style={styles.sortOptionLabel}>Shagun</Text>
                <RangeSlider
                  min={0}
                  max={10000}
                  lowValue={shagunLow}
                  highValue={shagunHigh}
                  onValueChange={(low, high) => {
                    setShagunLow(low);
                    setShagunHigh(high);
                  }}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>Next</Text>
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
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 55,
    backgroundColor: "#FAFAFA",
    borderRadius: 30, // Fully rounded search bar
    paddingHorizontal: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    height: "100%",
  },
  sortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  countText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    gap: 6,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF", // White card
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    // Soft shadow
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.05)",
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E6E6E6", // Light grey circle
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#EAEAEA", // Grey background for stats
    borderRadius: 16,
    padding: 12,
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
  wishesBox: {
    backgroundColor: "#EAEAEA", // Grey background for wishes
    borderRadius: 16,
    padding: 12,
    width: "100%",
  },
  wishesLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  wishesValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
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
    maxHeight: "80%",
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
  modalScrollView: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sortOption: {
    marginBottom: 24,
  },
  sortOptionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  sortInput: {
    height: 55,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#FFFFFF",
  },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  resetButton: {
    flex: 1,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  nextButton: {
    flex: 1,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  fab: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 110 : 90, // Above tab bar
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
        cursor: "pointer",
      },
    }),
  },
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    marginTop: -40, // Visual adjustment
  },
  emptyIconContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  decorativeDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E0E0E0",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#888",
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: "#000",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: "100%",
    maxWidth: 250,
    alignItems: "center",
  },
  emptyButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
