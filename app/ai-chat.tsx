import { useAuth } from '@/contexts/AuthContext';
import { useWedding } from '@/contexts/WeddingContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export default function AIChatScreen() {
    const router = useRouter();
    const { weddingData } = useWedding();
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: `Hello ${user?.name?.split(' ')[0] || 'User'}! I am your AI Wedding Assistant. How can I help you plan your dream wedding today?`,
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        // Auto-scroll to bottom of chat
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!weddingData?._id) return;
            try {
                const api = require('@/services/api').default;
                const res = await api.get(`/ai/history/${weddingData._id}`);
                const history = res.data.map((msg: any) => ({
                    id: msg._id,
                    text: msg.message,
                    sender: msg.sender,
                    timestamp: new Date(msg.createdAt)
                }));

                if (history.length > 0) {
                    setMessages(history);
                }
            } catch (error) {
                console.error("Failed to fetch chat history", error);
            }
        };
        fetchHistory();
    }, [weddingData?._id]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);
        Keyboard.dismiss();

        try {
            const api = require('@/services/api').default;
            const res = await api.post('/ai/chat', {
                message: userMsg.text,
                weddingId: weddingData?._id
            });

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: res.data.response,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error: any) {
            console.error(error);
            Alert.alert("AI Error", error.response?.data?.message || "Failed to get response");
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I'm having trouble connecting right now. Please try again.",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Ionicons name="sparkles" size={20} color="#FFeb3B" style={{ marginRight: 8 }} />
                    <Text style={styles.headerTitle}>Wedding AI Assistant</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.chatContainer}
                    contentContainerStyle={styles.chatContent}
                >
                    {messages.map((msg) => (
                        <View key={msg.id} style={[
                            styles.messageBubble,
                            msg.sender === 'user' ? styles.userBubble : styles.aiBubble
                        ]}>
                            {msg.sender === 'ai' && (
                                <View style={styles.botIcon}>
                                    <Ionicons name="flash" size={12} color="#FFF" />
                                </View>
                            )}
                            <Text style={[
                                styles.messageText,
                                msg.sender === 'user' ? styles.userText : styles.aiText
                            ]}>
                                {msg.text}
                            </Text>
                        </View>
                    ))}
                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color="#6C63FF" size="small" />
                            <Text style={styles.thinkingText}>Thinking...</Text>
                        </View>
                    )}
                </ScrollView>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask about budget, traditions, venue..."
                        value={inputText}
                        onChangeText={setInputText}
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || isLoading}
                    >
                        <Ionicons name="send" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        backgroundColor: '#6C63FF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    chatContainer: {
        flex: 1,
    },
    chatContent: {
        padding: 20,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 14,
        borderRadius: 20,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    userBubble: {
        backgroundColor: '#6C63FF',
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: '#FFF',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
        flexDirection: 'row', // to accommodate icon if needed specially
    },
    botIcon: {
        position: 'absolute',
        top: -8,
        left: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFA000',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    userText: {
        color: '#FFF',
    },
    aiText: {
        color: '#333',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
        marginBottom: 10,
    },
    thinkingText: {
        marginLeft: 8,
        color: '#666',
        fontSize: 12,
        fontStyle: 'italic',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#F0F2F5',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 12,
        fontSize: 16,
        maxHeight: 100,
        marginRight: 12,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#6C63FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#C5CAE9',
    },
});
