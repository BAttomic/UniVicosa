import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import AppButton from '../../../shared/components/AppButton';
import AppHeader from '../../../shared/components/AppHeader';
import { theme } from '../../../shared/theme/theme';
import { fetchWeatherDetail } from '../services/weatherApi';

function getWeatherEmoji(icon, description) {
  if (icon?.startsWith('2')) return '⛈️';
  if (icon?.startsWith('3') || icon?.startsWith('5')) return '🌧️';
  if (icon?.startsWith('6')) return '❄️';
  if (icon?.startsWith('7')) return '🌫️';
  if (icon === '01d' || description?.includes('limpo')) return '☀️';
  return '☁️';
}

export default function WeatherDetailScreen({ route, navigation }) {
  const cityName = route.params?.cityName ?? '';
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDetail = useCallback(async () => {
    if (!cityName) {
      setError('Cidade inválida.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchWeatherDetail(cityName);
      setWeather(data);
    } catch (fetchError) {
      setWeather(null);
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [cityName]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const metricCards = useMemo(
    () => [
      { label: 'Sensação térmica', value: weather ? `${weather.feels_like}°C` : '--' },
      { label: 'Mín / Máx', value: weather ? `${weather.temp_min}°C / ${weather.temp_max}°C` : '--' },
      { label: 'Umidade', value: weather ? `${weather.humidity}%` : '--' },
      { label: 'Pressão', value: weather ? `${weather.pressure} hPa` : '--' },
      { label: 'Vento', value: weather ? `${weather.wind_speed} m/s` : '--' },
    ],
    [weather]
  );

  return (
    <View style={styles.screen}>
      <AppHeader title={cityName || 'Detalhe do Clima'} subtitle="Detalhamento por cidade" />

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <AppButton title="Tentar Novamente" onPress={loadDetail} style={styles.button} />
          <AppButton title="Voltar" onPress={handleGoBack} style={styles.secondaryButton} />
        </View>
      ) : weather ? (
        <View style={styles.content}>
          <Text style={styles.emoji}>{getWeatherEmoji(weather.icon, weather.description)}</Text>
          <Text style={styles.temperature}>{weather.temp}°C</Text>
          <Text style={styles.description}>{weather.description}</Text>
          <Text style={styles.location}>{weather.name} • {weather.country}</Text>

          <View style={styles.grid}>
            {metricCards.map((item) => (
              <View key={item.label} style={styles.metricCard}>
                <Text style={styles.metricLabel}>{item.label}</Text>
                <Text style={styles.metricValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <AppButton title="Voltar" onPress={handleGoBack} style={styles.button} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fonts.md,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  temperature: {
    color: theme.colors.emeraldDeep,
    fontFamily: theme.fonts.serif,
    fontSize: theme.fonts.xxl,
    fontWeight: '700',
    marginTop: theme.spacing.md,
  },
  description: {
    color: theme.colors.ink,
    fontSize: theme.fonts.lg,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  location: {
    color: theme.colors.inkSoft,
    fontSize: theme.fonts.md,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  metricCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    width: '48%',
    ...theme.shadow.card,
  },
  metricLabel: {
    color: theme.colors.muted,
    fontSize: theme.fonts.sm,
    letterSpacing: 0.3,
  },
  metricValue: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.serif,
    fontSize: theme.fonts.lg,
    fontWeight: '700',
    marginTop: 4,
  },
  button: {
    marginTop: theme.spacing.lg,
    width: '72%',
  },
  secondaryButton: {
    marginTop: theme.spacing.sm,
    width: '72%',
  },
});