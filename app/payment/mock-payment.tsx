import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MockPaymentScreen() {
    const router = useRouter();
    const { reloadUser } = useAuth();
    const [selectedMethod, setSelectedMethod] = useState<'card' | 'upi'>('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form States
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [upiId, setUpiId] = useState('');

    const handlePay = async (forcedMethod?: 'card' | 'upi', forcedId?: string) => {
        Keyboard.dismiss();

        const method = forcedMethod || selectedMethod;
        const currentUpiId = forcedId || upiId;
        const currentCard = cardNumber; // no force needed for card usually

        if (method === 'card' && (cardNumber.length < 4 || expiry.length < 1 || cvv.length < 1)) {
            Alert.alert("Invalid Details", "Enter any dummy card details.");
            return;
        }
        if (method === 'upi' && upiId.length < 3) {
            Alert.alert("Invalid ID", "Enter any dummy UPI ID.");
            return;
        }

        setIsProcessing(true);

        // Simulate Network Processing
        setTimeout(async () => {
            try {
                // Call backend simulate endpoint
                const api = require('@/services/api').default;
                await api.post('/payment/simulate');

                // Refresh User Context
                await reloadUser();

                setIsProcessing(false);
                setShowSuccess(true);

                // Auto Close after Success Animation
                setTimeout(() => {
                    setShowSuccess(false);
                    Alert.alert("Payment Successful", "Premium features unlocked!", [
                        { text: "View Profile", onPress: () => router.replace('/(tabs)/profile') }
                    ]);
                }, 2000);

            } catch (error: any) {
                setIsProcessing(false);
                Alert.alert("Payment Failed", "Could not verify payment. Try again.");
            }
        }, 2000); // 2 second fake delay
    };

    const formatCardNumber = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
        setCardNumber(formatted);
    };

    const formatExpiry = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
        } else {
            setExpiry(cleaned);
        }
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* Success Modal Overlay */}
            <Modal visible={showSuccess} transparent animationType="fade">
                <View style={styles.successOverlay}>
                    <View style={styles.successCard}>
                        <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                        <Text style={styles.successTitle}>Payment Successful!</Text>
                        <Text style={styles.successSub}>Transcation ID: TXN_{Date.now().toString().slice(-6)}</Text>
                    </View>
                </View>
            </Modal>

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            // Fallback if opened directly or history lost
                            router.replace('/vendors' as any);
                        }
                    }}
                    // removed disabled={isProcessing} so user can always escape
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    style={{ padding: 8, marginLeft: -8 }}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Secure Payment</Text>
                <Ionicons name="lock-closed" size={18} color="#4CAF50" />
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

                {/* Amount Banner */}
                <View style={styles.amountBanner}>
                    <Text style={styles.amountLabel}>Total Payable</Text>
                    <Text style={styles.amountValue}>₹499.00</Text>
                </View>

                <Text style={styles.sectionTitle}>Payment Method</Text>

                <View style={styles.methodSelector}>
                    <TouchableOpacity
                        style={[styles.methodOption, selectedMethod === 'card' && styles.methodActive]}
                        onPress={() => setSelectedMethod('card')}
                    >
                        <Ionicons name="card" size={24} color={selectedMethod === 'card' ? '#6C63FF' : '#666'} />
                        <Text style={[styles.methodText, selectedMethod === 'card' && styles.methodTextActive]}>Card</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.methodOption, selectedMethod === 'upi' && styles.methodActive]}
                        onPress={() => setSelectedMethod('upi')}
                    >
                        <Ionicons name="qr-code" size={24} color={selectedMethod === 'upi' ? '#6C63FF' : '#666'} />
                        <Text style={[styles.methodText, selectedMethod === 'upi' && styles.methodTextActive]}>UPI</Text>
                    </TouchableOpacity>
                </View>

                {/* Secure Form */}
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View style={styles.formContainer}>
                        {selectedMethod === 'card' ? (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Card Number</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0000 0000 0000 0000"
                                        keyboardType="number-pad"
                                        maxLength={19}
                                        value={cardNumber}
                                        onChangeText={formatCardNumber}
                                    />
                                    <Ionicons name="card-outline" size={20} color="#999" style={styles.inputIcon} />
                                </View>
                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                        <Text style={styles.label}>Expiry Date</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="MM/YY"
                                            keyboardType="number-pad"
                                            maxLength={5}
                                            value={expiry}
                                            onChangeText={formatExpiry}
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={styles.label}>CVV</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="123"
                                            keyboardType="number-pad"
                                            maxLength={3}
                                            secureTextEntry
                                            value={cvv}
                                            onChangeText={setCvv}
                                        />
                                    </View>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Cardholder Name</Text>
                                    <TextInput style={styles.input} placeholder="Name on Card" />
                                </View>
                            </>
                        ) : (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Pay via App</Text>
                                <View style={styles.upiAppsContainer}>
                                    <TouchableOpacity style={styles.upiAppButton} onPress={() => {
                                        setSelectedMethod('upi');
                                        setUpiId('user@okaxis');
                                        handlePay('upi', 'user@okaxis'); // Pass directly
                                    }}>
                                        <View style={[styles.upiIcon, { backgroundColor: '#5F259F' }]}>
                                            <Text style={styles.upiIconText}>Ph</Text>
                                        </View>
                                        <Text style={styles.upiAppText}>PhonePe</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.upiAppButton} onPress={() => {
                                        setSelectedMethod('upi');
                                        setUpiId('user@oksbi');
                                        handlePay('upi', 'user@oksbi');
                                    }}>
                                        <View style={[styles.upiIcon, { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD' }]}>
                                            <Ionicons name="logo-google" size={28} color="#4285F4" />
                                        </View>
                                        <Text style={styles.upiAppText}>Google Pay</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.upiAppButton} onPress={() => {
                                        setSelectedMethod('upi');
                                        setUpiId('user@paytm');
                                        handlePay('upi', 'user@paytm');
                                    }}>
                                        <View style={[styles.upiIcon, { backgroundColor: '#00B9F1' }]}>
                                            <Text style={styles.upiIconText}>Pm</Text>
                                        </View>
                                        <Text style={styles.upiAppText}>Paytm</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.upiAppButton} onPress={() => {
                                        setSelectedMethod('upi');
                                        setUpiId('user@apl');
                                        handlePay('upi', 'user@apl');
                                    }}>
                                        <View style={[styles.upiIcon, { backgroundColor: '#FF9900' }]}>
                                            <Text style={styles.upiIconText}>Am</Text>
                                        </View>
                                        <Text style={styles.upiAppText}>Amazon</Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={[styles.label, { marginTop: 20 }]}>Or enter UPI ID</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="example@upi"
                                    autoCapitalize="none"
                                    value={upiId}
                                    onChangeText={setUpiId}
                                />
                                <Text style={styles.helperText}>Enter your GooglePay / PhonePe / Paytm ID</Text>
                            </View>
                        )}
                    </View>
                </KeyboardAvoidingView>

                {/* Footer Badges */}
                <View style={styles.trustBadges}>
                    <Ionicons name="shield-checkmark" size={16} color="#666" />
                    <Text style={styles.trustText}>100% Safe & Secure Payments</Text>
                </View>

            </ScrollView>

            {/* Pay Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
                    onPress={() => handlePay()}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.payButtonText}>Pay ₹499.00</Text>
                    )}
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 16,
        marginRight: 6,
        flex: 1,
    },
    content: {
        padding: 20,
    },
    amountBanner: {
        alignItems: 'center',
        marginBottom: 30,
    },
    amountLabel: {
        fontSize: 14,
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    amountValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    methodSelector: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    methodOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
    },
    methodActive: {
        backgroundColor: '#F3E5F5',
    },
    methodText: {
        marginLeft: 8,
        fontWeight: '600',
        color: '#666',
    },
    methodTextActive: {
        color: '#6C63FF',
    },
    formContainer: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    inputGroup: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 12,
        color: '#666',
        marginBottom: 6,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
        color: '#000',
    },
    inputIcon: {
        position: 'absolute',
        right: 12,
        top: 36,
    },
    helperText: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    trustBadges: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        opacity: 0.7,
    },
    trustText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 6,
    },
    footer: {
        padding: 20,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    payButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    payButtonDisabled: {
        opacity: 0.7,
    },
    payButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    successOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successCard: {
        backgroundColor: '#FFF',
        padding: 40,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginTop: 16,
        marginBottom: 8,
    },
    successSub: {
        fontSize: 14,
        color: '#666',
    },
    upiAppsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    upiAppButton: {
        alignItems: 'center',
        width: 70,
    },
    upiIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    upiIconText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    upiAppText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
});
