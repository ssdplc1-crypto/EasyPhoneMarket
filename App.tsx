import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

const APP_ICON = require('./assets/splash-icon.png');

function BrandSplash({ onDone }: { onDone: () => void }) {
  const fade = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.72)).current;
  const logoY = useRef(new Animated.Value(18)).current;
  const ringScale = useRef(new Animated.Value(0.72)).current;
  const ringOpacity = useRef(new Animated.Value(0.15)).current;
  const ring2Scale = useRef(new Animated.Value(0.72)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const shine = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const intro = Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 7, tension: 55, useNativeDriver: true }),
      Animated.timing(logoY, { toValue: 0, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(progress, { toValue: 1, duration: 1700, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }),
    ]);

    const rings = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ringScale, { toValue: 1.16, duration: 1150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(ringOpacity, { toValue: 0, duration: 1150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(ringScale, { toValue: 0.72, duration: 0, useNativeDriver: true }),
            Animated.timing(ringOpacity, { toValue: 0.18, duration: 0, useNativeDriver: true }),
          ]),
        ]),
        Animated.sequence([
          Animated.delay(550),
          Animated.parallel([
            Animated.timing(ring2Scale, { toValue: 1.18, duration: 1150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(ring2Opacity, { toValue: 0, duration: 1150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(ring2Scale, { toValue: 0.72, duration: 0, useNativeDriver: true }),
            Animated.timing(ring2Opacity, { toValue: 0.12, duration: 0, useNativeDriver: true }),
          ]),
        ]),
      ])
    );

    const shineLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shine, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.delay(650),
        Animated.timing(shine, { toValue: -1, duration: 0, useNativeDriver: true }),
      ])
    );

    intro.start();
    rings.start();
    shineLoop.start();

    const timer = setTimeout(() => {
      rings.stop();
      shineLoop.stop();
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 1.06, duration: 280, useNativeDriver: true }),
      ]).start(() => onDone());
    }, 2300);

    return () => clearTimeout(timer);
  }, [fade, logoScale, logoY, ringScale, ringOpacity, ring2Scale, ring2Opacity, progress, shine, onDone]);

  const shineX = shine.interpolate({ inputRange: [-1, 1], outputRange: [-150, 150] });
  const progressWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.splash}>
      <StatusBar style="light" />
      <View style={styles.glow} />
      <Animated.View style={[styles.ring, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />
      <Animated.View style={[styles.ring, styles.ringSecond, { opacity: ring2Opacity, transform: [{ scale: ring2Scale }] }]} />

      <Animated.View style={{ opacity: fade, transform: [{ translateY: logoY }, { scale: logoScale }] }}>
        <View style={styles.logoFrame}>
          <Image source={APP_ICON} style={styles.logoImage} resizeMode="contain" />
          <Animated.View style={[styles.shine, { transform: [{ translateX: shineX }, { rotate: '22deg' }] }]} />
        </View>

        <Text style={styles.brand}>FULATAN</Text>
        <Text style={styles.sub}>COMMUNICATION</Text>
        <Text style={styles.tag}>BUY • SELL • CONNECT</Text>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
        <Text style={styles.loading}>Preparing your marketplace</Text>
      </Animated.View>
    </View>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  return (
    <AppProvider>
      <StatusBar style={ready ? 'light' : 'light'} />
      {ready ? <AppNavigator /> : <BrandSplash onDone={() => setReady(true)} />}
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: '#070809', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  glow: { position: 'absolute', width: 330, height: 330, borderRadius: 165, backgroundColor: '#FF5A14', opacity: 0.055 },
  ring: { position: 'absolute', width: 270, height: 270, borderRadius: 135, borderWidth: 1.5, borderColor: '#FF5A14' },
  ringSecond: { width: 350, height: 350, borderRadius: 175, borderColor: '#FF9A5A' },
  logoFrame: { width: 150, height: 150, borderRadius: 42, backgroundColor: '#0D0F12', borderWidth: 1, borderColor: '#3A3D42', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', shadowColor: '#FF5A14', shadowOpacity: 0.38, shadowRadius: 28, elevation: 18 },
  logoImage: { width: 138, height: 138 },
  shine: { position: 'absolute', width: 34, height: 210, backgroundColor: 'rgba(255,255,255,0.14)', left: 55, top: -30 },
  brand: { marginTop: 22, textAlign: 'center', color: '#FFFFFF', fontSize: 29, fontWeight: '900', letterSpacing: 2.2 },
  sub: { marginTop: 2, textAlign: 'center', color: '#FF5A14', fontSize: 12, fontWeight: '900', letterSpacing: 4.2 },
  tag: { textAlign: 'center', color: '#A1A1AA', fontSize: 10, fontWeight: '800', letterSpacing: 1.7, marginTop: 13 },
  progressTrack: { width: 130, height: 4, borderRadius: 4, backgroundColor: '#292B30', marginTop: 20, overflow: 'hidden', alignSelf: 'center' },
  progressBar: { height: 4, borderRadius: 4, backgroundColor: '#FF5A14' },
  loading: { textAlign: 'center', color: '#666A72', fontSize: 9, marginTop: 9, letterSpacing: 0.5 },
});
