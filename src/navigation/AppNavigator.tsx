import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../types';
import { COLORS } from '../constants';
import { useApp } from '../context/AppContext';

import HomeScreen from '../screens/HomeScreen';
import PhoneDetailsScreen from '../screens/PhoneDetailsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PostPhoneScreen from '../screens/PostPhoneScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ChatScreen from '../screens/ChatScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { texts } = useApp();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: texts.home,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: texts.favorites,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>❤️</Text>,
        }}
      />
      <Tab.Screen
        name="Sell"
        component={PostPhoneScreen}
        options={{
          tabBarLabel: texts.sell,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>➕</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: texts.profile,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="PhoneDetails" component={PhoneDetailsScreen} />
        <Stack.Screen name="PostPhone" component={PostPhoneScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
