import { useCallback } from 'react';
import type { CalculationInput, CalculationResult, UsdToMxnResult, MxnToUsdResult } from '../types';

const ADDITIONAL_FEE_USD = 20;
const THRESHOLD_USD = 20000;

export function useCalculation() {
  const calculate = useCallback((input: CalculationInput): CalculationResult => {
    const { conversionType, amount, exchangeRate, commissionPercent, bankFee, additionalFeeEnabled } = input;

    if (conversionType === 'usdToMxn') {
      const usdNet = amount;
      const addFee = (additionalFeeEnabled && usdNet < THRESHOLD_USD) ? ADDITIONAL_FEE_USD : 0;
      const netMXN = usdNet * exchangeRate;
      const fixedFeesMXN = (bankFee + addFee) * exchangeRate;
      const baseMXN = netMXN + fixedFeesMXN;
      const commission = baseMXN * (commissionPercent / 100);
      const totalPesos = baseMXN + commission;

      return {
        type: 'usdToMxn',
        usdNet,
        netMXN,
        fixedFeesMXN,
        baseMXN,
        commission,
        totalPesos,
        exchangeRate,
        commissionPercent,
        bankFee,
        additionalFee: addFee,
        additionalFeeEnabled,
      } satisfies UsdToMxnResult;
    }

    const mxnTotal = amount;
    const baseMXN = mxnTotal * (1 - commissionPercent / 100);
    const commissionMXN = mxnTotal - baseMXN;
    const baseUSD = baseMXN / exchangeRate;
    const preliminaryUSD = baseUSD - bankFee;
    const addFee = (additionalFeeEnabled && preliminaryUSD < THRESHOLD_USD) ? ADDITIONAL_FEE_USD : 0;
    const netUSD = baseUSD - bankFee - addFee;

    return {
      type: 'mxnToUsd',
      mxnTotal,
      baseMXN,
      commissionMXN,
      baseUSD,
      netUSD,
      exchangeRate,
      commissionPercent,
      bankFee,
      additionalFee: addFee,
      additionalFeeEnabled,
    } satisfies MxnToUsdResult;
  }, []);

  return { calculate };
}
