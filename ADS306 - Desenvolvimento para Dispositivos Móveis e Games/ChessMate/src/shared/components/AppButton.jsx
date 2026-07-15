import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { theme } from '../theme/theme';

export default function AppButton({ onPress, title, style, disabled = false, variant = 'primary' }) {
  const handlePress = disabled ? undefined : onPress;
  const isSecondary = variant === 'secondary';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.button,
        isSecondary ? styles.secondary : styles.primary,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, isSecondary && styles.secondaryText]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'stretch',
    alignItems: 'center',
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderWidth: 1,
  },
  primary: {
    backgroundColor: theme.colors.emerald,
    borderColor: theme.colors.emeraldDeep,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.gold,
  },
  disabled: {
    opacity: 0.45,
  },
  text: {
    color: theme.colors.surface,
    fontFamily: theme.fonts.serif,
    fontSize: theme.fonts.md,
    fontWeight: '700',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  secondaryText: {
    color: theme.colors.gold,
  },
});
