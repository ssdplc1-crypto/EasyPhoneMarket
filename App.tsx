import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import FulatanLogo from './src/components/FulatanLogo';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

function BrandSplash({ onDone }: { onDone: () => void }) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(.82)).current;
  const ring = useRef(new Animated.Value(.82)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 7, tension: 45, useNativeDriver: true }),
      Animated.loop(Animated.sequence([
        Animated.timing(ring, { toValue: 1.08, duration: 850, useNativeDriver: true }),
        Animated.timing(ring, { toValue: .82, duration: 850, useNativeDriver: true }),
      ])),
    ]).start();
    const timer = setTimeout(() => Animated.timing(fade, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => onDone()), 1900);
    return () => clearTimeout(timer);
  }, [fade, ring, scale, onDone]);
  return <View style={styles.splash}>
    <StatusBar style="light" />
    <Animated.View style={[styles.ring, { transform: [{ scale: ring }] }]} />
    <Animated.View style={{ opacity: fade, transform: [{ scale }], alignItems: 'center' }}>
      <FulatanLogo width={250} height={205} />
      <Text style={styles.tag}>BUY • SELL • CONNECT</Text>
    </Animated.View>
  </View>;
}

export default function App() {
  const [ready, setReady] = useState(false);
  return <AppProvider><StatusBar style={ready ? 'light' : 'light'} />{ready ? <AppNavigator /> : <BrandSplash onDone={() => setReady(true)} />}</AppProvider>;
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: '#070809', alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 290, height: 290, borderRadius: 145, borderWidth: 1, borderColor: 'rgba(255,90,20,.16)' },
  tag: { color: '#A1A1AA', fontSize: 10, fontWeight: '900', letterSpacing: 1.8, marginTop: 8 },
});
