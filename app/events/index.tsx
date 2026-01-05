import { useLanguage } from "@/contexts/LanguageContext";
import { useWedding } from "@/contexts/WeddingContext";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EventsScreen() {
    const router = useRouter();
    const { weddingData } = useWedding();
    const { t } = useLanguage();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchEvents();
        }, [weddingData])
    );

    const fetchEvents = async () => {
        if (!weddingData?._id) return;
        try {
            const res = await api.get(`/events/${weddingData._id}`);
            setEvents(res.data);
        } catch (error) {
            console.log("Error fetching events", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchEvents();
    };

    const handleDelete = (id: string, name: string) => {
        const deleteAction = async () => {
            try {
                await api.delete(`/events/${id}`);
                setEvents(events.filter((e: any) => e._id !== id));
            } catch (error: any) {
                const msg = error.response?.data?.message || error.message || "Failed to delete event";
                Alert.alert("Error", msg);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`Are you sure you want to delete ${name}?`)) {
                deleteAction();
            }
        } else {
            Alert.alert(
                "Delete Event",
                `Are you sure you want to delete ${name}? (ID: ${id})`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: deleteAction
                    }
                ]
            );
        }
    };

    const renderEventItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.dateBox}>
                    <Text style={styles.dateDay}>{new Date(item.date).getDate()}</Text>
                    <Text style={styles.dateMonth}>
                        {new Date(item.date).toLocaleString('default', { month: 'short' })}
                    </Text>
                </View>
                <View style={styles.eventInfo}>
                    <Text style={styles.eventName}>{item.name}</Text>
                    <Text style={styles.eventTime}>
                        <Ionicons name="time-outline" size={14} /> {item.time || "Time not set"}
                    </Text>
                    <Text style={styles.eventVenue}>
                        <Ionicons name="location-outline" size={14} /> {item.venue || "Venue not set"}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => handleDelete(item._id, item.name)}
                    style={styles.deleteButton}
                >
                    <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Wedding Events</Text>
            </View>


            {
                loading ? (
                    <ActivityIndicator size="large" color="#E40046" style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={events}
                        keyExtractor={(item: any) => item._id}
                        renderItem={renderEventItem}
                        contentContainerStyle={styles.listContent}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="calendar-clear-outline" size={64} color="#CCC" />
                                <Text style={styles.emptyText}>No events added yet.</Text>
                                <Text style={styles.emptySubText}>Add ceremonies like Haldi, Sangeet, etc.</Text>
                            </View>
                        }
                    />
                )
            }

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push("/events/add-event" as any)}
            >
                <Ionicons name="add" size={30} color="#FFF" />
            </TouchableOpacity>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9F9F9" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#FFF",
        borderBottomWidth: 1,
        borderBottomColor: "#EEE"
    },
    backButton: { marginRight: 16 },
    title: { fontSize: 20, fontWeight: "bold" },
    listContent: { padding: 16, paddingBottom: 80 },
    card: {
        backgroundColor: "#FFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardHeader: { flexDirection: "row", alignItems: "center" },
    dateBox: {
        backgroundColor: "#FFF0F5",
        borderRadius: 8,
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
        minWidth: 60,
    },
    dateDay: { fontSize: 20, fontWeight: "bold", color: "#E40046" },
    dateMonth: { fontSize: 12, color: "#E40046", textTransform: 'uppercase' },
    eventInfo: { flex: 1 },
    eventName: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 4 },
    eventTime: { fontSize: 14, color: "#666", marginBottom: 2 },
    eventVenue: { fontSize: 14, color: "#666" },
    deleteButton: { padding: 8 },
    fab: {
        position: "absolute",
        bottom: 24,
        right: 24,
        backgroundColor: "#E40046",
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#888', marginTop: 16 },
    emptySubText: { fontSize: 14, color: '#AAA', marginTop: 8 }
});


