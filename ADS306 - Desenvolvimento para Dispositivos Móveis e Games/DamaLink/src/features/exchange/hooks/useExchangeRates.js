import { useCallback, useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../services/exchangeApi';

const DEFAULT_PAIRS = [
  'USD-BRL',
  'EUR-BRL',
  'GBP-BRL',
  'ARS-BRL',
  'JPY-BRL',
  'CHF-BRL',
  'CAD-BRL',
  'AUD-BRL',
  'CNY-BRL',
];

function useExchangeRates(pairs = DEFAULT_PAIRS) {
  const pairList = Array.isArray(pairs) && pairs.length ? pairs : DEFAULT_PAIRS;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/last/${pairList.join(',')}`);
      const payload = response.data || {};

      const normalized = pairList
        .map((pair) => normalizeRate(payload[pair.replace('-', '')]))
        .filter(Boolean);

      setData(normalized);
    } catch (fetchError) {
      setError(getApiErrorMessage(fetchError));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [pairList]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return { data, loading, error, refetch: fetchRates };
}

function normalizeRate(entry) {
  if (!entry) {
    return null;
  }

  return {
    pair: `${entry.code}-${entry.codein}`,
    code: entry.code,
    codein: entry.codein,
    name: entry.name,
    bid: toNumber(entry.bid),
    ask: toNumber(entry.ask),
    high: toNumber(entry.high),
    low: toNumber(entry.low),
    pctChange: toNumber(entry.pctChange),
    varBid: toNumber(entry.varBid),
    timestamp: toNumber(entry.timestamp),
    updatedAt: entry.create_date || null,
  };
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export { DEFAULT_PAIRS };
export default useExchangeRates;
