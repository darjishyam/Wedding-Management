
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Image, ImageBackground, Platform, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === 'web';
const CARD_WIDTH = isWeb ? 450 : width * 0.95;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

const DEMO_EVENTS = [
    { name: "Mandap Muhurat", time: "08:00 AM" },
    { name: "Grah Shanti", time: "10:30 AM" },
    { name: "Sangeet Sandhya", time: "07:30 PM" },
    { name: "Baraat Prasthan", time: "09:30 AM" },
    { name: "Hast Melap", time: "12:39 PM" },
    { name: "Dinner", time: "07:00 PM" },
];

interface InvitationCardProps {
    theme: "traditional" | "modern" | "minimal" | "gujarati" | "classic_kankotri" | "premium_gujarati";
    weddingDetails: {
        groomName: string;
        brideName: string;
        date: string;
        venue: string;
        message: string;
    };
    events?: any[];
}

const ThemeConfig = {
    traditional: {
        primary: "#8B0000",
        secondary: "#C5A059",
        bg: "#FFF",
        borderWidth: 2,
        innerBorderColor: "#8B0000",
        boxBg: "rgba(255, 245, 245, 0.8)",
        fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
        bgImage: null,
        overlayImage: require("../assets/images/gold_ornate_border.png"),
    },
    modern: {
        primary: "#6B4226",
        secondary: "#E8D5C4",
        bg: "#FAF9F6",
        borderWidth: 1,
        innerBorderColor: "#6B4226",
        boxBg: "rgba(255, 255, 255, 0.9)",
        fontFamily: Platform.OS === 'ios' ? 'Palatino' : 'serif',
        bgImage: require("../assets/images/floral_invitation_bg.png"),
        overlayImage: null,
    },
    minimal: {
        primary: "#2C3E50",
        secondary: "#BDC3C7",
        bg: "#FFF",
        borderWidth: 1,
        innerBorderColor: "#EEE",
        boxBg: "rgba(249, 250, 251, 0.9)",
        fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif',
        bgImage: require("../assets/images/minimal_paper_texture.png"),
        overlayImage: null,
    },
    gujarati: {
        primary: "#8B0000",
        secondary: "#000",
        bg: "#FFF",
        borderWidth: 2,
        innerBorderColor: "#8B0000",
        boxBg: "rgba(255, 245, 245, 0.8)",
        fontFamily: Platform.OS === 'ios' ? 'Gujarati Sangam MN' : 'serif',
        bgImage: null,
        overlayImage: require("../assets/images/gold_ornate_border.png"),
    },
    classic_kankotri: {
        primary: "#800000", // Royal Maroon
        secondary: "#D4AF37", // Traditional Gold
        bg: "#FFF9E3", // Ivory Paper
        borderWidth: 3,
        innerBorderColor: "#800000",
        boxBg: "rgba(255, 255, 255, 0.7)",
        fontFamily: Platform.OS === 'ios' ? 'Gujarati Sangam MN' : 'serif',
        bgImage: null,
        overlayImage: null,
    },
    premium_gujarati: {
        primary: "#1A1A1A",       // Classic Black
        secondary: "#D4AF37",     // Traditional Gold
        bg: "#FFFEF5",            // Warm Ivory Paper
        borderWidth: 3,
        innerBorderColor: "#1A1A1A",
        boxBg: "rgba(255, 254, 245, 0.95)",
        fontFamily: Platform.OS === 'ios' ? 'Gujarati Sangam MN' : 'serif',
        bgImage: null,
        overlayImage: null,
    }
};

