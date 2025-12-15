import { firestore } from '../app/providers/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  increment,
  query,
  where,
  getDocs,
  documentId,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { User, Report, CreateReportData } from '../types';
import { COLLECTIONS, AUTO_MUTE_REPORT_THRESHOLD } from '../shared';

/**
 * Get user by ID
 */
export const getUser = async (userId: string): Promise<User | null> => {
  const ref = doc(firestore, COLLECTIONS.USERS, userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return { id: snap.id, ...snap.data() } as User;
};

/**
 * Block a user
 */
export const blockUser = async (
  currentUserId: string,
  userIdToBlock: string
): Promise<void> => {
  const ref = doc(firestore, COLLECTIONS.USERS, currentUserId);
  await updateDoc(ref, {
    blockedUsers: arrayUnion(userIdToBlock),
  });

  console.log(`Blocked user: ${userIdToBlock}`);
};

/**
 * Unblock a user
 */
export const unblockUser = async (
  currentUserId: string,
  userIdToUnblock: string
): Promise<void> => {
  const ref = doc(firestore, COLLECTIONS.USERS, currentUserId);
  await updateDoc(ref, {
    blockedUsers: arrayRemove(userIdToUnblock),
  });

  console.log(`Unblocked user: ${userIdToUnblock}`);
};

/**
 * Mute a user (add to mutedUsers array)
 */
export const muteUser = async (
  currentUserId: string,
  userIdToMute: string
): Promise<void> => {
  const ref = doc(firestore, COLLECTIONS.USERS, currentUserId);
  await updateDoc(ref, {
    mutedUsers: arrayUnion(userIdToMute),
  });

  console.log(`Muted user: ${userIdToMute}`);
};

/**
 * Unmute a user
 */
export const unmuteUser = async (
  currentUserId: string,
  userIdToUnmute: string
): Promise<void> => {
  const ref = doc(firestore, COLLECTIONS.USERS, currentUserId);
  await updateDoc(ref, {
    mutedUsers: arrayRemove(userIdToUnmute),
  });

  console.log(`Unmuted user: ${userIdToUnmute}`);
};

/**
 * Report a user
 */
export const reportUser = async (
  reportData: CreateReportData
): Promise<void> => {
  // Create report document
  const report: Omit<Report, 'id' | 'timestamp'> & {
    timestamp: any;
  } = {
    ...reportData,
    timestamp: firestore.FieldValue.serverTimestamp(),
    status: 'pending',
  };

  await addDoc(collection(firestore, COLLECTIONS.REPORTS), report);

  // Increment reported user's report count
  await updateDoc(doc(firestore, COLLECTIONS.USERS, reportData.reportedUserId), {
    reportCount: increment(1),
  });

  // Check if user should be auto-muted
  const reportedUser = await getUser(reportData.reportedUserId);
  if (
    reportedUser &&
    reportedUser.reportCount + 1 >= AUTO_MUTE_REPORT_THRESHOLD
  ) {
    await updateDoc(doc(firestore, COLLECTIONS.USERS, reportData.reportedUserId), {
      isAutoMuted: true,
    });

    console.log(
      `User ${reportData.reportedUserId} auto-muted due to excessive reports`
    );
  }

  console.log(`Reported user: ${reportData.reportedUserId}`);
};

/**
 * Get blocked users list
 */
export const getBlockedUsers = async (userId: string): Promise<string[]> => {
  const user = await getUser(userId);
  return user?.blockedUsers || [];
};

/**
 * Get muted users list
 */
export const getMutedUsers = async (userId: string): Promise<string[]> => {
  const user = await getUser(userId);
  return user?.mutedUsers || [];
};

/**
 * Check if a user should be muted (blocked, muted, or auto-muted)
 */
export const shouldMuteUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<boolean> => {
  const [currentUser, targetUser] = await Promise.all([
    getUser(currentUserId),
    getUser(targetUserId),
  ]);

  if (!currentUser || !targetUser) {
    return false;
  }

  // Check if blocked
  if (currentUser.blockedUsers.includes(targetUserId)) {
    return true;
  }

  // Check if muted
  if (currentUser.mutedUsers.includes(targetUserId)) {
    return true;
  }

  // Check if target is auto-muted
  if (targetUser.isAutoMuted) {
    return true;
  }

  return false;
};

/**
 * Get users by IDs
 */
export const getUsersByIds = async (userIds: string[]): Promise<User[]> => {
  if (userIds.length === 0) {
    return [];
  }

  // Firestore 'in' query limited to 10 items
  const chunks: string[][] = [];
  for (let i = 0; i < userIds.length; i += 10) {
    chunks.push(userIds.slice(i, i + 10));
  }

  const users: User[] = [];
  for (const chunk of chunks) {
    const q = query(
      collection(firestore, COLLECTIONS.USERS),
      where(documentId(), 'in', chunk)
    );
    const snapshot = await getDocs(q);

    snapshot.docs.forEach((docSnap) => {
      users.push({ id: docSnap.id, ...docSnap.data() } as User);
    });
  }

  return users;
};

export default {
  getUser,
  blockUser,
  unblockUser,
  muteUser,
  unmuteUser,
  reportUser,
  getBlockedUsers,
  getMutedUsers,
  shouldMuteUser,
  getUsersByIds,
};
