import { Audio } from 'expo-av';

class AudioService {
  private audio: Audio.Sound | null = null;

  async initializeAudio() {
    await Audio.requestPermissionsAsync();
    this.audio = new Audio.Sound();
  }

  async playSound(uri: string) {
    if (this.audio) {
      await this.audio.loadAsync({ uri });
      await this.audio.playAsync();
    }
  }

  async stopSound() {
    if (this.audio) {
      await this.audio.stopAsync();
    }
  }

  async dispose() {
    if (this.audio) {
      await this.audio.unloadAsync();
      this.audio = null;
    }
  }

  async recordAudio() {
    const recording = new Audio.Recording();
    try {
      await Audio.Recording.requestPermissionsAsync();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      return recording;
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }

  async stopRecording(recording: Audio.Recording) {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }
}

export default new AudioService();