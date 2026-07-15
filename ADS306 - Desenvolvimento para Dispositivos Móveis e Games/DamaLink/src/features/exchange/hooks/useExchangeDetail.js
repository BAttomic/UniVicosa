import { useCallback, useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../services/exchangeApi';

function useExchangeDetail(pair) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExchangeDetail = useCallback(async () => {
    if (!pair) {
      setDetail(null);
      setLoading(false);
      setError('Par de moedas ausente.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/last/${pair}`);
      const key = pair.replace('-', '');
      const payload = response.data || {};
      const entry = payload[key];

      setDetail(normalizeRate(entry));
    } catch (fetchError) {
      setDetail(null);
      setError(getApiErrorMessage(fetchError));
    } finally {
      setLoading(false);
    }
  }, [pair]);

  useEffect(() => {
    fetchExchangeDetail();
  }, [fetchExchangeDetail]);

  return { detail, loading, error, refetch: fetchExchangeDetail };
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

export default useExchangeDetail;
