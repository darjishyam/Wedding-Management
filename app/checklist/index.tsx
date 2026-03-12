import CustomHeader from "@/components/CustomHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWedding } from "@/contexts/WeddingContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dynamic import for API to avoid cycles
const api = require('@/services/api').default;

interface Task {
    _id: string;
    title: string;
    category: string;
    isCompleted: boolean;
    dueDate?: string;
}

const CATEGORIES = ['All', 'Venue', 'Catering', 'Attire', 'GuestList', 'Ceremony', 'Photography', 'Music', 'Other'];

export default function ChecklistScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { weddingData } = useWedding();
    const { t } = useLanguage();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");

    // Add Task Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskCategory, setNewTaskCategory] = useState("Other");
    const [addingTask, setAddingTask] = useState(false);

    useEffect(() => {
        if (weddingData?._id) {
            fetchTasks();
        }
    }, [weddingData?._id]);

    const fetchTasks = async () => {
        if (!weddingData?._id) return;
        try {
            const res = await api.get(`/tasks?weddingId=${weddingData._id}`);
            setTasks(res.data);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
            Alert.alert("Error", "Could not load checklist.");
        } finally {
            setLoading(false);
        }
    };

    const toggleTask = async (taskId: string, currentStatus: boolean) => {
        // Optimistic Update
        const updatedTasks = tasks.map(t =>
            t._id === taskId ? { ...t, isCompleted: !currentStatus } : t
        );
        setTasks(updatedTasks);

        try {
            await api.patch(`/tasks/${taskId}`, { isCompleted: !currentStatus });
        } catch (error) {
            // Revert if failed
            setTasks(tasks);
            Alert.alert("Error", "Failed to update task.");
        }
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) {
            Alert.alert("Required", "Please enter a task title.");
            return;
        }

        if (!weddingData?._id) {
            Alert.alert("Error", "No active wedding found.");
            return;
        }

        setAddingTask(true);
        try {
            const res = await api.post("/tasks", {
                weddingId: weddingData._id,
                title: newTaskTitle,
                category: newTaskCategory,
            });
            setTasks([...tasks, res.data]);
            setShowAddModal(false);
            setNewTaskTitle("");
            setNewTaskCategory("Other");
        } catch (error) {
            Alert.alert("Error", "Failed to add task.");
        } finally {
            setAddingTask(false);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        Alert.alert(
            "Delete Task",
            "Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const previousTasks = tasks;
                        setTasks(tasks.filter(t => t._id !== taskId));
                        try {
                            await api.delete(`/tasks/${taskId}`);
                        } catch (error) {
                            setTasks(previousTasks);
                            Alert.alert("Error", "Failed to delete task.");
                        }
                    }
                }
            ]
        );
    };

    // derived state
    const completedCount = tasks.filter(t => t.isCompleted).length;
    const totalCount = tasks.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const filteredTasks = activeCategory === "All"
        ? tasks
        : tasks.filter(t => t.category === activeCategory);

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'Venue': return '#E1BEE7';
            case 'Catering': return '#FFCCBC';
            case 'Attire': return '#B3E5FC';
            case 'GuestList': return '#DCEDC8';
            default: return '#F5F5F5';
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
            <CustomHeader
                title="Checklist"
                onBack={() => router.replace("/(tabs)")}
                // @ts-ignore
                showBack={true}
            />
            <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 }}>
                <Text style={styles.subTitle}>
                    {completedCount} of {totalCount} tasks completed
                </Text>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
            </View>

            {/* Category Filter */}
            <View style={{ marginBottom: 10 }}>
                <FlatList
                    data={CATEGORIES}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                activeCategory === item && styles.categoryChipActive
                            ]}
                            onPress={() => setActiveCategory(item)}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    activeCategory === item && styles.categoryTextActive
                                ]}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color="#8A0030" />
                </View>
            ) : (
                <FlatList
                    data={filteredTasks}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 80 }}
                    renderItem={({ item }) => (
                        <View style={styles.taskCard}>
                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => toggleTask(item._id, item.isCompleted)}
                            >
                                <View style={[styles.checkbox, item.isCompleted && styles.checkboxActive]}>
                                    {item.isCompleted && <Ionicons name="checkmark" size={16} color="#FFF" />}
                                </View>
                            </TouchableOpacity>

                            <View style={{ flex: 1 }}>
                                <Text style={[styles.taskTitle, item.isCompleted && styles.taskTitleCompleted]}>
                                    {item.title}
                                </Text>
                                <View style={styles.taskMetaRow}>
                                    <View style={[styles.taskTag, { backgroundColor: getCategoryColor(item.category) }]}>
                                        <Text style={styles.taskTagText}>{item.category}</Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity onPress={() => handleDeleteTask(item._id)} style={{ padding: 8 }}>
                                <Ionicons name="trash-outline" size={18} color="#999" />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={{ color: "#999" }}>No tasks found in this category.</Text>
                        </View>
                    }
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowAddModal(true)}
            >
                <Ionicons name="add" size={30} color="#FFF" />
            </TouchableOpacity>

            {/* Add Modal */}
            <Modal
                visible={showAddModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>New Task</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="What needs to be done?"
                            value={newTaskTitle}
                            onChangeText={setNewTaskTitle}
                        />

                        <Text style={styles.label}>Category</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                            {CATEGORIES.filter(c => c !== 'All').map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.modalChip,
                                        newTaskCategory === cat && styles.modalChipActive
                                    ]}
                                    onPress={() => setNewTaskCategory(cat)}
                                >
                                    <Text style={[
                                        styles.modalChipText,
                                        newTaskCategory === cat && styles.modalChipTextActive
                                    ]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.cancelButton}>
                                <Text style={{ color: "#666" }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleAddTask}
                                style={styles.saveButton}
                                disabled={addingTask}
                            >
                                {addingTask ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={{ color: "#FFF", fontWeight: "bold" }}>Add Task</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    subTitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 10,
        marginTop: 4,
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: "#EFF0F6",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 10,
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#8A0030",
        borderRadius: 4,
    },
    categoryChip: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        marginRight: 8,
        backgroundColor: "#FFF",
    },
    categoryChipActive: {
        backgroundColor: "#8A0030",
        borderColor: "#8A0030",
    },
    categoryText: {
        color: "#666",
        fontSize: 14,
        fontWeight: "600",
    },
    categoryTextActive: {
        color: "#FFF",
    },
    taskCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F5F5F5",
    },
    checkboxContainer: {
        padding: 8,
        marginRight: 4,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#DDD",
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxActive: {
        backgroundColor: "#4CAF50",
        borderColor: "#4CAF50",
    },
    taskTitle: {
        fontSize: 16,
        color: "#000",
        fontWeight: "500",
    },
    taskTitleCompleted: {
        textDecorationLine: "line-through",
        color: "#AAA",
    },
    taskMetaRow: {
        flexDirection: "row",
        marginTop: 4,
    },
    taskTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    taskTagText: {
        fontSize: 10,
        color: "#444",
        fontWeight: "600",
    },
    emptyState: {
        alignItems: "center",
        marginTop: 40,
    },
    fab: {
        position: "absolute",
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#8A0030",
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#FFF",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#000",
    },
    input: {
        backgroundColor: "#F5F5F5",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
        marginBottom: 10,
    },
    modalChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    modalChipActive: {
        backgroundColor: "#8A0030",
        borderColor: "#8A0030",
    },
    modalChipText: {
        color: "#666",
        fontSize: 12,
    },
    modalChipTextActive: {
        color: "#FFF",
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        marginTop: 10,
    },
    cancelButton: {
        marginRight: 20,
    },
    saveButton: {
        backgroundColor: "#000",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
    },
});