// =============================================
// PREMIUM GUJARATI KANKOTRI LAYOUT COMPONENT
// =============================================
const PremiumGujaratiCard = ({ weddingDetails, events = [] }: { weddingDetails: any, events: any[] }) => {
    const { groomName, brideName, date, venue, message } = weddingDetails;
    const config = ThemeConfig.premium_gujarati;
    const validEvents = Array.isArray(events) ? events.filter(e => e && (e.name || e.title)) : [];

    const formattedDate = (() => {
        try {
            const d = new Date(date);
            const day = d.getDate().toString().padStart(2, '0');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const year = d.getFullYear();
            const days = ['રવિવાર', 'સોમવાર', 'મંગળવાર', 'બુધવાર', 'ગુરૂવાર', 'શુક્રવાર', 'શનિવાર'];
            return `તા. ${day}-${month}-${year}, ${days[d.getDay()]}`;
        } catch {
            return date;
        }
    })();

    return (
        <View style={[styles.card, { backgroundColor: config.bg, padding: 0 }]}>
            {/* ===== OUTER GOLD BORDER ===== */}
            <View style={pgStyles.outerBorder}>
                {/* ===== INNER BLACK BORDER ===== */}
                <View style={pgStyles.innerBorder}>

                    {/* ===== TOP MANTRA LINE ===== */}
                    <View style={pgStyles.mantraRow}>
                        <Text style={pgStyles.mantraText}>અમારા મહારાજી ઠેકાહા ના જય શ્રી કૃષ્ણ વાંચજો.</Text>
                        <Text style={pgStyles.mantraText}>અમારા ભાઈભાંડુ ઠા૩ૂર્ નારાયણ પરીવાર</Text>
                    </View>

                    {/* ===== HEADER ROW: Motif + Shubh Vivah ===== */}
                    <View style={pgStyles.headerSection}>
                        {/* Left: Nimantrak Label */}
                        <View style={pgStyles.nimantrakBox}>
                            <Text style={pgStyles.nimantrakText}>|| નિમંત્રક ||</Text>
                        </View>

                        {/* Center: Ganpati / Radha-Krishna Motif */}
                        <View style={pgStyles.motifCircle}>
                            <MaterialCommunityIcons name="om" size={40} color={config.primary} />
                        </View>

                        {/* Right: Shubh Vivah Box */}
                        <View style={pgStyles.shubhVivahBox}>
                            <View style={pgStyles.shubhVivahInner}>
                                <Text style={pgStyles.shubhVivahText}>શુભ વિવાહ</Text>
                                <View style={pgStyles.shubhVivahDivider} />
                                <Text style={pgStyles.shubhVivahDate}>{formattedDate}</Text>
                            </View>
                        </View>
                    </View>

                    {/* ===== COUPLE NAMES WITH "NA SHUBH LAGN" ===== */}
                    <View style={pgStyles.coupleSection}>
                        <Text style={pgStyles.coupleName}>ચિ. {groomName}</Text>
                        <View style={pgStyles.shubhLagnRow}>
                            <View style={pgStyles.ornamentLine} />
                            <MaterialCommunityIcons name="handshake" size={22} color={config.secondary} />
                            <Text style={pgStyles.shubhLagnText}>ના શુભ લગ્ન</Text>
                            <MaterialCommunityIcons name="handshake" size={22} color={config.secondary} />
                            <View style={pgStyles.ornamentLine} />
                        </View>
                        <Text style={pgStyles.coupleName}>ચિ. {brideName}</Text>
                    </View>

                    {/* ===== EVENTS SECTION ===== */}
                    {validEvents.length > 0 && (
                        <View style={pgStyles.eventsSection}>
                            <Text style={pgStyles.eventsSectionTitle}>卐 માંગલિક પ્રસંગો 卐</Text>
                            <View style={pgStyles.eventsGrid}>
                                {validEvents.map((event, index) => (
                                    <View key={index} style={pgStyles.eventBox}>
                                        <Text style={pgStyles.eventName} numberOfLines={2}>
                                            {event.name || event.title || event.eventName || "Event"}
                                        </Text>
                                        <View style={pgStyles.eventDivider} />
                                        <Text style={pgStyles.eventTime}>
                                            {event.time || event.eventTime || "TBD"}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* ===== INVITATION TEXT (SNEHI SHREE) ===== */}
                    <View style={pgStyles.invitationSection}>
                        <View style={pgStyles.invitationBox}>
                            <Text style={pgStyles.invitationHeader}>|| નિમંત્રણ ||</Text>
                            <Text style={pgStyles.invitationBody}>
                                {message || "સ્નેહી શ્રી, અમારા આંગણે અવસર રૂડો આવ્યો છે, આપની ઉપસ્થિતિ અમારી ખુશીઓમાં વધારો કરશે."}
                            </Text>
                        </View>
                    </View>

                    {/* ===== FOOTER: NIMANTRAK + VENUE ===== */}
                    <View style={pgStyles.footerSection}>
                        <View style={pgStyles.footerRow}>
                            {/* Left: Nimantrak Details */}
                            <View style={[pgStyles.footerCol, { borderRightWidth: 1, borderColor: 'rgba(0,0,0,0.15)' }]}>
                                <Text style={pgStyles.footerLabel}>|| નિમંત્રક ||</Text>
                                <Text style={pgStyles.footerDetail}>શ્રી કાનજીભાઈ જી ભાઈ નારાયણ</Text>
                                <Text style={pgStyles.footerDetail}>શ્રી રામભાઈ જુભાઈ નારાયણ</Text>
                                <Text style={pgStyles.footerSmall}>એક-પન, રેસીડેન્સી,</Text>
                                <Text style={pgStyles.footerSmall}>બંગ્લોઝની સામે, અમદાવાદ-380000.</Text>
                                <Text style={pgStyles.footerSmall}>મો.: 00000</Text>
                            </View>
                            {/* Right: Snehi Shri / Aavkar */}
                            <View style={pgStyles.footerCol}>
                                <Text style={pgStyles.footerLabel}>સ્નેહી શ્રી,_________</Text>
                                <View style={pgStyles.aavkarLines}>
                                    <View style={pgStyles.aavkarLine} />
                                    <View style={pgStyles.aavkarLine} />
                                    <View style={pgStyles.aavkarLine} />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* ===== VENUE ===== */}
                    <View style={pgStyles.venueSection}>
                        <Text style={pgStyles.venueLabel}>:: શુભ સ્થળ ::</Text>
                        <Text style={pgStyles.venueText}>{venue}</Text>
                        <Text style={pgStyles.venueDate}>{new Date(date).toDateString()}</Text>
                    </View>

                    {/* ===== BOTTOM LABEL ===== */}
                    <View style={pgStyles.bottomLabel}>
                        <Text style={pgStyles.bottomLabelText}>Gujarati Kankotri - Digital Edition</Text>
                    </View>

                </View>
            </View>
        </View>
    );
};

// =============================================
// ORIGINAL INVITATION CARD (all other themes)
// =============================================
const InvitationCard = ({ theme, weddingDetails, events = [] }: InvitationCardProps) => {

    // ---- USE PREMIUM GUJARATI LAYOUT ----
    if (theme === "premium_gujarati") {
        return <PremiumGujaratiCard weddingDetails={weddingDetails} events={events} />;
    }

    const { groomName, brideName, date, venue, message } = weddingDetails;

    // Filter and validate events
    const validEvents = Array.isArray(events) ? events.filter(e => e && (e.name || e.title)) : [];
    const displayEvents = validEvents; // Removed fallback to DEMO_EVENTS

    // Configuration based on theme
    const config = ThemeConfig[theme] || ThemeConfig.traditional;
    const isGujarati = theme === "gujarati" || theme === "classic_kankotri";

    const Strings = {
        mantra1: isGujarati ? "|| શ્રી ગણેશાય નમઃ ||" : "|| Shree Ganeshay Namah ||",
        mantra2: isGujarati ? "|| શ્રી અંબાઈ માતાય નમઃ ||" : "|| Shree Ambai Matay Namah ||",
        title: isGujarati ? "卐 માંગલિક પ્રસંગો 卐" : (theme === 'minimal' ? "Wedding Invitation" : "卐 Wedding Ceremony 卐"),
        body: isGujarati
            ? "સ્નેહી શ્રી, અમારા આંગણે અવસર રૂડો આવ્યો છે, આપની ઉપસ્થિતિ અમારી ખુશીઓમાં વધારો કરશે."
            : (message || "We cordially invite you to celebrate our union and bless us with your presence."),
        childHeader: isGujarati ? ":: મીઠો ટહુકો ::" : ":: With Love ::",
        childText: isGujarati
            ? "મારા કાકા ના લગ્ન માં જરૂર જરૂર પધારજો..."
            : "Please verify your presence to bless the couple...",
        venueHeader: isGujarati ? ":: શુભ સ્થળ ::" : ":: Auspicious Venue ::",
        groomPrefix: isGujarati ? "(ચિ.) " : "",
        bridePrefix: isGujarati ? "(અ.સૌ.) " : "",
        noEvents: isGujarati ? "કોઈ પ્રસંગ નથી" : "No Events"
    };

    return (
        <View style={[styles.card, { backgroundColor: config.bg, padding: 0 }]}>
            <ImageBackground
                source={config.bgImage}
                style={{ flex: 1, width: '100%' }}
                imageStyle={{ resizeMode: 'cover' }}
            >
                {/* Outer decorative border */}
                <View style={[styles.kankotriBorder, { borderColor: config.secondary, borderWidth: config.bgImage ? 0 : config.borderWidth }]}>
                    {/* Ornate Overlay as Background of Border */}
                    {config.overlayImage && (
                        <Image
                            source={config.overlayImage}
                            style={[StyleSheet.absoluteFill, { width: '100%', height: '100%', opacity: 0.1 }]}
                            resizeMode="stretch"
                        />
                    )}
                    <View style={[styles.innerBorder, {
                        borderColor: config.innerBorderColor,
                        backgroundColor: config.bgImage || config.overlayImage ? 'transparent' : config.bg,
                        borderWidth: config.bgImage || config.overlayImage ? 0 : 1
                    }]}>

                        {/* Header: Mantras */}
                        <View style={[styles.headerRow, { borderBottomColor: config.primary, borderBottomWidth: config.bgImage || config.overlayImage ? 0 : 1 }]}>
                            <Text style={[styles.mantra, { color: config.primary, fontFamily: config.fontFamily }]}>{Strings.mantra1}</Text>
                            <Text style={[styles.mantra, { color: config.primary, fontFamily: config.fontFamily }]}>{Strings.mantra2}</Text>
                        </View>

                        {/* Motif for Modern/Traditional/Classic */}
                        {theme !== 'minimal' && (
                            <View style={{ alignItems: 'center', marginBottom: 5, marginTop: 10 }}>
                                <MaterialCommunityIcons
                                    name={isGujarati ? "om" : "heart-outline"}
                                    size={theme === 'classic_kankotri' ? 48 : 36}
                                    color={config.primary}
                                />
                                {theme === 'classic_kankotri' && (
                                    <View style={{ height: 2, backgroundColor: config.secondary, width: 60, marginTop: 5 }} />
                                )}
                            </View>
                        )}

                        {/* Title */}
                        <Text style={[styles.mainTitle, { color: config.primary, fontFamily: config.fontFamily, textDecorationLine: 'none', fontSize: 32 }]}>{Strings.title}</Text>

                        {/* Events List */}
                        <View style={[styles.boxGrid, { borderColor: config.primary, backgroundColor: 'transparent', borderTopWidth: 0, borderBottomWidth: 0 }]}>
                            {displayEvents.length > 0 ? (
                                displayEvents.map((event, index) => (
                                    <View key={index} style={[styles.boxItem, { borderColor: config.primary, backgroundColor: config.boxBg, borderWidth: 0.5 }]}>
                                        <View style={{ width: '100%', alignItems: 'center', padding: 2 }}>
                                            <Text style={[styles.boxTextName, { fontSize: 13, color: config.primary, fontFamily: config.fontFamily }]} numberOfLines={2}>
                                                {event.name || event.title || event.eventName || (typeof event === 'string' ? event : "Event")}
                                            </Text>
                                            <View style={{ height: 1, backgroundColor: config.secondary, width: '60%', marginVertical: 4, opacity: 0.3 }} />
                                            <Text style={[styles.boxTextTime, { fontSize: 11, color: '#333', fontFamily: config.fontFamily }]}>
                                                {event.time || event.eventTime || "TBD"}
                                            </Text>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <View style={{ width: '100%', padding: 20, alignItems: 'center' }}>
                                    <Text style={{ color: '#888', fontStyle: 'italic', fontFamily: config.fontFamily }}>{Strings.noEvents}</Text>
                                </View>
                            )}
                        </View>

                        {/* Middle Text */}
                        <View style={styles.middleSection}>
                            <Text style={[styles.invitationBody, { color: '#333', fontFamily: config.fontFamily }]}>
                                {Strings.body}
                            </Text>

                            <View style={styles.coupleBlock}>
                                <Text style={[styles.coupleName, { color: config.primary, fontFamily: config.fontFamily, fontSize: 24 }]}>{Strings.groomPrefix}{groomName}</Text>
                                <View style={{ marginVertical: 8, flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ height: 1, backgroundColor: config.secondary, width: 40, opacity: 0.5 }} />
                                    <Text style={{ fontWeight: 'bold', fontStyle: 'italic', marginHorizontal: 15, color: config.primary, fontSize: 16 }}>weds</Text>
                                    <View style={{ height: 1, backgroundColor: config.secondary, width: 40, opacity: 0.5 }} />
                                </View>
                                <Text style={[styles.coupleName, { color: config.primary, fontFamily: config.fontFamily, fontSize: 24 }]}>{Strings.bridePrefix}{brideName}</Text>
                            </View>
                        </View>

                        {/* Footer */}
                        <View style={[styles.footerSection, { borderTopColor: config.primary, borderTopWidth: config.bgImage ? 0 : 2 }]}>
                            <View style={styles.footerRow}>
                                <View style={[styles.footerCol, { borderRightWidth: 1, borderColor: 'rgba(0,0,0,0.1)' }]}>
                                    <Text style={[styles.footerHeader, { color: config.primary, fontFamily: config.fontFamily }]}>{Strings.childHeader}</Text>
                                    <Text style={[styles.footerText, { fontFamily: config.fontFamily }]}>{Strings.childText}</Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 4 }}>
                                        <MaterialCommunityIcons name="face-man" size={16} color={config.primary} />
                                        <MaterialCommunityIcons name="face-woman" size={16} color={config.primary} />
                                    </View>
                                </View>
                                <View style={styles.footerCol}>
                                    <Text style={[styles.footerHeader, { color: config.primary, fontFamily: config.fontFamily }]}>{Strings.venueHeader}</Text>
                                    <Text style={[styles.footerText, { fontFamily: config.fontFamily }]}>{venue}</Text>
                                    <Text style={[styles.footerText, { marginTop: 2, fontFamily: config.fontFamily }]}>{new Date(date).toDateString()}</Text>
                                </View>
                            </View>
                        </View>

                    </View>
                </View>
            </ImageBackground>
        </View>
    );
};

// =============================================
// STYLES: Original Themes
// =============================================
const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        paddingBottom: 20,
        backgroundColor: "#FFF",
        borderRadius: 12,
        alignSelf: "center",
        elevation: 8,
        shadowColor: "#8A0030",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
    },
    // Kankotri Specific
    kankotriBorder: {
        borderWidth: 2,
        borderColor: '#D4AF37',
        margin: 5,
        padding: 4, // Double border effect
        borderRadius: 8,
    },
    innerBorder: {
        borderWidth: 1,
        borderColor: '#8A0030',
        padding: 12,
        backgroundColor: '#FFF',
        borderRadius: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#8B0000',
        paddingBottom: 5,
        gap: 5
    },
    mantra: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#8B0000',
        flexShrink: 1,
        textAlign: 'center'
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
        color: '#8B0000',
        textDecorationLine: 'underline',
    },
    // Simplified Box Layout
    boxGrid: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginVertical: 10,
        paddingVertical: 10,
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderColor: '#8B0000',
        backgroundColor: '#FFF',
    },
    boxItem: {
        width: '48%', // Fixed width
        borderWidth: 1,
        borderColor: '#8B0000',
        borderRadius: 5,
        marginBottom: 10,
        padding: 5,
        minHeight: 70,
        backgroundColor: '#FFF5F5',
        justifyContent: 'center', // RESTORED
        alignItems: 'center', // RESTORED
        overflow: 'visible',
    },
    boxTextName: {
        fontSize: 12,
        color: '#8B0000',
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    boxTextTime: {
        fontSize: 11,
        color: '#000000',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    middleSection: {
        alignItems: 'center',
        marginVertical: 15,
    },
    invitationBody: {
        textAlign: 'center',
        fontSize: 14,
        color: '#000',
        marginHorizontal: 10,
        marginBottom: 10,
        fontStyle: 'italic',
    },
    coupleBlock: {
        alignItems: 'center',
        marginVertical: 10,
    },
    coupleName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#8B0000',
        textAlign: 'center'
    },
    footerSection: {
        marginTop: 'auto',
        borderTopWidth: 2,
        borderTopColor: '#8B0000',
        paddingTop: 10,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerCol: {
        flex: 1,
        paddingHorizontal: 5,
    },
    footerHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#8B0000',
        textAlign: 'center',
        marginBottom: 2,
        textDecorationLine: 'underline',
    },
    footerText: {
        fontSize: 10,
        color: '#000',
        textAlign: 'center',
    },
});

