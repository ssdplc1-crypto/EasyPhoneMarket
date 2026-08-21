import React,{useEffect,useRef,useState} from 'react';
import {Animated,StyleSheet,Text,View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {AppProvider} from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

function BrandSplash({onDone}:{onDone:()=>void}){
 const fade=useRef(new Animated.Value(0)).current; const scale=useRef(new Animated.Value(.72)).current; const ring=useRef(new Animated.Value(.7)).current; const line=useRef(new Animated.Value(0)).current;
 useEffect(()=>{
  Animated.parallel([
   Animated.timing(fade,{toValue:1,duration:500,useNativeDriver:true}),
   Animated.spring(scale,{toValue:1,friction:6,tension:45,useNativeDriver:true}),
   Animated.timing(line,{toValue:1,duration:800,delay:350,useNativeDriver:true}),
   Animated.loop(Animated.sequence([Animated.timing(ring,{toValue:1.16,duration:900,useNativeDriver:true}),Animated.timing(ring,{toValue:.7,duration:900,useNativeDriver:true})]))
  ]).start();
  const timer=setTimeout(()=>{Animated.parallel([Animated.timing(fade,{toValue:0,duration:350,useNativeDriver:true}),Animated.timing(scale,{toValue:1.08,duration:350,useNativeDriver:true})]).start(()=>onDone());},2200);
  return()=>clearTimeout(timer);
 },[]);
 return <View style={styles.splash}><StatusBar style="light"/><Animated.View style={[styles.ring,{transform:[{scale:ring}]}]}/><Animated.View style={{opacity:fade,transform:[{scale}]}}><View style={styles.logo}><Text style={styles.logoF}>F</Text><View style={styles.dot}/></View><Text style={styles.brand}>FULATAN</Text><Text style={styles.sub}>COMMUNICATION</Text><Animated.View style={[styles.line,{transform:[{scaleX:line}]}]}/><Text style={styles.tag}>BUY • SELL • CONNECT</Text></Animated.View></View>
}
export default function App(){const[ready,setReady]=useState(false);return <AppProvider><StatusBar style={ready?'dark':'light'}/>{ready?<AppNavigator/>:<BrandSplash onDone={()=>setReady(true)}/>}</AppProvider>}
const styles=StyleSheet.create({splash:{flex:1,backgroundColor:'#071225',alignItems:'center',justifyContent:'center'},ring:{position:'absolute',width:270,height:270,borderRadius:135,borderWidth:1,borderColor:'rgba(96,165,250,.18)'},logo:{width:118,height:118,borderRadius:35,backgroundColor:'#2563EB',alignItems:'center',justifyContent:'center',shadowColor:'#2563EB',shadowOpacity:.4,shadowRadius:30,elevation:12},logoF:{fontSize:78,lineHeight:86,fontWeight:'900',color:'#fff'},dot:{position:'absolute',right:13,bottom:13,width:16,height:16,borderRadius:8,backgroundColor:'#F97316'},brand:{marginTop:22,textAlign:'center',color:'#fff',fontSize:29,fontWeight:'900',letterSpacing:2},sub:{marginTop:3,textAlign:'center',color:'#93C5FD',fontSize:12,fontWeight:'900',letterSpacing:4},line:{width:92,height:3,borderRadius:3,backgroundColor:'#F97316',alignSelf:'center',marginTop:15},tag:{textAlign:'center',color:'#94A3B8',fontSize:10,fontWeight:'800',letterSpacing:1.5,marginTop:12}});
