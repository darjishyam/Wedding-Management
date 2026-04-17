import { useAuth } from "@/contexts/AuthContext";
import { useExpense } from "@/contexts/ExpenseContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWedding } from "@/contexts/WeddingContext";
import { PDFService } from "@/services/PDFService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExpenseListScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { expenses, isLoading, updateExpense, deleteExpense } = useExpense();
    const { weddingData } = useWedding();
    const { t } = useLanguage();

    // Edit State
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingExpense, setEditingExpense] = useState<any>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editAmount, setEditAmount] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

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

    const handleEditPress = (expense: any) => {
        setEditingExpense(expense);
        setEditTitle(expense.title);
        setEditAmount(expense.amount.toString());
        setEditCategory(expense.category);
        setEditModalVisible(true);
    };

    const handleUpdateExpense = async () => {
        if (!editTitle || !editAmount || !editCategory) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        setIsUpdating(true);
        try {
            await updateExpense(editingExpense._id, {
                title: editTitle,
                amount: parseFloat(editAmount),
                category: editCategory
            });
            setEditModalVisible(false);
            Alert.alert("Success", "Expense updated");
        } catch (error: any) {
            Alert.alert("Error", "Failed to update expense");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteExpense = (id: string) => {
        Alert.alert(
            "Delete Expense",
            "Are you sure you want to remove this expense?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteExpense(id);
                        } catch (error: any) {
                            Alert.alert("Error", "Failed to delete expense");
                        }
                    }
                }
            ]
        );
    };

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
                                    
                                    <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                                        <TouchableOpacity onPress={() => handleEditPress(expense)}>
                                            <Ionicons name="create-outline" size={16} color="#007AFF" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteExpense(expense._id)}>
                                            <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <Text style={styles.expenseAmount}>₹ {expense.amount.toLocaleString()}</Text>
                            </View>
                        ))
                    )}
                </View>

            </ScrollView>

            {/* Edit Expense Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Expense</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>Title</Text>
                        <TextInput
                            style={styles.input}
                            value={editTitle}
                            onChangeText={setEditTitle}
                            placeholder="Expense Title"
                        />

                        <Text style={styles.inputLabel}>Amount (₹)</Text>
                        <TextInput
                            style={styles.input}
                            value={editAmount}
                            onChangeText={setEditAmount}
                            placeholder="Amount"
                            keyboardType="numeric"
                        />

                        <Text style={styles.inputLabel}>Category</Text>
                        <View style={styles.categoryContainer}>
                            {['Food', 'Venue', 'Decoration', 'Clothing', 'Photography', 'Other'].map((cat) => (
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
                            onPress={handleUpdateExpense}
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
    }
});
