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
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    headerLeft: {
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
    content: {
        flexDirection: "row",
        gap: 12,
    },
});
