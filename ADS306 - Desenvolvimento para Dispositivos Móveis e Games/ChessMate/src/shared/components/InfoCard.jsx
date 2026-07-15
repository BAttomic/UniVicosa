import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../theme/theme';

export default function InfoCard({ title, subtitle, detail, icon, onPress, index = 0 }) {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 360,
      delay: Math.min(index, 8) * 70,
      useNativeDriver: true,
    }).start();
  }, [enter, index]);

  const animatedStyle = {
    opacity: enter,
    transform: [
      { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
    ],
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
        <View style={styles.iconWrapper}>
          <Text style={styles.icon}>{icon ?? '♟'}</Text>
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    ...theme.shadow.card,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  icon: {
    fontSize: 24,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.serif,
    fontSize: theme.fonts.lg,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.colors.inkSoft,
    fontSize: theme.fonts.sm,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  detail: {
    color: theme.colors.emerald,
    fontFamily: theme.fonts.serif,
    fontSize: theme.fonts.lg,
    fontWeight: '700',
    marginLeft: theme.spacing.sm,
  },
});
