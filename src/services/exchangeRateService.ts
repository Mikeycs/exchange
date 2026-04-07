import type { ExchangeRateResult } from '../types';

const DEFAULT_EXCHANGE_RATE = 18.5;
const CACHE_KEY = 'wiemx_last_rate';
const FETCH_TIMEOUT = 8000;

interface CachedRate {
  rate: number;
  timestamp: string;
}

function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

function getCachedRate(): CachedRate | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRate;
    if (parsed.rate > 0) return parsed;
    return null;
  } catch {
    return null;
  }
}

function setCachedRate(rate: number): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rate, timestamp: new Date().toISOString() }));
  } catch {
    // silent
  }
}

async function fetchFrankfurter(): Promise<number | null> {
  try {
    const r = await fetchWithTimeout('https://api.frankfurter.dev/v1/latest?base=USD&symbols=MXN', FETCH_TIMEOUT);
    if (!r.ok) return null;
    const d = await r.json();
    const rate = Number(d?.rates?.MXN);
    return rate > 0 ? rate : null;
  } catch {
    return null;
  }
}

async function fetchOpenER(): Promise<number | null> {
  try {
    const r = await fetchWithTimeout('https://open.er-api.com/v6/latest/USD', FETCH_TIMEOUT);
    if (!r.ok) return null;
    const d = await r.json();
    const rate = Number(d?.rates?.MXN);
    return rate > 0 ? rate : null;
  } catch {
    return null;
  }
}

export async function getExchangeRate(): Promise<ExchangeRateResult> {
  const primary = await fetchFrankfurter();
  if (primary) {
    setCachedRate(primary);
    return { rate: primary, source: 'live', timestamp: new Date() };
  }

  const secondary = await fetchOpenER();
  if (secondary) {
    setCachedRate(secondary);
    return { rate: secondary, source: 'fallback', timestamp: new Date() };
  }

  const cached = getCachedRate();
  if (cached) {
    return { rate: cached.rate, source: 'cached', timestamp: new Date(cached.timestamp) };
  }

  return { rate: DEFAULT_EXCHANGE_RATE, source: 'default', timestamp: new Date() };
}

export { DEFAULT_EXCHANGE_RATE };
