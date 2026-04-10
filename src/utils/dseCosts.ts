import type { DseCostBreakdown } from '@/types';

/**
 * Calculate DSE transaction costs with full fee breakdown.
 * Brokerage rate varies by broker (e.g. iTrust = 0.8%, others may differ).
 *
 * Fee schedule:
 * - Brokerage:    configurable (default 0.8%)
 * - VAT:          18% on brokerage
 * - DSE Fee:      0.14% + 18% VAT
 * - CMSA Fee:     0.14%
 * - Fidelity Fee: 0.02%
 * - CDS Fee:      0.0708%
 */
export function calculateDseCosts(
  shares: number,
  price: number,
  type: 'buy' | 'sell',
  brokerageRate = 0.008, // default 0.8%
): DseCostBreakdown {
  const gross = shares * price;

  const brokerage = gross * brokerageRate;
  const vat = brokerage * 0.18;
  const dseFeeBase = gross * 0.0014;
  const dseFee = dseFeeBase + dseFeeBase * 0.18;
  const cmsaFee = gross * 0.0014;
  const fidelityFee = gross * 0.0002;
  const cdsFee = gross * 0.000708;

  const totalCharges = brokerage + vat + dseFee + cmsaFee + fidelityFee + cdsFee;
  const netAmount = type === 'buy' ? gross + totalCharges : gross - totalCharges;

  return {
    grossConsideration: Math.round(gross * 100) / 100,
    brokerage: Math.round(brokerage * 100) / 100,
    brokerageRate,
    vat: Math.round(vat * 100) / 100,
    dseFee: Math.round(dseFee * 100) / 100,
    cmsaFee: Math.round(cmsaFee * 100) / 100,
    fidelityFee: Math.round(fidelityFee * 100) / 100,
    cdsFee: Math.round(cdsFee * 100) / 100,
    totalCharges: Math.round(totalCharges * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100,
  };
}
