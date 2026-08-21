import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';
import { useApp } from '../context/AppContext';
import PhoneCard from '../components/PhoneCard';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function FavoritesScreen() {
  const navigation = useNavigation<Nav>();
  const { phones, favorites, texts } = useApp();

  const favoritePhones = phones.filter((p) => favorites.includes(p.id));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{texts.favorites}</Text>
        <Text style={styles.count}>{favoritePhones.length} items</Text>
      </View>

      <FlatList
        data={favoritePhones}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🤍</Text>
            <Text style={styles.emptyText}>
              {texts.noPhones}
            </Text>
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
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.black,
  },
  count: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
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
    marginTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
  },
});
