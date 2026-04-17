import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import CustomInput from "@/components/CustomInput";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useWedding } from "@/contexts/WeddingContext";
import { useToast } from "@/contexts/ToastContext";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

interface Suggestion {
    title: string;
    amount: number;
    category: string;
    description: string;
    selected?: boolean;
}

export default function AIBudgetPlannerScreen() {
    const router = useRouter();
    const { weddingData, refreshWeddingData } = useWedding();
    const { showToast } = useToast();

    const [budgetGoal, setBudgetGoal] = useState(
        weddingData?.totalBudget?.toString() || ""
    );
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [step, setStep] = useState(1); // 1: Input, 2: Review

    const handleGenerate = async () => {
        if (!budgetGoal || isNaN(Number(budgetGoal)) || Number(budgetGoal) <= 0) {
            showToast("Please enter a valid budget amount", "warning");
            return;
        }

        setIsLoading(true);
        try {
            const res = await api.post("/ai/suggest-budget", {
                totalBudget: Number(budgetGoal),
                weddingId: weddingData?._id
            });

            const enrichedSuggestions = res.data.suggestions.map((s: any) => ({
                ...s,
                selected: true
            }));

            setSuggestions(enrichedSuggestions);
            setStep(2);
        } catch (error: any) {
            console.error(error);
            showToast("Failed to generate suggestions", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelection = (index: number) => {
        const newSuggestions = [...suggestions];
        newSuggestions[index].selected = !newSuggestions[index].selected;
        setSuggestions(newSuggestions);
    };

    const handleApply = async () => {
        if (!weddingData?._id) {
            showToast("Wedding data is still loading. Please wait.", "warning");
            refreshWeddingData(); // Attempt to reload
            return;
        }

        console.log("[AI] Applying budget. Selected suggestions:", suggestions.filter(s => s.selected).length);
        const selectedSuggestions = suggestions.filter(s => s.selected);
        if (selectedSuggestions.length === 0) {
            showToast("Please select at least one item", "warning");
            return;
        }

        const confirmApply = () => {
            setIsApplying(true);
            try {
                console.log("[AI] Sending apply-budget request to backend...");
                api.post("/ai/apply-budget", {
                    weddingId: weddingData?._id,
                    suggestions: selectedSuggestions,
                    totalBudget: Number(budgetGoal)
                }).then(async () => {
                    showToast("Budget Applied Successfully!", "success");
                    await refreshWeddingData(); // Refresh context
                    router.replace("/(tabs)");
                }).catch((err) => {
                    console.error("[AI] Apply Budget API Error:", err);
                    showToast("Failed to apply budget", "error");
                }).finally(() => {
                    setIsApplying(false);
                });
            } catch (error) {
                console.error("[AI] Apply Budget Local Error:", error);
                setIsApplying(false);
            }
        };

        if (Platform.OS === 'web') {
            if (confirm("This will update your wedding's total budget and add these items to your expense list. Do you want to proceed?")) {
                confirmApply();
            }
        } else {
            Alert.alert(
                "Apply Budget?",
                "This will update your wedding's total budget and add these items to your expense list. Existing expenses will not be deleted.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Yes, Apply", onPress: confirmApply }
                ]
            );
        }
    };

    const totalSelected = suggestions
        .filter(s => s.selected)
        .reduce((sum, s) => sum + s.amount, 0);

    return (
        <ScreenWrapper>
            <CustomHeader title="AI Budget Planner" />

            {step === 1 ? (
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.card}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="sparkles" size={40} color="#6C63FF" />
                        </View>
                        <Text style={styles.cardTitle}>Smart Budget Architect</Text>
                        <Text style={styles.cardSubtitle}>
                            Enter your total target budget, and our AI will distribute it across categories based on wedding planning best practices.
                        </Text>

                        <CustomInput
                            label="Total Budget Goal (₹)"
                            placeholder="Ex: 1000000"
                            value={budgetGoal}
                            onChangeText={setBudgetGoal}
                            keyboardType="numeric"
                        />

                        <CustomButton
                            title={isLoading ? "Analyzing..." : "Generate AI Plan"}
                            onPress={handleGenerate}
                            loading={isLoading}
                            style={{ marginTop: 10 }}
                        />
                    </View>

                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={20} color="#666" />
                        <Text style={styles.infoText}>
                            The AI considers your wedding type and location to make category-specific recommendations.
                        </Text>
                    </View>
                </ScrollView>
            ) : (
                <View style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.container}>
                        <View style={styles.reviewHeader}>
                            <Text style={styles.reviewTitle}>AI Recommended Plan</Text>
                            <Text style={styles.reviewSubtitle}>
                                Review and select the items you'd like to add to your plan.
                            </Text>
                        </View>

                        {suggestions.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.suggestionItem, !item.selected && styles.unselectedItem]}
                                onPress={() => toggleSelection(index)}
                            >
                                <View style={styles.itemHeader}>
                                    <View style={styles.itemMain}>
                                        <Text style={styles.itemTitle}>{item.title}</Text>
                                        <Text style={styles.itemCategory}>{item.category}</Text>
                                    </View>
                                    <View style={styles.itemValue}>
                                        <Text style={styles.itemPrice}>₹{item.amount.toLocaleString()}</Text>
                                        <Ionicons 
                                            name={item.selected ? "checkbox" : "square-outline"} 
                                            size={24} 
                                            color={item.selected ? "#6C63FF" : "#DDD"} 
                                        />
                                    </View>
                                </View>
                                <Text style={styles.itemDesc}>{item.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.footer}>
                        <View style={styles.footerStats}>
                            <Text style={styles.totalLabel}>Total Selected:</Text>
                            <Text style={styles.totalValue}>₹{totalSelected.toLocaleString()}</Text>
                        </View>
                        <View style={styles.footerButtons}>
                            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                                <Text style={styles.backBtnText}>Edit Goal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.applyBtn, isApplying && {opacity: 0.7}]} 
                                onPress={handleApply}
                                disabled={isApplying}
                            >
                                {isApplying ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.applyBtnText}>Apply to Wedding</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0EFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    cardSubtitle: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#F0F2F5',
        padding: 16,
        borderRadius: 12,
        marginTop: 24,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    reviewHeader: {
        marginBottom: 20,
    },
    reviewTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    reviewSubtitle: {
        fontSize: 15,
        color: '#666',
        marginTop: 4,
    },
    suggestionItem: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#F0EFFF',
    },
    unselectedItem: {
        opacity: 0.6,
        borderColor: '#F5F5F5',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    itemMain: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#333',
    },
    itemCategory: {
        fontSize: 12,
        color: '#6C63FF',
        fontWeight: '600',
        marginTop: 2,
        textTransform: 'uppercase',
    },
    itemValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    itemPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    itemDesc: {
        fontSize: 13,
        color: '#666',
        marginTop: 8,
        lineHeight: 18,
    },
    footer: {
        backgroundColor: '#FFF',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    footerStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 16,
        color: '#666',
    },
    totalValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    footerButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    backBtn: {
        flex: 1,
        height: 55,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backBtnText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    applyBtn: {
        flex: 2,
        height: 55,
        borderRadius: 28,
        backgroundColor: '#6C63FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyBtnText: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
});
