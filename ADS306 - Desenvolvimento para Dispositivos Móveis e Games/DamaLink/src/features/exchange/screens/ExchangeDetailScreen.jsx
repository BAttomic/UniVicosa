import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import LoadingIndicator from '../../../shared/components/LoadingIndicator';
import ErrorMessage from '../../../shared/components/ErrorMessage';
import NeonGradient from '../../../shared/components/NeonGradient';
import palette, { gradients } from '../../../shared/theme/colors';
import dimensions from '../../../shared/theme/dimensions';
import useExchangeDetail from '../hooks/useExchangeDetail';

function DetailScreen({ route }) {
  const pair = route?.params?.pair;
  const { detail, loading, error, refetch } = useExchangeDetail(pair);

  if (loading) {
    return <LoadingIndicator text="Carregando detalhes..." style={styles.centerState} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} style={styles.centerState} />;
  }

  if (!detail) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.emptyTitle}>Dados não disponíveis</Text>
        <Text style={styles.emptyText}>Selecione outro câmbio ou tente recarregar a tela.</Text>
      </View>
    );
  }

  const updatedAt = formatUpdatedAt(detail);
  const isUp = detail.pctChange >= 0;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <NeonGradient colors={gradients.brand} style={styles.heroCard}>
        <Text style={styles.pair}>{detail.code}/{detail.codein}</Text>
        <Text style={styles.name}>{detail.name}</Text>
        {updatedAt ? <Text style={styles.updated}>Atualizado: {updatedAt}</Text> : null}
      </NeonGradient>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Cotação</Text>
        <MetricRow label="Compra" value={formatCurrency(detail.bid)} />
        <MetricRow label="Venda" value={formatCurrency(detail.ask)} />
        <MetricRow label="Máxima" value={formatCurrency(detail.high)} />
        <MetricRow label="Mínima" value={formatCurrency(detail.low)} last />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Variação</Text>
        <MetricRow
          label="Percentual"
          value={formatVariation(detail.pctChange)}
          valueStyle={isUp ? styles.positive : styles.negative}
        />
        <MetricRow label="Variação em R$" value={formatCurrency(detail.varBid)} last />
      </View>
    </ScrollView>
  );
}

function MetricRow({ label, value, valueStyle, last }) {
  return (
    <View style={[styles.metricRow, last && styles.metricRowLast]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, valueStyle]}>{value}</Text>
    </View>
  );
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

function formatUpdatedAt(detail) {
  const rawDate = detail.updatedAt || null;
  let parsedDate = null;

  if (rawDate) {
    const normalized = rawDate.includes(' ') ? rawDate.replace(' ', 'T') : rawDate;
    const date = new Date(normalized);
    parsedDate = Number.isNaN(date.getTime()) ? null : date;
  } else if (Number.isFinite(detail.timestamp)) {
    parsedDate = new Date(detail.timestamp * 1000);
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
  content: {
    backgroundColor: palette.primary,
    padding: dimensions.spacing.xl,
    paddingBottom: dimensions.spacing.xxl,
  },
  heroCard: {
    alignItems: 'center',
    borderRadius: dimensions.radius.xl,
    paddingHorizontal: dimensions.spacing.xl,
    paddingVertical: dimensions.spacing.xxl,
    shadowColor: palette.magenta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  pair: {
    color: palette.primary,
    fontSize: dimensions.typography.xl,
    fontWeight: '900',
    letterSpacing: 2,
  },
  name: {
    color: palette.primary,
    fontSize: dimensions.typography.xxl,
    fontWeight: '900',
    marginTop: dimensions.spacing.xs,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  updated: {
    color: 'rgba(11, 14, 26, 0.7)',
    fontSize: dimensions.typography.sm,
    fontWeight: '600',
    marginTop: dimensions.spacing.sm,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: palette.surfaceSolid,
    borderColor: palette.border,
    borderRadius: dimensions.radius.xl,
    borderWidth: 1,
    marginTop: dimensions.spacing.xl,
    padding: dimensions.spacing.xl,
    shadowColor: palette.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 3,
  },
  sectionTitle: {
    color: palette.accentSoft,
    fontSize: dimensions.typography.sm,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: dimensions.spacing.md,
    textTransform: 'uppercase',
  },
  metricRow: {
    alignItems: 'center',
    borderBottomColor: palette.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: dimensions.spacing.md,
  },
  metricRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  metricLabel: {
    color: palette.textSecondary,
    fontSize: dimensions.typography.md,
    fontWeight: '600',
  },
  metricValue: {
    color: palette.textPrimary,
    fontSize: dimensions.typography.lg,
    fontWeight: '800',
  },
  positive: {
    color: palette.success,
  },
  negative: {
    color: palette.error,
  },
  centerState: {
    alignItems: 'center',
    backgroundColor: palette.primary,
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
});

export default DetailScreen;
