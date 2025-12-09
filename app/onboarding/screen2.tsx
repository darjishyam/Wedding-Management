import { useRouter } from "expo-router";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useOnboarding } from "@/contexts/OnboardingContext";

const { width, height } = Dimensions.get("window");
const ARCH_RADIUS = width * 0.6;

export default function Screen2() {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();

  const handleSkip = async () => {
    await completeOnboarding();
    router.push("/login");
  };

  return (
    <View style={styles.container}>

      <TouchableOpacity style={styles.skipContainer} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Content Area */}
      <View style={styles.contentArea}>
      {/* Arch Image */}
      <View style={styles.archWrapper}>
        <Image
          source={require("../../assets/images/screen2.jpg")}
          style={styles.archImage}
        />
      </View>

      <Text style={styles.title}>Manage your guest list invitations</Text>

      <Text style={styles.description}>
        Invite, track, and manage with ease your ultimate tool for seamless guest list and invitation management!
      </Text>
      </View>

      {/* Bottom Row - Fixed at bottom */}
      <View style={styles.bottomRow}>
        <View style={styles.indicatorContainer}>
          <View style={styles.inactiveDot} />
          <View style={styles.activeDot} />
          <View style={styles.inactiveDot} />
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={() => router.push("/onboarding/screen3")}>
          <Text style={styles.nextArrow}>→</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCE9B0",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },

  skipContainer: {
    position: "absolute",
    right: 20,
    top: 40,
    zIndex: 10,
  },

  skipText: {
    fontSize: 16,
    fontWeight: "600",
  },

  contentArea: {
    flex: 1,
  },

  archWrapper: {
    width: "100%",
    height: height * 0.55,    // LARGER IMAGE AREA
    overflow: "hidden",
    borderTopLeftRadius: ARCH_RADIUS,
    borderTopRightRadius: ARCH_RADIUS,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  archImage: {
    width: "140%",
    height: "140%",
    resizeMode: "cover",
    bottom: -60,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 25,
    lineHeight: 40,
  },

  description: {
    marginTop: 15,
    fontSize: 17,
    color: "#444",
    lineHeight: 26,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
  },

  indicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  activeDot: {
    width: 10,
    height: 10,
    backgroundColor: "#000",
    borderRadius: 5,
    marginRight: 6,
  },

  inactiveDot: {
    width: 8,
    height: 8,
    backgroundColor: "#999",
    borderRadius: 4,
    marginRight: 6,
  },

  nextButton: {
    width: 55,
    height: 55,
    backgroundColor: "#000",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  nextArrow: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "700",
  },
});
