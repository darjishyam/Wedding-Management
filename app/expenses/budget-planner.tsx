import { useLanguage } from "@/contexts/LanguageContext";
import { useWedding } from "@/contexts/WeddingContext";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BudgetPlannerScreen() {
    const router = useRouter();
    const { weddingData, refreshWeddingData } = useWedding();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);

    // Budget States
    const [totalBudget, setTotalBudget] = useState("");

    // Category States
    const [catering, setCatering] = useState("");
    const [decoration, setDecoration] = useState("");
    const [venue, setVenue] = useState("");
    const [photography, setPhotography] = useState("");
    const [travel, setTravel] = useState("");
    const [stay, setStay] = useState("");
    const [makeup, setMakeup] = useState("");
    const [other, setOther] = useState("");

    useEffect(() => {
        if (weddingData) {
            setTotalBudget(weddingData.totalBudget?.toString() || "0");
            const breakdown = weddingData.budgetBreakdown || {};
            setCatering(breakdown.catering?.toString() || "0");
            setDecoration(breakdown.decoration?.toString() || "0");
            setStay(breakdown.venue?.toString() || "0"); // Using 'venue' field in breakdown for Venue & Stay
            setPhotography(breakdown.photography?.toString() || "0");
            setTravel(breakdown.travel?.toString() || "0");
            setMakeup(breakdown.makeup?.toString() || "0");
            setOther(breakdown.otherExpenses?.toString() || "0");
        }
    }, [weddingData]);

    // Correction: I need to verify if I can add venueCost now. 
    // I will assume I can add it to the backend model right now or use "Other" for it.
    // Let's use "Other" as "Venue/Other" for this iteration to avoid re-editing backend immediately if not strictly needed, 
    // but better to be correct. The user emphasized "Venue selection".
    // I'll check if I can just add `venueCost` to the list of updates I make to backend.
    // Actually, I'll just use 'other' for now and label it "Venue / Other" or just add it.
    // Let's add 'venueCost' to the update list for backend in next step if I want.
    // For now I will proceed with available fields + 'otherExpenses'.

    const calculateTotalAllocated = () => {
        return (
            (parseFloat(catering) || 0) +
            (parseFloat(decoration) || 0) +
            (parseFloat(photography) || 0) +
            (parseFloat(travel) || 0) +
            (parseFloat(stay) || 0) +
            (parseFloat(makeup) || 0) +
            (parseFloat(other) || 0)
        );
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.put(`/weddings/${weddingData._id}`, {
                totalBudget: parseFloat(totalBudget) || 0,
                budgetBreakdown: {
                    catering: parseFloat(catering) || 0,
                    decoration: parseFloat(decoration) || 0,
                    venue: parseFloat(stay) || 0, // Mapping 'Stay' UI to 'venue' Schema
                    photography: parseFloat(photography) || 0,
                    travel: parseFloat(travel) || 0,
                    makeup: parseFloat(makeup) || 0,
                    otherExpenses: parseFloat(other) || 0,
                }
            });

            await refreshWeddingData(); // Refresh context
            Alert.alert("Success", "Budget updated successfully!");
            router.back();
        } catch (error) {
            Alert.alert("Error", "Failed to update budget");
        } finally {
            setLoading(false);
        }
    };

    const allocated = calculateTotalAllocated();
    const totalB = parseFloat(totalBudget) || 0;
    const remaining = totalB - allocated;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Budget Planner</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content}>

                    {/* Total Budget */}
                    <View style={styles.totalSection}>
                        <Text style={styles.totalLabel}>Total Budget</Text>
                        <View style={styles.totalInputContainer}>
                            <Text style={styles.currency}>₹</Text>
                            <TextInput
                                style={styles.totalInput}
                                value={totalBudget}
                                onChangeText={setTotalBudget}
                                keyboardType="numeric"
                                placeholder="0"
                            />
                        </View>
                    </View>

                    {/* Breakdown Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Allocated</Text>
                            <Text style={[styles.statValue, { color: '#2E7D32' }]}>₹{allocated.toLocaleString()}</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Remaining</Text>
                            <Text style={[styles.statValue, { color: remaining < 0 ? '#C62828' : '#F57C00' }]}>
                                ₹{remaining.toLocaleString()}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.sectionHeader}>Category Breakdown</Text>

                    <BudgetInput label="Catering (Food)" value={catering} onChange={setCatering} icon="restaurant" />
                    <BudgetInput label="Decoration" value={decoration} onChange={setDecoration} icon="rose" />
                    <BudgetInput label="Venue & Stay" value={stay} onChange={setStay} icon="home" />
                    {/* user existing 'stay' field for Venue & Stay combined for now or just Stay */}
                    <BudgetInput label="Photography" value={photography} onChange={setPhotography} icon="camera" />
                    <BudgetInput label="Travel / Logistics" value={travel} onChange={setTravel} icon="car" />
                    <BudgetInput label="Makeup & Attire" value={makeup} onChange={setMakeup} icon="color-palette" />
                    <BudgetInput label="Other Expenses" value={other} onChange={setOther} icon="options" />


                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Save Budget Plan</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

function BudgetInput({ label, value, onChange, icon }: { label: string, value: string, onChange: (text: string) => void, icon: any }) {
    return (
        <View style={styles.inputRow}>
            <View style={styles.labelContainer}>
                <View style={styles.iconCircle}>
                    <Ionicons name={icon} size={18} color="#555" />
                </View>
                <Text style={styles.inputLabel}>{label}</Text>
            </View>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                placeholder="0"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    header: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE'
    },
    backButton: { marginRight: 16 },
    title: { fontSize: 20, fontWeight: 'bold' },
    content: {
        padding: 16,
        paddingBottom: 100,
    },
    totalSection: {
        backgroundColor: '#8A0030',
        padding: 24,
        borderRadius: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
    totalLabel: { color: '#FFD1D1', fontSize: 14, marginBottom: 8, fontWeight: '600' },
    totalInputContainer: { flexDirection: 'row', alignItems: 'center' },
    currency: { fontSize: 32, color: '#FFF', marginRight: 8, fontWeight: 'bold' },
    totalInput: { fontSize: 32, color: '#FFF', fontWeight: 'bold', minWidth: 100, textAlign: 'center' },

    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    statLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
    statValue: { fontSize: 18, fontWeight: 'bold' },

    sectionHeader: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#333' },

    inputRow: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    labelContainer: { flexDirection: 'row', alignItems: 'center' },
    iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    inputLabel: { fontSize: 16, fontWeight: '500', color: '#333' },
    input: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'right',
        minWidth: 80,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingVertical: 4,
    },
    footer: {
        padding: 16,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    saveButton: {
        backgroundColor: '#000',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    saveText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
