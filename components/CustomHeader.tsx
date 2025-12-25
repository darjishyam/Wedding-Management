import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CustomHeaderProps {
    title?: string;
    onBack?: () => void;
}

export default function CustomHeader({ title, onBack }: CustomHeaderProps) {
    const router = useRouter();
    const handleBack = onBack || (() => router.back());

    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            <View style={styles.placeholder} />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0", // Light separator
        backgroundColor: "#FFF",
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#000",
    },
    placeholder: {
        width: 40,
    },
});
