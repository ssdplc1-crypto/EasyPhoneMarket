import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, Image, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Phone } from '../types';
import { COLORS, BRANDS } from '../constants';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../services/mockData';

const { width } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<RootStackParamList>;

const brandIcon: Record<string, string> = { Apple: '', Samsung: 'S', Tecno: 'T', Infinix: 'I', Xiaomi: 'X', Oppo: 'O', Vivo: 'V', Huawei: 'H', Nokia: 'N', Other: '•••' };

function ProductCard({ phone, onPress }: { phone: Phone; onPress: () => void }) {
  const { isFavorite, toggleFavorite } = useApp();
  const fav = isFavorite(phone.id);
  return (
    <TouchableOpacity activeOpacity={0.92} style={styles.productCard} onPress={onPress}>
      <View style={styles.imageWrap}>
        {phone.images?.[0] ? <Image source={{ uri: phone.images[0] }} style={styles.productImage} /> : <View style={styles.imageFallback}><Text style={styles.fallbackIcon}>F</Text></View>}
        <View style={styles.condition}><Text style={styles.conditionText}>{phone.condition}</Text></View>
        <TouchableOpacity style={styles.heart} onPress={() => toggleFavorite(phone.id)}><Text style={styles.heartText}>{fav ? '♥' : '♡'}</Text></TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.brand}>{phone.brand}</Text>
        <Text style={styles.productTitle} numberOfLines={2}>{phone.title}</Text>
        <Text style={styles.price}>{formatPrice(phone.price)}</Text>
        <Text style={styles.location}>⌖ {phone.location}, {phone.state}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { phones, language, setLanguage, cartCount, user } = useApp();
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const filtered = useMemo(() => phones.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || `${p.title} ${p.brand} ${p.model}`.toLowerCase().includes(q);
    return matchesSearch && (!selectedBrand || p.brand === selectedBrand);
  }), [phones, search, selectedBrand]);

  const categories = useMemo(
    () => BRANDS.filter((b) => phones.some((p) => p.brand === b)),
    [phones]
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.logo}><Text style={styles.logoF}>F</Text><View style={styles.logoDot} /></View>
                <View><Text style={styles.welcome}>{language === 'ha' ? 'Barka da zuwa 👋' : 'Welcome 👋'}</Text><Text style={styles.appName}>FULATAN <Text style={styles.orange}>COMMUNICATION</Text></Text></View>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.lang} onPress={() => setLanguage(language === 'ha' ? 'en' : 'ha')}><Text style={styles.langText}>{language === 'ha' ? 'HA' : 'EN'}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.cartTop} onPress={() => navigation.navigate('Cart')}><Text style={styles.cartIcon}>🛒</Text>{cartCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cartCount}</Text></View>}</TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchBox}><Text style={styles.searchIcon}>⌕</Text><TextInput value={search} onChangeText={setSearch} placeholder={language === 'ha' ? 'Nemo waya, brand ko model...' : 'Search phones, brands, models...'} placeholderTextColor={COLORS.muted} style={styles.search} /></View>

            <View style={styles.hero}>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroSmall}>FULATAN MARKETPLACE</Text>
                <Text style={styles.heroTitle}>Quality phones.</Text>
                <Text style={styles.heroSub}>{language === 'ha' ? 'Wayoyi da Admin ya tabbatar da su.' : 'Only phones uploaded by FULATAN Admin.'}</Text>
                <TouchableOpacity style={styles.heroBtn} onPress={() => setSelectedBrand(null)}><Text style={styles.heroBtnText}>{language === 'ha' ? 'Duba Wayoyi' : 'Browse Phones'}</Text></TouchableOpacity>
              </View>
              <View style={styles.heroPhones}><View style={styles.heroPhone}><Text style={styles.heroPhoneText}>F</Text></View><View style={[styles.heroPhone, styles.heroPhone2]}><Text style={styles.heroPhoneText}>F</Text></View></View>
            </View>

            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{language === 'ha' ? 'Categories' : 'Categories'}</Text><TouchableOpacity onPress={() => navigation.navigate('Categories')}><Text style={styles.seeAll}>See All</Text></TouchableOpacity></View>
            {categories.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                {categories.map((b) => <TouchableOpacity key={b} style={styles.category} onPress={() => { setSelectedBrand(b); setSearch(''); }}><View style={styles.categoryIcon}><Text style={styles.categoryGlyph}>{brandIcon[b] || '•'}</Text></View><Text style={styles.categoryText}>{b}</Text></TouchableOpacity>)}
              </ScrollView>
            ) : (
              <View style={styles.noCategory}><Text style={styles.noCategoryText}>{language === 'ha' ? 'Babu category tukuna' : 'No categories yet'}</Text></View>
            )}

            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{language === 'ha' ? 'Wayoyin da Admin ya saka' : 'Admin Listings'}</Text>{phones.length > 0 && <TouchableOpacity onPress={() => { setSelectedBrand(null); setSearch(''); }}><Text style={styles.seeAll}>See All</Text></TouchableOpacity>}</View>
          </View>
        }
        renderItem={({ item }) => <ProductCard phone={item} onPress={() => navigation.navigate('PhoneDetails', { phoneId: item.id })} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyLogo}><Text style={styles.emptyLogoText}>F</Text></View>
            <Text style={styles.emptyTitle}>{phones.length === 0 ? (language === 'ha' ? 'Har yanzu babu waya' : 'No phones available yet') : (language === 'ha' ? 'Ba a samu ba' : 'No phones found')}</Text>
            <Text style={styles.emptySub}>{phones.length === 0 ? (language === 'ha' ? 'Admin zai saka wayoyi nan. Da zarar an saka su, customers za su iya ganin su.' : 'The Admin will upload phones here. Customers will see them after they are published.') : (language === 'ha' ? 'Gwada wani search ko category.' : 'Try another search or category.')}</Text>
            {user?.role === 'admin' && phones.length === 0 && <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('PostPhone')}><Text style={styles.emptyButtonText}>＋ Add First Phone</Text></TouchableOpacity>}
          </View>
        }
      />
      {user?.role === 'admin' && <TouchableOpacity style={styles.adminFab} onPress={() => navigation.navigate('AdminDashboard')}><Text style={styles.adminShield}>🛡️</Text><Text style={styles.adminFabText}>Admin</Text></TouchableOpacity>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#E9EEF5'},
  list:{paddingHorizontal:14,paddingBottom:35},
  header:{backgroundColor:'#101A2E',marginHorizontal:-14,paddingHorizontal:18,paddingTop:10,paddingBottom:15,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  headerLeft:{flexDirection:'row',alignItems:'center',flex:1},
  logo:{width:42,height:42,borderRadius:13,backgroundColor:'#2563EB',alignItems:'center',justifyContent:'center',marginRight:10,shadowColor:'#2563EB',shadowOpacity:.3,shadowRadius:10,elevation:5},
  logoF:{fontSize:27,fontWeight:'900',color:'#fff'},
  logoDot:{position:'absolute',right:5,bottom:5,width:7,height:7,borderRadius:4,backgroundColor:'#F97316'},
  welcome:{fontSize:11,color:'#94A3B8',fontFamily:'sans-serif-medium'},
  appName:{fontSize:15,fontWeight:'900',color:'#fff',fontFamily:'sans-serif'},
  orange:{color:'#F97316'},
  headerActions:{flexDirection:'row',alignItems:'center',gap:8},
  lang:{backgroundColor:'#2563EB',borderRadius:12,paddingHorizontal:10,paddingVertical:8},
  langText:{color:'#fff',fontWeight:'900',fontSize:10},
  cartTop:{width:40,height:40,borderRadius:13,backgroundColor:'#1A2740',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#2D3C59'},
  cartIcon:{fontSize:19},
  badge:{position:'absolute',right:-2,top:-3,minWidth:18,height:18,borderRadius:9,backgroundColor:'#F97316',alignItems:'center',justifyContent:'center'},
  badgeText:{color:'#fff',fontSize:9,fontWeight:'900'},
  searchBox:{marginTop:14,marginBottom:14,backgroundColor:'#F8FAFC',borderWidth:1,borderColor:'#D7DFEA',borderRadius:17,height:54,flexDirection:'row',alignItems:'center',paddingHorizontal:15},
  searchIcon:{fontSize:25,color:'#334155',marginRight:5},
  search:{flex:1,fontSize:14,color:COLORS.black,fontFamily:'sans-serif'},
  hero:{marginBottom:16,borderRadius:20,padding:18,backgroundColor:'#173EA5',minHeight:155,flexDirection:'row',overflow:'hidden',shadowColor:'#0B1220',shadowOpacity:.18,shadowRadius:12,elevation:5},
  heroSmall:{color:'#BFDBFE',fontSize:9,fontWeight:'900',letterSpacing:1.2},
  heroTitle:{color:'#fff',fontSize:27,fontWeight:'900',marginTop:5,fontFamily:'sans-serif'},
  heroSub:{color:'#DBEAFE',fontSize:11,marginTop:4,lineHeight:16,fontFamily:'sans-serif-medium'},
  heroBtn:{alignSelf:'flex-start',backgroundColor:'#F97316',borderRadius:11,paddingHorizontal:16,paddingVertical:9,marginTop:13},
  heroBtnText:{color:'#fff',fontWeight:'900',fontSize:11},
  heroPhones:{width:90,alignItems:'center',justifyContent:'center',transform:[{rotate:'-8deg'}]},
  heroPhone:{width:46,height:80,borderRadius:10,backgroundColor:'#0B1220',borderWidth:2,borderColor:'#60A5FA',alignItems:'center',justifyContent:'center',transform:[{rotate:'10deg'}]},
  heroPhone2:{marginLeft:-22,marginTop:24,opacity:.8},
  heroPhoneText:{color:'#60A5FA',fontSize:27,fontWeight:'900'},
  sectionHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:2,marginBottom:9},
  sectionTitle:{fontSize:18,fontWeight:'900',color:COLORS.black,fontFamily:'sans-serif'},
  seeAll:{fontSize:11,fontWeight:'900',color:COLORS.primary},
  categoryScroll:{paddingBottom:9},
  category:{width:70,alignItems:'center',marginRight:12},
  categoryIcon:{width:48,height:48,borderRadius:15,backgroundColor:'#F8FAFC',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#D7DFEA'},
  categoryGlyph:{fontSize:22,fontWeight:'900',color:COLORS.primary},
  categoryText:{fontSize:10,color:'#475569',fontWeight:'800',marginTop:5},
  noCategory:{backgroundColor:'#DDE5F0',borderRadius:13,padding:12,marginBottom:9},
  noCategoryText:{fontSize:11,color:'#64748B',fontWeight:'700'},
  gridRow:{justifyContent:'space-between'},
  productCard:{width:(width-38)/2,backgroundColor:'#fff',borderRadius:18,overflow:'hidden',marginBottom:14,borderWidth:1,borderColor:'#D7DFEA',elevation:3,shadowColor:'#0B1220',shadowOpacity:.07,shadowRadius:8,shadowOffset:{width:0,height:3}},
  imageWrap:{height:150,backgroundColor:'#DDE5F0',position:'relative'},
  productImage:{width:'100%',height:'100%'},
  imageFallback:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#DDE5F0'},
  fallbackIcon:{fontSize:46,fontWeight:'900',color:'#2563EB'},
  condition:{position:'absolute',left:10,bottom:9,backgroundColor:'#2563EB',borderRadius:8,paddingHorizontal:8,paddingVertical:5},
  conditionText:{color:'#fff',fontSize:9,fontWeight:'900'},
  heart:{position:'absolute',right:8,top:8,width:34,height:34,borderRadius:17,backgroundColor:'rgba(255,255,255,.94)',alignItems:'center',justifyContent:'center'},
  heartText:{fontSize:19,color:'#EF4444'},
  productInfo:{padding:11},
  brand:{fontSize:10,color:'#64748B',fontWeight:'800'},
  productTitle:{fontSize:13,fontWeight:'900',color:COLORS.black,lineHeight:18,marginTop:3,minHeight:36,fontFamily:'sans-serif'},
  price:{fontSize:16,fontWeight:'900',color:COLORS.primary,marginTop:4},
  location:{fontSize:10,color:'#64748B',marginTop:5,fontFamily:'sans-serif-medium'},
  empty:{alignItems:'center',paddingHorizontal:30,paddingTop:46,paddingBottom:30},
  emptyLogo:{width:72,height:72,borderRadius:23,backgroundColor:'#101A2E',alignItems:'center',justifyContent:'center',shadowColor:'#0B1220',shadowOpacity:.18,shadowRadius:10,elevation:5},
  emptyLogoText:{fontSize:42,fontWeight:'900',color:'#60A5FA'},
  emptyTitle:{fontSize:18,fontWeight:'900',color:COLORS.black,marginTop:13,fontFamily:'sans-serif'},
  emptySub:{fontSize:11,color:'#64748B',textAlign:'center',lineHeight:17,marginTop:6,fontFamily:'sans-serif-medium'},
  emptyButton:{backgroundColor:'#2563EB',borderRadius:12,paddingHorizontal:16,paddingVertical:11,marginTop:16},
  emptyButtonText:{color:'#fff',fontSize:11,fontWeight:'900'},
  adminFab:{position:'absolute',right:16,bottom:18,backgroundColor:'#101A2E',borderRadius:24,paddingHorizontal:14,paddingVertical:10,flexDirection:'row',alignItems:'center',gap:6,elevation:5},
  adminShield:{fontSize:18},
  adminFabText:{color:'#fff',fontWeight:'900',fontSize:11}
});
