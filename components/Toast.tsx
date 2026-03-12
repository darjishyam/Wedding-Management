import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    visible: boolean;
    message: string;
    type?: ToastType;
    duration?: number;
    onHide: () => void;
}

export default function Toast({
    visible,
    message,
    type = 'info',
    duration = 3000,
    onHide
}: ToastProps) {
    const opacity = React.useRef(new Animated.Value(0)).current;
    const translateY = React.useRef(new Animated.Value(-100)).current;
    const hasShown = React.useRef(false);

    useEffect(() => {
        if (visible) {
            hasShown.current = true;
            // Slide in and fade in
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto hide after duration
            const timer = setTimeout(() => {
                hideToast();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -100,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            hasShown.current = false;
            onHide();
        });
    };

    if (!visible && !hasShown.current) {
        return null;
    }

    const getToastStyle = () => {
        switch (type) {
            case 'success':
                return styles.success;
            case 'error':
                return styles.error;
            case 'warning':
                return styles.warning;
            case 'info':
            default:
                return styles.info;
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return 'checkmark-circle';
            case 'error':
                return 'close-circle';
            case 'warning':
                return 'warning';
            case 'info':
            default:
                return 'information-circle';
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            <View style={[styles.toast, getToastStyle()]}>
                <Ionicons
                    name={getIcon()}
                    size={24}
                    color="#fff"
                    style={styles.icon}
                />
                <Text style={styles.message}>{message}</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        left: 20,
        right: 20,
        zIndex: 9999,
        alignItems: 'center',
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        minHeight: 50,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    icon: {
        marginRight: 12,
    },
    message: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        flexWrap: 'wrap',
    },
    success: {
        backgroundColor: '#10B981',
    },
    error: {
        backgroundColor: '#EF4444',
    },
    warning: {
        backgroundColor: '#F59E0B',
    },
    info: {
        backgroundColor: '#3B82F6',
    },
});
