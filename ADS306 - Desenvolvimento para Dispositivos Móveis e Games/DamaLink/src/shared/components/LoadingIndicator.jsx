import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import palette from '../theme/colors';
import dimensions from '../theme/dimensions';

function LoadingIndicator({ text = 'Carregando...', style, textStyle }) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="large" color={palette.accent} />
      <Text style={[styles.text, textStyle]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    flex: 1,
    justifyContent: 'center',
    padding: dimensions.spacing.xl,
  },
  text: {
    color: palette.accentSoft,
    fontSize: dimensions.typography.md,
    letterSpacing: 0.5,
    marginTop: dimensions.spacing.md,
    textAlign: 'center',
  },
});

export default LoadingIndicator;
