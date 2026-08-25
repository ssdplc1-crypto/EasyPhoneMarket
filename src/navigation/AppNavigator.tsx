import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList, AdminTabParamList } from '../types';
import { COLORS } from '../constants';
import { useApp } from '../context/AppContext';
import HomeScreen from '../screens/HomeScreen';
import PhoneDetailsScreen from '../screens/PhoneDetailsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerifyOtpScreen from '../screens/VerifyOtpScreen';
import PostPhoneScreen from '../screens/PostPhoneScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ChatScreen from '../screens/ChatScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminOrdersScreen from '../screens/AdminOrdersScreen';
import AdminSettingsScreen from '../screens/AdminSettingsScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const AdminTab = createBottomTabNavigator<AdminTabParamList>();

function TabIcon({ icon, active }: { icon: string; active: boolean }) {
  return <View style={[styles.iconWrap, active && styles.iconWrapActive]}><Text style={[styles.icon, active && styles.iconActive]}>{icon}</Text></View>;
}

function MainTabs() {
  const { texts, cartCount } = useApp();
  const insets = useSafeAreaInsets();
  return <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#FF5A14', tabBarInactiveTintColor: '#777B84', tabBarStyle: [styles.tabBar, { height: 72 + insets.bottom, paddingBottom: 8 + insets.bottom }], tabBarLabelStyle: styles.label, tabBarItemStyle: styles.tabItem }}>
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: texts.home, tabBarIcon: ({ focused }) => <TabIcon icon="⌂" active={focused} /> }} />
    <Tab.Screen name="Categories" component={CategoriesScreen} options={{ tabBarLabel: 'Categories', tabBarIcon: ({ focused }) => <TabIcon icon="▦" active={focused} /> }} />
    <Tab.Screen name="Cart" component={CartScreen} options={{ tabBarLabel: 'Cart', tabBarBadge: cartCount || undefined, tabBarIcon: ({ focused }) => <TabIcon icon="🛒" active={focused} /> }} />
    <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ tabBarLabel: texts.favorites, tabBarIcon: ({ focused }) => <TabIcon icon="♡" active={focused} /> }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: texts.profile, tabBarIcon: ({ focused }) => <TabIcon icon="♙" active={focused} /> }} />
  </Tab.Navigator>;
}

function AdminTabs() {
  const { language } = useApp();
  const insets = useSafeAreaInsets();
  const labels = language === 'ha'
    ? { dashboard: 'Dashboard', add: 'Saka Waya', orders: 'Odarori', settings: 'Saituna' }
    : { dashboard: 'Dashboard', add: 'Add Phone', orders: 'Orders', settings: 'Settings' };
  return <AdminTab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#FF5A14', tabBarInactiveTintColor: '#777B84', tabBarStyle: [styles.tabBar, { height: 72 + insets.bottom, paddingBottom: 8 + insets.bottom }], tabBarLabelStyle: styles.label, tabBarItemStyle: styles.tabItem }}>
    <AdminTab.Screen name="Dashboard" component={AdminDashboardScreen} options={{ tabBarLabel: labels.dashboard, tabBarIcon: ({ focused }) => <TabIcon icon="▦" active={focused} /> }} />
    <AdminTab.Screen name="AddPhone" component={PostPhoneScreen} options={{ tabBarLabel: labels.add, tabBarIcon: ({ focused }) => <TabIcon icon="＋" active={focused} /> }} />
    <AdminTab.Screen name="Orders" component={AdminOrdersScreen} options={{ tabBarLabel: labels.orders, tabBarIcon: ({ focused }) => <TabIcon icon="▤" active={focused} /> }} />
    <AdminTab.Screen name="Settings" component={AdminSettingsScreen} options={{ tabBarLabel: labels.settings, tabBarIcon: ({ focused }) => <TabIcon icon="⚙" active={focused} /> }} />
  </AdminTab.Navigator>;
}

function RootStack() {
  const { user } = useApp();
  const navigation = useNavigation<any>();
  useEffect(() => {
    const state = navigation.getState();
    const current = state?.routes?.[state.index || 0]?.name;
    if (user?.role === 'admin' && current === 'MainTabs') navigation.reset({ index: 0, routes: [{ name: 'AdminTabs' }] });
    if (user?.role !== 'admin' && current === 'AdminTabs') navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  }, [user?.role, navigation]);
  return <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen name="AdminTabs" component={AdminTabs} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
    <Stack.Screen name="PhoneDetails" component={PhoneDetailsScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="Categories" component={CategoriesScreen} />
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
  </Stack.Navigator>;
}

export default function AppNavigator() {
  return <SafeAreaProvider><NavigationContainer><RootStack /></NavigationContainer></SafeAreaProvider>;
}

const styles = {
  tabBar: { marginHorizontal: 10, marginBottom: 8, paddingTop: 7, borderTopWidth: 1, borderTopColor: '#2B2E35', borderRadius: 22, backgroundColor: '#101216', elevation: 14, shadowColor: '#000000', shadowOpacity: .12, shadowRadius: 16, shadowOffset: { width: 0, height: -3 } },
  tabItem: { borderRadius: 18, marginHorizontal: 2 }, label: { fontSize: 9, fontWeight: '900' as const, marginTop: 1 },
  iconWrap: { width: 40, height: 32, borderRadius: 12, alignItems: 'center' as const, justifyContent: 'center' as const }, iconWrapActive: { backgroundColor: '#2A160D' }, icon: { fontSize: 19, color: '#777B84', fontWeight: '900' as const }, iconActive: { color: '#FF5A14', fontSize: 20 }
};
