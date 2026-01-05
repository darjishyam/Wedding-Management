import { useAuth } from "@/contexts/AuthContext";
import { useExpense } from "@/contexts/ExpenseContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWedding } from "@/contexts/WeddingContext";
import { PDFService } from "@/services/PDFService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExpenseListScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { expenses, isLoading } = useExpense();
    const { weddingData } = useWedding();
    const { t } = useLanguage();

    // Packages Logic
    const [packages, setPackages] = useState<any[]>([]);
    const [loadingPackages, setLoadingPackages] = useState(true);

    useEffect(() => {
        if (weddingData?._id) fetchPackages();
    }, [weddingData?._id]);

    const fetchPackages = async () => {
        try {
            const api = require('@/services/api').default;
            const res = await api.get('/packages');
            setPackages(res.data);
        } catch (error) {
            console.error("Failed to fetch packages", error);
        } finally {
            setLoadingPackages(false);
        }
    };

    const handleAddPackage = async (pkg: any) => {
        try {
            const api = require('@/services/api').default;

            if (Platform.OS === 'web') {
                if (!window.confirm(`Add "${pkg.name}" to your expenses? This will add ₹${pkg.totalPrice} to your budget plan.`)) return;
            } else {
                // Native confirmation could be added here
            }

            const expensesToAdd = [
                { title: `Package: ${pkg.name} - Catering`, amount: pkg.items.catering, category: 'Food' },
                { title: `Package: ${pkg.name} - Decoration`, amount: pkg.items.decoration, category: 'Decoration' },
                { title: `Package: ${pkg.name} - Stay`, amount: pkg.items.stay, category: 'Venue' },
            ];

            // Use the refresh function from context if available, or force reload somehow.
            // But API post works.
            for (const item of expensesToAdd) {
                if (item.amount > 0) {
                    await api.post('/expenses', {
                        title: item.title,
                        amount: item.amount,
                        category: item.category,
                        date: new Date(),
                        notes: `Added from Standard Package: ${pkg.name}`,
                        weddingId: weddingData?._id
                    });
                }
            }

            if (Platform.OS === 'web') {
                window.alert("Expenses added! Refreshing list...");
                window.location.reload(); // Simple way to refresh specific to web, or rely on context
            } else {
                Alert.alert("Success", "Package expenses added to your plan!");
                router.replace('/expenses'); // Trigger refresh by nav toggle? 
            }
            // Ideally we call fetchExpenses() from context but it's not exposed right now.

        } catch (error: any) {
            console.error("Add Package Error", error);
            if (Platform.OS === 'web') window.alert("Failed to add package");
            else Alert.alert("Error", "Failed to add package");
        }
    };

    const handleAddExpense = () => {
        if (!user) {
            Alert.alert("Login Required", "Please login to continue.");
            return;
        }
        router.push("/expenses/add-expense");
    };

    const handleExportPDF = async () => {
        if (!user?.isPremium) {
            Alert.alert("Premium Feature", "Upgrade to export PDF.", [
                { text: "Cancel", style: "cancel" },
                { text: "Upgrade", onPress: () => router.push("/purchase-premium") }
            ]);
            return;
        }
        // Calculate Budget vs Actual
        const totalBudget = weddingData?.budget?.total || 0;
        const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

        const html = PDFService.generateExpenseListHTML(expenses, totalBudget, totalSpent);
        await PDFService.generateAndSharePDF(html, "BudgetReport");
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.navigate('/(tabs)')}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>{t("expense")}</Text>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={styles.addButtonSmall} onPress={handleAddExpense}>
                        <Ionicons name="add" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addButtonSmall} onPress={handleExportPDF}>
                        <Ionicons name="document-text-outline" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* 1. Featured Packages Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Standard Packages</Text>
                    {loadingPackages ? (
                        <ActivityIndicator color="#8A0030" />
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
                            {packages.map((pkg) => (
                                <View key={pkg._id} style={styles.packageCard}>
                                    <Image source={{ uri: pkg.image }} style={styles.packageImage} />
                                    <View style={styles.packageContent}>
                                        <Text style={styles.pkgName} numberOfLines={1}>{pkg.name}</Text>
                                        <Text style={styles.pkgPrice}>₹ {pkg.totalPrice?.toLocaleString()}</Text>
                                        <Text style={styles.pkgLoc}>{pkg.location}</Text>
                                        <TouchableOpacity style={styles.addPkgButton} onPress={() => handleAddPackage(pkg)}>
                                            <Text style={styles.addPkgText}>+ Add</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* 2. My Expenses List */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>My Expenses ({expenses.length})</Text>

                    {expenses.length === 0 ? (
                        <View style={styles.emptyInline}>
                            <Text style={styles.secondaryText}>No expenses added yet.</Text>
                        </View>
                    ) : (
                        expenses.map((expense, index) => (
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
                        ))
                    )}
                </View>

            </ScrollView>

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
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    backButton: { padding: 8, marginLeft: -8 },
    navTitle: { fontSize: 18, fontWeight: "700", color: "#000" },
    addButtonSmall: { padding: 8 },

    scrollContent: { paddingBottom: 100 },

    sectionContainer: {
        paddingTop: 20,
        paddingLeft: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 12,
    },

    // Package Style
    packageCard: {
        width: 160,
        backgroundColor: '#FFF',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EEE',
        marginRight: 4,
    },
    packageImage: { width: '100%', height: 100, backgroundColor: '#EEE' },
    packageContent: { padding: 8 },
    pkgName: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
    pkgPrice: { fontSize: 12, color: '#2E7D32', fontWeight: '700' },
    pkgLoc: { fontSize: 10, color: '#666', marginBottom: 6 },
    addPkgButton: { backgroundColor: '#000', borderRadius: 6, paddingVertical: 6, alignItems: 'center' },
    addPkgText: { color: '#FFF', fontSize: 10, fontWeight: '700' },

    emptyInline: {
        padding: 20,
        alignItems: 'center',
    },
    secondaryText: { color: '#999', fontSize: 14 },

    // Expense Card
    expenseCard: {
        backgroundColor: "#F9F9F9",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        marginRight: 20, // Add right margin as section has left padding
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
    expenseInfo: { flex: 1 },
    expenseTitle: { fontSize: 16, fontWeight: "600", color: "#000", marginBottom: 4 },
    expenseCategory: { fontSize: 13, color: "#666" },
    expenseAmount: { fontSize: 16, fontWeight: "700", color: "#8A0030" },

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
