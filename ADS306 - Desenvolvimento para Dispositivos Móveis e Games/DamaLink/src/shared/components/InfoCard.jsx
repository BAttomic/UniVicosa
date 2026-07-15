import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import palette from '../theme/colors';
import dimensions from '../theme/dimensions';

function InfoCard({ title, description, imageUrl, onPress, style, index = 0 }) {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 380,
      delay: Math.min(index, 8) * 70,
      useNativeDriver: true,
    }).start();
  }, [enter, index]);

  const animatedStyle = {
    opacity: enter,
    transform: [
      { translateX: enter.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) },
    ],
  };

  return (
    <Animated.View style={animatedStyle}>
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
      onPress={onPress}
      style={[styles.card, style]}
    >
      <View style={styles.accentBar} />

      {imageUrl ? (
        <View style={styles.imageWrapper}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
        </View>
      ) : null}

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>

      {onPress ? <Text style={styles.chevron}>›</Text> : null}
    </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: palette.surfaceSolid,
    borderColor: palette.border,
    borderRadius: dimensions.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: dimensions.spacing.md,
    marginVertical: dimensions.spacing.sm,
    overflow: 'hidden',
    paddingHorizontal: dimensions.spacing.lg,
    paddingVertical: dimensions.spacing.md,
    shadowColor: palette.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  accentBar: {
    backgroundColor: palette.accent,
    borderRadius: 4,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 4,
  },
  imageWrapper: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: palette.primarySoft,
    borderRadius: dimensions.radius.md,
    justifyContent: 'center',
    width: '24%',
  },
  image: {
    height: '78%',
    width: '78%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: palette.textPrimary,
    fontSize: dimensions.typography.lg,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  description: {
    color: palette.textSecondary,
    fontSize: dimensions.typography.sm,
    lineHeight: dimensions.typography.md + 4,
    marginTop: dimensions.spacing.xs,
  },
  chevron: {
    color: palette.accent,
    fontSize: dimensions.typography.xxl,
    fontWeight: '900',
    marginLeft: dimensions.spacing.sm,
  },
});

export default InfoCard;
