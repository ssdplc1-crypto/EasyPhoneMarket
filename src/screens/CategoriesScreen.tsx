import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BRANDS, COLORS } from '../constants';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;
export default function CategoriesScreen(){
 const navigation=useNavigation<Nav>(); const {phones}=useApp();
 return <SafeAreaView style={styles.container}><View style={styles.header}><TouchableOpacity onPress={()=>navigation.goBack()}><Text style={styles.back}>‹</Text></TouchableOpacity><Text style={styles.title}>Categories</Text><View style={{width:32}}/></View>
 <FlatList data={BRANDS} numColumns={2} keyExtractor={x=>x} contentContainerStyle={styles.grid} renderItem={({item})=>{const p=phones.find(x=>x.brand===item);const count=phones.filter(x=>x.brand===item).length;return <TouchableOpacity style={styles.card} onPress={()=>navigation.navigate('Home')}><View style={styles.pic}>{p?.images?.[0]?<Image source={{uri:p.images[0]}} style={styles.image}/>:<Text style={styles.emoji}>📱</Text>}</View><Text style={styles.brand}>{item}</Text><Text style={styles.count}>{count} items</Text></TouchableOpacity>}}/></SafeAreaView>
}
const styles=StyleSheet.create({container:{flex:1,backgroundColor:'#F7F9FC'},header:{height:62,backgroundColor:'#fff',flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:18,borderBottomWidth:1,borderBottomColor:'#E8EDF4'},back:{fontSize:36,color:COLORS.black,lineHeight:36},title:{fontSize:20,fontWeight:'900',color:COLORS.black},grid:{padding:14},card:{flex:1,backgroundColor:'#fff',borderRadius:18,margin:7,padding:12,borderWidth:1,borderColor:'#E7ECF3'},pic:{height:125,borderRadius:14,backgroundColor:'#F1F5F9',overflow:'hidden',alignItems:'center',justifyContent:'center'},image:{width:'100%',height:'100%'},emoji:{fontSize:48},brand:{fontSize:15,fontWeight:'900',marginTop:10,color:COLORS.black},count:{fontSize:11,color:COLORS.gray,marginTop:3}});
