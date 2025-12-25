import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";

interface StatBoxProps {
    label: string;
    value: string | number;
    icon?: keyof typeof Ionicons.glyphMap;
    imageSource?: ImageSourcePropType;
    style?: any; // For custom background color
}

export default function StatBox({ label, value, icon, imageSource, style }: StatBoxProps) {
    return (
        <View style={[styles.container, style]}>
            {imageSource ? (
                <Image
                    source={imageSource}
                    style={styles.imageIcon}
                    resizeMode="contain"
                />
            ) : (
                icon && <Ionicons name={icon} size={24} color="#000" style={styles.icon} />
            )}
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EAEAEA",
        borderRadius: 16,
        padding: 12,
        alignItems: "flex-start",
        minHeight: 100, // Ensure consistent height
        justifyContent: "center",
    },
    icon: {
        marginBottom: 8,
    },
    imageIcon: {
        width: 36,
        height: 36,
        marginBottom: 4,
        tintColor: "#000",
    },
    label: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: "700",
        color: "#000",
    },
});
