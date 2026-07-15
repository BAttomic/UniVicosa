import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme/theme';

export default function AppHeader({ title, subtitle, style }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rule} />
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  title: {
    color: theme.colors.emeraldDeep,
    fontFamily: theme.fonts.serif,
    fontSize: theme.fonts.xl,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  rule: {
    width: 48,
    height: 2,
    backgroundColor: theme.colors.gold,
    borderRadius: 2,
    marginTop: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.inkSoft,
    fontSize: theme.fonts.sm,
    letterSpacing: 1.5,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
