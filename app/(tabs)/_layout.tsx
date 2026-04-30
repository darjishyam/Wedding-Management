import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, Image as RNImage } from "react-native";
import { useEffect } from "react";
import FirebaseService from "@/services/FirebaseService";


export default function TabLayout() {
  useEffect(() => {
    if (Platform.OS === 'web') return;

    // 1. Setup foreground notification handler (heads-up alerts)
    const unsubscribe = FirebaseService.setupForegroundHandler();

    // 2. Handle app opened from quit state
    FirebaseService.handleInitialNotification();

    // 3. Register for notifications if a session exists
    // (This acts as a backup in case registration fails during login)
    FirebaseService.registerForPushNotifications();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#666666",
        tabBarStyle: {
          height: Platform.OS === "android" ? 80 : 100,
          paddingBottom: Platform.OS === "android" ? 20 : 30,
          paddingTop: 10,
          position: "absolute",
          backgroundColor: "#000",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "My Wedding",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="chandla"
        options={{
          title: "My Shagun",
          tabBarIcon: ({ color }) => (
            <RNImage
              source={require("@/assets/images/wallet.png")}
              style={{ width: 24, height: 24, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="checklist"
        options={{
          title: "Checklist",
          tabBarIcon: ({ color }) => (
            <Ionicons name="checkbox-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

