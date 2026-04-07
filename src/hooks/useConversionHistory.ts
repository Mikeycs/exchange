import { useState, useCallback } from 'react';
import type { ConversionRecord } from '../types';

const HISTORY_KEY = 'wiemx_conversion_history';
const MAX_HISTORY = 10;

function readHistory(): ConversionRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeHistory(arr: ConversionRecord[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(arr.slice(0, MAX_HISTORY)));
  } catch {
    // silent
  }
}

function buildSignature(r: ConversionRecord): string {
  const conv = r.conversionType;
  const usd = conv === 'usdToMxn' ? r.inputAmount : 0;
  const mxn = conv === 'mxnToUsd' ? r.inputAmount : 0;
  const tc = r.exchangeRate.toFixed(4);
  const pct = r.commissionPercent;
  const bank = r.bankFee;
  const addE = r.additionalFeeEnabled ? 1 : 0;
  return JSON.stringify({ conv, usd, mxn, tc, pct, bank, addE });
}

export function useConversionHistory() {
  const [history, setHistory] = useState<ConversionRecord[]>(readHistory);

  const addRecord = useCallback((record: ConversionRecord) => {
    const existing = readHistory();
    const withSig = record.signature ? record : { ...record, signature: buildSignature(record) };
    const lastSig = existing[0]?.signature;

    if (lastSig && withSig.signature === lastSig) {
      setHistory(existing);
      return;
    }

    const updated = [withSig, ...existing].slice(0, MAX_HISTORY);
    writeHistory(updated);
    setHistory(updated);
  }, []);

  const clearHistory = useCallback(() => {
    writeHistory([]);
    setHistory([]);
  }, []);

  return { history, addRecord, clearHistory };
}
