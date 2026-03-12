import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function AdminDashboard() {
    const router = useRouter();
    const { logout, user } = useAuth();
    const [stats, setStats] = React.useState({ users: 0, weddings: 0, premiumUsers: 0, vendors: 0, packages: 0, revenue: 0 });

    React.useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const api = require('@/services/api').default;
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch admin stats", error);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/login' as any);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Admin Dashboard</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
                </TouchableOpacity>
            </View>

            <View style={styles.welcomeCard}>
                <Text style={styles.welcomeText}>System Overview</Text>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.users}</Text>
                        <Text style={styles.statLabel}>Users</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.weddings}</Text>
                        <Text style={styles.statLabel}>Weddings</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>₹{(stats.revenue || 0).toLocaleString()}</Text>
                        <Text style={styles.statLabel}>Revenue</Text>
                    </View>
                </View>
            </View>

            <View style={styles.grid}>
                <TouchableOpacity style={styles.card} onPress={() => router.push('/admin/create-package' as any)}>
                    <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                        <Ionicons name="cube-outline" size={32} color="#2E7D32" />
                    </View>
                    <Text style={styles.cardTitle}>Create Package</Text>
                    <Text style={styles.cardDescription}>Add new standard wedding package ({stats.packages})</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.card} onPress={() => router.push('/admin/users' as any)}>
                    <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                        <Ionicons name="people-outline" size={32} color="#1565C0" />
                    </View>
                    <Text style={styles.cardTitle}>Manage Users</Text>
                    <Text style={styles.cardDescription}>View registered users ({stats.users})</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.card} onPress={() => router.push('/admin/weddings' as any)}>
                    <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
                        <Ionicons name="heart-outline" size={32} color="#8E24AA" />
                    </View>
                    <Text style={styles.cardTitle}>Manage Weddings</Text>
                    <Text style={styles.cardDescription}>View all weddings ({stats.weddings})</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flexGrow: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    logoutButton: {
        padding: 10,
        backgroundColor: '#FFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    welcomeCard: {
        backgroundColor: '#6C63FF',
        borderRadius: 20,
        padding: 24,
        marginBottom: 30,
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    welcomeText: {
        color: '#FFF',
        fontSize: 16,
        opacity: 0.9,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        width: '47%',
        minWidth: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
});
