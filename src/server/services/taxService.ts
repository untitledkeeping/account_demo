// src/server/services/taxService.ts
import { CanadianProvince, SalesTaxSummary, TaxCode } from '../../types';

export interface TaxSplit {
  subtotal: number;
  gstAmount: number;
  qstAmount: number;
  hstAmount: number;
  totalTax: number;
  grossTotal: number;
}

export function extractTaxesFromGrossTotal(
  grossTotal: number,
  province: CanadianProvince,
  taxCode?: TaxCode
): TaxSplit {
  const roundedGross = Math.round(grossTotal * 100) / 100;

  if (taxCode === 'EXEMPT' || taxCode === 'ZERO_RATED' || taxCode === 'NONE') {
    return {
      subtotal: roundedGross,
      gstAmount: 0,
      qstAmount: 0,
      hstAmount: 0,
      totalTax: 0,
      grossTotal: roundedGross,
    };
  }

  if (province === 'QC') {
    const combinedRate = 0.05 + 0.09975;
    const subtotal = Math.round((roundedGross / (1 + combinedRate)) * 100) / 100;
    const gstAmount = Math.round(subtotal * 0.05 * 100) / 100;
    const qstAmount = Math.round(subtotal * 0.09975 * 100) / 100;
    const totalTax = Math.round((gstAmount + qstAmount) * 100) / 100;

    return {
      subtotal,
      gstAmount,
      qstAmount,
      hstAmount: 0,
      totalTax,
      grossTotal: roundedGross,
    };
  }

  if (province === 'ON') {
    const hstRate = 0.13;
    const subtotal = Math.round((roundedGross / (1 + hstRate)) * 100) / 100;
    const hstAmount = Math.round(subtotal * hstRate * 100) / 100;

    return {
      subtotal,
      gstAmount: 0,
      qstAmount: 0,
      hstAmount,
      totalTax: hstAmount,
      grossTotal: roundedGross,
    };
  }

  // Default GST 5% (BC, AB, etc.)
  const gstRate = 0.05;
  const subtotal = Math.round((roundedGross / (1 + gstRate)) * 100) / 100;
  const gstAmount = Math.round(subtotal * gstRate * 100) / 100;

  return {
    subtotal,
    gstAmount,
    qstAmount: 0,
    hstAmount: 0,
    totalTax: gstAmount,
    grossTotal: roundedGross,
  };
}
