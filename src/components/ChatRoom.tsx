import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import VoiceControls from './VoiceControls';
import UserAvatar from './UserAvatar';

const ChatRoom = ({ users, onJoinVoiceChannel }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat Room</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userContainer}>
            <UserAvatar username={item.username} />
            <Text style={styles.username}>{item.username}</Text>
          </View>
        )}
      />
      <VoiceControls onJoinVoiceChannel={onJoinVoiceChannel} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  username: {
    marginLeft: 10,
    fontSize: 18,
  },
});

export default ChatRoom;