import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../services/mockData';
import { createOrGetChat } from '../services/firebaseService';

type Route = RouteProp<RootStackParamList, 'PhoneDetails'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');

export default function PhoneDetailsScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { phones, texts, isFavorite, toggleFavorite, user, language } = useApp();
  const phone = phones.find((p) => p.id === route.params.phoneId);

  if (!phone) {
    return (
      <View style={styles.center}>
        <Text>Phone not found</Text>
      </View>
    );
  }

  const favorite = isFavorite(phone.id);

  const openWhatsApp = () => {
    const message = language === 'ha'
      ? `Sannu, ina so in tambaya game da ${phone.title}`
      : `Hi, I'm interested in your ${phone.title}`;
    const url = `https://wa.me/234${phone.sellerPhone.slice(1)}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  const callSeller = () => {
    Linking.openURL(`tel:${phone.sellerPhone}`);
  };

  const startChat = async () => {
    if (!user) {
      Alert.alert(
        language === 'ha' ? 'Shiga' : 'Login Required',
        language === 'ha'
          ? 'Dole ne ka shiga kafin ka fara hira'
          : 'Please login to start a chat',
        [
          { text: texts.cancel, style: 'cancel' },
          { text: texts.login, onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    if (user.id === phone.sellerId) {
      Alert.alert(
        language === 'ha' ? 'Ba zai yiwu ba' : 'Not allowed',
        language === 'ha' ? 'Ba za ka iya yiwa kanka magana ba' : "You can't chat with yourself"
      );
      return;
    }

    try {
      const chatId = await createOrGetChat(
        phone.id,
        phone.title,
        user.id,
        phone.sellerId
      );
      navigation.navigate('Chat', {
        chatId,
        phoneTitle: phone.title,
        otherUserName: phone.sellerName,
      });
    } catch (e) {
      // Fallback for mock
      navigation.navigate('Chat', {
        chatId: `chat_${phone.id}_${user.id}`,
        phoneTitle: phone.title,
        otherUserName: phone.sellerName,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: phone.images[0] || 'https://via.placeholder.com/400' }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.iconText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => toggleFavorite(phone.id)}
          >
            <Text style={styles.iconText}>{favorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(phone.price)}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{phone.condition}</Text>
            </View>
          </View>

          <Text style={styles.title}>{phone.title}</Text>

          <View style={styles.meta}>
            <Text style={styles.metaText}>📍 {phone.location}, {phone.state}</Text>
            <Text style={styles.metaText}>👁 {phone.views || 0} views</Text>
          </View>

          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerInitial}>
                {phone.sellerName.charAt(0)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sellerName}>{phone.sellerName}</Text>
              <Text style={styles.sellerRating}>
                ⭐ {phone.sellerRating} · Seller
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>{texts.description}</Text>
          <Text style={styles.description}>{phone.description}</Text>

          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>{texts.brand}</Text>
            <Text style={styles.specValue}>{phone.brand}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>{texts.model}</Text>
            <Text style={styles.specValue}>{phone.model}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>{texts.condition}</Text>
            <Text style={styles.specValue}>{phone.condition}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>{texts.location}</Text>
            <Text style={styles.specValue}>
              {phone.location}, {phone.state}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.callBtn} onPress={callSeller}>
          <Text style={styles.callBtnText}>📞</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatBtn} onPress={startChat}>
          <Text style={styles.chatBtnText}>💬 {texts.chat}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.whatsappBtn} onPress={openWhatsApp}>
          <Text style={styles.whatsappBtnText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: 320,
  },
  topActions: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  content: {
    padding: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
  },
  badge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 13,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.gray,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerInitial: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  sellerRating: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
    marginTop: 8,
  },
  description: {
    fontSize: 15,
    color: COLORS.gray,
    lineHeight: 22,
    marginBottom: 16,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  specLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  callBtn: {
    width: 50,
    backgroundColor: COLORS.background,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  callBtnText: {
    fontSize: 18,
  },
  chatBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  chatBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  whatsappBtn: {
    flex: 1,
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  whatsappBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
