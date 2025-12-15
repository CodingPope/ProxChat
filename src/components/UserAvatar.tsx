import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface UserAvatarProps {
  uri: string;
  size?: number;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ uri, size = 50 }) => {
  return (
    <View style={[styles.avatarContainer, { width: size, height: size }]}>
      <Image source={{ uri }} style={[styles.avatar, { width: size, height: size }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    borderRadius: 25,
  },
});

export default UserAvatar;