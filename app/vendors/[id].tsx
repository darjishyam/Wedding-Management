import { useVendor } from "@/contexts/VendorContext";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from 'expo-web-browser';
import api from "@/services/api";

export default function VendorDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { vendors, addPaymentToVendor } = useVendor();
    const { user } = useAuth();

    const vendor = vendors.find(v => v._id === id);

    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [mode, setMode] = useState('Cash'); // Cash, UPI, Online
    const [isProcessing, setIsProcessing] = useState(false);

    if (!vendor) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Vendor not found</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const handleAddPayment = async () => {
        if (!amount || isNaN(Number(amount))) {
            Alert.alert("Invalid Amount", "Please enter a valid amount.");
            return;
        }

        if (mode === 'Online') {
            handleRazorpayPayment();
            return;
        }

        setIsProcessing(true);
        try {
            await addPaymentToVendor(vendor._id, Number(amount), mode, note);
            setPaymentModalVisible(false);
            setAmount('');
            setNote('');
            Alert.alert("Success", "Payment recorded successfully!");
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to add payment.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRazorpayPayment = async () => {
        setIsProcessing(true);
        try {
            // 1. Create Order on Backend
            const orderRes = await api.post('/payment/order', {
                amount: Number(amount),
                currency: 'INR',
                vendorId: vendor._id
            });

            const orderData = orderRes.data;
            if (orderData && orderData.id) {
                // 2. Open Hosted Checkout
                const checkoutUrl = `${api.defaults.baseURL}/payment/razorpay-checkout?orderId=${orderData.id}&amount=${orderData.amount}&vendorId=${vendor._id}&vendorAmount=${amount}&userId=${user?._id}`;
                
                console.log("[Razorpay] Opening Vendor Checkout:", checkoutUrl);
                await WebBrowser.openBrowserAsync(checkoutUrl);

                // 3. After returning
                Alert.alert(
                    "Payment Done?",
                    "If you completed the payment, return to the vendor list to see updated balance.",
                    [{
                        text: "Check Status", onPress: () => {
                            router.replace('/vendors' as any);
                        }
                    }]
                );
            }
        } catch (error: any) {
            console.error("Razorpay Init Error:", error);
            Alert.alert("Error", "Could not start Razorpay checkout.");
        } finally {
            setIsProcessing(false);
            setPaymentModalVisible(false);
        }
    };

    const pendingAmount = (vendor.totalAmount || 0) - (vendor.paidAmount || 0);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.navBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.navTitle} numberOfLines={1}>{vendor.name}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Stats Card */}
                <View style={styles.statsCard}>
                    <View style={styles.statRow}>
                        <View>
                            <Text style={styles.statLabel}>Total Amount</Text>
                            <Text style={styles.statValue}>₹{vendor.totalAmount?.toLocaleString()}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.statLabel}>Paid</Text>
                            <Text style={[styles.statValue, { color: '#4CAF50' }]}>₹{vendor.paidAmount?.toLocaleString()}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.statRow}>
                        <View>
                            <Text style={[styles.statLabel, { color: '#FFF' }]}>Status</Text>
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
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={[styles.statLabel, { color: '#FFF' }]}>Pending</Text>
                            <Text style={[styles.statValue, { color: '#FF5252' }]}>₹{pendingAmount.toLocaleString()}</Text>
                        </View>
                    </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.sectionHeader}>Details</Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="pricetag" size={18} color="#666" />
                        <Text style={styles.infoText}>{vendor.category}</Text>
                    </View>
                    {vendor.contact ? (
                        <View style={styles.infoRow}>
                            <Ionicons name="call" size={18} color="#666" />
                            <Text style={styles.infoText}>{vendor.contact}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Payment History */}
                <View style={styles.historySection}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.sectionHeader}>Payment History</Text>
                        <TouchableOpacity onPress={() => setPaymentModalVisible(true)} style={styles.addPaymentLink}>
                            <Text style={styles.addPaymentLinkText}>+ Add Payment</Text>
                        </TouchableOpacity>
                    </View>

                    {(!vendor.payments || vendor.payments.length === 0) ? (
                        <Text style={styles.emptyHistory}>No payments recorded yet.</Text>
                    ) : (
                        vendor.payments.map((p: any, index: number) => (
                            <View key={index} style={styles.paymentRow}>
                                <View style={styles.paymentInfo}>
                                    <Text style={styles.paymentDate}>{new Date(p.date).toLocaleDateString()}</Text>
                                    <Text style={styles.paymentMode}>{p.mode} {p.note ? `• ${p.note}` : ''}</Text>
                                </View>
                                <Text style={styles.paymentAmount}>+ ₹{p.amount.toLocaleString()}</Text>
                            </View>
                        ))
                    )}
                </View>

            </ScrollView>

            {/* FAB for Payment */}
            {pendingAmount > 0 && (
                <TouchableOpacity style={styles.fab} onPress={() => setPaymentModalVisible(true)}>
                    <Text style={styles.fabText}>Pay Now</Text>
                    <Ionicons name="cash" size={24} color="#FFF" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            )}

            {/* Add Payment Modal */}
            <Modal
                visible={paymentModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setPaymentModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Payment</Text>
                            <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Amount</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Amount"
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Payment Mode</Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                {['Cash', 'UPI', 'Online'].map(m => (
                                    <TouchableOpacity
                                        key={m}
                                        style={[styles.modeChip, mode === m && styles.modeChipSelected]}
                                        onPress={() => setMode(m)}
                                    >
                                        <Text style={[styles.modeText, mode === m && styles.modeTextSelected]}>{m}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Note (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Advance, 2nd Installment"
                                value={note}
                                onChangeText={setNote}
                            />
                        </View>

                        <TouchableOpacity 
                            style={[styles.submitBtn, isProcessing && { opacity: 0.7 }]} 
                            onPress={handleAddPayment}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.submitBtnText}>
                                    {mode === 'Online' ? 'Proceed to Razorpay' : 'Confirm Payment'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    backButton: { padding: 8, marginLeft: -8 },
    navTitle: { fontSize: 18, fontWeight: '700' },
    content: { padding: 20 },
    statsCard: { backgroundColor: '#000', borderRadius: 16, padding: 20, marginBottom: 24 },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statLabel: { color: '#BBB', fontSize: 12, marginBottom: 4 },
    statValue: { color: '#FFF', fontSize: 20, fontWeight: '700' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 16 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: -4 },
    statusPaid: { backgroundColor: '#E8F5E9' },
    statusPartial: { backgroundColor: '#FFF8E1' },
    statusPending: { backgroundColor: '#FFEBEE' },
    statusText: { fontSize: 12, fontWeight: '700' },
    statusTextPaid: { color: '#4CAF50' },
    statusTextPartial: { color: '#FFB300' },
    statusTextPending: { color: '#EF5350' },

    infoSection: { marginBottom: 24 },
    sectionHeader: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#333' },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    infoText: { marginLeft: 10, fontSize: 16, color: '#444' },

    historySection: { marginBottom: 100 },
    historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    addPaymentLink: { padding: 8 },
    addPaymentLinkText: { color: '#007AFF', fontWeight: '600' },
    paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    paymentInfo: {},
    paymentDate: { fontSize: 12, color: '#888' },
    paymentMode: { fontSize: 14, fontWeight: '500', color: '#000' },
    paymentAmount: { fontSize: 16, fontWeight: '600', color: '#4CAF50' },
    emptyHistory: { color: '#999', fontStyle: 'italic' },

    fab: {
        position: 'absolute', bottom: 30, right: 20, left: 20,
        backgroundColor: '#000', height: 56, borderRadius: 28,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4
    },
    fabText: { fontSize: 18, fontWeight: '600', color: '#FFF' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '700' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
    input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: '#FAFAFA' },
    modeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#DDD', marginRight: 0 },
    modeChipSelected: { backgroundColor: '#000', borderColor: '#000' },
    modeText: { color: '#666' },
    modeTextSelected: { color: '#FFF', fontWeight: '600' },
    submitBtn: { backgroundColor: '#000', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});
