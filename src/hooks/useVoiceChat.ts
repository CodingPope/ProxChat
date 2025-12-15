import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import { useLocation } from './useLocation';
import { startVoiceChat, stopVoiceChat } from '../services/audioService';

const useVoiceChat = () => {
    const { location } = useLocation();
    const [isRecording, setIsRecording] = useState(false);
    const [audioPermissionGranted, setAudioPermissionGranted] = useState(false);

    useEffect(() => {
        const requestAudioPermission = async () => {
            const { status } = await Audio.requestPermissionsAsync();
            setAudioPermissionGranted(status === 'granted');
        };

        requestAudioPermission();
    }, []);

    const startRecording = async () => {
        if (audioPermissionGranted) {
            setIsRecording(true);
            await startVoiceChat(location);
        }
    };

    const stopRecording = async () => {
        setIsRecording(false);
        await stopVoiceChat();
    };

    return {
        isRecording,
        startRecording,
        stopRecording,
        audioPermissionGranted,
    };
};

export default useVoiceChat;