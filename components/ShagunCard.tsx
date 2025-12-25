import { useLanguage } from "@/contexts/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ShagunCardProps {
    name: string;
    date: string;
    amount: string | number;
    wishes?: string;
    onPress?: () => void;
}

export default function ShagunCard({ name, date, amount, wishes, onPress }: ShagunCardProps) {
    const { t, convertNumerals } = useLanguage();

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const dateObj = new Date(dateString);
        if (isNaN(dateObj.getTime())) return dateString;

        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day}-${month}-${year}`;
    };

    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="heart" size={16} color="#000" />
                    </View>
                    <Text style={styles.cardTitle}>{name}</Text>
                </View>
                <TouchableOpacity onPress={onPress}>
                    <Ionicons name="ellipsis-vertical" size={20} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsGrid}>
                {/* Marriage Date */}
                <View style={styles.statBox}>
                    <View style={styles.statLabelRow}>
                        <Ionicons name="calendar-outline" size={16} color="#000" />
                        <Text style={styles.statLabel}>{t("marriage_date")}</Text>
                    </View>
                    <Text style={styles.statValue}>{convertNumerals(formatDate(date))}</Text>
                </View>

                {/* Total Chandlo */}
                <View style={styles.statBox}>
                    <View style={styles.statLabelRow}>
                        <Ionicons name="cash-outline" size={16} color="#000" />
                        <Text style={styles.statLabel}>{t("total_chandlo")}</Text>
                    </View>
                    <Text style={styles.statValue}>{amount}</Text>
                </View>
            </View>

            {/* Wishes */}
            <View style={styles.wishesBox}>
                <Text style={styles.wishesLabel}>{t("wishes")}</Text>
                <Text style={styles.wishesValue}>{wishes || t("happy_marriage_life")}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 16,
        marginBottom: 20,
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
        backgroundColor: "#E6E6E6",
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
        backgroundColor: "#EAEAEA",
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
        backgroundColor: "#EAEAEA",
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
});
