import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { firestore } from '../app/providers/firebase';
import { COLLECTIONS } from '../shared';
import { hashPasscode } from '../shared/utils';
import { Channel, ChannelMember, ChannelRole } from '../types';

const channelCollection = collection(firestore, COLLECTIONS.CHANNELS);

export const createChannel = async (
  name: string,
  passcode: string,
  createdBy: string
): Promise<string> => {
  const passcodeHash = await hashPasscode(passcode);

  const channelRef = await addDoc(channelCollection, {
    name,
    passcodeHash,
    createdBy,
    createdAt: serverTimestamp(),
  });

  // Creator becomes admin member
  const memberRef = doc(channelRef, 'members', createdBy);
  await setDoc(memberRef, {
    role: 'admin',
    joinedAt: serverTimestamp(),
    passcodeHash,
  });

  return channelRef.id;
};

export const getChannel = async (
  channelId: string
): Promise<Channel | null> => {
  const ref = doc(firestore, COLLECTIONS.CHANNELS, channelId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as any) } as Channel;
};

export const listChannelsByOwner = async (
  userId: string
): Promise<Channel[]> => {
  const q = query(channelCollection, where('createdBy', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...(d.data() as any) } as Channel)
  );
};

export const joinChannelWithPasscode = async (
  channelId: string,
  passcode: string,
  userId: string
): Promise<void> => {
  const channel = await getChannel(channelId);
  if (!channel) throw new Error('Channel not found');

  const passcodeHash = await hashPasscode(passcode);
  if (passcodeHash !== channel.passcodeHash) {
    throw new Error('Incorrect passcode');
  }

  const memberRef = doc(
    firestore,
    `${COLLECTIONS.CHANNELS}/${channelId}/members`,
    userId
  );

  await setDoc(memberRef, {
    role: 'member',
    joinedAt: serverTimestamp(),
    passcodeHash,
  });
};

export const addMemberAsAdmin = async (
  channelId: string,
  targetUserId: string,
  role: ChannelRole
): Promise<void> => {
  const memberRef = doc(
    firestore,
    `${COLLECTIONS.CHANNELS}/${channelId}/members`,
    targetUserId
  );

  await setDoc(memberRef, {
    role,
    joinedAt: serverTimestamp(),
  });
};

export const listChannelMembers = async (
  channelId: string
): Promise<ChannelMember[]> => {
  const membersCol = collection(
    firestore,
    `${COLLECTIONS.CHANNELS}/${channelId}/members`
  );
  const snapshot = await getDocs(membersCol);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as any),
  })) as ChannelMember[];
};

export default {
  createChannel,
  getChannel,
  listChannelsByOwner,
  joinChannelWithPasscode,
  addMemberAsAdmin,
  listChannelMembers,
};
