import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const marks: Record<string,string> = {
  Apple: 'A', Samsung: 'S', Huawei: 'H', Tecno: 'T', Infinix: 'I', Xiaomi: 'X',
  Nokia: 'N', Oppo: 'O', Vivo: 'V', Other: '•••',
};
const colors: Record<string,string> = {
  Apple: '#F4F4F5', Samsung: '#4DA3FF', Huawei: '#FF304F', Tecno: '#16A5FF',
  Infinix: '#A7F33A', Xiaomi: '#FF7A00', Nokia: '#3B82F6', Oppo: '#38C978', Vivo: '#60A5FA', Other: '#A1A1AA'
};

export default function BrandIcon({ brand, size=54 }: { brand:string; size?:number }) {
  const mark = marks[brand] || brand.charAt(0).toUpperCase();
  return (
    <View style={[styles.box,{width:size,height:size,borderRadius:size*.25}]}> 
      <Text style={[styles.mark,{color:colors[brand] || '#FFFFFF',fontSize:size*.38}]}>{mark}</Text>
    </View>
  );
}
const styles=StyleSheet.create({
  box:{backgroundColor:'#111318',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#2B2E35'},
  mark:{fontWeight:'900',letterSpacing:.5},
});
