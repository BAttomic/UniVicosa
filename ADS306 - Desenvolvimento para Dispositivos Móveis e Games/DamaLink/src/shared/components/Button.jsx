import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import palette, { gradients } from '../theme/colors';
import dimensions from '../theme/dimensions';
import NeonGradient from './NeonGradient';

function Button({ title, onPress, variant = 'primary', disabled = false, style }) {
  const isPrimary = variant === 'primary' && !disabled;
  const isDanger = variant === 'danger';

  const label = (
    <Text
      style={[
        styles.text,
        { color: disabled ? palette.muted : isPrimary ? palette.primary : palette.textLight },
      ]}
    >
      {title}
    </Text>
  );

  if (isPrimary) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.shadow, style]}>
        <NeonGradient colors={gradients.brand} style={[styles.button, styles.gradient]}>
          {label}
        </NeonGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        styles.outline,
        {
          borderColor: disabled ? palette.muted : isDanger ? palette.error : palette.accent,
          backgroundColor: palette.surface,
        },
        style,
      ]}
    >
      {label}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: dimensions.radius.md,
    justifyContent: 'center',
    minHeight: dimensions.responsiveSize(48),
    paddingHorizontal: dimensions.spacing.xl,
    paddingVertical: dimensions.spacing.sm,
  },
  gradient: {
    paddingHorizontal: dimensions.spacing.xl + 4,
  },
  outline: {
    borderWidth: 1.5,
  },
  shadow: {
    alignSelf: 'flex-start',
    borderRadius: dimensions.radius.md,
    shadowColor: palette.magenta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 8,
  },
  text: {
    fontSize: dimensions.typography.md,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});

export default Button;
