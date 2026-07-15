import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import AppButton from '../../../shared/components/AppButton';
import AppHeader from '../../../shared/components/AppHeader';
import InfoCard from '../../../shared/components/InfoCard';
import { theme } from '../../../shared/theme/theme';
import { fetchWeatherList } from '../services/weatherApi';

const DEFAULT_CITIES = [
  'São Paulo',
  'Rio de Janeiro',
  'Belo Horizonte',
  'Curitiba',
  'Salvador',
  'Brasília',
  'Fortaleza',
  'Recife',
  'Porto Alegre',
  'Manaus',
];

function getWeatherEmoji(icon, description) {
  if (icon?.startsWith('2')) return '⛈️';
  if (icon?.startsWith('3') || icon?.startsWith('5')) return '🌧️';
  if (icon?.startsWith('6')) return '❄️';
  if (icon?.startsWith('7')) return '🌫️';
  if (icon === '01d' || description?.includes('limpo')) return '☀️';
  return '☁️';
}

export default function WeatherListScreen({ navigation }) {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cities = useMemo(() => DEFAULT_CITIES, []);

  const loadWeather = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchWeatherList(cities);
      setWeatherData(data);
    } catch (fetchError) {
      setWeatherData([]);
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [cities]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  const handlePress = useCallback(
    (cityName) => {
      navigation.navigate('WeatherDetail', { cityName });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item, index }) => (
      <InfoCard
        title={item.name}
        subtitle={item.description}
        detail={`${item.temp}°C`}
        icon={getWeatherEmoji(item.icon, item.description)}
        onPress={() => handlePress(item.name)}
        index={index}
      />
    ),
    [handlePress]
  );

  const keyExtractor = useCallback((item) => String(item.id), []);

  return (
    <View style={styles.screen}>
      <AppHeader title="Previsão do Tempo" subtitle="Principais cidades do Brasil" />

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <AppButton title="Tentar Novamente" onPress={loadWeather} style={styles.retryButton} />
        </View>
      ) : (
        <FlatList
          data={weatherData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum dado disponível</Text>}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  retryButton: {
    width: '70%',
  },
  listContent: {
    paddingBottom: theme.spacing.lg,
  },
  emptyText: {
    color: theme.colors.gray,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
});