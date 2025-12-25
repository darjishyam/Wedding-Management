import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
} from "react-native";

interface CustomButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
    variant?: 'primary' | 'outline';
}

export default function CustomButton({
    title,
    loading = false,
    variant = 'primary',
    style,
    disabled,
    ...props
}: CustomButtonProps) {
    const isOutline = variant === 'outline';

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isOutline ? styles.buttonOutline : styles.buttonPrimary,
                (loading || disabled) && styles.disabled,
                style
            ]}
            disabled={loading || disabled}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={isOutline ? "#000" : "#FFF"} />
            ) : (
                <Text style={[styles.buttonText, isOutline ? styles.textOutline : styles.textPrimary]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 55,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    buttonPrimary: {
        backgroundColor: "#000",
    },
    buttonOutline: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#000",
    },
    disabled: {
        opacity: 0.7,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    textPrimary: {
        color: "#FFF",
    },
    textOutline: {
        color: "#000",
    },
});
