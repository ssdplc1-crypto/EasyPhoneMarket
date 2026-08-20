import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS, BRANDS } from '../constants';
import { useApp } from '../context/AppContext';
import PhoneCard from '../components/PhoneCard';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { phones, texts, language, setLanguage } = useApp();
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const filtered = phones.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.model.toLowerCase().includes(search.toLowerCase());
    const matchBrand = selectedBrand ? p.brand === selectedBrand : true;
    return matchSearch && matchBrand;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {language === 'ha' ? 'Barka da zuwa 👋' : 'Welcome 👋'}
          </Text>
          <Text style={styles.appName}>Easy Phone Market</Text>
        </View>
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setLanguage(language === 'ha' ? 'en' : 'ha')}
        >
          <Text style={styles.langText}>{language === 'ha' ? 'HA' : 'EN'}</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={texts.searchPlaceholder}
          placeholderTextColor={COLORS.gray}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Brand Filter */}
      <View style={styles.brandRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['All', ...BRANDS]}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isSelected =
              item === 'All' ? !selectedBrand : selectedBrand === item;
            return (
              <TouchableOpacity
                style={[styles.brandChip, isSelected && styles.brandChipActive]}
                onPress={() =>
                  setSelectedBrand(item === 'All' ? null : item)
                }
              >
                <Text
                  style={[
                    styles.brandChipText,
                    isSelected && styles.brandChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* Phones Grid */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{texts.noPhones}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <PhoneCard
            phone={item}
            onPress={() =>
              navigation.navigate('PhoneDetails', { phoneId: item.id })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: COLORS.white,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.gray,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
  },
  langBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  langText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
  },
  searchInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  brandRow: {
    backgroundColor: COLORS.white,
    paddingBottom: 12,
  },
  brandChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  brandChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  brandChipText: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
  brandChipTextActive: {
    color: COLORS.white,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
  },
});
