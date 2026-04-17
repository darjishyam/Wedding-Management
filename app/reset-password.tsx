import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import CustomInput from "@/components/CustomInput";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useToast } from "@/contexts/ToastContext";
import { authService } from "@/services/authService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function ResetPasswordScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { showToast } = useToast();

    const email = params.email as string;

    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleResetPassword = async () => {
        if (!otp || otp.length < 6) {
            showToast("Please enter a valid 6-digit OTP", "warning");
            return;
        }

        if (!newPassword) {
            showToast("Please enter a new password", "warning");
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast("Passwords do not match", "error");
            return;
        }

        // Password Validation: Min 8 chars, 1 letter, 1 number, 1 special char
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            showToast("Password must be 8+ chars (Uppercase, Lowercase, Number, Special Char)", "error", 5000);
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(email, otp, newPassword);

            showToast("Password reset successful!", "success");
            
            // Short delay to let the toast be seen before navigating
            setTimeout(() => {
                router.replace("/login");
            }, 1500);
            
        } catch (error: any) {
            const msg = error.message || "Failed to reset password";
            showToast(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <CustomHeader title="Reset Password" />

            <View style={styles.container}>
                <Text style={styles.subtitle}>
                    OTP sent to <Text style={{ fontWeight: 'bold' }}>{email}</Text>
                </Text>

                <CustomInput
                    label="Enter OTP"
                    placeholder="123456"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="numeric"
                    maxLength={6}
                />

                <CustomInput
                    label="New Password"
                    placeholder="********"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                    rightIcon={showPassword ? "eye-off" : "eye"}
                    onRightIconPress={() => setShowPassword(!showPassword)}
                />

                <CustomInput
                    label="Confirm New Password"
                    placeholder="********"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    style={{ marginBottom: 20 }}
                />

                <CustomButton
                    title={loading ? "Resetting..." : "Reset Password"}
                    onPress={handleResetPassword}
                    loading={loading}
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
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 30,
        textAlign: "center"
    },
});
