import React,{useEffect,useState} from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,SafeAreaView,ActivityIndicator,Alert} from 'react-native';
import {useNavigation,useRoute,RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types';
import {COLORS} from '../constants';
import {useApp} from '../context/AppContext';
import {resendRegistrationOtp,verifyRegistrationOtp} from '../services/api';
import FulatanLogo from '../components/FulatanLogo';

type Nav=NativeStackNavigationProp<RootStackParamList>;
type Route=RouteProp<RootStackParamList,'VerifyOtp'>;
export default function VerifyOtpScreen(){
 const navigation=useNavigation<Nav>(); const route=useRoute<Route>(); const {setUser,language}=useApp();
 const [otp,setOtp]=useState(''); const [loading,setLoading]=useState(false); const [resending,setResending]=useState(false); const [seconds,setSeconds]=useState(60);
 useEffect(()=>{const id=setInterval(()=>setSeconds((s:number)=>s>0?s-1:0),1000);return()=>clearInterval(id)},[]);
 const verify=async()=>{if(!/^\d{6}$/.test(otp))return Alert.alert(language==='ha'?'Kuskure':'Error',language==='ha'?'Shigar da lambar OTP mai lambobi 6.':'Enter the 6-digit OTP.');setLoading(true);try{const user=await verifyRegistrationOtp(route.params.verificationId,otp);setUser(user); navigation.replace('MainTabs');}catch(e:any){Alert.alert(language==='ha'?'Ba a tabbatar ba':'Verification failed',e?.message||'Invalid OTP.');}finally{setLoading(false)}};
 const resend=async()=>{if(seconds>0)return;setResending(true);try{await resendRegistrationOtp(route.params.verificationId);setSeconds(60);Alert.alert(language==='ha'?'An sake tura OTP':'OTP sent','A new verification code has been sent.');}catch(e:any){Alert.alert('Error',e?.message||'Could not resend OTP.');}finally{setResending(false)}};
 return <SafeAreaView style={s.container}><View style={s.box}><FulatanLogo width={150} height={105} /><Text style={s.title}>{language==='ha'?'Tabbatar da Account':'Verify your account'}</Text><Text style={s.sub}>{language==='ha'?`Mun aika OTP zuwa ${route.params.destination}`:`We sent a verification code to ${route.params.destination}`}</Text><TextInput style={s.input} value={otp} onChangeText={(v:string)=>setOtp(v.replace(/\D/g,'').slice(0,6))} keyboardType="number-pad" maxLength={6} placeholder="000000" placeholderTextColor="#777" textAlign="center"/><TouchableOpacity style={s.button} onPress={verify} disabled={loading}>{loading?<ActivityIndicator color="#fff"/>:<Text style={s.buttonText}>{language==='ha'?'Tabbatar':'Verify'}</Text>}</TouchableOpacity><TouchableOpacity onPress={resend} disabled={seconds>0||resending} style={s.resend}><Text style={[s.resendText,(seconds>0||resending)&&{color:'#777'}]}>{resending?'Sending...':seconds>0?`Resend in ${seconds}s`:'Resend OTP'}</Text></TouchableOpacity><TouchableOpacity onPress={()=>navigation.goBack()}><Text style={s.back}>{language==='ha'?'Komawa':'Back'}</Text></TouchableOpacity></View></SafeAreaView>
}
const s=StyleSheet.create({container:{flex:1,backgroundColor:COLORS.background,justifyContent:'center',padding:24},box:{backgroundColor:COLORS.card,borderRadius:24,padding:24,borderWidth:1,borderColor:COLORS.border},logo:{width:64,height:64,borderRadius:20,backgroundColor:COLORS.navy,alignSelf:'center',alignItems:'center',justifyContent:'center',marginBottom:18},logoText:{fontSize:42,fontWeight:'900',color:COLORS.primary},title:{fontSize:24,fontWeight:'900',color:'#fff',textAlign:'center'},sub:{fontSize:14,color:COLORS.gray,textAlign:'center',marginTop:8,lineHeight:21},input:{marginTop:24,backgroundColor:'#08090B',borderWidth:1,borderColor:COLORS.border,borderRadius:14,padding:15,color:'#fff',fontSize:26,fontWeight:'900',letterSpacing:8},button:{marginTop:16,backgroundColor:COLORS.primary,borderRadius:14,padding:16,alignItems:'center'},buttonText:{color:'#fff',fontSize:16,fontWeight:'900'},resend:{alignItems:'center',padding:16},resendText:{color:COLORS.primary,fontWeight:'800'},back:{textAlign:'center',color:COLORS.gray,fontWeight:'700',padding:8}});
