import { auth, firestore, FirebaseUser, Timestamp } from '../app/providers/firebase';
import {
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  type UserCredential,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  collection,
  query,
  where,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
// Google Sign-In disabled for now - using email/password auth only
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { User, CreateUserData } from '../types';
import { COLLECTIONS } from '../shared';

// Google Sign-In configuration disabled - enable later when needed
// const configureGoogleSignIn = () => { ... };

/**
 * Get current Firebase auth user
 */
export const getCurrentAuthUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChanged = (
  callback: (user: FirebaseUser | null) => void
): (() => void) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Sign in with Google (disabled - enable later)
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  throw new Error(
    'Google Sign-In is not configured yet. Please use email/password authentication.'
  );
};

/**
 * Sign in with Apple
 */
export const signInWithApple = async (): Promise<UserCredential> => {
  // Start the sign-in request
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });

  // Ensure Apple returned a user identityToken
  if (!appleAuthRequestResponse.identityToken) {
    throw new Error('Apple Sign-In failed - no identify token returned');
  }

  // Create a Firebase credential from the response
  const { identityToken, nonce } = appleAuthRequestResponse;
  const provider = new OAuthProvider('apple.com');
  const appleCredential = provider.credential({
    idToken: identityToken,
    rawNonce: nonce,
  });

  return signInWithCredential(auth, appleCredential);
};

/**
 * Sign out
 */
export const signOut = async (): Promise<void> => {
  // Google sign-out disabled for now
  // try {
  //   await GoogleSignin.signOut();
  // } catch (error) {
  //   // Ignore if not signed in with Google
  // }

  return auth.signOut();
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  return firebaseSendPasswordResetEmail(auth, email);
};

/**
 * Create user document in Firestore
 */
export const createUserDocument = async (
  userData: CreateUserData
): Promise<void> => {
  const userDoc: Omit<User, 'createdAt'> & {
    createdAt: Timestamp;
  } = {
    ...userData,
    createdAt: serverTimestamp() as Timestamp,
    blockedUsers: [],
    mutedUsers: [],
    reportCount: 0,
    isAutoMuted: false,
  };

  await setDoc(doc(firestore, COLLECTIONS.USERS, userData.id), userDoc);
};

/**
 * Helper function to retry async operations with exponential backoff
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isOfflineError =
        error?.code === 'unavailable' ||
        error?.message?.includes('offline') ||
        error?.message?.includes('Failed to get document');

      if (!isOfflineError || attempt === maxRetries - 1) {
        throw error;
      }

      // Wait with exponential backoff before retrying
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(
        `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Get user document from Firestore with retry logic
 */
export const getUserDocument = async (userId: string): Promise<User | null> => {
  try {
    const ref = doc(firestore, COLLECTIONS.USERS, userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return null;
    }

    return { id: snap.id, ...snap.data() } as User;
  } catch (error: any) {
    console.error('getUserDocument error:', error?.code, error?.message);
    // If it's a permissions or network error, throw it
    // Otherwise return null to allow graceful handling
    if (error?.code === 'permission-denied') {
      throw error;
    }
    // For network errors, return null so auth flow can continue
    return null;
  }
};

/**
 * Update user document
 */
export const updateUserDocument = async (
  userId: string,
  updates: Partial<User>
): Promise<void> => {
  const ref = doc(firestore, COLLECTIONS.USERS, userId);
  await updateDoc(ref, updates as any);
};

/**
 * Check if username is available
 */
export const isUsernameAvailable = async (
  username: string
): Promise<boolean> => {
  const q = query(
    collection(firestore, COLLECTIONS.USERS),
    where('username', '==', username.toLowerCase()),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

/**
 * Update username
 */
export const updateUsername = async (
  userId: string,
  username: string
): Promise<void> => {
  const ref = doc(firestore, COLLECTIONS.USERS, userId);
  await updateDoc(ref, { username: username.toLowerCase() });
};

/**
 * Delete user account
 */
export const deleteAccount = async (): Promise<void> => {
  const user = getCurrentAuthUser();
  if (!user) throw new Error('No user logged in');

  // Delete user document
  await updateDoc(doc(firestore, COLLECTIONS.USERS, user.uid), {
    deleted: true,
  });

  // Delete auth account
  await user.delete();
};

export default {
  getCurrentAuthUser,
  onAuthStateChanged,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInWithApple,
  signOut,
  sendPasswordResetEmail,
  createUserDocument,
  getUserDocument,
  updateUserDocument,
  isUsernameAvailable,
  updateUsername,
  deleteAccount,
};
