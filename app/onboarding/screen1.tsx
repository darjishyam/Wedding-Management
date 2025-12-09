import { useRouter } from "expo-router";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useOnboarding } from "@/contexts/OnboardingContext";

const { width, height } = Dimensions.get("window");
const ARCH_RADIUS = width * 0.65;

export default function Screen1() {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();

  const handleSkip = async () => {
    await completeOnboarding();
    router.push("/login");
  };

  return (
    <View style={styles.container}>
      
      {/* Skip */}
      <TouchableOpacity style={styles.skipContainer} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Content Area */}
      <View style={styles.contentArea}>
      {/* TOP ARCH IMAGE */}
      <View style={styles.archWrapper}>
        <Image
          source={require("../../assets/images/screen1.jpg")}
          style={styles.archImage}
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Say goodbye to physical chandla book</Text>

      <Text style={styles.description}>
        Hey there! Now you don't have to worry about losing your marriage chandla book.
      </Text>
      </View>

      {/* Bottom Row - Fixed at bottom */}
      <View style={styles.bottomRow}>
        <View style={styles.indicatorContainer}>
          <View style={styles.activeDot} />
          <View style={styles.inactiveDot} />
          <View style={styles.inactiveDot} />
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={() => router.push("/onboarding/screen2")}>
          <Text style={styles.nextArrow}>→</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FADADD",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },

  skipContainer: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 20,
  },

  skipText: {
    fontSize: 16,
    fontWeight: "600",
  },

  contentArea: {
    flex: 1,
  },

  /* -------- PERFECT FIGMA ARCH -------- */
  archWrapper: {
    width: "100%",
    height: height * 0.55,    // LARGER IMAGE AREA
    overflow: "hidden",

    // Curved at TOP instead of bottom
    borderTopLeftRadius: ARCH_RADIUS,
    borderTopRightRadius: ARCH_RADIUS,

    justifyContent: "flex-end",
    alignItems: "center",
  },

  archImage: {
    width: "120%",
    height: "140%",
    resizeMode: "cover",
    bottom: -60,  // pushes image UP
  },

  title: {
    marginTop: 25,
    fontSize: 32,
    fontWeight: "700",
    color: "#000",
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
