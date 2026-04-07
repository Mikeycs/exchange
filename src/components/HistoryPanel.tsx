import { memo } from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { formatMoney, formatRate } from '../utils/formatters';
import type { ConversionRecord } from '../types';

interface HistoryPanelProps {
  history: ConversionRecord[];
  onClear: () => void;
}

export const HistoryPanel = memo(function HistoryPanel({ history, onClear }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-slate-500" />
          <h3 className="text-lg font-semibold text-slate-100">Historial de cotizaciones</h3>
        </div>
        <p className="text-sm text-slate-500 italic text-center py-8">
          Aun no hay cotizaciones recientes.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold text-slate-100">Historial de cotizaciones</h3>
          <span className="text-xs text-slate-500 font-mono">({history.length})</span>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Limpiar
        </button>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Escenario</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingresado</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Resultado</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">TC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {history.map((it, i) => {
              const inCur = it.conversionType === 'usdToMxn' ? 'USD' : 'MXN';
              const outCur = it.conversionType === 'usdToMxn' ? 'MXN' : 'USD';
              const scenario = it.conversionType === 'usdToMxn' ? 'USD \u2192 MXN' : 'MXN \u2192 USD';
              return (
                <tr key={`${it.timestamp}-${i}`} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 text-slate-400 font-mono text-xs">{new Date(it.timestamp).toLocaleString('es-MX')}</td>
                  <td className="py-2 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-teal-300 border border-slate-700">
                      {scenario}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-slate-200 font-mono">{formatMoney(it.inputAmount, inCur)}</td>
                  <td className="py-2 px-3 text-right text-slate-200 font-mono">{formatMoney(it.outputAmount, outCur)}</td>
                  <td className="py-2 px-3 text-right text-slate-400 font-mono">{formatRate(it.exchangeRate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {history.map((it, i) => {
          const inCur = it.conversionType === 'usdToMxn' ? 'USD' : 'MXN';
          const outCur = it.conversionType === 'usdToMxn' ? 'MXN' : 'USD';
          const scenario = it.conversionType === 'usdToMxn' ? 'USD \u2192 MXN' : 'MXN \u2192 USD';
          return (
            <div key={`${it.timestamp}-${i}`} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-teal-300 border border-slate-700">
                  {scenario}
                </span>
                <span className="text-[11px] font-mono text-slate-500">{new Date(it.timestamp).toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Ingresado</span>
                <span className="font-mono text-slate-200">{formatMoney(it.inputAmount, inCur)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Resultado</span>
                <span className="font-mono text-slate-200">{formatMoney(it.outputAmount, outCur)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">TC</span>
                <span className="font-mono text-slate-400">{formatRate(it.exchangeRate)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
