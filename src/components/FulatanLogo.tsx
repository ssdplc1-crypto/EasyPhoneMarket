import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

const logo = require('../../assets/fulatan-logo.png');

export default function FulatanLogo({ width = 120, height = 96, style }: { width?: number; height?: number; style?: StyleProp<ImageStyle> }) {
  return <Image source={logo} resizeMode="contain" style={[{ width, height }, style]} />;
}
