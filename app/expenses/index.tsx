import { useAuth } from "@/contexts/AuthContext";
import { useExpense } from "@/contexts/ExpenseContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { PDFService } from "@/services/PDFService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExpenseListScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { expenses, isLoading } = useExpense();
    const { t } = useLanguage();

    const handleAddExpense = () => {
        if (!user) {
            if (Platform.OS === 'web') {
                if (window.confirm("Login Required\n\nYou need to login to add an expense.")) router.push("/login");
            } else {
                Alert.alert("Login Required", "You need to login to add an expense.", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Login", onPress: () => router.push("/login") }
                ]);
            }
            return;
        }
        router.push("/expenses/add-expense");
    };

    const handleExportPDF = async () => {
        if (!user?.isPremium) {
            Alert.alert(
                "Premium Feature",
                "Exporting expenses to PDF is a premium feature. Upgrade to unlock!",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Upgrade", onPress: () => router.push("/purchase-premium") }
                ]
            );
            return;
        }

        const totalBudget = 0; // TODO: Fetch budget from context if available
        const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

        const html = PDFService.generateExpenseListHTML(expenses, totalBudget, totalSpent);
        await PDFService.generateAndSharePDF(html, "ExpenseList");
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    if (!isLoading && expenses.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.navBar}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.navigate('/(tabs)')}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.navTitle}>{t("expense")}</Text>
                    <View style={styles.placeholder} />
                </View>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.emptyContent}>
                        {/* Use the same empty image style for consistency */}
                        <View style={styles.iconContainer}>
                            <Image source={require('@/assets/images/dollar-circle.png')} style={{ width: 120, height: 120 }} resizeMode="contain" />
                        </View>
                        <Text style={styles.primaryText}>{t("no_expenses_added")}</Text>
                        <Text style={styles.secondaryText}>{t("track_spending")}</Text>
                        <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
                            <Text style={styles.addButtonText}>{t("add_new_expense")}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.navigate('/(tabs)')}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>{t("expense")} ({expenses.length})</Text>
                <TouchableOpacity style={styles.addButtonSmall} onPress={handleAddExpense}>
                    <Ionicons name="add" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.addButtonSmall} onPress={handleExportPDF}>
                    <Ionicons name="document-text-outline" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.listContent}>
                {expenses.map((expense, index) => (
                    <View key={expense._id || index} style={styles.expenseCard}>
                        <View style={styles.iconBox}>
                            <Ionicons name="pricetag-outline" size={20} color="#8A0030" />
                        </View>
                        <View style={styles.expenseInfo}>
                            <Text style={styles.expenseTitle}>{expense.title}</Text>
                            <Text style={styles.expenseCategory}>{expense.category} • {formatDate(expense.date)}</Text>
                        </View>
                        <Text style={styles.expenseAmount}>₹ {expense.amount.toLocaleString()}</Text>
                    </View>
                ))}
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity style={styles.fab} onPress={handleAddExpense}>
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
    placeholder: { width: 40 },
    addButtonSmall: { padding: 8 },
    scrollContent: { flexGrow: 1 },
    listContent: { padding: 20, paddingBottom: 100 },

    // Empty State
    emptyContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingBottom: 64,
    },
    iconContainer: {
        marginBottom: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryText: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000",
        marginBottom: 8,
    },
    secondaryText: {
        fontSize: 14,
        color: "#999",
        marginBottom: 32,
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

    // List Item
    expenseCard: {
        backgroundColor: "#F9F9F9",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(138, 0, 48, 0.1)",
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    expenseInfo: {
        flex: 1,
    },
    expenseTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
        marginBottom: 4,
    },
    expenseCategory: {
        fontSize: 13,
        color: "#666",
    },
    expenseAmount: {
        fontSize: 16,
        fontWeight: "700",
        color: "#8A0030",
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
