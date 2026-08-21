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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';
import { useApp } from '../context/AppContext';
import { loginUser } from '../services/firebaseService';
import { isFirebaseConfigured } from '../services/firebase';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { setUser, texts, language } = useApp();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      Alert.alert(
        language === 'ha' ? 'Kuskure' : 'Error',
        language === 'ha' ? 'Cika duk filayen' : 'Fill all fields'
      );
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser(emailOrPhone, password);
      setUser(user);
      navigation.replace('MainTabs');
    } catch (e: any) {
      Alert.alert(
        language === 'ha' ? 'Kuskure' : 'Login failed',
        e?.message || (language === 'ha' ? 'Bayanan shiga ba daidai ba' : 'Invalid credentials')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <View style={styles.header}>
          <View style={styles.logoBox}><Text style={styles.logoF}>F</Text><View style={styles.logoDot}/></View>
          <Text style={styles.title}>FULATAN COMMUNICATION</Text>
          <Text style={styles.subtitle}>
            {language === 'ha' ? 'Shiga don ci gaba' : 'Login to continue'}
          </Text>
          {!isFirebaseConfigured && <View style={styles.demo}><Text style={styles.demoTitle}>Demo Admin</Text><Text style={styles.demoText}>admin@fulatan.com • any password</Text></View>}
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>
            {language === 'ha' ? 'Email ko Lambar Waya' : 'Email or Phone'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="08012345678 or you@email.com"
            placeholderTextColor={COLORS.gray}
            autoCapitalize="none"
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
          />

          <Text style={styles.label}>
            {language === 'ha' ? 'Kalmar sirri' : 'Password'}
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
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{texts.login}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.linkText}>
              {language === 'ha'
                ? 'Ba ka da account? Yi rajista'
                : "Don't have an account? Register"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skip}
            onPress={() => navigation.replace('MainTabs')}
          >
            <Text style={styles.skipText}>
              {language === 'ha' ? 'Ci gaba ba tare da shiga ba' : 'Continue as Guest'}
            </Text>
          </TouchableOpacity>
        </View>
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
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBox: { width: 86, height: 86, borderRadius: 26, backgroundColor: COLORS.navy, alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowColor: COLORS.primary, shadowOpacity: .22, shadowRadius: 16, elevation: 7 },
  logoF: { fontSize: 56, fontWeight: '900', color: '#60A5FA' },
  logoDot: { position: 'absolute', right: 9, bottom: 9, width: 11, height: 11, borderRadius: 6, backgroundColor: COLORS.accent },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.black,
  },
  demo: { backgroundColor: '#EAF1FF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginTop: 12, borderWidth: 1, borderColor: '#C6D6FF' },
  demoTitle: { fontSize: 10, color: COLORS.primary, fontWeight: '900', textAlign: 'center' },
  demoText: { fontSize: 9, color: COLORS.gray, fontWeight: '700', marginTop: 2 },
  subtitle: {
    fontSize: 15,
    color: COLORS.gray,
    marginTop: 6,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontWeight: '700',
    color: COLORS.black,
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
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  skip: {
    marginTop: 16,
    alignItems: 'center',
  },
  skipText: {
    color: COLORS.gray,
    fontSize: 14,
  },
});
