// Firebase configuration using the JS SDK (no native Firebase pods).
// This avoids the gRPC / Firestore iOS build issues from @react-native-firebase.

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  type Auth,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  type Firestore,
  Timestamp,
  GeoPoint,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from '../../shared/logging';

const log = createLogger('FirebaseProvider');

// Firebase configuration from GoogleService-Info.plist
const firebaseConfig = {
  apiKey: 'AIzaSyAd5A3FNDaCEFXvBNCSTuhU7O7c4rzqWvE',
  authDomain: 'proxchat-b0f95.firebaseapp.com',
  projectId: 'proxchat-b0f95',
  storageBucket: 'proxchat-b0f95.firebasestorage.app',
  messagingSenderId: '135465541188',
  appId: '1:135465541188:ios:51c3d17bbdda0d5ef4e611',
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth with React Native persistence
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error: any) {
  // Auth already initialized, get existing instance
  auth = getAuth(app);
}

// Initialize Firestore with settings optimized for React Native
let firestore: Firestore;
try {
  firestore = initializeFirestore(app, {
    experimentalForceLongPolling: true, // Required for React Native to avoid WebSocket issues
  });
  log.info('Firestore initialized with long polling');
} catch (error: any) {
  // Firestore already initialized, get existing instance
  log.info('Getting existing Firestore instance', { error });
  firestore = getFirestore(app);
}

export { app as firebase, auth, firestore, Timestamp, GeoPoint, FirebaseUser };
export default app;
