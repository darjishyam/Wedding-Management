import { useWedding } from "@/contexts/WeddingContext";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddEventScreen() {
    const router = useRouter();
    const { weddingData } = useWedding();
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState("");
    const [venue, setVenue] = useState("");
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState("");
    const [description, setDescription] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSave = async () => {
        if (!weddingData?._id) {
            Alert.alert("Error", "No active wedding found. Please select a wedding.");
            return;
        }

        if (!name || !venue || !time) {
            Alert.alert("Missing Fields", "Please fill Name, Venue and Time.");
            return;
        }

        setLoading(true);
        try {
            console.log("Sending Event Data:", {
                weddingId: weddingData._id,
                name,
                venue,
                date: date.toISOString(),
                time,
                description
            });

            await api.post('/events', {
                weddingId: weddingData._id,
                name,
                venue,
                date: date.toISOString(),
                time,
                description
            });
            Alert.alert("Success", "Event added successfully");
            if (Platform.OS === 'web') {
                router.replace('/events' as any);
            } else {
                router.back();
            }
        } catch (error: any) {
            console.error("Event Create Error:", error);
            const msg = error.response?.data?.message || error.message || "Failed to create event";
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        if (event.type === 'set' || selectedDate) {
            setDate(currentDate);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/events' as any)}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Add New Event</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Event Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Haldi Ceremony"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Date</Text>
                    {Platform.OS === 'web' ? (
                        <input
                            type="date"
                            value={date.toISOString().split('T')[0]}
                            onChange={(e) => setDate(new Date(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '12px',
                                fontSize: '16px',
                                border: '1px solid #DDD',
                                borderRadius: '8px',
                                outline: 'none'
                            }}
                        />
                    ) : (
                        <>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={styles.dateText}>{date.toDateString()}</Text>
                                <Ionicons name="calendar-outline" size={20} color="#666" />
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display="default"
                                    onChange={onDateChange}
                                />
                            )}
                        </>
                    )}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Time</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 10:00 AM"
                        value={time}
                        onChangeText={setTime}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Venue</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Hotel Grand / Home"
                        value={venue}
                        onChangeText={setVenue}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description (Optional)</Text>
                    <TextInput
                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                        placeholder="Add notes about dress code, etc."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />
                </View>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Create Event</Text>}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#EEE"
    },
    backButton: { marginRight: 16 },
    title: { fontSize: 20, fontWeight: "bold" },
    content: { padding: 24 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#333" },
    input: {
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    dateButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 8,
        padding: 12,
    },
    dateText: { fontSize: 16 },
    saveButton: {
        backgroundColor: "#E40046",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20
    },
    saveText: { color: "#FFF", fontSize: 16, fontWeight: "bold" }
});
