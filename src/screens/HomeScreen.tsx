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

const brandIcon: Record<string, string> = { Apple: '', Samsung: 'S', Tecno: 'T', Infinix: 'I', Xiaomi: 'X', Google: 'G', Nokia: 'N', Other: '•••' };

function ProductCard({ phone, onPress }: { phone: Phone; onPress: () => void }) {
  const { isFavorite, toggleFavorite } = useApp();
  const fav = isFavorite(phone.id);
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.productCard} onPress={onPress}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: phone.images?.[0] }} style={styles.productImage} />
        <View style={styles.condition}><Text style={styles.conditionText}>{phone.condition}</Text></View>
        <TouchableOpacity style={styles.heart} onPress={() => toggleFavorite(phone.id)}><Text>{fav ? '❤️' : '♡'}</Text></TouchableOpacity>
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

  const categories = BRANDS.slice(0, 8);

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
                <View style={styles.logo}><Text style={styles.logoF}>F</Text><Text style={styles.logoCart}>🛒</Text></View>
                <View><Text style={styles.welcome}>{language === 'ha' ? 'Barka da zuwa 👋' : 'Welcome 👋'}</Text><Text style={styles.appName}>FULATAN <Text style={styles.orange}>COMMUNICATION</Text></Text></View>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.lang} onPress={() => setLanguage(language === 'ha' ? 'en' : 'ha')}><Text style={styles.langText}>{language === 'ha' ? 'HA' : 'EN'}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.cartTop} onPress={() => navigation.navigate('Cart')}><Text style={{ fontSize: 22 }}>🛒</Text>{cartCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cartCount}</Text></View>}</TouchableOpacity>
              </View>
            </View>
            <View style={styles.searchBox}><Text style={styles.searchIcon}>⌕</Text><TextInput value={search} onChangeText={setSearch} placeholder="Search phones, brands, models..." placeholderTextColor={COLORS.gray} style={styles.search} /></View>
            <View style={styles.hero}><View style={{ flex: 1 }}><Text style={styles.heroSmall}>LATEST DEALS</Text><Text style={styles.heroTitle}>iPhone 15 Series</Text><Text style={styles.heroSub}>Power. Beauty. Titanium.</Text><TouchableOpacity style={styles.heroBtn} onPress={() => setSelectedBrand('Apple')}><Text style={styles.heroBtnText}>Shop Now</Text></TouchableOpacity></View><View style={styles.heroPhones}><Text style={styles.phoneEmoji}>📱</Text><Text style={[styles.phoneEmoji, { marginLeft: -18, marginTop: 18 }]}>📱</Text></View></View>
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Categories</Text><TouchableOpacity onPress={() => navigation.navigate('Categories')}><Text style={styles.seeAll}>See All</Text></TouchableOpacity></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
              {categories.map((b) => <TouchableOpacity key={b} style={styles.category} onPress={() => { setSelectedBrand(b); setSearch(''); }}><View style={styles.categoryIcon}><Text style={styles.categoryGlyph}>{brandIcon[b] || '•'}</Text></View><Text style={styles.categoryText}>{b}</Text></TouchableOpacity>)}
            </ScrollView>
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Hot Deals</Text><TouchableOpacity onPress={() => { setSelectedBrand(null); setSearch(''); }}><Text style={styles.seeAll}>See All</Text></TouchableOpacity></View>
          </View>
        }
        renderItem={({ item }) => <ProductCard phone={item} onPress={() => navigation.navigate('PhoneDetails', { phoneId: item.id })} />}
        ListEmptyComponent={<View style={styles.empty}><Text style={{ fontSize: 38 }}>📱</Text><Text style={styles.emptyTitle}>No phones found</Text><Text style={styles.emptySub}>Try another search or category.</Text></View>}
      />
      {user?.role === 'admin' && <TouchableOpacity style={styles.adminFab} onPress={() => navigation.navigate('AdminDashboard')}><Text style={{ fontSize: 20 }}>🛡️</Text><Text style={styles.adminFabText}>Admin</Text></TouchableOpacity>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#F6F8FB'},list:{paddingHorizontal:14,paddingBottom:30},header:{backgroundColor:'#fff',paddingHorizontal:4,paddingTop:8,paddingBottom:12,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},headerLeft:{flexDirection:'row',alignItems:'center',flex:1},logo:{width:38,height:38,borderRadius:12,backgroundColor:'#EFF6FF',alignItems:'center',justifyContent:'center',marginRight:9},logoF:{fontSize:25,fontWeight:'900',color:COLORS.primary},logoCart:{position:'absolute',fontSize:12,right:1,bottom:1},welcome:{fontSize:11,color:COLORS.gray},appName:{fontSize:15,fontWeight:'900',color:COLORS.black},orange:{color:'#F97316'},headerActions:{flexDirection:'row',alignItems:'center',gap:8},lang:{backgroundColor:COLORS.primary,borderRadius:12,paddingHorizontal:10,paddingVertical:7},langText:{color:'#fff',fontWeight:'800',fontSize:11},cartTop:{width:38,height:38,borderRadius:12,backgroundColor:'#F8FAFC',alignItems:'center',justifyContent:'center'},badge:{position:'absolute',right:-2,top:-3,minWidth:17,height:17,borderRadius:9,backgroundColor:'#EF4444',alignItems:'center',justifyContent:'center'},badgeText:{color:'#fff',fontSize:9,fontWeight:'900'},searchBox:{marginHorizontal:2,marginBottom:12,backgroundColor:'#fff',borderWidth:1,borderColor:'#E2E8F0',borderRadius:16,height:52,flexDirection:'row',alignItems:'center',paddingHorizontal:14},searchIcon:{fontSize:26,color:COLORS.gray,marginRight:5},search:{flex:1,fontSize:14,color:COLORS.black},hero:{marginBottom:15,borderRadius:18,padding:18,backgroundColor:'#0F4CD8',minHeight:145,flexDirection:'row',overflow:'hidden'},heroSmall:{color:'#DCE8FF',fontSize:10,fontWeight:'800',letterSpacing:1},heroTitle:{color:'#fff',fontSize:25,fontWeight:'900',marginTop:5},heroSub:{color:'#DCE8FF',fontSize:12,marginTop:3},heroBtn:{alignSelf:'flex-start',backgroundColor:'#F97316',borderRadius:9,paddingHorizontal:15,paddingVertical:8,marginTop:13},heroBtnText:{color:'#fff',fontWeight:'900',fontSize:11},heroPhones:{width:105,alignItems:'center',justifyContent:'center',transform:[{rotate:'-8deg'}]},phoneEmoji:{fontSize:66},sectionHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:3,marginBottom:9},sectionTitle:{fontSize:18,fontWeight:'900',color:COLORS.black},seeAll:{fontSize:12,fontWeight:'800',color:COLORS.primary},category:{width:68,alignItems:'center',marginRight:12},categoryIcon:{width:46,height:46,borderRadius:14,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#E5EAF1'},categoryGlyph:{fontSize:22,fontWeight:'900',color:COLORS.primary},categoryText:{fontSize:10,color:COLORS.gray,fontWeight:'700',marginTop:5},gridRow:{justifyContent:'space-between'},productCard:{width:(width-38)/2,backgroundColor:'#fff',borderRadius:17,overflow:'hidden',marginBottom:14,borderWidth:1,borderColor:'#E7ECF3',elevation:2,shadowColor:'#000',shadowOpacity:.05,shadowRadius:7,shadowOffset:{width:0,height:3}},imageWrap:{height:150,backgroundColor:'#F1F5F9',position:'relative'},productImage:{width:'100%',height:'100%'},condition:{position:'absolute',left:10,bottom:9,backgroundColor:COLORS.primary,borderRadius:8,paddingHorizontal:8,paddingVertical:5},conditionText:{color:'#fff',fontSize:10,fontWeight:'800'},heart:{position:'absolute',right:8,top:8,width:34,height:34,borderRadius:17,backgroundColor:'rgba(255,255,255,.92)',alignItems:'center',justifyContent:'center'},productInfo:{padding:11},brand:{fontSize:11,color:COLORS.gray,fontWeight:'600'},productTitle:{fontSize:13,fontWeight:'800',color:COLORS.black,lineHeight:18,marginTop:3,minHeight:36},price:{fontSize:16,fontWeight:'900',color:COLORS.primary,marginTop:4},location:{fontSize:10,color:COLORS.gray,marginTop:5},empty:{alignItems:'center',paddingTop:70},emptyTitle:{fontSize:17,fontWeight:'800',marginTop:8},emptySub:{color:COLORS.gray,marginTop:4},adminFab:{position:'absolute',right:16,bottom:18,backgroundColor:'#0F172A',borderRadius:24,paddingHorizontal:14,paddingVertical:10,flexDirection:'row',alignItems:'center',gap:6,elevation:5},adminFabText:{color:'#fff',fontWeight:'800',fontSize:12}
});
