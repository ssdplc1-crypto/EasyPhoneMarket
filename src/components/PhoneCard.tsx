import React from 'react';
import { View,Text,Image,StyleSheet,TouchableOpacity,Dimensions } from 'react-native';
import { Phone } from '../types';
import { COLORS } from '../constants';
import { useApp } from '../context/AppContext';
const { width } = Dimensions.get('window');
const CARD_WIDTH=(width-52)/2;
export default function PhoneCard({phone,onPress}:{phone:Phone;onPress:()=>void}){
 const {isFavorite,toggleFavorite,addToCart}=useApp(); const favorite=isFavorite(phone.id);
 return <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={.9}>
  <View style={styles.imageContainer}><Image source={{uri:phone.images?.[0]}} style={styles.image}/><TouchableOpacity style={styles.favButton} onPress={()=>toggleFavorite(phone.id)}><Text style={styles.favIcon}>{favorite?'♥':'♡'}</Text></TouchableOpacity></View>
  <View style={styles.info}><Text style={styles.brand}>{phone.brand}</Text><Text style={styles.title} numberOfLines={2}>{phone.title}</Text><Text style={styles.price}>{`₦${Number(phone.price).toLocaleString('en-NG')}`}</Text><View style={styles.bottom}><Text style={styles.stock}>● In Stock</Text><TouchableOpacity style={styles.cartBtn} onPress={()=>addToCart(phone.id)}><Text style={styles.cartIcon}>🛒</Text></TouchableOpacity></View></View>
 </TouchableOpacity>
}
const styles=StyleSheet.create({card:{width:CARD_WIDTH,backgroundColor:'#101216',borderRadius:15,marginBottom:12,overflow:'hidden',borderWidth:1,borderColor:'#2B2E35'},imageContainer:{height:154,backgroundColor:'#181A1F',position:'relative'},image:{width:'100%',height:'100%',resizeMode:'contain'},favButton:{position:'absolute',top:8,right:8,width:31,height:31,borderRadius:16,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,.55)',borderWidth:1,borderColor:'#383B42'},favIcon:{fontSize:18,color:'#fff'},info:{padding:10},brand:{fontSize:9,color:'#A1A1AA',fontWeight:'800',textTransform:'uppercase'},title:{fontSize:12,fontWeight:'900',color:'#fff',lineHeight:16,marginTop:3,minHeight:32},price:{fontSize:15,fontWeight:'900',color:'#FF6A24',marginTop:5},bottom:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:7},stock:{fontSize:9,color:'#22C55E',fontWeight:'800'},cartBtn:{width:31,height:31,borderRadius:9,backgroundColor:'#FF5A14',alignItems:'center',justifyContent:'center'},cartIcon:{fontSize:14}});
