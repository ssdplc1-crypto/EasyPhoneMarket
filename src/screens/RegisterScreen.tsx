import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';
import { useApp } from '../context/AppContext';
import { registerUser } from '../services/api';
import FulatanLogo from '../components/FulatanLogo';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { texts, language } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpChannel, setOtpChannel] = useState<'email'|'sms'>('email');

  const handleRegister = async () => {
    if (!name || !email || !phone || phone.length < 10 || !password) {
      Alert.alert(
        language === 'ha' ? 'Kuskure' : 'Error',
        language === 'ha'
          ? 'Da fatan za a cika duk filayen'
          : 'Please fill all required fields'
      );
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser(name,email,phone,password,referralCode,otpChannel);
      navigation.navigate('VerifyOtp',{verificationId:result.verificationId,destination:result.destination,channel:result.channel});
    } catch (e: any) {
      Alert.alert(language === 'ha' ? 'An kasa yin rajista' : 'Registration failed', e?.message || 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.inner}>
          <View style={styles.header}>
            <FulatanLogo width={135} height={100} />
            <Text style={styles.title}>
              {language === 'ha' ? 'Yi Rajista' : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {language === 'ha'
                ? 'Shiga FULATAN COMMUNICATION'
                : 'Join FULATAN COMMUNICATION'}
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>
              {language === 'ha' ? 'Suna' : 'Full Name'} *
            </Text>
            <TextInput
              style={styles.input}
              placeholder={language === 'ha' ? 'Misali: Ahmad Musa' : 'e.g. John Doe'}
              placeholderTextColor={COLORS.gray}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>
              {language === 'ha' ? 'Lambar Waya' : 'Phone Number'} *
            </Text>
            <TextInput
              style={styles.input}
              placeholder="08012345678"
              placeholderTextColor={COLORS.gray}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="you@email.com"
              placeholderTextColor={COLORS.gray}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>{language === 'ha' ? 'Hanyar karɓar OTP' : 'OTP verification method'} *</Text>
            <View style={styles.otpRow}><TouchableOpacity style={[styles.otpChoice,otpChannel==='email'&&styles.otpActive]} onPress={()=>setOtpChannel('email')}><Text style={styles.otpText}>📧 Email</Text></TouchableOpacity><TouchableOpacity style={[styles.otpChoice,otpChannel==='sms'&&styles.otpActive]} onPress={()=>setOtpChannel('sms')}><Text style={styles.otpText}>📱 SMS</Text></TouchableOpacity></View>

            <Text style={styles.label}>Referral Code ({language === 'ha' ? 'idan kana da shi' : 'optional'})</Text>
            <TextInput style={styles.input} placeholder={language === 'ha' ? 'Misali: AHMAD-7K2P9Q' : 'e.g. AHMAD-7K2P9Q'} placeholderTextColor={COLORS.gray} autoCapitalize="characters" value={referralCode} onChangeText={setReferralCode}/>

            <Text style={styles.label}>
              {language === 'ha' ? 'Kalmar sirri' : 'Password'} *
            </Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.gray}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{texts.register}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.link}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.linkText}>
                {language === 'ha'
                  ? 'Kana da account? Shiga'
                  : 'Already have an account? Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inner: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logo: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 6,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  link: {
    marginTop: 20,
    alignItems: 'center',
  },
  otpRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  otpChoice: { flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', backgroundColor: COLORS.card },
  otpActive: { borderColor: COLORS.primary, backgroundColor: COLORS.softOrange },
  otpText: { color: '#FFFFFF', fontWeight: '800' },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
