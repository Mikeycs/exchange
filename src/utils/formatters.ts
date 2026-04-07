import type { QuoteTextParams } from '../types';

export function formatMoney(value: number, currency: 'USD' | 'MXN'): string {
  const n = Number(value || 0);
  if (currency === 'USD') {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
  }
  return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });
}

export function formatRate(rate: number): string {
  return rate.toFixed(4);
}

export function formatDateTime(): { fecha: string; hora: string; fechaHora: string } {
  const now = new Date();
  const fecha = now.toLocaleDateString('es-MX');
  const hora = now.toLocaleTimeString('es-MX');
  return { fecha, hora, fechaHora: `${fecha} - ${hora}` };
}

export function buildQuoteText(o: QuoteTextParams): string {
  return [
    `COTIZACION (${o.scenarioLabel})`,
    `FECHA Y HORA DE COTIZACION    ${o.fechaHora}`,
    '',
    `${o.fila1Label}    ${o.fila1Value}`,
    `${o.comisionLabel}    ${o.comisionValue}`,
    `${o.disponibleLabel}    ${o.disponibleValue}`,
    `${o.tcLabel}    ${o.tcValue}`,
    `${o.bankLabel}    ${o.bankValue}`,
    `${o.addLabel}    ${o.addValue}`,
    '',
    `${o.totalLabel}    ${o.totalValue}`,
    '',
    'Esta es solo una cotizacion; el tipo de cambio fluctua continuamente. No representa una cotizacion oficial.',
  ].join('\n');
}
