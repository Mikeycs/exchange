import { memo, useCallback, type RefObject } from 'react';
import { Copy, MessageCircle, Mail, Download } from 'lucide-react';
import { useToast } from './Toast';
import { formatMoney, formatRate, formatDateTime } from '../utils/formatters';
import { copyToClipboard, shareWhatsApp, shareEmail, downloadAsImage } from '../utils/sharing';
import type { CalculationResult } from '../types';

interface ResultCardProps {
  result: CalculationResult;
  quoteText: string;
  resultRef: RefObject<HTMLDivElement>;
}

export const ResultCard = memo(function ResultCard({ result, quoteText, resultRef }: ResultCardProps) {
  const { showToast } = useToast();
  const { fechaHora } = formatDateTime();

  const handleCopy = useCallback(async () => {
    if (!quoteText) { showToast('No hay cotizacion para copiar'); return; }
    const ok = await copyToClipboard(quoteText);
    showToast(ok ? 'Cotizacion copiada al portapapeles' : 'No se pudo copiar');
  }, [quoteText, showToast]);

  const handleWhatsApp = useCallback(() => {
    if (!quoteText) { showToast('No hay cotizacion para compartir'); return; }
    shareWhatsApp(quoteText);
  }, [quoteText, showToast]);

  const handleEmail = useCallback(() => {
    if (!quoteText) { showToast('No hay cotizacion para enviar'); return; }
    shareEmail(quoteText);
  }, [quoteText, showToast]);

  const handleDownload = useCallback(async () => {
    if (!resultRef.current) { showToast('No hay cotizacion para descargar'); return; }
    const ok = await downloadAsImage(resultRef.current);
    showToast(ok ? 'Imagen descargada' : 'No se pudo generar la imagen');
  }, [resultRef, showToast]);

  if (result.type === 'usdToMxn') {
    return (
      <div className="space-y-4">
        <div className="overflow-hidden rounded-xl border border-teal-500/30 shadow-lg shadow-teal-500/5">
          <table className="w-full">
            <thead>
              <tr>
                <th colSpan={2} className="bg-gradient-to-r from-teal-600 to-cyan-700 px-4 py-3 text-left text-sm font-semibold text-white tracking-wide">
                  COTIZACION (USD &rarr; MXN)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              <ResultRow label="FECHA Y HORA DE COTIZACION" value={fechaHora} />
              <ResultRow
                label="TOTAL EN PESOS QUE EL CLIENTE PAGARA"
                value={formatMoney(result.totalPesos, 'MXN')}
                highlight
              />
              <ResultRow label={`Comision ${result.commissionPercent}%`} value={formatMoney(result.commission, 'MXN')} />
              <ResultRow label="Disponible a enviar restando comision" value={formatMoney(result.baseMXN, 'MXN')} />
              <ResultRow label="TIPO DE CAMBIO (TC)" value={formatRate(result.exchangeRate)} mono />
              <ResultRow
                label="Comision Bancaria"
                value={`${formatMoney(result.bankFee, 'USD')} = ${formatMoney(result.bankFee * result.exchangeRate, 'MXN')}`}
              />
              <ResultRow
                label="Comision adicional (< 20,000 USD)"
                value={`${formatMoney(result.additionalFee, 'USD')} = ${formatMoney(result.additionalFee * result.exchangeRate, 'MXN')}`}
              />
              <ResultRow
                label="USD NETOS A RECIBIR"
                value={formatMoney(result.usdNet, 'USD')}
                highlight
              />
            </tbody>
          </table>
        </div>
        <ActionButtons
          onCopy={handleCopy}
          onWhatsApp={handleWhatsApp}
          onEmail={handleEmail}
          onDownload={handleDownload}
        />
        <p className="text-xs text-slate-500 italic leading-relaxed">
          Esta es solo una cotizacion; el tipo de cambio fluctua continuamente. No representa una cotizacion oficial.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-teal-500/30 shadow-lg shadow-teal-500/5">
        <table className="w-full">
          <thead>
            <tr>
              <th colSpan={2} className="bg-gradient-to-r from-teal-600 to-cyan-700 px-4 py-3 text-left text-sm font-semibold text-white tracking-wide">
                COTIZACION (MXN &rarr; USD)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            <ResultRow label="FECHA Y HORA DE COTIZACION" value={fechaHora} />
            <ResultRow label="TOTAL EN PESOS PAGADOS" value={formatMoney(result.mxnTotal, 'MXN')} />
            <ResultRow label={`Comision ${result.commissionPercent}%`} value={formatMoney(result.commissionMXN, 'MXN')} />
            <ResultRow label="Disponible despues de comision" value={formatMoney(result.baseMXN, 'MXN')} />
            <ResultRow label="TIPO DE CAMBIO (TC)" value={formatRate(result.exchangeRate)} mono />
            <ResultRow label="Equivalente en USD (antes de comisiones)" value={formatMoney(result.baseUSD, 'USD')} />
            <ResultRow label="Comision Bancaria" value={formatMoney(result.bankFee, 'USD')} />
            <ResultRow label="Comision adicional (< 20,000 USD)" value={formatMoney(result.additionalFee, 'USD')} />
            <ResultRow
              label="USD NETOS A RECIBIR"
              value={formatMoney(result.netUSD, 'USD')}
              highlight
            />
          </tbody>
        </table>
      </div>
      <ActionButtons
        onCopy={handleCopy}
        onWhatsApp={handleWhatsApp}
        onEmail={handleEmail}
        onDownload={handleDownload}
      />
      <p className="text-xs text-slate-500 italic leading-relaxed">
        Esta es solo una cotizacion; el tipo de cambio fluctua continuamente. No representa una cotizacion oficial.
      </p>
    </div>
  );
});

function ResultRow({ label, value, highlight, mono }: { label: string; value: string; highlight?: boolean; mono?: boolean }) {
  if (highlight) {
    return (
      <tr className="bg-amber-500/10">
        <td className="px-4 py-3 text-sm font-bold text-amber-300">{label}</td>
        <td className="px-4 py-3 text-sm font-bold text-amber-300 font-mono text-right">{value}</td>
      </tr>
    );
  }
  return (
    <tr className="hover:bg-slate-700/20 transition-colors">
      <td className="px-4 py-2.5 text-sm text-slate-400">{label}</td>
      <td className={`px-4 py-2.5 text-sm text-slate-200 text-right ${mono ? 'font-mono' : ''}`}>{value}</td>
    </tr>
  );
}

function ActionButtons({ onCopy, onWhatsApp, onEmail, onDownload }: {
  onCopy: () => void;
  onWhatsApp: () => void;
  onEmail: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-end">
      <button className="btn-ghost" onClick={onCopy}><Copy className="w-4 h-4" /><span>Copiar</span></button>
      <button className="btn-ghost" onClick={onWhatsApp}><MessageCircle className="w-4 h-4" /><span>WhatsApp</span></button>
      <button className="btn-ghost" onClick={onEmail}><Mail className="w-4 h-4" /><span>Email</span></button>
      <button className="btn-ghost" onClick={onDownload}><Download className="w-4 h-4" /><span>PNG</span></button>
    </div>
  );
}
