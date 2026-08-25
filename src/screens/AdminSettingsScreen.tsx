import React, { useEffect, useState } from 'react';
import { BackHandler, View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { saveContactSettings, logoutUser } from '../services/api';
import FulatanLogo from '../components/FulatanLogo';

export default function AdminSettingsScreen() {
  const nav = useNavigation<any>();
  const { user, setUser, language, setLanguage, contactSettings, setContactSettings } = useApp();
  const [phone, setPhone] = useState(contactSettings.phone);
  const [wa, setWa] = useState(contactSettings.whatsapp);
  const [call, setCall] = useState(contactSettings.callEnabled);
  const [whatsapp, setWhatsapp] = useState(contactSettings.whatsappEnabled);
  const [chat, setChat] = useState(contactSettings.chatEnabled);
  const ha = language === 'ha';

  const goDashboard = () => nav.navigate('Dashboard');
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goDashboard();
      return true;
    });
    return () => sub.remove();
  }, [nav]);

  const save = async () => {
    try {
      const next = { ...contactSettings, phone, whatsapp: wa, callEnabled: call, whatsappEnabled: whatsapp, chatEnabled: chat, updatedAt: new Date().toISOString() };
      await saveContactSettings(next);
      setContactSettings(next);
      Alert.alert(ha ? 'An adana' : 'Saved', ha ? 'An adana saitunan cikin nasara.' : 'Settings saved successfully.');
    } catch (e: any) {
      Alert.alert(ha ? 'Kuskure' : 'Error', e?.message || (ha ? 'Ba a iya adana saituna ba.' : 'Could not save settings.'));
    }
  };

  const logout = async () => {
    await logoutUser().catch(() => {});
    setUser(null);
    nav.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={goDashboard} style={styles.back}><Text style={styles.backText}>‹ {ha ? 'Dashboard' : 'Dashboard'}</Text></TouchableOpacity>
      <View style={styles.header}><FulatanLogo width={72} height={58}/><View style={{ flex: 1 }}><Text style={styles.kicker}>FULATAN</Text><Text style={styles.title}>{ha ? 'Saitunan Admin' : 'Admin Settings'}</Text><Text style={styles.email}>{user?.email}</Text></View><View style={styles.secure}><Text>🛡️</Text><Text style={styles.secureText}>SECURE</Text></View></View>

      <Text style={styles.section}>{ha ? 'Sarrafa Tuntuɓa' : 'Contact Controls'}</Text>
      <View style={styles.card}>
        <Text style={styles.label}>{ha ? 'Lambar Kira' : 'Call Number'}</Text>
        <TextInput value={phone} onChangeText={setPhone} style={styles.input} placeholder="+234..." placeholderTextColor="#777" keyboardType="phone-pad"/>
        <Text style={styles.label}>WhatsApp Number</Text>
        <TextInput value={wa} onChangeText={setWa} style={styles.input} placeholder="+234..." placeholderTextColor="#777" keyboardType="phone-pad"/>
        <Row label={ha ? 'Bada Kira' : 'Enable Call'} value={call} onChange={setCall}/>
        <Row label={ha ? 'Bada WhatsApp' : 'Enable WhatsApp'} value={whatsapp} onChange={setWhatsapp}/>
        <Row label={ha ? 'Bada Live Chat' : 'Enable Live Chat'} value={chat} onChange={setChat}/>
        <TouchableOpacity style={styles.save} onPress={save}><Text style={styles.saveText}>{ha ? 'Adana Saituna' : 'Save Settings'}</Text></TouchableOpacity>
      </View>

      <Text style={styles.section}>{ha ? 'Harshe' : 'Language'}</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.lang} onPress={() => setLanguage('ha')}><Text style={styles.langText}>Hausa</Text><Text style={styles.check}>{language === 'ha' ? '✓' : ''}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.lang} onPress={() => setLanguage('en')}><Text style={styles.langText}>English</Text><Text style={styles.check}>{language === 'en' ? '✓' : ''}</Text></TouchableOpacity>
      </View>

      <Text style={styles.section}>{ha ? 'Asusun Admin' : 'Admin Account'}</Text>
      <View style={styles.card}><Text style={styles.name}>{user?.name}</Text><Text style={styles.email}>{user?.phone}</Text><Text style={styles.note}>{ha ? 'Wannan dashboard na admin ne kawai.' : 'This area is restricted to the admin account.'}</Text></View>

      <TouchableOpacity style={styles.logout} onPress={() => Alert.alert(ha ? 'Fita' : 'Logout', ha ? 'Kana son fita daga admin account?' : 'Do you want to logout from the admin account?', [{ text: ha ? 'Soke' : 'Cancel', style: 'cancel' }, { text: ha ? 'Fita' : 'Logout', style: 'destructive', onPress: logout }])}>
        <Text style={styles.logoutText}>{ha ? 'Fita daga Account' : 'Logout'}</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>;
}

function Row({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return <View style={styles.row}><Text style={styles.label}>{label}</Text><Switch value={value} onValueChange={onChange} trackColor={{ false: '#2B2E35', true: '#FF5A14' }} thumbColor={value ? '#16A5A1' : '#777B84'} /></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070809' }, content: { padding: 16, paddingBottom: 40 },
  back: { paddingVertical: 5, marginBottom: 8 }, backText: { color: '#FF5A14', fontWeight: '900', fontSize: 13 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 }, kicker: { fontSize: 9, color: '#FF5A14', fontWeight: '900', letterSpacing: 2 }, title: { fontSize: 24, color: '#fff', fontWeight: '900', marginTop: 2 }, email: { color: '#8F939B', fontSize: 10, marginTop: 3 },
  secure: { backgroundColor: '#102218', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 8, alignItems: 'center' }, secureText: { color: '#22C55E', fontSize: 8, fontWeight: '900', marginTop: 2 },
  section: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 9, marginTop: 8 }, card: { backgroundColor: '#101216', borderWidth: 1, borderColor: '#2B2E35', borderRadius: 17, padding: 15, marginBottom: 16 }, label: { color: '#fff', fontWeight: '800', fontSize: 12 }, input: { backgroundColor: '#08090B', borderWidth: 1, borderColor: '#2B2E35', borderRadius: 13, padding: 13, color: '#fff', marginTop: 7, marginBottom: 12, fontSize: 14 }, row: { minHeight: 55, borderTopWidth: 1, borderTopColor: '#24272D', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, save: { backgroundColor: '#FF5A14', borderRadius: 13, padding: 14, alignItems: 'center', marginTop: 8 }, saveText: { color: '#fff', fontWeight: '900' }, lang: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 50, borderBottomWidth: 1, borderBottomColor: '#24272D' }, langText: { color: '#fff', fontWeight: '800' }, check: { color: '#FF5A14', fontSize: 18, fontWeight: '900' }, name: { color: '#fff', fontSize: 18, fontWeight: '900' }, note: { color: '#8F939B', fontSize: 11, marginTop: 8, lineHeight: 16 }, logout: { backgroundColor: '#241313', borderWidth: 1, borderColor: '#5A2020', borderRadius: 16, padding: 16, alignItems: 'center' }, logoutText: { color: '#EF4444', fontWeight: '900', fontSize: 15 }
});
