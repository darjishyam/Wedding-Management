import { useLanguage } from "@/contexts/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, Image as RNImage } from "react-native";

export default function TabLayout() {
  const { t } = useLanguage();
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
          title: t("my_wedding"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="chandla"
        options={{
          title: t("my_shagun"),
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
        name="profile"
        options={{
          title: t("profile"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
