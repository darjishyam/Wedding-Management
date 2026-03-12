import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import CustomInput from "@/components/CustomInput";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useToast } from "@/contexts/ToastContext";
import { authService } from "@/services/authService";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { showToast } = useToast();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async () => {
        if (!email) {
            showToast("Please enter your email address", "warning");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast("Please enter a valid email address", "error");
            return;
        }

        setLoading(true);
        try {
            await authService.forgotPassword(email);
            showToast("OTP sent to your email!", "success");

            // Navigate to Reset Password Screen with email param
            router.push({
                pathname: "/reset-password",
                params: { email }
            });
        } catch (error: any) {
            const msg = error.message || "Failed to send OTP";
            showToast(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <CustomHeader title="Forgot Password" />

            <View style={styles.container}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                    Enter your email address and we will send you an OTP to reset your password.
                </Text>

                <CustomInput
                    label="Email Address"
                    placeholder="Ex: jhondoe@gmail.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <CustomButton
                    title={loading ? "Sending OTP..." : "Send OTP"}
                    onPress={handleSendOTP}
                    loading={loading}
                    style={{ marginTop: 20 }}
                />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#000",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 30,
        lineHeight: 22,
    },
});
