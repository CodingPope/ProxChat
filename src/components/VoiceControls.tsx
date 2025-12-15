import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useVoiceChat } from '../hooks/useVoiceChat';

const VoiceControls = () => {
    const { isRecording, startRecording, stopRecording } = useVoiceChat();

    return (
        <View style={styles.container}>
            <Button
                title={isRecording ? "Stop" : "Talk"}
                onPress={isRecording ? stopRecording : startRecording}
                color={isRecording ? "red" : "green"}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});

export default VoiceControls;