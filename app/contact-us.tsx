import CustomHeader from "@/components/CustomHeader";
import ScreenWrapper from "@/components/ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ContactUsScreen() {
    const router = useRouter();

    const handleEmail = () => {
        Linking.openURL("mailto:info@bytesved.com");
    };

    const handleCall = () => {
        Linking.openURL("tel:+919016046068");
    };

    const handleWebsite = () => {
        Linking.openURL("https://bytesved.com/");
    };

    return (
        <ScreenWrapper>
            <CustomHeader title="Contact Us" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.subtitle}>
                    We're here to help! Reach out to us via any of the following channels.
                </Text>

                {/* Support Email Card */}
                <TouchableOpacity style={styles.card} onPress={handleEmail}>
                    <View style={styles.cardContent}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="mail-outline" size={24} color="#000" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.cardTitle}>Email Support</Text>
                            <Text style={styles.cardSubtitle}>info@bytesved.com</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                </TouchableOpacity>

                {/* Phone Card */}
                <TouchableOpacity style={styles.card} onPress={handleCall}>
                    <View style={styles.cardContent}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="call-outline" size={24} color="#000" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.cardTitle}>Call Us</Text>
                            <Text style={styles.cardSubtitle}>+91 90160 46068</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                </TouchableOpacity>

                {/* Office Address (Static) */}
                <View style={styles.card}>
                    <View style={styles.cardContent}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="location-outline" size={24} color="#000" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.cardTitle}>Office Address</Text>
                            <Text style={styles.cardSubtitle}>
                                A-507, The Landmark, Kudasan, Gandhinagar, Gujarat, 382421
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Website Card */}
                <TouchableOpacity style={styles.card} onPress={handleWebsite}>
                    <View style={styles.cardContent}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="globe-outline" size={24} color="#000" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.cardTitle}>Visit Website</Text>
                            <Text style={styles.cardSubtitle}>https://bytesved.com/</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                </TouchableOpacity>

            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 24,
        lineHeight: 20,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        // Soft shadow consistent with Chandla page
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
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    cardContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        paddingRight: 10,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#000",
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
});
