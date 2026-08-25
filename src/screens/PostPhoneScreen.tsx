import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, BRANDS, CONDITIONS, NIGERIAN_STATES } from '../constants';
import { useApp } from '../context/AppContext';
import { Phone, PhoneBrand, PhoneCondition } from '../types';
import { postPhone } from '../services/api';

export default function PostPhoneScreen() {
  const navigation = useNavigation();
  const { phones, setPhones, user, texts, language, isAdmin } = useApp();

  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState<PhoneBrand>('Samsung');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<PhoneCondition>('Good');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('Kano');
  const [images, setImages] = useState<string[]>([]);
  const [commissionType, setCommissionType] = useState<'fixed'|'percent'>('fixed');
  const [commissionValue, setCommissionValue] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!user || !isAdmin) navigation.goBack(); }, [user, isAdmin, navigation]);
  useEffect(() => { const sub = BackHandler.addEventListener('hardwareBackPress', () => { (navigation as any).navigate('Dashboard'); return true; }); return () => sub.remove(); }, [navigation]);
  if (!user || !isAdmin) return null;

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        language === 'ha' ? 'Izini' : 'Permission',
        language === 'ha'
          ? 'Muna buƙatar izinin gallery'
          : 'We need gallery permission'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...uris].slice(0, 5));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        language === 'ha' ? 'Izini' : 'Permission',
        language === 'ha'
          ? 'Muna buƙatar izinin camera'
          : 'We need camera permission'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const normalizedPrice = Number(price.replace(/,/g, '').replace(/₦/g, '').trim());
    const normalizedCommission = Number(commissionValue.replace(/,/g, '').replace(/₦/g, '').replace('%', '').trim() || '0');
    if (!title || !model || !price || !location || !Number.isFinite(normalizedPrice)) {
      Alert.alert(
        language === 'ha' ? 'Kuskure' : 'Error',
        language === 'ha'
          ? 'Da fatan za a cika duk muhimman filayen'
          : 'Please fill all required fields'
      );
      return;
    }

    if (!user || !isAdmin) {
      Alert.alert(
        language === 'ha' ? 'Shiga' : 'Login Required',
        language === 'ha'
          ? 'Admin ne kawai zai iya saka waya.'
          : 'Only the FULATAN Admin can publish phones.'
      );
      return;
    }

    setLoading(true);
    try {
      const newPhone = await postPhone(
        {
          title,
          brand,
          model,
          price: normalizedPrice,
          commissionType,
          commissionValue: Number.isFinite(normalizedCommission) ? normalizedCommission : 0,
          condition,
          description,
          images: [],
          location,
          state,
          sellerId: user.id,
          sellerName: user.name,
          sellerPhone: user.phone,
          sellerRating: user.rating || 5,
          isPublished: true,
        },
        images
      );

      setPhones([newPhone, ...phones]);
      Alert.alert(
        language === 'ha' ? 'Nasara!' : 'Success!',
        language === 'ha'
          ? 'An saka wayar a FULATAN cikin nasara.'
          : 'Phone published successfully.',
        [{ text: 'OK', onPress: () => (navigation as any).navigate('Dashboard') }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}><View><Text style={styles.pageTitle}>{texts.postPhone}</Text><Text style={styles.pageSub}>{language==='ha'?'Cika bayanan wayar da kyau':'Add a phone to the marketplace'}</Text></View></View>

        {/* Image Picker */}
        <Text style={styles.label}>{texts.uploadPhotos}</Text>
        <View style={styles.imageRow}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 5 && (
            <View style={styles.addButtons}>
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                <Text style={styles.addImageText}>🖼️</Text>
                <Text style={styles.addImageLabel}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addImageBtn} onPress={takePhoto}>
                <Text style={styles.addImageText}>📷</Text>
                <Text style={styles.addImageLabel}>Camera</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.label}>{texts.brand}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {BRANDS.map((b) => (
            <TouchableOpacity
              key={b}
              style={[styles.chip, brand === b && styles.chipActive]}
              onPress={() => setBrand(b)}
            >
              <Text style={[styles.chipText, brand === b && styles.chipTextActive]}>
                {b}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>
          {language === 'ha' ? 'Take (Title)' : 'Title'} *
        </Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. iPhone 14 Pro Max 256GB"
          placeholderTextColor={COLORS.gray}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>{texts.model} *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. iPhone 14 Pro Max"
          placeholderTextColor={COLORS.gray}
          value={model}
          onChangeText={setModel}
        />

        <Text style={styles.label}>{texts.price} (₦) *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 450000"
          placeholderTextColor={COLORS.gray}
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>{language === 'ha' ? 'Referral Commission' : 'Referral Commission'}</Text>
        <View style={styles.chipsRow}>
          <TouchableOpacity style={[styles.chip, commissionType === 'fixed' && styles.chipActive]} onPress={() => setCommissionType('fixed')}><Text style={[styles.chipText, commissionType === 'fixed' && styles.chipTextActive]}>₦ Fixed</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.chip, commissionType === 'percent' && styles.chipActive]} onPress={() => setCommissionType('percent')}><Text style={[styles.chipText, commissionType === 'percent' && styles.chipTextActive]}>% Percent</Text></TouchableOpacity>
        </View>
        <TextInput style={styles.input} placeholder={commissionType === 'fixed' ? 'e.g. 5000' : 'e.g. 2'} placeholderTextColor={COLORS.gray} keyboardType="numeric" value={commissionValue} onChangeText={setCommissionValue}/>

        <Text style={styles.label}>{texts.condition}</Text>
        <View style={styles.chipsRow}>
          {CONDITIONS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, condition === c && styles.chipActive]}
              onPress={() => setCondition(c)}
            >
              <Text style={[styles.chipText, condition === c && styles.chipTextActive]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{texts.location} *</Text>
        <TextInput
          style={styles.input}
          placeholder={language === 'ha' ? 'Misali: Sabon Gari' : 'e.g. Ikeja'}
          placeholderTextColor={COLORS.gray}
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>State</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {NIGERIAN_STATES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, state === s && styles.chipActive]}
              onPress={() => setState(s)}
            >
              <Text style={[styles.chipText, state === s && styles.chipTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>{texts.description}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={
            language === 'ha'
              ? 'Bayyana yanayin wayar, battery, etc...'
              : 'Describe the phone condition, battery, accessories...'
          }
          placeholderTextColor={COLORS.gray}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>{texts.submit}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070809',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  kicker: { fontSize: 9, color: COLORS.primary, fontWeight: '900', letterSpacing: 2, marginBottom: 3 },
  secure: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12 },
  secureText: { color: '#166534', fontSize: 8, fontWeight: '900' },
  notice: { backgroundColor: '#17120F', borderWidth: 1, borderColor: '#4A2B1E', borderRadius: 15, padding: 12, marginBottom: 8 },
  noticeTitle: { fontSize: 12, fontWeight: '900', color: COLORS.primary },
  noticeText: { fontSize: 10, color: '#A1A1AA', lineHeight: 16, marginTop: 4, fontWeight: '600' },
  pageSub: { fontSize: 10, color: '#8F939B', marginTop: -15, marginBottom: 18 },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#101216',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  chips: {
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#101216',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
  chipTextActive: {
    color: COLORS.white,
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  imageWrapper: {
    position: 'relative',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.danger,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  addButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#101216',
  },
  addImageText: {
    fontSize: 24,
  },
  addImageLabel: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