// =============================================
// STYLES: Premium Gujarati Kankotri
// =============================================
const pgStyles = StyleSheet.create({
    outerBorder: {
        borderWidth: 3,
        borderColor: '#D4AF37',
        margin: 4,
        padding: 3,
        borderRadius: 6,
    },
    innerBorder: {
        borderWidth: 2,
        borderColor: '#1A1A1A',
        padding: 10,
        backgroundColor: '#FFFEF5',
        borderRadius: 2,
    },
    // Top Mantra Row
    mantraRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#1A1A1A',
        paddingBottom: 6,
        marginBottom: 8,
    },
    mantraText: {
        fontSize: 8,
        color: '#1A1A1A',
        fontFamily: Platform.OS === 'ios' ? 'Gujarati Sangam MN' : 'serif',
        flexShrink: 1,
        textAlign: 'center',
    },
    // Header Section
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 2,
    },
    nimantrakBox: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: '#1A1A1A',
        borderRadius: 4,
        paddingVertical: 6,
        paddingHorizontal: 4,
        alignItems: 'center',
        backgroundColor: '#FFFEF5',
    },
    nimantrakText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1A1A1A',
        fontFamily: Platform.OS === 'ios' ? 'Gujarati Sangam MN' : 'serif',
        textAlign: 'center',
    },
    motifCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
        backgroundColor: '#FFFEF5',
    },
    shubhVivahBox: {
        flex: 1,
        alignItems: 'center',
    },
    shubhVivahInner: {
        borderWidth: 2,
        borderColor: '#1A1A1A',
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 10,
        alignItems: 'center',
        backgroundColor: '#FFFEF5',
        width: '100%',
    },
    shubhVivahText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        fontFamily: Platform.OS === 'ios' ? 'Gujarati Sangam MN' : 'serif',
        letterSpacing: 1,
    },
    shubhVivahDivider: {
        height: 1.5,
        backgroundColor: '#D4AF37',
        width: '80%',
        marginVertical: 4,
    },
    shubhVivahDate: {
        fontSize: 9,
        color: '#333',
        fontFamily: Platform.OS === 'ios' ? 'Gujarati Sangam MN' : 'serif',
        textAlign: 'center',
    },
    // Couple Section
    coupleSection: {
        alignItems: 'center',
        marginVertical: 10,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    coupleName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
        fontFamily: Platform.OS === 'ios' ? 'Gujarati Sangam MN' : 'serif',
        textAlign: 'center',
    },
    shubhLagnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 6,
    },
    shubhLagnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A1A',
        fontFamily: Platform.OS === 'ios' ? 'Gujarati Sangam MN' : 'serif',
        marginHorizontal: 6,
    },
    ornamentLine: {
        height: 1,
        backgroundColor: '#D4AF37',
        width: 30,
        marginHorizontal: 4,
    },
    // Events Section
    eventsSection: {
        marginVertical: 8,
    },
    eventsSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 8,
        fontFamily: Platform.OS === 'ios' ? 'Gujarati Sangam MN' : 'serif',
    },
    eventsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    eventBox: {
        width: '48%',
        borderWidth: 1,
        borderColor: '#1A1A1A',
        borderRadius: 4,
        marginBottom: 8,
        padding: 6,
        minHeight: 60,
        backgroundColor: 'rgba(255, 254, 245, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    eventName: {
        fontSize: 12,
        color: '#1A1A1A',
        textAlign: 'center',
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Gujarati Sangam MN' : 'serif',
    },
    eventDivider: {
        height: 1,
        backgroundColor: '#D4AF37',
        width: '50%',
        marginVertical: 3,
        opacity: 0.5,
    },
    eventTime: {
        fontSize: 10,
        color: '#333',
        textAlign: 'center',
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Gujarati Sangam MN' : 'serif',
    },
    // Invitation Section
    invitationSection: {
        marginVertical: 8,
        alignItems: 'center',
    },
    invitationBox: {
        borderWidth: 1.5,
        borderColor: '#1A1A1A',
        borderRadius: 6,
        padding: 12,
        width: '95%',
        backgroundColor: 'rgba(255,254,245,0.9)',
    },
    invitationHeader: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 6,
        textDecorationLine: 'underline',
        fontFamily: Platform.OS === 'ios' ? 'Gujarati Sangam MN' : 'serif',
    },
    invitationBody: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
        lineHeight: 20,
        fontFamily: Platform.OS === 'ios' ? 'Gujarati Sangam MN' : 'serif',
    },
    // Footer Section
    footerSection: {
        borderTopWidth: 2,
        borderTopColor: '#1A1A1A',
        paddingTop: 8,
        marginTop: 8,
    },
    footerRow: {
        flexDirection: 'row',
    },
    footerCol: {
        flex: 1,
        paddingHorizontal: 6,
    },
    footerLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 4,
        fontFamily: Platform.OS === 'ios' ? 'Gujarati Sangam MN' : 'serif',
        textDecorationLine: 'underline',
    },
    footerDetail: {
        fontSize: 9,
        color: '#1A1A1A',
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Gujarati Sangam MN' : 'serif',
        marginBottom: 1,
    },
    footerSmall: {
        fontSize: 8,
        color: '#555',
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Gujarati Sangam MN' : 'serif',
    },
    aavkarLines: {
        marginTop: 6,
        paddingHorizontal: 10,
    },
    aavkarLine: {
        height: 1,
        backgroundColor: '#1A1A1A',
        marginBottom: 10,
        width: '100%',
    },
    // Venue Section
    venueSection: {
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    venueLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textDecorationLine: 'underline',
        fontFamily: Platform.OS === 'ios' ? 'Gujarati Sangam MN' : 'serif',
        marginBottom: 3,
    },
    venueText: {
        fontSize: 11,
        color: '#333',
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Gujarati Sangam MN' : 'serif',
    },
    venueDate: {
        fontSize: 10,
        color: '#555',
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Gujarati Sangam MN' : 'serif',
        marginTop: 2,
    },
    // Bottom Label
    bottomLabel: {
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: '#D4AF37',
    },
    bottomLabelText: {
        fontSize: 10,
        color: '#999',
        fontStyle: 'italic',
    },
});

export default InvitationCard;
