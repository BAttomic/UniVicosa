import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import palette from '../theme/colors';
import dimensions from '../theme/dimensions';

function Header({ title, subtitle, style }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: dimensions.spacing.xs,
    width: '100%',
  },
  title: {
    color: palette.textLight,
    fontSize: dimensions.responsiveFont(30),
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: palette.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  subtitle: {
    color: palette.accentSoft,
    fontSize: dimensions.responsiveFont(13),
    letterSpacing: 0.6,
    lineHeight: dimensions.responsiveFont(20),
    textAlign: 'center',
  },
});

export default Header;
