import { useState, useCallback } from 'react';
import { getExchangeRate, DEFAULT_EXCHANGE_RATE } from '../services/exchangeRateService';
import type { RateSource } from '../types';

interface UseExchangeRateReturn {
  rate: string;
  setRate: (val: string) => void;
  autoRate: boolean;
  setAutoRate: (val: boolean) => void;
  rateSource: RateSource | null;
  loading: boolean;
  lastUpdated: string | null;
  fetchLiveRate: () => Promise<void>;
  resolveRate: () => Promise<{ rate: number; messages: string[] }>;
}

export function useExchangeRate(showToast: (msg: string) => void): UseExchangeRateReturn {
  const [rate, setRate] = useState('');
  const [autoRate, setAutoRate] = useState(false);
  const [rateSource, setRateSource] = useState<RateSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchLiveRate = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getExchangeRate();
      setRate(result.rate.toFixed(4));
      setRateSource(result.source);
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }));

      if (result.source === 'live') {
        showToast('Tipo de cambio actualizado');
      } else if (result.source === 'fallback') {
        showToast('TC obtenido de fuente alternativa');
      } else if (result.source === 'cached') {
        showToast('Usando tipo de cambio en cache');
      } else {
        showToast(`Usando TC por defecto: ${DEFAULT_EXCHANGE_RATE}`);
      }
    } catch {
      showToast('No se pudo obtener el tipo de cambio');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const resolveRate = useCallback(async (): Promise<{ rate: number; messages: string[] }> => {
    const messages: string[] = [];
    const currentRate = Number(rate || 0);

    if (autoRate || !currentRate) {
      const result = await getExchangeRate();
      setRate(result.rate.toFixed(4));
      setRateSource(result.source);

      if (result.source === 'live') {
        messages.push(`Tipo de cambio automatico: ${result.rate.toFixed(4)} MXN por USD.`);
      } else if (result.source === 'fallback') {
        messages.push(`TC de fuente alternativa: ${result.rate.toFixed(4)} MXN por USD.`);
      } else if (result.source === 'cached') {
        messages.push(`TC en cache: ${result.rate.toFixed(4)} MXN por USD.`);
      } else {
        messages.push(`No se pudo obtener TC en linea. Se uso ${DEFAULT_EXCHANGE_RATE.toFixed(2)} MXN por USD.`);
      }

      return { rate: result.rate, messages };
    }

    return { rate: currentRate, messages };
  }, [rate, autoRate]);

  return { rate, setRate, autoRate, setAutoRate, rateSource, loading, lastUpdated, fetchLiveRate, resolveRate };
}
