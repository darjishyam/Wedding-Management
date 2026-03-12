import { PDFService } from "@/services/PDFService"; // Added Service Import
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import * as Sharing from "expo-sharing"; // Ensure Sharing is imported
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform, // Added Platform Import
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import ViewShot from "react-native-view-shot";
import InvitationCard from "../../components/InvitationCard";
import api from "../../services/api";

const THEMES = [
    { id: "gujarati", name: "Gujarati Kankotri" },
    { id: "traditional", name: "Royal Traditional" },
    { id: "modern", name: "Modern Floral" },
    { id: "minimal", name: "Sleek Minimal" },
];

export default function InvitationsScreen() {
    const router = useRouter();
    const viewShotRef = useRef(null);
    const [selectedTheme, setSelectedTheme] = useState<"gujarati" | "traditional" | "modern" | "minimal">("gujarati");
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [customMessage, setCustomMessage] = useState(
        "We cordially invite you to celebrate our union and bless us with your presence."
    );

    const [weddingDetails, setWeddingDetails] = useState({
        id: "",
        groomName: "Groom",
        brideName: "Bride",
        date: new Date().toISOString(),
        venue: "Wedding Venue",
        message: customMessage,
    });

    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetchWeddingDetails();
    }, []);

    useEffect(() => {
        setWeddingDetails(prev => ({ ...prev, message: customMessage }));
    }, [customMessage]);

    const fetchWeddingDetails = async () => {
        try {
            const res = await api.get("/weddings/my");
            if (res.data) {
                setWeddingDetails(res.data);
                if (res.data.weddingType) {
                    setSelectedTheme(res.data.weddingType);
                }
                const weddingId = res.data._id || (res.data as any).id;
                fetchEvents(weddingId); // Re-enabled Data Fetching
            }
        } catch (error) {
            console.log("Failed to fetch wedding details", error);
        }
    };

    const fetchEvents = async (weddingId: string) => {
        if (!weddingId) return;
        try {
            console.log("Fetching events for wedding:", weddingId);
            const res = await api.get(`/events/${weddingId}`);
            if (res.data) {
                console.log("Events fetched raw:", JSON.stringify(res.data, null, 2));
                setEvents(res.data);
            } else {
                console.log("No events data in response");
            }
        } catch (error) {
            console.log("Failed to fetch events", error);
        }
    };

    const captureInvitation = async () => {
        try {
            if (Platform.OS === 'web') {
                const html2canvas = require('html2canvas');
                const element = document.getElementById('invitation-card-view');
                if (element) {
                    const canvas = await html2canvas(element, {
                        backgroundColor: '#ffffff',
                        scale: 2,
                    });
                    return canvas.toDataURL('image/png');
                } else {
                    Alert.alert("Error", "Could not find invitation element on page.");
                    return null;
                }
            } else {
                if (!viewShotRef.current) {
                    Alert.alert("Error", "Could not capture invitation (Ref Null).");
                    return null;
                }
                // @ts-ignore
                return await viewShotRef.current.capture();
            }
        } catch (error: any) {
            console.error("CAPTURE ERROR:", error);
            Alert.alert("Error", "Failed to capture invitation: " + error.message);
            return null;
        }
    };

    const handleShareImage = async () => {
        setLoading(true);
        try {
            const uri = await captureInvitation();
            if (uri) {
                if (Platform.OS === 'web') {
                    // Web Sharing Logic
                    if (navigator.share) {
                        try {
                            const response = await fetch(uri);
                            const blob = await response.blob();
                            const file = new File([blob], "wedding-invitation.png", { type: "image/png" });

                            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                await navigator.share({
                                    files: [file],
                                    title: 'Wedding Invitation',
                                    text: 'Please join us for our wedding!',
                                });
                                setLoading(false);
                                return;
                            }
                        } catch (e) {
                            console.log("Web Share API failed, falling back to download", e);
                        }
                    }

                    // Fallback: Download Link
                    const link = document.createElement('a');
                    link.href = uri;
                    link.download = 'wedding-invitation.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                } else {
                    // Native Sharing Logic
                    if (!(await Sharing.isAvailableAsync())) {
                        Alert.alert("Error", "Sharing is not available on this device");
                    } else {
                        await Sharing.shareAsync(uri, {
                            mimeType: "image/png",
                            dialogTitle: "Share Wedding Invitation",
                        });
                    }
                }
            }
        } catch (error: any) {
            console.error("Sharing failed", error);
            Alert.alert("Error", "Failed to share invitation.");
        } finally {
            setLoading(false);
        }
    };

    const handleSharePDF = async () => {
        setLoading(true);
        const uri = await captureInvitation();
        if (uri) {
            try {
                const html = PDFService.generateInvitationHTML(uri);
                await PDFService.generateAndSharePDF(html, "WeddingInvitation");
            } catch (e: any) {
                Alert.alert("Error", "Failed to generate PDF: " + e.message);
            }
        }
        setLoading(false);
    };

    const generateAiMessage = async () => {
        try {
            setAiLoading(true);
            const prompt = `Write a short, poetic, and ${selectedTheme === 'traditional' ? 'culturally rich' : 'elegant'} one-sentence wedding invitation message for ${weddingDetails.groomName} and ${weddingDetails.brideName}. Max 15 words.`;

            const res = await api.post("/ai/ask", {
                prompt: prompt,
                context: "Wedding Invitation"
            });

            if (res.data && res.data.response) {
                const msg = res.data.response.replace(/^"|"$/g, '').trim();
                setCustomMessage(msg);
            }
        } catch (error) {
            Alert.alert("AI Error", "Could not generate message. Check connectivity.");
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: "Digital Invites",
                    headerTitleAlign: "center",
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.navigate('/(tabs)')} style={{ marginRight: 15 }}>
                            <Ionicons name="arrow-back" size={24} color="#000" />
                        </TouchableOpacity>
                    ),
                }}
            />

            {/* DEBUG BUTTON */}
            {/* <View style={{ padding: 10, backgroundColor: 'yellow' }}>
                <Button title="DEBUG SHARE (CLICK ME)" onPress={() => { console.log("DEBUG CLICK"); handleShare(); }} />
            </View> */}

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Theme Selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeSelector}>
                    {THEMES.map((theme) => (
                        <TouchableOpacity
                            key={theme.id}
                            style={[
                                styles.themeButton,
                                selectedTheme === theme.id && styles.activeThemeButton,
                            ]}
                            onPress={() => setSelectedTheme(theme.id as any)}
                        >
                            <Text
                                style={[
                                    styles.themeText,
                                    selectedTheme === theme.id && styles.activeThemeText,
                                ]}
                            >
                                {theme.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Card Preview */}
                <View
                    style={{ width: '100%', alignItems: "center", minHeight: 400 }}
                    // @ts-ignore
                    nativeID="invitation-card-view" // Added for html2canvas targeting
                >
                    <ViewShot
                        ref={viewShotRef}
                        options={{ format: "png", quality: 0.9 }}
                        style={{ width: '100%', maxWidth: 500, backgroundColor: 'white' }}
                    >
                        <InvitationCard
                            weddingDetails={weddingDetails}
                            theme={selectedTheme}
                            events={events}
                        />
                    </ViewShot>
                </View>

                {/* Custom Message Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Invitation Message:</Text>
                    <View style={styles.messageRow}>
                        <TextInput
                            style={styles.input}
                            value={customMessage}
                            onChangeText={setCustomMessage}
                            multiline
                            placeholder="Enter your invitation wording..."
                        />
                        <TouchableOpacity
                            style={styles.aiButton}
                            onPress={generateAiMessage}
                            disabled={aiLoading}
                        >
                            {aiLoading ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <MaterialCommunityIcons name="magic-staff" size={24} color="#FFF" />
                            )}
                        </TouchableOpacity>
                    </View>
                    <Text style={{ fontSize: 10, color: '#666', marginTop: 5 }}>
                        Click the wand to let AI write for you!
                    </Text>
                </View>

                {/* Spacer for Floating Footer */}
                <View style={{ height: 100 }} />

            </ScrollView>

            {/* Share Buttons (Fixed Footer) */}
            <View style={styles.fixedFooter}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 10 }}>
                    <TouchableOpacity
                        style={[styles.shareButton, { flex: 1, backgroundColor: '#4A90E2' }]}
                        onPress={handleShareImage}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="image-outline" size={24} color="#FFF" />
                                <Text style={styles.shareText}>Image</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.shareButton, { flex: 1, backgroundColor: '#E74C3C' }]}
                        onPress={handleSharePDF}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="document-text-outline" size={24} color="#FFF" />
                                <Text style={styles.shareText}>PDF</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
        alignItems: "center",
        flexGrow: 1, // Changed from default
    },
    fixedFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.9)', // Slight transparency
        padding: 20,
        paddingBottom: 30, // For notch
        borderTopWidth: 1,
        borderColor: '#EEE',
        alignItems: 'center',
        zIndex: 9999, // Ensure on top
        elevation: 10,
    },
    shareButton: {
        flexDirection: "row",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 15, // Slightly rounded
        alignItems: "center",
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
        // Web Cursor
        ...Platform.select({
            web: {
                cursor: 'pointer',
            },
        }),
    },
    // ... (Keep other styles same, just ensure shareButton style is updated here)
    themeSelector: {
        flexDirection: "row",
        marginBottom: 20,
        maxHeight: 50,
        width: '100%', // Ensure full width
    },
    themeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "#FFF",
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#DDD",
    },
    activeThemeButton: {
        backgroundColor: "#4A90E2",
        borderColor: "#4A90E2",
    },
    themeText: {
        fontSize: 14,
        color: "#333",
    },
    activeThemeText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    cardContainer: {
        marginVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        backgroundColor: "transparent",
    },
    inputContainer: {
        width: "100%",
        marginTop: 20,
        backgroundColor: "#FFF",
        padding: 15,
        borderRadius: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    messageRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    input: {
        flex: 1,
        height: 80,
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 8,
        padding: 10,
        textAlignVertical: "top",
        fontSize: 14,
        color: "#333",
    },
    aiButton: {
        width: 50,
        height: 50,
        backgroundColor: "#9B59B6",
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
    },
    shareText: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 10,
    },
});
