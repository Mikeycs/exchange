import { useState, useCallback, useRef } from 'react';
import { RefreshCw, Calculator as CalcIcon, Loader2 } from 'lucide-react';
import { useToast } from './Toast';
import { useExchangeRate } from '../hooks/useExchangeRate';
import { useCalculation } from '../hooks/useCalculation';
import { useConversionHistory } from '../hooks/useConversionHistory';
import { formatMoney, formatRate, formatDateTime, buildQuoteText } from '../utils/formatters';
import { ResultCard } from './ResultCard';
import { HistoryPanel } from './HistoryPanel';
import type { CalculationResult, ConversionRecord } from '../types';

export function Calculator() {
  const { showToast } = useToast();
  const { rate, setRate, autoRate, setAutoRate, rateSource, loading, lastUpdated, fetchLiveRate, resolveRate } = useExchangeRate(showToast);
  const { calculate } = useCalculation();
  const { history, addRecord, clearHistory } = useConversionHistory();

  const [conversionType, setConversionType] = useState<'usdToMxn' | 'mxnToUsd'>('usdToMxn');
  const [amount, setAmount] = useState('');
  const [commission, setCommission] = useState('');
  const [bankFee, setBankFee] = useState('20');
  const [additionalFeeEnabled, setAdditionalFeeEnabled] = useState(true);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [quoteText, setQuoteText] = useState('');
  const [computing, setComputing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resultRef = useRef<HTMLDivElement>(null);

  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    const rateVal = Number(rate || 0);
    const amountVal = Number(amount || 0);
    const commissionVal = Number(commission || 0);
    const bankVal = Number(bankFee || 0);

    if (!autoRate && (!rateVal || rateVal <= 0)) {
      errs.rate = 'Ingresa un tipo de cambio valido o habilita el tipo automatico';
    }
    if (!amountVal || amountVal <= 0) {
      errs.amount = conversionType === 'usdToMxn'
        ? 'Ingresa un monto en USD valido'
        : 'Ingresa un monto en MXN valido';
    }
    if (commissionVal < 0) errs.commission = 'Ingresa un porcentaje de comision valido';
    if (bankVal < 0) errs.bankFee = 'La comision bancaria no puede ser negativa';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [rate, amount, commission, bankFee, autoRate, conversionType]);

  const handleCalculate = useCallback(async () => {
    if (!validate()) return;
    setComputing(true);

    try {
      const resolved = await resolveRate();
      if (!resolved.rate || resolved.rate <= 0) {
        setErrors({ rate: 'Tipo de cambio invalido' });
        return;
      }

      const amountVal = Number(amount);
      const commissionVal = Number(commission || 0);
      const bankVal = Number(bankFee || 0);

      const calcResult = calculate({
        conversionType,
        amount: amountVal,
        exchangeRate: resolved.rate,
        commissionPercent: commissionVal,
        bankFee: bankVal,
        additionalFeeEnabled,
      });

      setResult(calcResult);

      const { fechaHora } = formatDateTime();
      let text = '';

      if (calcResult.type === 'usdToMxn') {
        text = buildQuoteText({
          scenarioLabel: 'USD -> MXN',
          fechaHora,
          fila1Label: 'TOTAL EN PESOS QUE EL CLIENTE PAGARA',
          fila1Value: formatMoney(calcResult.totalPesos, 'MXN'),
          comisionLabel: `Comision ${calcResult.commissionPercent}%`,
          comisionValue: formatMoney(calcResult.commission, 'MXN'),
          disponibleLabel: 'Disponible a enviar restando comision',
          disponibleValue: formatMoney(calcResult.baseMXN, 'MXN'),
          tcLabel: 'TIPO DE CAMBIO (TC)',
          tcValue: formatRate(calcResult.exchangeRate),
          bankLabel: 'Comision Bancaria',
          bankValue: `${formatMoney(calcResult.bankFee, 'USD')} = ${formatMoney(calcResult.bankFee * calcResult.exchangeRate, 'MXN')}`,
          addLabel: 'Comision adicional (< 20,000 USD)',
          addValue: `${formatMoney(calcResult.additionalFee, 'USD')} = ${formatMoney(calcResult.additionalFee * calcResult.exchangeRate, 'MXN')}`,
          totalLabel: 'USD NETOS A RECIBIR',
          totalValue: formatMoney(calcResult.usdNet, 'USD'),
        });

        const record: ConversionRecord = {
          timestamp: new Date().toISOString(),
          conversionType: 'usdToMxn',
          inputAmount: calcResult.usdNet,
          inputCurrency: 'USD',
          outputAmount: calcResult.totalPesos,
          outputCurrency: 'MXN',
          exchangeRate: calcResult.exchangeRate,
          commissionPercent: calcResult.commissionPercent,
          bankFee: calcResult.bankFee,
          additionalFee: calcResult.additionalFee,
          additionalFeeEnabled: calcResult.additionalFeeEnabled,
          signature: '',
        };
        record.signature = JSON.stringify({
          conv: record.conversionType,
          usd: record.inputAmount,
          mxn: 0,
          tc: record.exchangeRate.toFixed(4),
          pct: record.commissionPercent,
          bank: record.bankFee,
          addE: record.additionalFeeEnabled ? 1 : 0,
        });
        addRecord(record);
      } else {
        text = buildQuoteText({
          scenarioLabel: 'MXN -> USD',
          fechaHora,
          fila1Label: 'TOTAL EN PESOS PAGADOS',
          fila1Value: formatMoney(calcResult.mxnTotal, 'MXN'),
          comisionLabel: `Comision ${calcResult.commissionPercent}%`,
          comisionValue: formatMoney(calcResult.commissionMXN, 'MXN'),
          disponibleLabel: 'Disponible despues de comision',
          disponibleValue: formatMoney(calcResult.baseMXN, 'MXN'),
          tcLabel: 'TIPO DE CAMBIO (TC)',
          tcValue: formatRate(calcResult.exchangeRate),
          bankLabel: 'Comision Bancaria',
          bankValue: formatMoney(calcResult.bankFee, 'USD'),
          addLabel: 'Comision adicional (< 20,000 USD)',
          addValue: formatMoney(calcResult.additionalFee, 'USD'),
          totalLabel: 'USD NETOS A RECIBIR',
          totalValue: formatMoney(calcResult.netUSD, 'USD'),
        });

        const record: ConversionRecord = {
          timestamp: new Date().toISOString(),
          conversionType: 'mxnToUsd',
          inputAmount: calcResult.mxnTotal,
          inputCurrency: 'MXN',
          outputAmount: calcResult.netUSD,
          outputCurrency: 'USD',
          exchangeRate: calcResult.exchangeRate,
          commissionPercent: calcResult.commissionPercent,
          bankFee: calcResult.bankFee,
          additionalFee: calcResult.additionalFee,
          additionalFeeEnabled: calcResult.additionalFeeEnabled,
          signature: '',
        };
        record.signature = JSON.stringify({
          conv: record.conversionType,
          usd: 0,
          mxn: record.inputAmount,
          tc: record.exchangeRate.toFixed(4),
          pct: record.commissionPercent,
          bank: record.bankFee,
          addE: record.additionalFeeEnabled ? 1 : 0,
        });
        addRecord(record);
      }

      setQuoteText(text);
    } finally {
      setComputing(false);
    }
  }, [validate, resolveRate, amount, commission, bankFee, conversionType, additionalFeeEnabled, calculate, addRecord]);

  const sourceLabel = rateSource === 'live' ? 'EN VIVO' : rateSource === 'fallback' ? 'ALTERNATIVA' : rateSource === 'cached' ? 'CACHE' : rateSource === 'default' ? 'POR DEFECTO' : null;
  const sourceColor = rateSource === 'live' ? 'text-emerald-400' : rateSource === 'fallback' ? 'text-amber-400' : 'text-slate-400';

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-100 mb-1">Cotizacion de divisas USD/MXN</h3>
        <p className="text-sm text-slate-400 mb-6">Configura los parametros y calcula tu cotizacion</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="input-label" htmlFor="conversionType">Tipo de conversion</label>
            <select
              id="conversionType"
              className="input-field"
              value={conversionType}
              onChange={(e) => {
                setConversionType(e.target.value as 'usdToMxn' | 'mxnToUsd');
                setResult(null);
                setErrors({});
              }}
            >
              <option value="usdToMxn">Necesito X USD netos (cuantos MXN pago?)</option>
              <option value="mxnToUsd">Tengo X MXN (cuantos USD recibo?)</option>
            </select>
          </div>

          <div>
            <label className="input-label" htmlFor="exchangeRate">
              Tipo de cambio (1 USD = X MXN)
              {sourceLabel && (
                <span className={`ml-2 text-[10px] font-mono uppercase tracking-wider ${sourceColor}`}>
                  [{sourceLabel}]
                </span>
              )}
            </label>
            <div className="flex gap-2">
              <input
                id="exchangeRate"
                type="number"
                step="0.0001"
                placeholder="Ej. 18.5000"
                className={`input-field flex-1 font-mono ${errors.rate ? 'border-red-500/70' : ''}`}
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
              <button
                type="button"
                className="btn-secondary shrink-0 !px-3"
                onClick={fetchLiveRate}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span className="hidden sm:inline ml-1.5">TC en vivo</span>
              </button>
            </div>
            {errors.rate && <p className="text-red-400 text-xs mt-1">{errors.rate}</p>}
            {lastUpdated && (
              <p className="text-xs text-emerald-400/70 mt-1">Actualizado {lastUpdated}</p>
            )}
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                className="accent-teal-500 w-4 h-4"
                checked={autoRate}
                onChange={(e) => setAutoRate(e.target.checked)}
              />
              <span className="text-xs text-slate-400">Usar tipo de cambio automatico al calcular</span>
            </label>
          </div>
        </div>

        <div className="mt-5">
          <label className="input-label" htmlFor="amount">
            {conversionType === 'usdToMxn'
              ? 'Monto en Dolares (USD) requeridos (netos)'
              : 'Monto en Pesos (MXN) que vas a pagar'}
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            placeholder={conversionType === 'usdToMxn' ? 'Ej. 1000' : 'Ej. 21894.73'}
            className={`input-field font-mono text-lg ${errors.amount ? 'border-red-500/70' : ''}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <div>
            <label className="input-label" htmlFor="commission">Porcentaje de comision (%)</label>
            <input
              id="commission"
              type="number"
              step="0.01"
              placeholder="Ej. 5"
              className={`input-field font-mono ${errors.commission ? 'border-red-500/70' : ''}`}
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
            />
            {errors.commission && <p className="text-red-400 text-xs mt-1">{errors.commission}</p>}
          </div>
          <div>
            <label className="input-label" htmlFor="bankFee">Comision bancaria (USD)</label>
            <input
              id="bankFee"
              type="number"
              step="0.01"
              className={`input-field font-mono ${errors.bankFee ? 'border-red-500/70' : ''}`}
              value={bankFee}
              onChange={(e) => setBankFee(e.target.value)}
            />
            {errors.bankFee && <p className="text-red-400 text-xs mt-1">{errors.bankFee}</p>}
          </div>
        </div>

        <div className="mt-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="accent-teal-500 w-4 h-4"
              checked={additionalFeeEnabled}
              onChange={(e) => setAdditionalFeeEnabled(e.target.checked)}
            />
            <span className="text-sm text-slate-300">
              Habilitar comision adicional si &lt; 20,000 USD: <strong className="text-teal-400">$20 USD</strong>
            </span>
          </label>
        </div>

        <button
          className="btn-primary w-full mt-6"
          onClick={handleCalculate}
          disabled={computing}
        >
          {computing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CalcIcon className="w-5 h-5" />
          )}
          <span>{computing ? 'Calculando...' : 'Calcular'}</span>
        </button>

        {result && (
          <div ref={resultRef} className="mt-6">
            <ResultCard result={result} quoteText={quoteText} resultRef={resultRef} />
          </div>
        )}
      </div>

      <HistoryPanel history={history} onClear={clearHistory} />
    </div>
  );
}
