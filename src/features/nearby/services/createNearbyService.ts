import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  setDoc,
  type Firestore,
  type QuerySnapshot,
} from 'firebase/firestore';
import { GeoPoint, Timestamp } from '../../../app/providers/firebase';
import {
  COLLECTIONS,
  PROXIMITY_RADIUS_METERS,
  getChannelNameFromGeohash,
  getNeighbors,
  calculateDistance,
} from '../../../shared';
import { createLogger } from '../../../shared/logging';
import { ActiveUser, LocationData, NearbyUser } from '../../../types';

export type NearbyServiceDeps = {
  firestore: Firestore;
};

export const createNearbyService = ({ firestore }: NearbyServiceDeps) => {
  let nearbyUsersUnsubscribe: (() => void) | null = null;
  const log = createLogger('NearbyService');

  const joinProximityChannel = async (
    userId: string,
    username: string,
    location: LocationData,
    geohash: string,
    agoraUid: number
  ) => {
    const channelName = getChannelNameFromGeohash(geohash);

    const activeUserData: Omit<ActiveUser, 'lastUpdated'> & {
      lastUpdated: Timestamp;
    } = {
      id: userId,
      username,
      location: new GeoPoint(location.latitude, location.longitude),
      geohash,
      proximityChannel: channelName,
      agoraUid,
      isSpeaking: false,
      lastUpdated: Timestamp.now(),
    };

    await setDoc(
      doc(firestore, COLLECTIONS.ACTIVE_USERS, userId),
      activeUserData
    );

    return channelName;
  };

  const leaveProximityChannel = async (userId: string) => {
    await deleteDoc(doc(firestore, COLLECTIONS.ACTIVE_USERS, userId));
  };

  const updateSpeakingStatus = async (userId: string, isSpeaking: boolean) => {
    await updateDoc(doc(firestore, COLLECTIONS.ACTIVE_USERS, userId), {
      isSpeaking,
      lastUpdated: Timestamp.now(),
    });
  };

  const subscribeToNearbyUsers = (
    currentGeohash: string,
    currentLocation: LocationData,
    currentUserId: string,
    onUpdate: (users: NearbyUser[]) => void,
    onError: (error: Error) => void
  ) => {
    if (nearbyUsersUnsubscribe) {
      nearbyUsersUnsubscribe();
    }

    const geohashesToSearch = [currentGeohash, ...getNeighbors(currentGeohash)];
    const colRef = collection(firestore, COLLECTIONS.ACTIVE_USERS);
    const q = query(colRef, where('geohash', 'in', geohashesToSearch));

    nearbyUsersUnsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const users: NearbyUser[] = snapshot.docs
          .filter((docSnap) => docSnap.id !== currentUserId)
          .filter((docSnap) => {
            const data = docSnap.data() as any;
            const location = data.location as GeoPoint | undefined;
            if (!location) return false;

            const distance = calculateDistance(
              currentLocation.latitude,
              currentLocation.longitude,
              location.latitude,
              location.longitude
            );

            return distance <= PROXIMITY_RADIUS_METERS;
          })
          .map((docSnap) => {
            const data = docSnap.data() as any;
            return {
              id: docSnap.id,
              username: data.username,
              isSpeaking: data.isSpeaking,
              agoraUid: data.agoraUid,
            } as NearbyUser;
          });

        onUpdate(users);
      },
      (error: Error) => {
        log.error('Nearby users listener error', { error });
        onError(error);
      }
    );
  };

  const unsubscribeFromNearbyUsers = () => {
    if (nearbyUsersUnsubscribe) {
      nearbyUsersUnsubscribe();
      nearbyUsersUnsubscribe = null;
    }
  };

  const getChannelUserCount = async (channelName: string) => {
    const colRef = collection(firestore, COLLECTIONS.ACTIVE_USERS);
    const q = query(colRef, where('proximityChannel', '==', channelName));
    const snapshot = await getDocs(q);
    return snapshot.size;
  };

  return {
    joinProximityChannel,
    leaveProximityChannel,
    updateSpeakingStatus,
    subscribeToNearbyUsers,
    unsubscribeFromNearbyUsers,
    getChannelUserCount,
  };
};

export type NearbyService = ReturnType<typeof createNearbyService>;
