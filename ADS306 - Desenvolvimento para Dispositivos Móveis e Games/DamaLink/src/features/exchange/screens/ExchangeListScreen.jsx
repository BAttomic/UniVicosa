import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Header from '../../../shared/components/Header';
import InfoCard from '../../../shared/components/InfoCard';
import LoadingIndicator from '../../../shared/components/LoadingIndicator';
import ErrorMessage from '../../../shared/components/ErrorMessage';
import NeonGradient from '../../../shared/components/NeonGradient';
import palette, { gradients } from '../../../shared/theme/colors';
import dimensions from '../../../shared/theme/dimensions';
import useExchangeRates, { DEFAULT_PAIRS } from '../hooks/useExchangeRates';

function HomeScreen({ navigation }) {
  const { data, loading, error, refetch } = useExchangeRates(DEFAULT_PAIRS);

  const renderItem = ({ item, index }) => (
    <InfoCard
      title={`${item.code}/${item.codein}`}
      description={formatRateDescription(item)}
      onPress={() => navigation.navigate('ExchangeDetail', { pair: item.pair })}
      index={index}
    />
  );

  if (loading) {
    return <LoadingIndicator text="Carregando câmbios..." style={styles.centerState} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} style={styles.centerState} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Header
          title="Câmbio Brasil"
          subtitle="Acompanhe as principais taxas do real em tempo quase real."
        />
        <NeonGradient colors={gradients.brand} style={styles.heroBar} />
      </View>

      {data.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nenhuma cotação disponível</Text>
          <Text style={styles.emptyText}>Tente novamente mais tarde ou verifique sua conexão.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.pair}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function formatRateDescription(item) {
  const bid = formatCurrency(item.bid);
  const variation = formatVariation(item.pctChange);
  const updatedAt = formatUpdatedAt(item);

  if (updatedAt) {
    return `Compra: ${bid} • Var: ${variation}\nAtualizado: ${updatedAt}`;
  }

  return `Compra: ${bid} • Var: ${variation}`;
}

function formatCurrency(value) {
  if (!Number.isFinite(value)) {
    return '—';
  }

  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  } catch (error) {
    return `R$ ${value.toFixed(4).replace('.', ',')}`;
  }
}

function formatVariation(value) {
  if (!Number.isFinite(value)) {
    return '—';
  }

  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function formatUpdatedAt(item) {
  const rawDate = item.updatedAt || null;
  let parsedDate = null;

  if (rawDate) {
    const normalized = rawDate.includes(' ') ? rawDate.replace(' ', 'T') : rawDate;
    const date = new Date(normalized);
    parsedDate = Number.isNaN(date.getTime()) ? null : date;
  } else if (Number.isFinite(item.timestamp)) {
    parsedDate = new Date(item.timestamp * 1000);
  }

  if (!parsedDate) {
    return null;
  }

  try {
    return parsedDate.toLocaleString('pt-BR');
  } catch (error) {
    return parsedDate.toISOString().replace('T', ' ').slice(0, 16);
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.primary,
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    borderBottomColor: palette.border,
    borderBottomWidth: 1,
    paddingHorizontal: dimensions.spacing.xl,
    paddingVertical: dimensions.spacing.xxl,
  },
  heroBar: {
    borderRadius: 3,
    height: 4,
    marginTop: dimensions.spacing.lg,
    width: 80,
  },
  listContent: {
    padding: dimensions.spacing.xl,
    paddingBottom: dimensions.spacing.xxl,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: dimensions.spacing.xl,
  },
  emptyTitle: {
    color: palette.textPrimary,
    fontSize: dimensions.typography.xl,
    fontWeight: '800',
    marginBottom: dimensions.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    color: palette.textSecondary,
    fontSize: dimensions.typography.md,
    textAlign: 'center',
  },
  centerState: {
    backgroundColor: palette.surfaceMuted,
  },
});

export default HomeScreen;
