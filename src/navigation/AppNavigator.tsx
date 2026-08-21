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

function TabIcon({icon,active}:{icon:string;active:boolean}) {
  return <View style={[styles.iconWrap, active && styles.iconWrapActive]}><Text style={[styles.icon, active && styles.iconActive]}>{icon}</Text></View>;
}

function MainTabs(){
 const {texts,cartCount}=useApp();
 return <Tab.Navigator screenOptions={{headerShown:false,tabBarActiveTintColor:COLORS.primary,tabBarInactiveTintColor:'#7B879A',tabBarStyle:styles.tabBar,tabBarLabelStyle:styles.label,tabBarItemStyle:styles.tabItem}}>
  <Tab.Screen name="Home" component={HomeScreen} options={{tabBarLabel:texts.home,tabBarIcon:({focused})=><TabIcon icon="⌂" active={focused}/>}}/>
  <Tab.Screen name="Categories" component={CategoriesScreen} options={{tabBarLabel:'Categories',tabBarIcon:({focused})=><TabIcon icon="▦" active={focused}/>}}/>
  <Tab.Screen name="Cart" component={CartScreen} options={{tabBarLabel:'Cart',tabBarBadge:cartCount||undefined,tabBarIcon:({focused})=><TabIcon icon="🛒" active={focused}/>}}/>
  <Tab.Screen name="Favorites" component={FavoritesScreen} options={{tabBarLabel:texts.favorites,tabBarIcon:({focused})=><TabIcon icon="♡" active={focused}/>}}/>
  <Tab.Screen name="Profile" component={ProfileScreen} options={{tabBarLabel:texts.profile,tabBarIcon:({focused})=><TabIcon icon="♙" active={focused}/>}}/>
 </Tab.Navigator>
}

export default function AppNavigator(){return <NavigationContainer><Stack.Navigator screenOptions={{headerShown:false,contentStyle:{backgroundColor:COLORS.background}}}><Stack.Screen name="MainTabs" component={MainTabs}/><Stack.Screen name="Login" component={LoginScreen}/><Stack.Screen name="Register" component={RegisterScreen}/><Stack.Screen name="PhoneDetails" component={PhoneDetailsScreen}/><Stack.Screen name="PostPhone" component={PostPhoneScreen}/><Stack.Screen name="Chat" component={ChatScreen}/><Stack.Screen name="AdminDashboard" component={AdminDashboardScreen}/><Stack.Screen name="Categories" component={CategoriesScreen}/><Stack.Screen name="Cart" component={CartScreen}/><Stack.Screen name="Checkout" component={CheckoutScreen}/></Stack.Navigator></NavigationContainer>}

const styles={
 tabBar:{position:'absolute' as const,left:10,right:10,bottom:10,height:72,paddingBottom:8,paddingTop:7,borderTopWidth:0,borderRadius:24,backgroundColor:'#FFFFFF',elevation:16,shadowColor:'#071225',shadowOpacity:.16,shadowRadius:18,shadowOffset:{width:0,height:7}},
 tabItem:{borderRadius:18,marginHorizontal:2}, label:{fontSize:9,fontWeight:'900' as const,marginTop:1},
 iconWrap:{width:40,height:32,borderRadius:12,alignItems:'center' as const,justifyContent:'center' as const},iconWrapActive:{backgroundColor:'#EAF1FF'},icon:{fontSize:19,color:'#64748B',fontWeight:'900' as const},iconActive:{color:COLORS.primary,fontSize:20}
};
