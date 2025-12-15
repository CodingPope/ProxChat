import { useEffect } from 'react';
import { useAppStore } from '../../../app/state/store';
import { createLogger } from '../../../shared/logging';
import { nearbyService } from '../services';
import { voiceService } from '../../voice/services';
import { NearbyUser } from '../../../types';

const log = createLogger('useNearbyUsers');

/**
 * Hook for subscribing to nearby users in current channel
 */
export const useNearbyUsers = () => {
  const {
    user,
    currentChannel,
    currentLocation,
    currentGeohash,
    nearbyUsers,
    nearbyCount,
    blockedUsers,
    mutedUsers,
    setNearbyUsers,
  } = useAppStore();

  useEffect(() => {
    if (!currentChannel || !user || !currentLocation || !currentGeohash) {
      setNearbyUsers([]);
      return;
    }

    nearbyService.subscribeToNearbyUsers(
      currentGeohash,
      currentLocation,
      user.id,
      (users: NearbyUser[]) => {
        setNearbyUsers(users);
      },
      (error) => {
        log.error('Nearby users subscription error', { error });
      }
    );

    return () => {
      nearbyService.unsubscribeFromNearbyUsers();
    };
  }, [currentChannel, user, currentLocation, currentGeohash, setNearbyUsers]);

  useEffect(() => {
    if (!nearbyUsers.length) {
      return;
    }

    nearbyUsers.forEach((nearbyUser) => {
      const shouldMute =
        blockedUsers.includes(nearbyUser.id) ||
        mutedUsers.includes(nearbyUser.id);

      voiceService.muteRemoteUser(nearbyUser.agoraUid, shouldMute);
    });
  }, [nearbyUsers, blockedUsers, mutedUsers]);

  return {
    nearbyUsers,
    nearbyCount,
    // Add 1 to include current user in count
    totalUsersInChannel: nearbyCount + 1,
  };
};

export default useNearbyUsers;
