import React from 'react';
import { View,Text,Image,StyleSheet,TouchableOpacity,Dimensions } from 'react-native';
import { Phone } from '../types';
import { COLORS } from '../constants';
import { formatPrice } from '../services/mockData';
import { useApp } from '../context/AppContext';
const { width } = Dimensions.get('window');
const CARD_WIDTH=(width-48)/2;
export default function PhoneCard({phone,onPress}:{phone:Phone;onPress:()=>void}){
 const {isFavorite,toggleFavorite}=useApp(); const favorite=isFavorite(phone.id);
 return <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={.9}>
  <View style={styles.imageContainer}><Image source={{uri:phone.images?.[0]}} style={styles.image}/><TouchableOpacity style={styles.favButton} onPress={()=>toggleFavorite(phone.id)}><Text style={styles.favIcon}>{favorite?'♥':'♡'}</Text></TouchableOpacity><View style={styles.condition}><Text style={styles.conditionText}>{phone.condition}</Text></View></View>
  <View style={styles.info}><Text style={styles.brand}>{phone.brand}</Text><Text style={styles.title} numberOfLines={2}>{phone.title}</Text><Text style={styles.price}>{formatPrice(phone.price)}</Text><Text style={styles.location}>⌖ {phone.location}, {phone.state}</Text></View>
 </TouchableOpacity>
}
const styles=StyleSheet.create({card:{width:CARD_WIDTH,backgroundColor:'#fff',borderRadius:20,marginBottom:15,overflow:'hidden',borderWidth:1,borderColor:COLORS.border,elevation:4,shadowColor:'#071225',shadowOffset:{width:0,height:4},shadowOpacity:.08,shadowRadius:10},imageContainer:{height:148,backgroundColor:'#E4EAF3',position:'relative'},image:{width:'100%',height:'100%'},favButton:{position:'absolute',top:9,right:9,width:35,height:35,borderRadius:18,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(255,255,255,.95)'},favIcon:{fontSize:20,color:'#EF4444',fontWeight:'900'},condition:{position:'absolute',left:9,bottom:9,backgroundColor:COLORS.primary,paddingHorizontal:9,paddingVertical:5,borderRadius:9},conditionText:{color:'#fff',fontSize:9,fontWeight:'900'},info:{padding:11},brand:{fontSize:10,color:COLORS.gray,fontWeight:'900'},title:{fontSize:13,fontWeight:'900',color:COLORS.black,lineHeight:18,marginTop:3,minHeight:36},price:{fontSize:16,fontWeight:'900',color:COLORS.primary,marginTop:4},location:{fontSize:10,color:COLORS.gray,marginTop:5,fontWeight:'700'}});
