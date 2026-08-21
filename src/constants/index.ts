export const COLORS = {
  primary: '#2563EB',
  primaryDark: '#173EA5',
  secondary: '#0F766E',
  accent: '#F97316',
  background: '#EEF2F7',
  white: '#FFFFFF',
  black: '#081225',
  navy: '#0B1630',
  navy2: '#132342',
  gray: '#52627A',
  muted: '#8290A6',
  lightGray: '#D6DEEA',
  danger: '#DC2626',
  success: '#16A34A',
  card: '#FFFFFF',
  border: '#D9E1EC',
  softBlue: '#EAF1FF',
  softOrange: '#FFF1E8',
};

export const BRANDS = ['Apple','Samsung','Tecno','Infinix','Xiaomi','Oppo','Vivo','Huawei','Nokia','Other'] as const;
export const CONDITIONS = ['New','Like New','Good','Fair'] as const;
export const NIGERIAN_STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];

export const t = {
  en: {
    home:'Home', search:'Search', sell:'Sell', favorites:'Favorites', profile:'Profile', login:'Login', register:'Register', logout:'Logout', postPhone:'Add Phone', phoneDetails:'Phone Details', contactSeller:'Contact Admin', call:'Call', whatsapp:'WhatsApp', chat:'Chat', price:'Price', condition:'Condition', location:'Location', description:'Description', brand:'Brand', model:'Model', uploadPhotos:'Phone Photos', submit:'Publish Phone', cancel:'Cancel', noPhones:'No phones found', searchPlaceholder:'Search phones, brands, models...', welcome:'Welcome to FULATAN COMMUNICATION', sellYourPhone:'Admin phone publishing', buyPhone:'Buy quality phones', myListings:'Admin Listings', editProfile:'Edit Profile', settings:'Settings', language:'Language', new:'New', likeNew:'Like New', good:'Good', fair:'Fair'
  },
  ha: {
    home:'Gida', search:'Nema', sell:'Saka Waya', favorites:'Abubuwan da aka fi so', profile:'Bayanan Kai', login:'Shiga', register:'Yi Rajista', logout:'Fita', postPhone:'Saka Waya', phoneDetails:'Cikakken Bayanin Waya', contactSeller:'Tuntuɓi Admin', call:'Kira', whatsapp:'WhatsApp', chat:'Hira', price:'Farashi', condition:'Yanayi', location:'Wuri', description:'Bayani', brand:'Brand', model:'Model', uploadPhotos:'Hotunan Waya', submit:'Saka Wayar', cancel:'Soke', noPhones:'Babu wayoyi', searchPlaceholder:'Nemo waya, brand ko model...', welcome:'Barka da zuwa FULATAN COMMUNICATION', sellYourPhone:'Admin ne kawai ke saka wayoyi', buyPhone:'Sayi wayoyi masu inganci', myListings:'Wayoyin Admin', editProfile:'Gyara Bayanan Kai', settings:'Saituna', language:'Harshe', new:'Sabuwa', likeNew:'Kamar Sabuwa', good:'Mai Kyau', fair:'Matsakaici'
  },
};
export type Language = 'en' | 'ha';
