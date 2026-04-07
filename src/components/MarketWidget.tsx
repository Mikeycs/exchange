import { useEffect, useRef, useState, useCallback } from 'react';
import { BarChart3, AlertCircle } from 'lucide-react';
import { DEFAULT_EXCHANGE_RATE } from '../services/exchangeRateService';

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: Record<string, unknown>) => unknown;
    };
  }
}

const WIDGET_TIMEOUT = 4000;

export function MarketWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<'loading' | 'chart' | 'fallback'>('loading');
  const [state, setState] = useState<'loading' | 'chart' | 'fallback'>('loading');
  const [rates, setRates] = useState<{ usdMxn: string; mxnUsd: string; updated: string } | null>(null);

  const inIframe = typeof window !== 'undefined' && window.self !== window.top;

  const setWidgetState = useCallback((s: 'loading' | 'chart' | 'fallback') => {
    stateRef.current = s;
    setState(s);
  }, []);

  const loadFallbackRates = useCallback(async () => {
    try {
      const r = await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=MXN');
      if (!r.ok) throw new Error('fail');
      const d = await r.json();
      const usdMxn = Number(d?.rates?.MXN) || DEFAULT_EXCHANGE_RATE;
      setRates({
        usdMxn: usdMxn.toFixed(4),
        mxnUsd: (1 / usdMxn).toFixed(6),
        updated: new Date().toLocaleString('es-MX'),
      });
    } catch {
      const fallback = DEFAULT_EXCHANGE_RATE;
      setRates({
        usdMxn: fallback.toFixed(4),
        mxnUsd: (1 / fallback).toFixed(6),
        updated: 'Tipo de cambio por defecto',
      });
    }
    setWidgetState('fallback');
  }, [setWidgetState]);

  useEffect(() => {
    if (inIframe) {
      loadFallbackRates();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    let timeoutId: ReturnType<typeof setTimeout>;

    script.onload = () => {
      try {
        if (window.TradingView && containerRef.current) {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          new window.TradingView.widget({
            symbol: 'FX:USDMXN',
            interval: 'D',
            locale: 'es',
            timezone: 'America/Mexico_City',
            theme: prefersDark ? 'dark' : 'light',
            style: '1',
            withdateranges: true,
            allow_symbol_change: false,
            autosize: true,
            container_id: 'tv-advanced',
          });
          setWidgetState('chart');
        } else {
          loadFallbackRates();
        }
      } catch {
        loadFallbackRates();
      }
    };

    script.onerror = () => {
      loadFallbackRates();
    };

    document.head.appendChild(script);

    timeoutId = setTimeout(() => {
      if (stateRef.current === 'loading') {
        const container = containerRef.current;
        const hasContent = container && (container.querySelector('iframe') || container.children.length > 0);
        if (!hasContent) {
          loadFallbackRates();
        } else {
          setWidgetState('chart');
        }
      }
    }, WIDGET_TIMEOUT);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-teal-400" />
        <h3 className="text-lg font-semibold text-slate-100">Grafico USD/MXN</h3>
        {state === 'chart' && (
          <span className="ml-auto text-[10px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            EN VIVO
          </span>
        )}
      </div>

      {state === 'loading' && (
        <div className="h-[300px] md:h-[420px] rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500">Cargando grafico...</p>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        id="tv-advanced"
        className={`rounded-lg overflow-hidden ${state === 'chart' ? 'h-[300px] md:h-[420px]' : 'hidden'}`}
      />

      {state === 'fallback' && rates && (
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-5">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <AlertCircle className="w-4 h-4 text-slate-500" />
            <p className="text-sm text-slate-400">
              {inIframe ? 'Informacion del mercado (modo preview)' : 'Informacion del mercado (API)'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-slate-800/60 rounded-lg border border-slate-700/40">
              <div className="text-2xl font-bold font-mono text-teal-400">{rates.usdMxn}</div>
              <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">USD &rarr; MXN</div>
            </div>
            <div className="text-center p-4 bg-slate-800/60 rounded-lg border border-slate-700/40">
              <div className="text-2xl font-bold font-mono text-cyan-400">{rates.mxnUsd}</div>
              <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">MXN &rarr; USD</div>
            </div>
          </div>
          <p className="text-center text-[11px] text-slate-600 mt-3">{rates.updated}</p>
        </div>
      )}
    </div>
  );
}
