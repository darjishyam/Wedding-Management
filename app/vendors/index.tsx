
import { useLanguage } from '@/contexts/LanguageContext';
import { useVendor } from '@/contexts/VendorContext';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VendorsScreen() {
    const router = useRouter();
    const { vendors, fetchVendors, isLoading } = useVendor();
    const { t } = useLanguage();
    const { user } = require('@/contexts/AuthContext').useAuth(); // Using require to avoid top-level import cycle if any, though cleaner is import.

    useFocusEffect(
        useCallback(() => {
            fetchVendors();
        }, [])
    );

    const handleExport = async () => {
        if (!user?.isPremium) {
            Alert.alert(
                "Premium Feature (College Demo)",
                "Exporting reports is a Premium feature. Upgrade for ₹499?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Upgrade Now",
                        onPress: () => router.push('/payment/mock-payment' as any)
                    }
                ]
            );
            return;
        }

        const html = require('@/services/PDFService').PDFService.generateVendorReportHTML(vendors);
        await require('@/services/PDFService').PDFService.generateAndSharePDF(html, "VendorReport");
    };

    const totalCost = vendors.reduce((sum, v) => sum + (v.totalAmount || 0), 0);
    const totalPaid = vendors.reduce((sum, v) => sum + (v.paidAmount || 0), 0);
    const pendingAmount = totalCost - totalPaid;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Vendors</Text>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={styles.addButtonSmall} onPress={handleExport}>
                        <Ionicons name="document-text-outline" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addButtonSmall} onPress={() => router.push('/vendors/add-vendor')}>
                        <Ionicons name="add" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchVendors} />}
            >
                {/* Summary Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <View>
                            <Text style={styles.summaryLabel}>Total Est.</Text>
                            <Text style={styles.summaryValue}>₹{totalCost.toLocaleString()}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.summaryLabel}>Paid</Text>
                            <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>₹{totalPaid.toLocaleString()}</Text>
                        </View>
                    </View>
                    <View style={[styles.summaryRow, { marginTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 12 }]}>
                        <Text style={styles.summaryLabelWhite}>Pending</Text>
                        <Text style={styles.summaryValueWhite}>₹{pendingAmount.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Vendors List */}
                <Text style={styles.sectionTitle}>All Vendors ({vendors.length})</Text>

                {vendors.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No vendors added yet.</Text>
                    </View>
                ) : (
                    vendors.map((vendor) => (
                        <TouchableOpacity
                            key={vendor._id}
                            style={styles.vendorCard}
                            onPress={() => router.push(`/vendors/${vendor._id}` as any)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.vendorHeader}>
                                <View>
                                    <Text style={styles.vendorName}>{vendor.name}</Text>
                                    <Text style={styles.vendorCategory}>{vendor.category}</Text>
                                </View>
                                <View style={[styles.statusBadge,
                                vendor.status === 'Paid' ? styles.statusPaid :
                                    vendor.status === 'Partial' ? styles.statusPartial : styles.statusPending
                                ]}>
                                    <Text style={[styles.statusText,
                                    vendor.status === 'Paid' ? styles.statusTextPaid :
                                        vendor.status === 'Partial' ? styles.statusTextPartial : styles.statusTextPending
                                    ]}>{vendor.status}</Text>
                                </View>
                            </View>

                            <View style={styles.vendorFooter}>
                                <Text style={styles.amountText}>₹{vendor.paidAmount.toLocaleString()} / ₹{vendor.totalAmount.toLocaleString()}</Text>
                            </View>

                            {/* Progress Bar */}
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, {
                                    width: `${Math.min((vendor.paidAmount / (vendor.totalAmount || 1)) * 100, 100)}%`,
                                    backgroundColor: vendor.status === 'Paid' ? '#4CAF50' : '#FFC107'
                                }]} />
                            </View>
                        </TouchableOpacity>
                    ))
                )}

            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => router.push('/vendors/add-vendor')}>
                <Ionicons name="add" size={30} color="#FFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    navTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    addButtonSmall: {
        padding: 8,
        marginRight: -8,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    summaryCard: {
        backgroundColor: '#000',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryLabel: {
        color: '#BBB',
        fontSize: 12,
        marginBottom: 4,
    },
    summaryValue: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '700',
    },
    summaryLabelWhite: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    summaryValueWhite: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
        color: '#333',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        color: '#999',
    },
    vendorCard: {
        backgroundColor: '#FAFAFA',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    vendorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    vendorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    vendorCategory: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusPaid: { backgroundColor: '#E8F5E9' },
    statusPartial: { backgroundColor: '#FFF8E1' },
    statusPending: { backgroundColor: '#FFEBEE' },
    statusText: { fontSize: 10, fontWeight: '700' },
    statusTextPaid: { color: '#4CAF50' },
    statusTextPartial: { color: '#FFB300' },
    statusTextPending: { color: '#EF5350' },
    vendorFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 8,
    },
    amountText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    progressBarBg: {
        height: 4,
        backgroundColor: '#EEE',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#000',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
