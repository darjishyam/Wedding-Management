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
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    KeyboardAvoidingView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGuest } from "@/contexts/GuestContext";
import { PDFService } from "@/services/PDFService";

export default function EventsScreen() {
    const router = useRouter();
    const { weddingData } = useWedding();
    const { guests, fetchGuests } = useGuest(); // Use Guest Context
    const { t } = useLanguage();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // AI Modal State
    const [aiModalVisible, setAiModalVisible] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [suggestedEvents, setSuggestedEvents] = useState<any[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

    useFocusEffect(
        useCallback(() => {
            fetchEvents();
            fetchGuests(); // Ensure guests are loaded
        }, [weddingData])
    );

    // Itinerary Modal State
    const [itineraryModalVisible, setItineraryModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [itineraryForm, setItineraryForm] = useState({ time: '', activity: '', personInCharge: '' });
    const [isUpdatingItinerary, setIsUpdatingItinerary] = useState(false);

    const openItinerary = (event: any) => {
        setSelectedEvent(event);
        setItineraryModalVisible(true);
    };

    const handleAddItineraryItem = async () => {
        if (!itineraryForm.time || !itineraryForm.activity) {
            Alert.alert("Error", "Please fill time and activity");
            return;
        }

        const updatedItinerary = [...(selectedEvent.itinerary || []), itineraryForm];
        setIsUpdatingItinerary(true);

        try {
            const res = await api.put(`/events/${selectedEvent._id}`, {
                itinerary: updatedItinerary
            });
            setSelectedEvent(res.data);
            setEvents(events.map((e: any) => e._id === selectedEvent._id ? res.data : e));
            setItineraryForm({ time: '', activity: '', personInCharge: '' });
        } catch (error) {
            Alert.alert("Error", "Failed to update itinerary");
        } finally {
            setIsUpdatingItinerary(false);
        }
    };

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

    const handleExportPDF = async (event: any) => {
        if (!guests || guests.length === 0) {
            Alert.alert("Info", "No guests loaded or guests list is empty.");
            return;
        }

        // Filter guests assigned to this event
        const eventGuests = guests.filter(g =>
            g.assignedEvents && g.assignedEvents.some((ae: any) => {
                const eventId = typeof ae === 'string' ? ae : ae.event;
                return eventId === event._id;
            })
        );

        if (eventGuests.length === 0) {
            Alert.alert("Info", "No guests invited to this event yet.");
            // We can still proceed if user wants empty list, but alert is good.
            // Let's proceed to allow exporting event details alone? 
            // Better to ask. For now just proceed.
        }

        const html = PDFService.generateEventPDFHTML(event, eventGuests);
        await PDFService.generateAndSharePDF(html, `${event.name}_List`);
    };

    const handleExportAllEvents = async () => {
        if (events.length === 0) {
            Alert.alert("Info", "No events to export.");
            return;
        }

        Alert.alert(
            "Export Schedule",
            `Exporting ${events.length} events as PDF. Continue?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Export",
                    onPress: async () => {
                        const html = PDFService.generateAllEventsPDFHTML(events, guests || []);
                        await PDFService.generateAndSharePDF(html, 'All_Events_Schedule');
                    }
                }
            ]
        );
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

    const generateAiTimeline = async () => {
        if (!weddingData?.date) {
            Alert.alert("Date Required", "Please set a wedding date in Profile first.");
            return;
        }
        setAiModalVisible(true);
        setGenerating(true);
        try {
            const res = await api.post('/ai/timeline', {
                date: weddingData.date,
                daysCount: 3,
                type: weddingData.type || "Indian"
            });
            setSuggestedEvents(res.data.timeline || []);
            setSelectedIndices(res.data.timeline ? res.data.timeline.map((_: any, i: number) => i) : []);
        } catch (error: any) {
            Alert.alert("AI Error", "Failed to generate timeline. Try again.");
            setAiModalVisible(false);
        } finally {
            setGenerating(false);
        }
    };

    const saveSuggestedEvents = async () => {
        const eventsToSave = suggestedEvents.filter((_, i) => selectedIndices.includes(i));
        if (eventsToSave.length === 0) return;

        setGenerating(true); // Re-use spinner
        try {
            // Batch creation (using Promise.all for simplicity)
            await Promise.all(eventsToSave.map(ev =>
                api.post('/events', {
                    weddingId: weddingData._id,
                    name: ev.name,
                    date: ev.date,
                    time: ev.time,
                    venue: ev.venue,
                    description: ev.description
                })
            ));

            setAiModalVisible(false);
            fetchEvents(); // Refresh list
            Alert.alert("Success", `${eventsToSave.length} events added to your schedule!`);
        } catch (error) {
            Alert.alert("Error", "Failed to save some events.");
        } finally {
            setGenerating(false);
        }
    };

    const toggleSelection = (index: number) => {
        if (selectedIndices.includes(index)) {
            setSelectedIndices(selectedIndices.filter(i => i !== index));
        } else {
            setSelectedIndices([...selectedIndices, index]);
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

                <View style={{ flexDirection: 'column', gap: 8 }}>
                    <TouchableOpacity
                        onPress={() => openItinerary(item)}
                        style={[styles.actionButton, { backgroundColor: '#FFF9E3' }]}
                    >
                        <Ionicons name="list-outline" size={20} color="#D4AF37" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleExportPDF(item)}
                        style={[styles.actionButton, { backgroundColor: 'rgba(138, 0, 48, 0.05)' }]}
                    >
                        <Ionicons name="document-text-outline" size={20} color="#8A0030" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDelete(item._id, item.name)}
                        style={[styles.actionButton, { backgroundColor: '#FFEBEE' }]}
                    >
                        <Ionicons name="trash-outline" size={20} color="#D32F2F" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#8A0030" />
                </TouchableOpacity>
                <Text style={styles.title}>{t("events") || "Wedding Events"}</Text>
                <TouchableOpacity onPress={handleExportAllEvents} style={{ padding: 8 }}>
                    <Ionicons name="share-outline" size={22} color="#8A0030" />
                </TouchableOpacity>
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
                style={styles.aiButton}
                onPress={generateAiTimeline}
            >
                <Ionicons name="sparkles" size={24} color="#FFF" />
                <Text style={styles.aiButtonText}>AI Auto-Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push("/events/add-event" as any)}
            >
                <Ionicons name="add" size={30} color="#FFF" />
            </TouchableOpacity>

            {/* AI Suggestion Modal */}
            <Modal
                visible={aiModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                statusBarTranslucent={true}
                onRequestClose={() => setAiModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>✨ AI Suggestions</Text>
                        <TouchableOpacity onPress={() => setAiModalVisible(false)}>
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {generating && suggestedEvents.length === 0 ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#E40046" />
                            <Text style={styles.loadingText}>Analyzing wedding date...</Text>
                            <Text style={styles.loadingSubText}>Consulting timelines for {weddingData?.type} Wedding</Text>
                        </View>
                    ) : (
                        <View style={{ flex: 1 }}>
                            <Text style={styles.modalSubtitle}>Select events to add to your calendar:</Text>
                            <ScrollView contentContainerStyle={styles.suggestionList}>
                                {suggestedEvents.map((ev, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.suggestionCard, selectedIndices.includes(index) && styles.selectedCard]}
                                        onPress={() => toggleSelection(index)}
                                    >
                                        <View style={styles.suggestionHeader}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Ionicons
                                                    name={selectedIndices.includes(index) ? "checkbox" : "square-outline"}
                                                    size={24}
                                                    color={selectedIndices.includes(index) ? "#E40046" : "#CCC"}
                                                />
                                                <Text style={styles.suggestionName}>{ev.name}</Text>
                                            </View>
                                            <Text style={styles.suggestionDate}>{new Date(ev.date).toDateString()}</Text>
                                        </View>
                                        <Text style={styles.suggestionDesc}>{ev.description}</Text>
                                        <Text style={styles.suggestionTime}><Ionicons name="time" /> {ev.time} at {ev.venue}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={[styles.saveButton, { opacity: generating ? 0.7 : 1 }]}
                                    onPress={saveSuggestedEvents}
                                    disabled={generating}
                                >
                                    {generating ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Add {selectedIndices.length} Events</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </Modal>

            {/* Itinerary Management Modal */}
            <Modal
                visible={itineraryModalVisible}
                animationType="slide"
                transparent={true}
                statusBarTranslucent={true}
                onRequestClose={() => setItineraryModalVisible(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <View style={[styles.modalOverlay, Platform.OS === 'android' && { paddingBottom: 0 }]}>
                        <View style={styles.itineraryContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Ceremony Itinerary</Text>
                                <TouchableOpacity onPress={() => setItineraryModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#000" />
                                </TouchableOpacity>
                            </View>

                            {selectedEvent && (
                                <ScrollView 
                                    style={{ flex: 1 }} 
                                    contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 24 : 100 }}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                >
                                    <Text style={styles.eventLabel}>{selectedEvent.name} • Granular Schedule</Text>
                                
                                {selectedEvent.itinerary && selectedEvent.itinerary.length > 0 ? (
                                    selectedEvent.itinerary.map((it: any, i: number) => (
                                        <View key={i} style={styles.itineraryItem}>
                                            <View style={styles.timeLine}>
                                                <Text style={styles.itTime}>{it.time}</Text>
                                                <View style={styles.line} />
                                            </View>
                                            <View style={styles.itDetails}>
                                                <Text style={styles.itActivity}>{it.activity}</Text>
                                                <Text style={styles.itPerson}><Ionicons name="person" size={10} /> {it.personInCharge || 'Unassigned'}</Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.emptyItinerary}>
                                        <Text style={{ color: '#999' }}>No activities mapped for this event.</Text>
                                    </View>
                                )}

                                <View style={styles.itineraryForm}>
                                    <Text style={styles.formTitle}>Add Activity</Text>
                                    <TextInput 
                                        style={styles.itInput} 
                                        placeholder="Time (e.g. 10:00 AM)" 
                                        value={itineraryForm.time}
                                        onChangeText={(t) => setItineraryForm({ ...itineraryForm, time: t })}
                                    />
                                    <TextInput 
                                        style={styles.itInput} 
                                        placeholder="Activity Details" 
                                        value={itineraryForm.activity}
                                        onChangeText={(t) => setItineraryForm({ ...itineraryForm, activity: t })}
                                    />
                                    <TextInput 
                                        style={styles.itInput} 
                                        placeholder="Person in Charge" 
                                        value={itineraryForm.personInCharge}
                                        onChangeText={(t) => setItineraryForm({ ...itineraryForm, personInCharge: t })}
                                    />
                                    <TouchableOpacity style={styles.itAddBtn} onPress={handleAddItineraryItem} disabled={isUpdatingItinerary}>
                                        {isUpdatingItinerary ? <ActivityIndicator color="#FFF" /> : <Text style={styles.itAddText}>Add to Timeline</Text>}
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9F9F9" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
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
    actionButton: { padding: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
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
    emptySubText: { fontSize: 14, color: '#AAA', marginTop: 8 },

    // AI Styles
    aiButton: {
        position: 'absolute', bottom: 90, right: 24,
        backgroundColor: '#7E57C2', flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30,
        elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25,
    },
    aiButtonText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },

    // Modal Styles
    modalContainer: { flex: 1, backgroundColor: '#F5F5F5' },
    modalHeader: { padding: 20, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: 22, fontWeight: 'bold' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 20, fontSize: 18, fontWeight: '600' },
    loadingSubText: { marginTop: 8, color: '#666' },
    modalSubtitle: { padding: 16, color: '#666', fontSize: 14 },
    suggestionList: { padding: 16 },
    suggestionCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
    selectedCard: { borderColor: '#E40046', backgroundColor: '#FFF5F8' },
    suggestionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    suggestionName: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
    suggestionDate: { fontSize: 12, color: '#E40046', fontWeight: '600' },
    suggestionDesc: { color: '#666', marginBottom: 8 },
    suggestionTime: { fontSize: 12, color: '#999' },
    modalFooter: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
    saveButton: { backgroundColor: '#8A0030', padding: 16, borderRadius: 12, alignItems: 'center' },
    saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    
    // New Itinerary Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    itineraryContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
    },
    eventLabel: {
        fontSize: 14,
        color: '#D4AF37',
        fontWeight: '700',
        marginBottom: 20,
    },
    itineraryItem: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    timeLine: {
        alignItems: 'center',
        width: 70,
    },
    itTime: {
        fontSize: 12,
        fontWeight: '700',
        color: '#333',
    },
    line: {
        width: 1,
        flex: 1,
        backgroundColor: '#D4AF37',
        marginVertical: 4,
    },
    itDetails: {
        flex: 1,
        paddingLeft: 15,
        paddingBottom: 15,
    },
    itActivity: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    itPerson: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    emptyItinerary: {
        padding: 40,
        alignItems: 'center',
    },
    itineraryForm: {
        marginTop: 20,
        backgroundColor: '#F9F9F9',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    formTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    itInput: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#DDD'
    },
    itAddBtn: {
        backgroundColor: '#8A0030',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    itAddText: {
        color: '#FFF',
        fontWeight: '700'
    }
});


