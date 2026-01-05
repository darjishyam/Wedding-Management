import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function ManageUsersScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchUsers();
        }, [])
    );

    const fetchUsers = async () => {
        try {
            if (!user) return;
            // Fetch directly using the backend URL 
            const api = require('@/services/api').default;
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (id: string, name: string) => {
        Alert.alert(
            'Delete User',
            `Are you sure you want to delete ${name}? This will remove all their data.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const api = require('@/services/api').default;
                            await api.delete(`/admin/users/${id}`);
                            Alert.alert('Success', 'User deleted');
                            fetchUsers();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete user');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name?.charAt(0) || 'U'}</Text>
                </View>
                <View>
                    <Text style={styles.userName}>{item.name} {item.isPremium && <Ionicons name="star" size={14} color="#FFD700" />}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <Text style={styles.userDate}>Joined: {new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => handleDeleteUser(item._id, item.name)} style={styles.deleteButton}>
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
                <Text style={styles.title}>All Users ({users.length})</Text>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, color: '#888' }}>No users found</Text>}
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
    userCard: {
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
    userInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: { fontSize: 18, color: '#1565C0', fontWeight: 'bold' },
    userName: { fontSize: 16, fontWeight: '600', color: '#333' },
    userEmail: { fontSize: 12, color: '#666', marginTop: 2 },
    userDate: { fontSize: 10, color: '#999', marginTop: 2 },
    deleteButton: { padding: 8 },
});
