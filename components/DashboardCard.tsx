import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DashboardCardProps {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
    children: ReactNode;
    rightElement?: ReactNode;
    style?: any; // Allow passing custom styles like backgroundColor
}

export default function DashboardCard({ title, icon, onPress, children, rightElement, style }: DashboardCardProps) {
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            style={[styles.card, style]}
            onPress={onPress}
            activeOpacity={onPress ? 0.9 : 1}
        >
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.iconCircle}>
                        <Ionicons name={icon} size={18} color="#000" />
                    </View>
                    <Text style={styles.cardTitle}>{title}</Text>
                </View>
                {rightElement && <View>{rightElement}</View>}
            </View>
            <View style={styles.content}>
                {children}
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "rgba(212, 175, 55, 0.2)", // Subtle Gold border
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.08)",
            },
        }),
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(212, 175, 55, 0.1)", // Light Gold background
        justifyContent: "center",
        alignItems: "center",
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#1A1A1A",
        letterSpacing: 0.5,
    },
    content: {
        flexDirection: "row",
        gap: 14,
    },
});
