import React from 'react';
import { Text, View } from 'react-native';
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
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';

const Stack=createNativeStackNavigator<RootStackParamList>();
const Tab=createBottomTabNavigator<MainTabParamList>();

function Icon({name,active}:{name:string;active:boolean}){return <Text style={{fontSize:20,opacity:active?1:.55}}>{name}</Text>}
function MainTabs(){
 const {texts,cartCount}=useApp();
 return <Tab.Navigator screenOptions={{headerShown:false,tabBarActiveTintColor:COLORS.primary,tabBarInactiveTintColor:'#64748B',tabBarStyle:{backgroundColor:'#fff',height:66,paddingBottom:8,paddingTop:6,borderTopColor:'#E5EAF1'},tabBarLabelStyle:{fontSize:10,fontWeight:'800'}}}>
  <Tab.Screen name="Home" component={HomeScreen} options={{tabBarLabel:texts.home,tabBarIcon:({focused})=><Icon name="⌂" active={focused}/>}}/>
  <Tab.Screen name="Categories" component={CategoriesScreen} options={{tabBarLabel:'Categories',tabBarIcon:({focused})=><Icon name="▦" active={focused}/>}}/>
  <Tab.Screen name="Cart" component={CartScreen} options={{tabBarLabel:'Cart',tabBarBadge:cartCount||undefined,tabBarIcon:({focused})=><Icon name="🛒" active={focused}/>}}/>
  <Tab.Screen name="Favorites" component={FavoritesScreen} options={{tabBarLabel:texts.favorites,tabBarIcon:({focused})=><Icon name="♡" active={focused}/>}}/>
  <Tab.Screen name="Profile" component={ProfileScreen} options={{tabBarLabel:texts.profile,tabBarIcon:({focused})=><Icon name="♙" active={focused}/>}}/>
 </Tab.Navigator>
}
export default function AppNavigator(){return <NavigationContainer><Stack.Navigator screenOptions={{headerShown:false}}><Stack.Screen name="MainTabs" component={MainTabs}/><Stack.Screen name="Login" component={LoginScreen}/><Stack.Screen name="Register" component={RegisterScreen}/><Stack.Screen name="PhoneDetails" component={PhoneDetailsScreen}/><Stack.Screen name="PostPhone" component={PostPhoneScreen}/><Stack.Screen name="Chat" component={ChatScreen}/><Stack.Screen name="AdminDashboard" component={AdminDashboardScreen}/><Stack.Screen name="Categories" component={CategoriesScreen}/><Stack.Screen name="Cart" component={CartScreen}/><Stack.Screen name="Checkout" component={CheckoutScreen}/></Stack.Navigator></NavigationContainer>}
