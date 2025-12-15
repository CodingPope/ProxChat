import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types';
import PermissionsScreen from '../../screens/PermissionsScreen';
import OnboardingScreen from '../../screens/OnboardingScreen';
import HomeScreen from '../../screens/HomeScreen';
import SettingsScreen from '../../screens/SettingsScreen';
import AdminPortalScreen from '../../screens/AdminPortalScreen';
import { COLORS } from '../../shared';

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name='Permissions' component={PermissionsScreen} />
      <Stack.Screen name='Onboarding' component={OnboardingScreen} />
      <Stack.Screen name='Home' component={HomeScreen} />
      <Stack.Screen
        name='Settings'
        component={SettingsScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name='AdminPortal'
        component={AdminPortalScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
};

export default MainStack;
