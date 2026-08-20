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
import { registerUser } from '../services/firebaseService';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { setUser, texts, language } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !phone || phone.length < 10 || !password) {
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
      const user = await registerUser(
        name,
        email || `${phone}@phone.local`,
        phone,
        password
      );
      setUser(user);
      navigation.replace('MainTabs');
    } catch (e: any) {
      // Even if Firebase fails, allow mock registration
      setUser({
        id: 'u_' + Date.now(),
        name,
        email: email || '',
        phone,
        joinedAt: new Date().toISOString().split('T')[0],
        rating: 5,
        totalSales: 0,
      });
      navigation.replace('MainTabs');
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
            <Text style={styles.logo}>📱</Text>
            <Text style={styles.title}>
              {language === 'ha' ? 'Yi Rajista' : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {language === 'ha'
                ? 'Shiga Easy Phone Market'
                : 'Join Easy Phone Market'}
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

            <Text style={styles.label}>Email (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="you@email.com"
              placeholderTextColor={COLORS.gray}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

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
    backgroundColor: COLORS.white,
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
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.black,
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
    color: COLORS.black,
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
});
