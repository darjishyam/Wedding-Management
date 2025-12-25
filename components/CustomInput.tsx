import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from "react-native";

interface CustomInputProps extends TextInputProps {
    label?: string;
    prefix?: string;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
}

export default function CustomInput({
    label,
    prefix,
    rightIcon,
    onRightIconPress,
    style,
    ...props
}: CustomInputProps) {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputContainer}>
                {prefix && <Text style={styles.prefix}>{prefix}</Text>}
                <TextInput
                    style={[styles.input, prefix && styles.inputWithPrefix, style]}
                    placeholderTextColor="#666"
                    {...props}
                />
                {rightIcon && !(Platform.OS === 'web' && (rightIcon === 'eye' || rightIcon === 'eye-off' || props.secureTextEntry !== undefined)) && (
                    <TouchableOpacity onPress={onRightIconPress} style={styles.icon}>
                        <Ionicons name={rightIcon} size={24} color="gray" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: "#6F6F6F",
        marginBottom: 6,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 55,
        borderWidth: 1,
        borderColor: "#E6E6E6",
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: "#F9F9F9",
    },
    input: {
        flex: 1,
        height: "100%",
        fontSize: 16,
        color: "#000",
    },
    inputWithPrefix: {
        paddingLeft: 0,
    },
    prefix: {
        fontSize: 16,
        color: "#000",
        marginRight: 10,
        fontWeight: "600",
    },
    icon: {
        padding: 8,
    },
});
