import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import VoiceControls from '../components/VoiceControls';
import ChatRoom from '../components/ChatRoom';

const ChatScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>ProxChat Room</Text>
            <ChatRoom />
            <VoiceControls />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});

export default ChatScreen;