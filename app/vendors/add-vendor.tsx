
import { useLanguage } from '@/contexts/LanguageContext';
import { useVendor } from '@/contexts/VendorContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddVendorScreen() {
    const router = useRouter();
    const { addVendor } = useVendor();
    const { t } = useLanguage();

    const [name, setName] = useState('');
    const [category, setCategory] = useState('Other');
    const [contact, setContact] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [paidAmount, setPaidAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const categories = ['Catering', 'Decoration', 'Photography', 'Venue', 'Makeup', 'Music', 'Other'];

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "Name is required");
            return;
        }
        if (!totalAmount.trim()) {
            Alert.alert("Error", "Total Amount is required");
            return;
        }

        setLoading(true);
        try {
            await addVendor({
                name,
                category,
                contact,
                totalAmount: parseFloat(totalAmount) || 0,
                paidAmount: parseFloat(paidAmount) || 0
            });
            Alert.alert("Success", "Vendor added successfully");
            if (Platform.OS === 'web') {
                router.replace('/vendors' as any);
            } else {
                router.back();
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to add vendor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Add Vendor</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView contentContainerStyle={styles.content}>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('name') || "Name"} *</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g. Royal Catering"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('category') || "Category"}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 8 }}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.chip, category === cat && styles.chipSelected]}
                                    onPress={() => setCategory(cat)}
                                >
                                    <Text style={[styles.chipText, category === cat && styles.chipTextSelected]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('contact') || "Contact Number"}</Text>
                        <TextInput
                            style={styles.input}
                            value={contact}
                            onChangeText={setContact}
                            placeholder="e.g. 9876543210"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Total Amount *</Text>
                            <TextInput
                                style={styles.input}
                                value={totalAmount}
                                onChangeText={setTotalAmount}
                                placeholder="0"
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Paid Amount</Text>
                            <TextInput
                                style={styles.input}
                                value={paidAmount}
                                onChangeText={setPaidAmount}
                                placeholder="0"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.saveButton, loading && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        <Text style={styles.saveButtonText}>{loading ? "Saving..." : "Save Vendor"}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
    content: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        fontSize: 16,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#EEE',
    },
    chipSelected: {
        backgroundColor: '#FFF0F5',
        borderColor: '#E40046',
    },
    chipText: {
        color: '#666',
        fontSize: 14,
    },
    chipTextSelected: {
        color: '#E40046',
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    saveButton: {
        backgroundColor: '#000',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
