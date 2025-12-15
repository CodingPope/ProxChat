import { useEffect, useCallback } from 'react';
import { useAppStore } from '../app/providers/useAppStore';
import authService from '../services/authService';
import { User } from '../types';

// Global flag to ensure auth listener is only set up once
let authListenerInitialized = false;
let authUnsubscribe: (() => void) | null = null;

/**
 * Initialize auth listener - call this once at app startup
 */
export const initializeAuthListener = () => {
  if (authListenerInitialized) {
    return;
  }

  authListenerInitialized = true;

  const { setUser, setLoading, setPendingAuthUser } = useAppStore.getState();
  setLoading(true);

  authUnsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
    const { setUser, setLoading, setPendingAuthUser } = useAppStore.getState();
    console.log(
      '[Auth] State changed:',
      firebaseUser ? `User: ${firebaseUser.uid}` : 'No user'
    );

    if (firebaseUser) {
      try {
        // Add a timeout to prevent hanging forever on Firestore issues
        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 5000)
        );

        const userDoc = await Promise.race([
          authService.getUserDocument(firebaseUser.uid),
          timeoutPromise,
        ]);

        if (userDoc) {
          console.log('[Auth] User document found, setting user');
          setPendingAuthUser(null);
          setUser(userDoc);
        } else {
          // User exists in Auth but not in Firestore - they need to complete signup
          console.log(
            '[Auth] User exists in Auth but not Firestore - needs username setup'
          );
          // IMPORTANT: Don't call setUser(null) here as it resets needsUsernameSetup
          // Just set the pending user which also sets needsUsernameSetup to true
          setPendingAuthUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
          });
          const state = useAppStore.getState();
          console.log('[Auth] After setPendingAuthUser:', {
            needsUsernameSetup: state.needsUsernameSetup,
            pendingAuthUser: state.pendingAuthUser,
          });
        }
      } catch (error) {
        console.error('[Auth] Error fetching user document:', error);
        // On Firestore error, sign the user out so they can try again fresh
        console.log('[Auth] Signing out user due to Firestore error');
        try {
          await authService.signOut();
        } catch (signOutError) {
          console.error('[Auth] Error signing out:', signOutError);
        }
        setUser(null);
        setPendingAuthUser(null);
      }
    } else {
      console.log('[Auth] No user, setting user to null');
      setUser(null);
      setPendingAuthUser(null);
    }

    console.log('[Auth] Setting isLoading to false');
    setLoading(false);
  });
};

/**
 * Hook for managing authentication state
 */
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, setLoading, reset } =
    useAppStore();

  // Initialize the auth listener on first use
  useEffect(() => {
    initializeAuthListener();
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        await authService.signInWithEmail(email, password);
        // Auth state listener will handle the rest
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [setLoading]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        const credential = await authService.signUpWithEmail(email, password);
        setLoading(false);
        return credential.user.uid;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [setLoading]
  );

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      const credential = await authService.signInWithGoogle();

      // Check if user document exists
      const userDoc = await authService.getUserDocument(credential.user.uid);

      if (!userDoc) {
        // New Google user - needs to set username
        setLoading(false);
        return {
          isNewUser: true,
          userId: credential.user.uid,
          email: credential.user.email,
        };
      }

      // Existing user
      setUser(userDoc);
      setLoading(false);
      return { isNewUser: false, userId: credential.user.uid };
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [setLoading, setUser]);

  const signInWithApple = useCallback(async () => {
    try {
      setLoading(true);
      const credential = await authService.signInWithApple();

      // Check if user document exists
      const userDoc = await authService.getUserDocument(credential.user.uid);

      if (!userDoc) {
        // New Apple user - needs to set username
        setLoading(false);
        return {
          isNewUser: true,
          userId: credential.user.uid,
          email: credential.user.email,
        };
      }

      // Existing user
      setUser(userDoc);
      setLoading(false);
      return { isNewUser: false, userId: credential.user.uid };
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [setLoading, setUser]);

  const setUsername = useCallback(
    async (userId: string, username: string, email: string) => {
      try {
        setLoading(true);

        // Check username availability
        const isAvailable = await authService.isUsernameAvailable(username);
        if (!isAvailable) {
          throw new Error('Username is already taken');
        }

        // Create user document
        await authService.createUserDocument({
          id: userId,
          username: username.toLowerCase(),
          email,
        });

        // Fetch and set user
        const userDoc = await authService.getUserDocument(userId);
        if (userDoc) {
          setUser(userDoc);
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [setLoading, setUser]
  );

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await authService.signOut();
      reset();
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [setLoading, reset]);

  const updateUsername = useCallback(
    async (newUsername: string) => {
      if (!user) throw new Error('No user logged in');

      try {
        const isAvailable = await authService.isUsernameAvailable(newUsername);
        if (!isAvailable) {
          throw new Error('Username is already taken');
        }

        await authService.updateUsername(user.id, newUsername);

        // Update local state
        setUser({ ...user, username: newUsername.toLowerCase() });
      } catch (error) {
        throw error;
      }
    },
    [user, setUser]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithApple,
    setUsername,
    signOut,
    updateUsername,
  };
};

export default useAuth;
