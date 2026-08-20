import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';
import { useApp } from '../context/AppContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, setUser, texts, language, setLanguage } = useApp();

  const handleLogout = () => {
    Alert.alert(
      language === 'ha' ? 'Fita' : 'Logout',
      language === 'ha' ? 'Ka tabbata kana so ka fita?' : 'Are you sure you want to logout?',
      [
        { text: texts.cancel, style: 'cancel' },
        {
          text: texts.logout,
          style: 'destructive',
          onPress: () => {
            setUser(null);
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.guest}>
          <Text style={styles.guestIcon}>👤</Text>
          <Text style={styles.guestTitle}>
            {language === 'ha' ? 'Ba ka shiga ba' : 'You are not logged in'}
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginBtnText}>{texts.login}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerBtnText}>{texts.register}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.phone}>{user.phone}</Text>
        {user.rating && (
          <Text style={styles.rating}>⭐ {user.rating} · {user.totalSales || 0} sales</Text>
        )}
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📦</Text>
          <Text style={styles.menuText}>{texts.myListings}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setLanguage(language === 'ha' ? 'en' : 'ha')}
        >
          <Text style={styles.menuIcon}>🌐</Text>
          <Text style={styles.menuText}>
            {texts.language}: {language === 'ha' ? 'Hausa' : 'English'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>{texts.settings}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logout]} onPress={handleLogout}>
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={[styles.menuText, { color: COLORS.danger }]}>
            {texts.logout}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  guest: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  guestIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    width: '80%',
    alignItems: 'center',
  },
  loginBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  registerBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  registerBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  header: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.black,
  },
  phone: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  rating: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 6,
  },
  menu: {
    marginTop: 16,
    backgroundColor: COLORS.white,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  menuText: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '500',
  },
  logout: {
    marginTop: 8,
  },
});
