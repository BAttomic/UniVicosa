import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { gradients } from '../theme/colors';

// Gradiente linear em React Native puro (sem expo-linear-gradient):
// desenha N fatias com cores interpoladas entre os "stops".
const SLICES = 24;

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const int = parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function mix(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function colorAt(stops, t) {
  if (stops.length === 1) return stops[0];
  const scaled = t * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(scaled));
  const local = scaled - i;
  const from = hexToRgb(stops[i]);
  const to = hexToRgb(stops[i + 1]);
  return `rgb(${mix(from.r, to.r, local)}, ${mix(from.g, to.g, local)}, ${mix(from.b, to.b, local)})`;
}

export default function NeonGradient({
  colors = gradients.brand,
  horizontal = true,
  style,
  children,
}) {
  const slices = useMemo(() => {
    const arr = [];
    for (let i = 0; i < SLICES; i += 1) {
      arr.push(colorAt(colors, i / (SLICES - 1)));
    }
    return arr;
  }, [colors]);

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[StyleSheet.absoluteFill, horizontal ? styles.row : styles.column]}>
        {slices.map((color, index) => (
          <View key={index} style={[styles.slice, { backgroundColor: color }]} />
        ))}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  slice: {
    flex: 1,
  },
});
