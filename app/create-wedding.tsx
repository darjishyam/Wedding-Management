import { useLanguage } from "@/contexts/LanguageContext";
import { useWedding } from "@/contexts/WeddingContext";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateWeddingScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { createWedding } = useWedding();

  // Form State
  const [groomName, setGroomName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [groomImage, setGroomImage] = useState<string | null>(null);
  const [brideImage, setBrideImage] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState("");
  const [weddingType, setWeddingType] = useState("Traditional");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Package State
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [filteredPackages, setFilteredPackages] = useState<any[]>([]);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const res = await api.get('/packages');
      setPackages(res.data);
      setFilteredPackages(res.data);
    } catch (error) {
      console.log('Error loading packages:', error);
    }
  };

  const pickImage = async (isGroom: boolean) => {
    const { launchImageLibraryAsync, MediaTypeOptions } = require('expo-image-picker');
    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      if (isGroom) {
        setGroomImage(uri);
      } else {
        setBrideImage(uri);
      }
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === 'set' || selectedDate) {
      setDate(currentDate);
    }
  };

  const handleCreateWedding = async () => {
    if (!groomName || !brideName || !date) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    if (!selectedPackage) {
      Alert.alert("Select Package", "Please select a wedding package to proceed.");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Creating wedding with:", {
        groomName,
        brideName,
        date,
        packageId: selectedPackage,
        location,
        type: weddingType
      });

      await createWedding({
        groomName,
        brideName,
        groomImage,
        brideImage,
        date,
        packageId: selectedPackage,
        location,
        type: weddingType
      });

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create wedding");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{t("create_wedding")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Basic Info */}
        <View style={styles.formSection}>
          <Text style={styles.label}>{t("groom_name")}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity onPress={() => pickImage(true)} style={{ marginRight: 16 }}>
              <Image
                source={groomImage ? { uri: groomImage } : require('../assets/images/empty_guest.png')}
                style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: '#DDD' }}
              />
              <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#E40046', borderRadius: 10, padding: 4 }}>
                <Ionicons name="camera" size={12} color="#FFF" />
              </View>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder={t("enter_groom_name")}
              value={groomName}
              onChangeText={setGroomName}
            />
          </View>

          <Text style={styles.label}>{t("bride_name")}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity onPress={() => pickImage(false)} style={{ marginRight: 16 }}>
              <Image
                source={brideImage ? { uri: brideImage } : require('../assets/images/empty_guest.png')}
                style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: '#DDD' }}
              />
              <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#E40046', borderRadius: 10, padding: 4 }}>
                <Ionicons name="camera" size={12} color="#FFF" />
              </View>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder={t("enter_bride_name")}
              value={brideName}
              onChangeText={setBrideName}
            />
          </View>

          <Text style={styles.label}>{t("wedding_date")}</Text>
          <Text style={styles.label}>{t("wedding_date")}</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={date.toISOString().split('T')[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                if (!isNaN(newDate.getTime())) {
                  setDate(newDate);
                }
              }}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #DDD',
                borderRadius: '8px',
                marginBottom: '20px',
                outline: 'none'
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{date.toDateString()}</Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                />
              )}
            </>
          )}
        </View>

        {/* New Fields: Location & Type */}
        <View style={styles.formSection}>
          <Text style={styles.label}>{t("location_venue") || "Location / City"}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Mumbai, Goa"
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>{t("wedding_type") || "Wedding Type"}</Text>
          <View style={styles.typeContainer}>
            {['Traditional', 'Destination'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  weddingType === type && styles.typeButtonSelected
                ]}
                onPress={() => setWeddingType(type)}
              >
                <Text style={[
                  styles.typeText,
                  weddingType === type && styles.typeTextSelected
                ]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Package Selection */}
        <View style={styles.formSection}>
          <Text style={[styles.label, { marginTop: 20 }]}>Select a Wedding Package</Text>
          <Text style={styles.helperText}>Choose a package to auto-setup your expenses and budget.</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.packageScroll}>
            {packages.map((pkg: any) => (
              <TouchableOpacity
                key={pkg._id}
                style={[
                  styles.packageCard,
                  selectedPackage === pkg._id && styles.packageCardSelected
                ]}
                onPress={() => setSelectedPackage(pkg._id)}
              >
                {/* Package Image */}
                <Image
                  source={{ uri: pkg.image || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop' }}
                  style={styles.packageImage}
                />

                {/* Overlay for Text Readability */}
                <View style={styles.packageOverlay} />

                {/* Content */}
                <View style={styles.packageContent}>
                  <View style={styles.packageBadge}>
                    <Text style={styles.packageBadgeText}>{pkg.type}</Text>
                  </View>
                  <Text style={styles.packageName} numberOfLines={2}>{pkg.name}</Text>
                  <Text style={styles.packagePrice}>₹{pkg.totalPrice.toLocaleString()}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color="#FFF" />
                    <Text style={styles.packageLocation}>{pkg.location}</Text>
                  </View>
                </View>

                {/* Selected Indicator */}
                {selectedPackage === pkg._id && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          {filteredPackages.length === 0 && (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>Loading packages...</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.disabledButton]}
          onPress={handleCreateWedding}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.createButtonText}>{t("create_wedding")}</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 30,
  },
  dateText: {
    fontSize: 16,
  },
  createButton: {
    backgroundColor: "#E40046",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  createButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  packageScroll: {
    marginTop: 10,
    marginBottom: 20,
  },
  packageCard: {
    width: 250,
    height: 320,
    backgroundColor: '#FFF', // Fallback
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  packageCardSelected: {
    borderWidth: 3,
    borderColor: '#2E7D32',
  },
  packageImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  packageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)', // Darken image
  },
  packageContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  packageBadge: {
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  packageBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  packageName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  packageLocation: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 2,
  },
  checkIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  helperText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  formSection: {
    marginBottom: 24,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  typeButtonSelected: {
    borderColor: '#E40046',
    backgroundColor: '#FFF0F5',
  },
  typeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  typeTextSelected: {
    color: '#E40046',
  }
});
