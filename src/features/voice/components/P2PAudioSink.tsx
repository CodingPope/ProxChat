import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RTCView } from 'react-native-webrtc';

type Props = {
  stream: MediaStream | null;
};

// Keeps the remote audio stream alive without UI chrome.
const P2PAudioSink: React.FC<Props> = ({ stream }) => {
  if (!stream) return null;

  return (
    <View style={styles.container} pointerEvents='none'>
      <RTCView
        streamURL={stream.toURL()}
        style={styles.view}
        objectFit='cover'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  view: {
    width: 1,
    height: 1,
    opacity: 0,
  },
});

export default P2PAudioSink;
