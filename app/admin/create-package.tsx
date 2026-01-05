import api from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function AdminCreatePackage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Package Details
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('India');
    const [location, setLocation] = useState('');
    const [venue, setVenue] = useState('');
    const [totalPrice, setTotalPrice] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [tempUploadedUrl, setTempUploadedUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Costs Breakdown
    const [catering, setCatering] = useState('');
    const [decoration, setDecoration] = useState('');
    const [stay, setStay] = useState('');

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setTempUploadedUrl(null); // Reset when image changes
        }
    };

    const uploadToImageKit = async (uri: string) => {
        console.log("Starting uploadToImageKit with URI:", uri);
        try {
            // 1. Get auth params from backend
            console.log("Fetching auth params...");
            const authResponse = await api.get('/upload/auth');
            const { signature, expire, token } = authResponse.data;
            const filename = uri.split('/').pop() || 'upload.jpg';
            console.log("Auth params received. Filename:", filename);

            // 2. Prepare Upload based on Platform
            if (Platform.OS === 'web') {
                console.log("Platform: WEB. Converting to Blob...");
                // WEB: Convert URI to Blob and use fetch
                const response = await fetch(uri);
                const blob = await response.blob();
                console.log("Blob created. Size:", blob.size);

                const formData = new FormData();
                formData.append('file', blob, filename);
                formData.append('fileName', filename);
                formData.append('publicKey', 'public_CyXQrr8IOerPKnKy/ftkpmySVc0=');
                formData.append('signature', signature);
                formData.append('expire', expire);
                formData.append('token', token);
                formData.append('useUniqueFileName', 'true');
                formData.append('folder', '/packages');

                console.log("Sending Web Upload Request...");
                const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                    method: 'POST',
                    body: formData
                });

                const data = await uploadResponse.json();
                console.log("Upload Response:", data);
                if (data.url) return data.url;
                else throw new Error('Web upload failed: ' + JSON.stringify(data));

            } else {
                console.log("Platform: NATIVE. Using expo-file-system");
                // NATIVE: Use FileSystem.uploadAsync
                const fileSystem = require('expo-file-system');
                console.log("Starting native upload...");
                const uploadResult = await fileSystem.uploadAsync('https://upload.imagekit.io/api/v1/files/upload', uri, {
                    fieldName: 'file',
                    httpMethod: 'POST',
                    uploadType: fileSystem.FileSystemUploadType.MULTIPART,
                    parameters: {
                        fileName: filename,
                        publicKey: 'public_CyXQrr8IOerPKnKy/ftkpmySVc0=',
                        signature: signature,
                        expire: expire.toString(),
                        token: token,
                        useUniqueFileName: 'true',
                        folder: '/packages'
                    }
                });

                console.log("Native upload complete. Status:", uploadResult.status);
                if (uploadResult.status !== 200) {
                    throw new Error(`Upload failed with status ${uploadResult.status}`);
                }
                const data = JSON.parse(uploadResult.body);
                if (data.url) return data.url;
                else throw new Error('Native upload failed');
            }
        } catch (error) {
            console.error("Upload error details:", error);
            throw error;
        }
    };

    const handleGenerateDescription = async () => {
        if (!imageUri) {
            Alert.alert("No Image", "Please upload a package image first.");
            return;
        }

        setIsGenerating(true);
        try {
            // 1. Upload if not already uploaded
            let url = tempUploadedUrl;
            if (!url) {
                url = await uploadToImageKit(imageUri);
                setTempUploadedUrl(url);
            }

            // 2. Call AI Endpoint
            const response = await api.post('/ai/package-description', {
                imageUrl: url,
                name: name,
                type: type
            });

            if (response.data.description) {
                setDescription(response.data.description);
            }

        } catch (error: any) {
            Alert.alert("AI Error", error.response?.data?.message || "Failed to generate description");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCreate = async () => {
        console.log("Create button clicked");
        if (!name || !totalPrice || !location) {
            console.log("Validation failed: Missing fields");
            Alert.alert('Missing Fields', 'Please fill in Name, Location and Total Price.');
            return;
        }

        console.log("Validation passed. Starting creation...");
        setIsLoading(true);
        try {
            let uploadedImageUrl = tempUploadedUrl || '';
            if (imageUri && !uploadedImageUrl) {
                console.log("Image not pre-uploaded. Uploading now...");
                uploadedImageUrl = await uploadToImageKit(imageUri);
            }

            // Flatten payload for backend controller compatibility
            const payload = {
                name,
                description,
                type,
                location,
                venue,
                totalPrice: Number(totalPrice),
                image: uploadedImageUrl,
                catering: Number(catering) || 0,
                decoration: Number(decoration) || 0,
                stay: Number(stay) || 0,
                items: { // Keeping this just in case, but backend seems to reconstruct it from root args
                    catering: Number(catering) || 0,
                    decoration: Number(decoration) || 0,
                    stay: Number(stay) || 0,
                    venue: 0
                }
            };

            await api.post('/packages', payload);
            console.log("Package created successfully in Backend.");

            if (Platform.OS === 'web') {
                window.alert('Package created successfully!');
                router.back();
            } else {
                Alert.alert('Success', 'Package created successfully!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            }

        } catch (error: any) {
            console.error("Creation Error:", error);
            const msg = error.response?.data?.message || 'Failed to create package';
            if (Platform.OS === 'web') {
                window.alert('Error: ' + msg);
            } else {
                Alert.alert('Error', msg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/admin/dashboard' as any)} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.title}>Create New Package</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Image Picker Section */}
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <Ionicons name="image-outline" size={40} color="#666" />
                            <Text style={styles.placeholderText}>Tap to add Package Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Section: Basic Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Package Details</Text>
                    <Text style={styles.label}>Package Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Royal Gold Package"
                        value={name}
                        onChangeText={setName}
                    />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ fontSize: 14, color: '#666' }}>Description</Text>
                        {imageUri && (
                            <TouchableOpacity
                                onPress={handleGenerateDescription}
                                disabled={isGenerating}
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                            >
                                {isGenerating ? (
                                    <ActivityIndicator size="small" color="#2E7D32" />
                                ) : (
                                    <>
                                        <Ionicons name="sparkles" size={16} color="#2E7D32" />
                                        <Text style={{ color: '#2E7D32', fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>
                                            Auto-Generate
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                    <TextInput
                        style={[styles.input, { height: 80 }]}
                        placeholder="Describe what's included..."
                        multiline
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                    />

                    <Text style={styles.label}>Type</Text>
                    <View style={styles.chipContainer}>
                        {['India', 'Destination'].map((t) => (
                            <TouchableOpacity
                                key={t}
                                style={[styles.chip, type === t && styles.chipActive]}
                                onPress={() => setType(t)}
                            >
                                <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Section: Location */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Location & Venue</Text>
                    <Text style={styles.label}>Location (City)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Udaipur"
                        value={location}
                        onChangeText={setLocation}
                    />
                    <Text style={styles.label}>Venue Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. The Oberoi Udaivilas"
                        value={venue}
                        onChangeText={setVenue}
                    />
                </View>

                {/* Section: Financials */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pricing & Breakdown</Text>

                    <Text style={styles.label}>Total Package Price (₹)</Text>
                    <TextInput
                        style={[styles.input, { fontSize: 18, fontWeight: 'bold' }]}
                        placeholder="0"
                        keyboardType="numeric"
                        value={totalPrice}
                        onChangeText={setTotalPrice}
                    />

                    <Text style={styles.subHeader}>Internal Cost Allocation (For Expense Tracking)</Text>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Catering</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                keyboardType="numeric"
                                value={catering}
                                onChangeText={setCatering}
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Decoration</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                keyboardType="numeric"
                                value={decoration}
                                onChangeText={setDecoration}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Stay</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                keyboardType="numeric"
                                value={stay}
                                onChangeText={setStay}
                            />
                        </View>
                        {/* Shagun Removed */}
                    </View>

                </View>

                <TouchableOpacity
                    style={[styles.createButton, isLoading && styles.disabledButton]}
                    onPress={handleCreate}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.createButtonText}>Create Package</Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
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
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    scrollContent: {
        padding: 20,
    },
    imagePicker: {
        width: '100%',
        height: 200,
        backgroundColor: '#E0E0E0',
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    placeholderContainer: {
        alignItems: 'center',
    },
    placeholderText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
    section: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    subHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginTop: 10,
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#1A1A1A',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    chipActive: {
        backgroundColor: '#E8F5E9',
        borderColor: '#2E7D32',
    },
    chipText: {
        fontSize: 14,
        color: '#666',
    },
    chipTextActive: {
        color: '#2E7D32',
        fontWeight: '600',
    },
    createButton: {
        backgroundColor: '#2E7D32',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        opacity: 0.7,
    },
    createButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
