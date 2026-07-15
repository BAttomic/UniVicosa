import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import palette from '../theme/colors';
import dimensions from '../theme/dimensions';
import Button from './Button';

function ErrorMessage({ message = 'Ocorreu um erro inesperado.', onRetry, style }) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>!</Text>
      </View>
      <Text style={styles.title}>Algo deu errado</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <Button title="Tentar Novamente" onPress={onRetry} variant="primary" /> : null}
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
  badge: {
    alignItems: 'center',
    backgroundColor: palette.error,
    borderRadius: 999,
    height: dimensions.responsiveSize(52),
    justifyContent: 'center',
    marginBottom: dimensions.spacing.md,
    width: dimensions.responsiveSize(52),
    shadowColor: palette.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 8,
  },
  badgeText: {
    color: palette.primary,
    fontSize: dimensions.typography.xl,
    fontWeight: '900',
  },
  title: {
    color: palette.textPrimary,
    fontSize: dimensions.typography.xl,
    fontWeight: '800',
    marginBottom: dimensions.spacing.xs,
    textAlign: 'center',
  },
  message: {
    color: palette.textSecondary,
    fontSize: dimensions.typography.md,
    marginBottom: dimensions.spacing.lg,
    maxWidth: '88%',
    textAlign: 'center',
  },
});

export default ErrorMessage;
