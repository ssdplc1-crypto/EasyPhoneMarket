import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Phone } from '../types';
import { COLORS } from '../constants';
import { formatPrice } from '../services/mockData';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface Props {
  phone: Phone;
  onPress: () => void;
}

export default function PhoneCard({ phone, onPress }: Props) {
  const { isFavorite, toggleFavorite, texts } = useApp();
  const favorite = isFavorite(phone.id);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: phone.images[0] || 'https://via.placeholder.com/200' }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.favButton}
          onPress={() => toggleFavorite(phone.id)}
        >
          <Text style={styles.favIcon}>{favorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
        <View style={styles.conditionBadge}>
          <Text style={styles.conditionText}>{phone.condition}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.brand}>{phone.brand}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {phone.title}
        </Text>
        <Text style={styles.price}>{formatPrice(phone.price)}</Text>
        <View style={styles.locationRow}>
          <Text style={styles.location}>📍 {phone.location}, {phone.state}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    position: 'relative',
    height: 140,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favIcon: {
    fontSize: 16,
  },
  conditionBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  conditionText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  info: {
    padding: 10,
  },
  brand: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
    lineHeight: 18,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 11,
    color: COLORS.gray,
  },
});
