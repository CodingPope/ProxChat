import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../providers/useAppStore';
import { useAuth } from '../../hooks/useAuth';
import { RootStackParamList } from '../../types';
import { COLORS } from '../../shared';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import UsernameScreen from '../../screens/UsernameScreen';
import SplashScreen from '../../screens/SplashScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  // Initialize auth listener at app root level
  useAuth();

  const {
    isAuthenticated,
    isLoading,
    needsUsernameSetup,
    pendingAuthUser,
    hasCompletedOnboarding,
    hasGrantedPermissions,
  } = useAppStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('[AppNavigator] State:', {
      isReady,
      isLoading,
      isAuthenticated,
      needsUsernameSetup,
      pendingAuthUser: pendingAuthUser?.uid || null,
    });
  }, [
    isReady,
    isLoading,
    isAuthenticated,
    needsUsernameSetup,
    pendingAuthUser,
  ]);

  useEffect(() => {
    // Simulate splash screen delay
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady || isLoading) {
    return <SplashScreen />;
  }

  // If user needs to set up username (exists in Auth but not Firestore)
  if (needsUsernameSetup && pendingAuthUser) {
    console.log(
      '[AppNavigator] Showing Username screen for:',
      pendingAuthUser.uid
    );
    return (
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen
            name='Username'
            component={UsernameScreen}
            initialParams={{
              userId: pendingAuthUser.uid,
              email: pendingAuthUser.email || '',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name='Auth' component={AuthStack} />
        ) : (
          <Stack.Screen
            name='Main'
            component={MainStack}
            initialParams={{
              initialRouteName: hasGrantedPermissions
                ? hasCompletedOnboarding
                  ? 'Home'
                  : 'Onboarding'
                : 'Permissions',
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Extended type for navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export default AppNavigator;
