
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";

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
    theme: "traditional" | "modern" | "minimal" | "gujarati";
    weddingDetails: {
        groomName: string;
        brideName: string;
        date: string;
        venue: string;
        message: string;
    };
    events?: any[];
}

const InvitationCard = ({ theme, weddingDetails, events = [] }: InvitationCardProps) => {
    const { groomName, brideName, date, venue, message } = weddingDetails;

    // Filter and validate events
    const validEvents = Array.isArray(events) ? events.filter(e => e && (e.name || e.title)) : [];
    const displayEvents = validEvents; // Removed fallback to DEMO_EVENTS

    // Configuration based on theme
    const isGujarati = theme === "gujarati";

    const Strings = {
        mantra1: isGujarati ? "|| શ્રી ગણેશાય નમઃ ||" : "|| Shree Ganeshay Namah ||",
        mantra2: isGujarati ? "|| શ્રી અંબાઈ માતાય નમઃ ||" : "|| Shree Ambai Matay Namah ||",
        title: isGujarati ? "卐 માંગલિક પ્રસંગો 卐" : "卐 Wedding Ceremony 卐",
        body: isGujarati
            ? "સ્નેહી શ્રી, અમારા આંગણે અવસર રૂડો આવ્યો છે, આપની ઉપસ્થિતિ અમારી ખુશીઓમાં વધારો કરશે."
            : (message || "We cordially invite you to celebrate our union and bless us with your presence."),
        childHeader: isGujarati ? ":: મીઠો ટહુકો ::" : ":: With Love ::",
        childText: isGujarati
            ? "મારા કાકા ના લગ્ન માં જરૂર જરૂર પધારજો..."
            : "Please verify your presence to bless the couple...",
        venueHeader: isGujarati ? ":: શુભ સ્થળ ::" : ":: Auspicious Venue ::",
        groomSuffix: isGujarati ? "(ચિ.)" : "",
        brideSuffix: isGujarati ? "(અ.સૌ.)" : "",
        noEvents: isGujarati ? "કોઈ પ્રસંગ નથી" : "No Events"
    };

    return (
        <View style={[styles.card, { backgroundColor: "#FFF", padding: 0 }]}>
            {/* Outer decorative border */}
            <View style={styles.kankotriBorder}>
                <View style={styles.innerBorder}>

                    {/* Header: Mantras */}
                    <View style={styles.headerRow}>
                        <Text style={styles.mantra}>{Strings.mantra1}</Text>
                        <Text style={styles.mantra}>{Strings.mantra2}</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.mainTitle}>{Strings.title}</Text>

                    {/* Events List */}
                    <View style={styles.boxGrid}>
                        {displayEvents.length > 0 ? (
                            displayEvents.map((event, index) => (
                                <View key={index} style={styles.boxItem}>
                                    <View style={{ width: '100%', alignItems: 'center', padding: 2 }}>
                                        <Text style={[styles.boxTextName, { fontSize: 14, color: '#8B0000' }]} numberOfLines={2}>
                                            {event.name || event.title || event.eventName || (typeof event === 'string' ? event : "Event")}
                                        </Text>
                                        <View style={{ height: 1, backgroundColor: '#FFCCCC', width: '60%', marginVertical: 4 }} />
                                        <Text style={[styles.boxTextTime, { fontSize: 12, color: '#000' }]}>
                                            {event.time || event.eventTime || "TBD"}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={{ width: '100%', padding: 20, alignItems: 'center' }}>
                                <Text style={{ color: '#888', fontStyle: 'italic' }}>{Strings.noEvents}</Text>
                            </View>
                        )}
                    </View>

                    {/* Middle Text */}
                    <View style={styles.middleSection}>
                        <Text style={styles.invitationBody}>
                            {Strings.body}
                        </Text>

                        <View style={styles.coupleBlock}>
                            <Text style={styles.coupleName}>{groomName} {Strings.groomSuffix}</Text>
                            <Text style={{ fontWeight: 'bold', fontStyle: 'italic', marginVertical: 2 }}>weds</Text>
                            <Text style={styles.coupleName}>{brideName} {Strings.brideSuffix}</Text>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footerSection}>
                        <View style={styles.footerRow}>
                            <View style={[styles.footerCol, { borderRightWidth: 1, borderColor: '#CCC' }]}>
                                <Text style={styles.footerHeader}>{Strings.childHeader}</Text>
                                <Text style={styles.footerText}>{Strings.childText}</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 2 }}>
                                    <MaterialCommunityIcons name="face-man-profile" size={16} color="black" />
                                    <MaterialCommunityIcons name="face-woman-profile" size={16} color="black" />
                                </View>
                            </View>
                            <View style={styles.footerCol}>
                                <Text style={styles.footerHeader}>{Strings.venueHeader}</Text>
                                <Text style={styles.footerText}>{venue}</Text>
                                <Text style={[styles.footerText, { marginTop: 2 }]}>{new Date(date).toDateString()}</Text>
                            </View>
                        </View>
                    </View>

                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        // minHeight: CARD_HEIGHT, // Removed to allow auto-growth
        paddingBottom: 20,
        backgroundColor: "#FFF",
        borderRadius: 10,
        // overflow: "hidden", // Removed to prevent clipping
        alignSelf: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    // Kankotri Specific
    kankotriBorder: {
        borderWidth: 2,
        borderColor: '#000',
        margin: 5,
        padding: 2, // Double border effect
        borderRadius: 0,
    },
    innerBorder: {
        borderWidth: 1,
        borderColor: '#8B0000',
        padding: 10,
        backgroundColor: '#FFF',
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
        // REMOVED: width: '100%'
        // REMOVED: lineHeight: 18
    },
    boxTextTime: {
        fontSize: 11,
        color: '#000000',
        textAlign: 'center',
        fontWeight: 'bold',
        // REMOVED: width: '100%'
        // REMOVED: lineHeight: 16
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

export default InvitationCard;
