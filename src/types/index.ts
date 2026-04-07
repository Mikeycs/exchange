export interface ConversionRecord {
  timestamp: string;
  conversionType: 'usdToMxn' | 'mxnToUsd';
  inputAmount: number;
  inputCurrency: 'USD' | 'MXN';
  outputAmount: number;
  outputCurrency: 'USD' | 'MXN';
  exchangeRate: number;
  commissionPercent: number;
  bankFee: number;
  additionalFee: number;
  additionalFeeEnabled: boolean;
  signature: string;
}

export interface CalculationInput {
  conversionType: 'usdToMxn' | 'mxnToUsd';
  amount: number;
  exchangeRate: number;
  commissionPercent: number;
  bankFee: number;
  additionalFeeEnabled: boolean;
}

export interface UsdToMxnResult {
  type: 'usdToMxn';
  usdNet: number;
  netMXN: number;
  fixedFeesMXN: number;
  baseMXN: number;
  commission: number;
  totalPesos: number;
  exchangeRate: number;
  commissionPercent: number;
  bankFee: number;
  additionalFee: number;
  additionalFeeEnabled: boolean;
}

export interface MxnToUsdResult {
  type: 'mxnToUsd';
  mxnTotal: number;
  baseMXN: number;
  commissionMXN: number;
  baseUSD: number;
  netUSD: number;
  exchangeRate: number;
  commissionPercent: number;
  bankFee: number;
  additionalFee: number;
  additionalFeeEnabled: boolean;
}

export type CalculationResult = UsdToMxnResult | MxnToUsdResult;

export interface QuoteTextParams {
  scenarioLabel: string;
  fechaHora: string;
  fila1Label: string;
  fila1Value: string;
  comisionLabel: string;
  comisionValue: string;
  disponibleLabel: string;
  disponibleValue: string;
  tcLabel: string;
  tcValue: string;
  bankLabel: string;
  bankValue: string;
  addLabel: string;
  addValue: string;
  totalLabel: string;
  totalValue: string;
}

export type RateSource = 'live' | 'fallback' | 'cached' | 'default';

export interface ExchangeRateResult {
  rate: number;
  source: RateSource;
  timestamp: Date;
}
