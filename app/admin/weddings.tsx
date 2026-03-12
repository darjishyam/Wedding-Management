import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function ManageWeddingsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [weddings, setWeddings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchWeddings();
        }, [])
    );

    const fetchWeddings = async () => {
        try {
            if (!user) return;
            const api = require('@/services/api').default;
            const res = await api.get('/admin/weddings');
            setWeddings(res.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch weddings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteWedding = async (id: string, name: string) => {
        Alert.alert(
            'Delete Wedding',
            `Are you sure you want to delete the wedding of ${name}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const api = require('@/services/api').default;
                            await api.delete(`/admin/weddings/${id}`);
                            Alert.alert('Success', 'Wedding deleted');
                            fetchWeddings();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete wedding');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.avatar}>
                    <Ionicons name="heart" size={24} color="#E91E63" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.weddingName}>{item.groomName} & {item.brideName}</Text>
                    <Text style={styles.weddingDate}>
                        {new Date(item.date).toLocaleDateString()}
                    </Text>
                    <Text style={styles.createBy}>Created by: {item.user?.name || 'Unknown'}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => handleDeleteWedding(item._id, `${item.groomName} & ${item.brideName}`)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={20} color="#FF5252" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>All Weddings ({weddings.length})</Text>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={weddings}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, color: '#888' }}>No weddings found</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    backButton: { marginRight: 16 },
    title: { fontSize: 20, fontWeight: 'bold' },
    list: { padding: 20 },
    card: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FCE4EC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    weddingName: { fontSize: 16, fontWeight: '600', color: '#333' },
    weddingDate: { fontSize: 13, color: '#666', marginTop: 2 },
    createBy: { fontSize: 11, color: '#999', marginTop: 2, fontStyle: 'italic' },
    deleteButton: { padding: 10 },
});
